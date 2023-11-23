import React, { useEffect, useState } from 'react';
import { Autocomplete, Avatar, Card, CardActions, CardContent, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, FormControlLabel, FormLabel, InputBase, InputLabel, List, ListItem, ListItemAvatar, ListItemText, MenuItem, Modal, Radio, RadioGroup, Select, TextField, Typography, makeStyles, useTheme } from '@mui/material';
import Head from 'next/head';
import scss from '../../../styles/Home.module.scss';
import { Box } from '@mui/system';
import SideMenu from '../../../components/SideMenu/SideMenu';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { fetchBedStartWith, fetchDataByCollection, fetchDataById, fetchDataByRole, fetchDataByRoomID, fetchDataByShift, findAvailableAmbulance } from "../../../firebase/fetch-data";
import { fireStore } from '../../../firebase/firebase-config';
import { Button } from '@mui/material';
import { collection, doc, query, where, getDocs, setDoc, getFirestore, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { blue, green } from '@mui/material/colors';
import { useMemo } from 'react';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import SearchIcon from '@mui/icons-material/Search';
import { Sick } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';

function SimpleDialog(props) {
  //Roll Back
  const { onClose, open, selectedRow, setRefreshList} = props;

  const [doctor, setDoctor] = useState("");
  const [patient, setPatient] = useState("");
  const [room, setRoom] = useState("");
  const [bed, setBed] = useState("");
  const [dateAppointment, setDateAppointment] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState({ doctor: "", patient: "", room: "", bed: "", dateAppointment: "", category: "", result: "", status: ""});

  const handleReset = () => {
    setDoctor('')
    setPatient('');
    setRoom('');
    setBed('');
    setDateAppointment('');
    setStatus('');
    setCategory('');
    setResult('');
    onClose();
  };

  const countAppointments = async () => {
    try {
        const collectionRef = collection(fireStore, "appointment");
        const promise = await getDocs(collectionRef);
        const count = Number(promise.size);
        console.log('Total Appointments:', count);
        return count;
    } catch (error) {
      console.log('Error counting appointments:', error);
    }
  };

  const handleEdit = async() => {
    const appointmentData = {
        doctor: doctor.trim(),
        patient: patient.trim(),
        roomID: room.trim(),
        bedNumber: bed,
        dateAppointment: dateAppointment.trim(),
        category: category.trim(),
        status: status.trim(),
        result: result.trim(),
    };

    console.log(appointmentData);
    const documentRef = doc(fireStore, 'appointment', selectedRow.id);
    await updateDoc(documentRef, appointmentData);
    
    enqueueSnackbar('Appointment data has been update!', { variant: 'success' });
    setRefreshList((prevState) => !prevState);
    handleReset();
  }

  const handleFinish = async (variant) => {
    let isValid = true;
    let errors = { doctor: "", patient: "", room: "", bed: "", dateAppointment: "", category: "", result: ""};

    if (doctor.trim().length < 1) {
        isValid = false;
        errors.doctor = "Must be filled.";
    }
    if (patient.trim().length < 1) {
        isValid = false;
        errors.patient = "Must be filled.";
    }
    if (room.trim().length < 1) {
        isValid = false;
        errors.room = "Must be filled.";
    }
    if (dateAppointment.trim().length < 1) {
        isValid = false;
        errors.dateAppointment = "Must be filled.";
    }
    if (category.trim().length < 1) {
        isValid = false;
        errors.category = "Must be filled.";
    }
    
    setError(errors);
    
    if (isValid) {
        const appointmentData = {
            doctor: doctor.trim(),
            patient: patient.trim(),
            roomID: room.trim(),
            bedNumber: bed,
            dateAppointment: dateAppointment.trim(),
            category: category.trim(),
            result: result.trim(),
            status: "queued",
            queue: await countAppointments(),
        };

      if(selectedRow){
        // let flag = 0;

        // try {
        //   const bedsData = await fetchBedStartWith("beds");
        //   for (let i = 0; i < bedsData.length; i++) {
        //     const bedData = bedsData[i];
        //     if (bedData.status === "Available") {
        //       const firstAvailableAmbulance = await findAvailableAmbulance();
        //       if (firstAvailableAmbulance) {
        //         flag = 1;
        //         const bedsRef = doc(fireStore, 'beds', "A1006-" + bedData.number);
        //         await updateDoc(bedsRef, { status: 'Filled with patients' });

        //         const ambulanceRef = doc(fireStore, 'ambulance', firstAvailableAmbulance.id);
        //         await updateDoc(ambulanceRef, { status: 'used' });

        //         const patientData = {
        //           name: "Patient on the way",
        //           email: "Patient on the way",
        //           phone: "Patient on the way",
        //           gender: "Patient on the way",
        //           dateOfBirth: "Patient on the way",
        //           address: "Patient on the way",
        //           bedNumber: String(bedData.number),
        //           roomID: "A1006",
        //           sickness: "Patient on the way"
        //         };
                
        //         const newPatientRef = await addDoc(collection(fireStore, 'patients'), patientData);

        //         const today = new Date();
        //         const todayDate = today.toISOString().slice(0, 10);
        //         const jobData = {
        //           name: "Pick Up Patient",
        //           status: "unfinished",
        //           category: "Ambulance Driver",
        //           patient: newPatientRef.id,
        //           assignedDate: todayDate,
        //           dueDate: todayDate,
        //           room: "A1006",
        //           bed: bedData.number,
        //           staff: "",
        //         };

        //         const newjobRef = await addDoc(collection(fireStore, 'jobs'), jobData);
        //         break;
        //       }
        //     }
        //   }
        //   if (flag === 0) {
        //     enqueueSnackbar('Emergency Room is full!', { variant });
        //   } else {
        //     enqueueSnackbar('Ambulance on their way!', { variant });
        //   }
        // } catch (error) {
        //   console.error('Error fetching beds data:', error);
        // }
        
        
        //update patient where doc.id = selectedRow.id in collection patients
        // const patientRef = doc(fireStore, 'patients', selectedRow.id);
        // await updateDoc(patientRef, { status: 'late' });
        // enqueueSnackbar('Patient data has been update!', { variant });
      }else{
        const newPatientRef = await addDoc(collection(fireStore, 'appointment'), appointmentData);
        enqueueSnackbar('Appointment add successfully!', { variant });
      }
      setRefreshList((prevState) => !prevState);
      handleReset();
    }
  };
  
  const handleClose = () => {
    onClose();
  };
  
  React.useEffect(() => {
    if (selectedRow) {
        setDoctor(selectedRow.doctor)
        setPatient(selectedRow.patient);
        setRoom(selectedRow.room);
        setBed(selectedRow.bed);
        setDateAppointment(selectedRow.dateAppointment)
        setCategory(selectedRow.category);
        setResult(selectedRow.result);
        setStatus(selectedRow.status);
    }else{
        setDoctor('')
        setPatient('');
        setRoom('');
        setBed('');
        setStatus('');
        setDateAppointment('')
        setPatient('');
        setCategory('');
        setResult('');
    }
  }, [selectedRow, onClose]);

// Form
  const [ doctorList, setDoctorList ] = useState();
  React.useEffect(() => {
    fetchDataByRole("users", "Doctor").then(d => {
        setDoctorList(
        d.docs.map((dd => {
          const ddd = {id: dd.id, ...dd.data()};
          return ddd;
        }))
      );
    })
  }, []);
  
  const [ patientList, setPatientList ] = useState();
  React.useEffect(() => {
    fetchDataByCollection("patients").then(d => {
        setPatientList(
        d.docs.map((dd => {
          const ddd = {id: dd.id, ...dd.data()};
          return ddd;
        }))
      );
    })
  }, []);

  const [roomList, setRoomList] = useState([]);
  React.useEffect(() => {
    fetchDataByCollection("rooms").then(d => {
      setRoomList(
        d.docs.map((dd => {
          const ddd = {id: dd.id};
          return ddd;
        }))
      );
    })
  }, []);

  const [bedList, setBedList] = useState([]);
  React.useEffect(() => {
    fetchDataByRoomID("beds", room).then(d => {
      setBedList(
        d.docs.map((dd => {
          const ddd = {id: dd.data().number};
          return ddd;
        }))
      );
    })
  }, [room]);

  const [showSecondAutocomplete, setShowSecondAutocomplete] = useState(false);
  const handleFirstAutocompleteChange = (event, value) => {
    setShowSecondAutocomplete(Boolean(value));
  };

  return (
    <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
      <DialogTitle>Add Appointment</DialogTitle>
        <DialogContent>
            <Autocomplete
                // disabled={selectedRow !== "" && selectedRow.status == "complete"}
                options={doctorList}
                getOptionLabel={(option) => option.name}
                value={doctor ? doctorList.find(option => option.id === doctor) : null}
                onChange={(event, value) => setDoctor(value.id)}
                renderInput={(params) => (
                    <TextField
                    {...params}
                    placeholder="Search Doctor"
                    color="secondary"
                    margin="normal"
                    fullWidth
                    id="doctor"
                    name="doctor"
                    type="doctor"
                    helperText={error.doctor}
                    error={error.doctor.length > 0}
                    // disabled={selectedRow !== "" && selectedRow.status == "complete"}
                    />
                )}
            />
            <Autocomplete
                // disabled={selectedRow !== "" && selectedRow.status == "complete"}
                options={patientList}
                getOptionLabel={(option) => option.name}
                value={patient ? patientList.find(option => option.id === patient) : null}
                onChange={(event, value) => setPatient(value.id)}
                renderInput={(params) => (
                    <TextField
                    {...params}
                    placeholder="Search patient"
                    color="secondary"
                    margin="normal"
                    fullWidth
                    id="patient"
                    name="patient"
                    type="patient"
                    helperText={error.patient}
                    error={error.patient.length > 0}
                    // disabled={selectedRow !== "" && selectedRow.status == "complete"}
                    />
                )}
            />
            <Autocomplete
                // disabled={selectedRow !== "" && selectedRow.status == "complete"}
                options={roomList}
                getOptionLabel={(option) => option.id}
                value={room ? roomList.find(option => option.id === room) : null}
                onChange={(event, value) => {
                    setRoom(value.id);
                    handleFirstAutocompleteChange(event, value);
                }}
                renderInput={(params) => (
                    <TextField
                    {...params}
                    placeholder="Search room"
                    color="secondary"
                    margin="normal"
                    fullWidth
                    id="room"
                    name="room"
                    type="room"
                    helperText={error.room}
                    error={error.room.length > 0}
                    // disabled={selectedRow !== "" && selectedRow.status == "complete"}
                    />
                )}
            />

            {showSecondAutocomplete && (
                <Autocomplete
                // disabled={selectedRow !== "" && selectedRow.status == "complete"}
                options={bedList}
                getOptionLabel={(option) => option.id}
                value={bed ? bedList.find(option => option.id === bed) : null}
                onChange={(event, value) => {
                    setBed(value.id);
                }}
                renderInput={(params) => (
                <TextField
                {...params}
                    placeholder="Search available bed"
                    color="secondary"
                    margin="normal"
                    fullWidth
                    id="bed"
                    name="bed"
                    type="bed"
                    helperText={error.bed}
                    error={error.bed.length > 0} 
                    // disabled={selectedRow !== "" && selectedRow.status == "complete"}
                />
                )}
            />
            )}

            <TextField variant="outlined" margin="normal" required fullWidth id="dateAppointment" label="Appointment Date" name="dateAppointment" type="date" value={dateAppointment} onChange={(e) => setDateAppointment(e.target.value)} color="secondary" style={{ marginTop: '26px' }} InputLabelProps={{ shrink: true,}} helperText={error.dateAppointment} error={error.dateAppointment.length > 0} /> 

            <FormControl variant="outlined" margin="normal" required fullWidth color="secondary" helperText={error.category} error={error.category.length > 0}>
                <InputLabel id="demo-simple-select-outlined-label">Category</InputLabel>
                <Select labelId="category" id="category" value={category} onChange={(e) => setCategory(e.target.value)} label="category" >
                    <MenuItem value=""> <em>None</em> </MenuItem>
                    <MenuItem value={"normal"}>normal</MenuItem>
                    <MenuItem value={"urgent"}>urgent</MenuItem>
                </Select>
            </FormControl>

            {selectedRow && (
              <FormControl variant="outlined" margin="normal" required fullWidth color="secondary">
                <InputLabel id="demo-simple-select-outlined-label">status</InputLabel>
                <Select labelId="status" id="status" value={status} onChange={(e) => setStatus(e.target.value)} label="status" >
                    <MenuItem value=""> <em>None</em> </MenuItem>
                    <MenuItem value={"queued"}>queued</MenuItem>
                    <MenuItem value={"in progress"}>in progress</MenuItem>
                    <MenuItem value={"skipped"}>skipped</MenuItem>
                    <MenuItem value={"completed"}>completed</MenuItem>
                </Select>
              </FormControl>
            )}
            
            {selectedRow && (
              <TextField variant="outlined" margin="normal" required fullWidth id="result" label="result" name="result" type="result" value={result} onChange={(e) => setResult(e.target.value)} color="secondary"/>
            )}

        </DialogContent>
      <DialogActions>
        <Button onClick={handleReset}>Cancel</Button>
        
        {!selectedRow && (
          <Button onClick={handleFinish}>Add Appointment</Button>
        )}
        {selectedRow && (
            <div>
                <Button onClick={handleEdit}>Edit Appointment</Button>
            </div>
        )}

      </DialogActions>
    </Dialog>
  );
}
  
function BanDialog(props) {
    const { onClose, open, selectedRow, setRefreshList} = props;
    const [reason, setReason] = useState("");
    
    const handleReset = () => {
        setReason('')
        onClose();
    };
  
    const handleFinish = async (variant) => {
      
        //update patient where doc.id = selectedRow.id in collection patients
        const ambulanceRef = doc(fireStore, 'ambulance', selectedRow.id);
        await updateDoc(ambulanceRef, { 
        status: 'unusable',
        reason: reason
        });
        console.log(ambulanceRef)
        
        enqueueSnackbar('Patient data has been update!', { variant });
        setRefreshList((prevState) => !prevState);
        handleReset();
      
    };
    
    const handleClose = () => {
      onClose();
    };
    
    React.useEffect(() => {
      if (selectedRow) {
        setReason(selectedRow.reason);
      }else{
        setReason('')
      }
    }, [selectedRow, onClose]);
  
    return (
      <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
        <DialogTitle>Ban Ambulance</DialogTitle>
        <DialogContent>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="reason"
            label="Reason for banning the ambulance"
            name="reason"
            autoFocus
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            color="secondary"
        />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleFinish}>Ban</Button>
        </DialogActions>
      </Dialog>
    );
  }

export default function appointment() {
  const [refreshList, setRefreshList ] = useState(false);
  const [appointment, setAppointment] = React.useState([])
  const [open, setOpen] = React.useState(false);
  const [openBan, setOpenBan] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState('');
  const [search, setSearch] = React.useState('');

  const handleClickOpen = () => {
    setSelectedRow('')
    console.log(selectedRow);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCloseBan = () => {
    setOpenBan(false);
  };
  const columns = [
    { field: 'id', headerName: 'ID', width: 250 },
    { field: 'doctor', headerName: 'Doctor', width: 100 },
    { field: 'patient', headerName: 'Patient', width: 100 },
    { field: 'room', headerName: 'Room ID', width: 100 },
    { field: 'bedNumber', headerName: 'Bed Number', width: 150 },
    { field: 'dateAppointment', headerName: 'Date Appointment', width: 100 },
    { field: 'queue', headerName: 'Queue', width: 100 },
    { field: 'status', headerName: 'Status', width: 100 },
    { field: 'category', headerName: 'Category', width: 100 },
    { field: 'result', headerName: 'Result', width: 100 },
    { field: 'update', headerName: '', width: 100,
      renderCell: (params) => {
        const handleClickOpen = () => {
          setSelectedRow(params.row);
          setOpen(true);
        };

        if(params.row.status == "unusable"){
          return null;
        }
  
        return (
          <div>
            <Button variant="outlined" color="primary" onClick={handleClickOpen} style={{textTransform: "none"}}>
              Update
            </Button>
          </div>
        );
      },
    },
    { field: 'delete', headerName: '', width: 100,
      renderCell: (params) => {
        const handleDeleteRow = async () => {
            const appointmentReqDocRef = doc(getFirestore(), 'appointment', params.row.id);
            await deleteDoc(appointmentReqDocRef);
            setRefreshList((prevState) => !prevState);
            enqueueSnackbar('Remove appointment successfully!', { variant: 'success' });
        };

        if(params.row.status == "unusable"){
          return null;
        }
  
        return (
          <div>
            <Button variant="outlined" color="primary" onClick={handleDeleteRow} style={{textTransform: "none"}}>
                <DeleteIcon />
            </Button>
          </div>
        );
      },
    },
  ];

  React.useEffect(() => {
    fetchDataByCollection("appointment").then(d => {
        setAppointment(
        d.docs.map((dd => {
          const ddd = {id: dd.id, ...dd.data()};
          return ddd;
        }))
      );
    })
  }, [refreshList]);

  return (
    <React.Fragment>
    <SnackbarProvider maxSnack={3} style={{ backgroundColor: green[500] }} >
      <Head>
        <title>Appointment - SiLVoam Hospital</title>
      </Head>
      <main className={scss.main}>
        <Box sx={{ display: 'flex' }}>
          <SimpleDialog setRefreshList={setRefreshList} selectedRow={selectedRow} open={open} onClose={handleClose} />
          <BanDialog setRefreshList={setRefreshList} selectedRow={selectedRow} open={openBan} onClose={handleCloseBan} />
          <SideMenu/>
          <div style={{ flexGrow: 1 }}>
          <h1 style={{ fontSize: '50px', fontWeight: 'bold', marginLeft: '30px', marginTop: '30px', marginBottom:'10px'}}>Appointment</h1>
          <div style={{ display: 'flex', alignItems: 'center', margin: '0px 25px'}}>
            <Button
              style={{ fontSize: '15px', fontWeight: 'bold', background: '#7000ff', textTransform: "none", height:"55px", position:'absolute', right:'25px', marginTop:'70px' }}
              variant="outlined"
              color="primary"
              onClick={handleClickOpen}
            >
              Add Appointment
            </Button>
          </div>

          <Box component="main" sx={{ p: 3, marginTop:'50px'}}>
            <div style={{ height: 500, width: '100%' }}>
              <DataGrid
                rows={appointment.map((eachAppointment) => ({
                  id: eachAppointment.id,
                  doctor: eachAppointment.doctor,
                  patient: eachAppointment.patient,
                  room: eachAppointment.roomID,
                  bedNumber: eachAppointment.bedNumber,
                  dateAppointment: eachAppointment.dateAppointment,
                  queue: eachAppointment.queue,
                  status: eachAppointment.status,
                  category: eachAppointment.category,
                  result: eachAppointment.result,
                }))}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
              />
            </div>
          </Box>
          </div>  
        </Box>
      </main>
    </SnackbarProvider>
    </React.Fragment>
  );
}