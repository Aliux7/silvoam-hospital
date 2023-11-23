import React, { useState } from 'react';
import { Avatar, Card, CardActions, CardContent, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, FormControlLabel, FormLabel, InputBase, InputLabel, List, ListItem, ListItemAvatar, ListItemText, MenuItem, Modal, Radio, RadioGroup, Select, TextField, Typography, makeStyles, useTheme } from '@mui/material';
import Head from 'next/head';
import scss from '../../../styles/Home.module.scss';
import { Box } from '@mui/system';
import SideMenu from '../../../components/SideMenu/SideMenu';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { fetchBedStartWith, fetchDataByCollection, fetchDataById, fetchDataByShift, findAvailableAmbulance } from "../../../firebase/fetch-data";
import { fireStore } from '../../../firebase/firebase-config';
import { Button } from '@mui/material';
import { collection, doc, query, where, getDocs, setDoc, getFirestore, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { blue, green } from '@mui/material/colors';
import { useMemo } from 'react';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import SearchIcon from '@mui/icons-material/Search';
import { Sick } from '@mui/icons-material';

function SimpleDialog(props) {
  //Roll Back
  const { onClose, open, selectedRow, setRefreshList} = props;

  //Attribute Add/Edit Patient
  const [type, setType] = useState("");
  const [year, setYear] = useState("");
  const [policeNumber, setPoliceNumber] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState({ type: "", year: "", policeNumber: "", status: ""});

  const handleTypeChange = (event) => {
    setType(event.target.value);
  };

  const handleReset = () => {
    setType('')
    setYear('');
    setPoliceNumber('');
    setStatus('');
    onClose();
  };

  const handleFinish = async (variant) => {
    let isValid = true;
    let errors = { type: "", year: "", policeNumber: "", status: ""};

    if (type.trim().length < 1) {
        isValid = false;
        errors.type = "Type must be filled.";
    }
    if (year.trim().length < 1) {
        isValid = false;
        errors.year = "Year must be filled.";
    }
    if (policeNumber.trim().length < 1) {
        isValid = false;
        errors.policeNumber = "Police Number must be filled.";
    }
    
    setError(errors);
    
    if (isValid) {
      const ambulanceData = {
        type: type.trim(),
        year: year.trim(),
        policeNumber: policeNumber.trim(),
        status: 'available',
      };

      if(selectedRow){
        let flag = 0;

        try {
          const bedsData = await fetchBedStartWith("beds");
          for (let i = 0; i < bedsData.length; i++) {
            const bedData = bedsData[i];
            if (bedData.status === "Available") {
              const firstAvailableAmbulance = await findAvailableAmbulance();
              if (firstAvailableAmbulance) {
                flag = 1;
                const bedsRef = doc(fireStore, 'beds', "A1006-" + bedData.number);
                await updateDoc(bedsRef, { status: 'Filled with patients' });

                const ambulanceRef = doc(fireStore, 'ambulance', firstAvailableAmbulance.id);
                await updateDoc(ambulanceRef, { status: 'used' });

                const patientData = {
                  name: "Patient on the way",
                  email: "Patient on the way",
                  phone: "Patient on the way",
                  gender: "Patient on the way",
                  dateOfBirth: "Patient on the way",
                  address: "Patient on the way",
                  bedNumber: String(bedData.number),
                  roomID: "A1006",
                  sickness: "Patient on the way"
                };
                
                const newPatientRef = await addDoc(collection(fireStore, 'patients'), patientData);

                const today = new Date();
                const todayDate = today.toISOString().slice(0, 10);
                const jobData = {
                  name: "Pick Up Patient",
                  status: "unfinished",
                  category: "Ambulance Driver",
                  patient: newPatientRef.id,
                  assignedDate: todayDate,
                  dueDate: todayDate,
                  room: "A1006",
                  bed: bedData.number,
                  staff: "",
                };

                const newjobRef = await addDoc(collection(fireStore, 'jobs'), jobData);
                break;
              }
            }
          }
          if (flag === 0) {
            enqueueSnackbar('Emergency Room is full!', { variant });
          } else {
            enqueueSnackbar('Ambulance on their way!', { variant });
          }
        } catch (error) {
          console.error('Error fetching beds data:', error);
        }
        
        
        //update patient where doc.id = selectedRow.id in collection patients
        // const patientRef = doc(fireStore, 'patients', selectedRow.id);
        // await updateDoc(patientRef, { status: 'late' });
        // enqueueSnackbar('Patient data has been update!', { variant });
      }else{
        const newPatientRef = await addDoc(collection(fireStore, 'ambulance'), ambulanceData);
        enqueueSnackbar('Ambulance add successfully!', { variant });
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
        setStatus('');
        setType(selectedRow.type);
        setYear(selectedRow.year);
        setPoliceNumber(selectedRow.policeNumber);
        setStatus(selectedRow.status);
    }else{
        setType('')
        setYear('');
        setPoliceNumber('');
        setStatus('');
    }
  }, [selectedRow, onClose]);

  return (
    <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
      <DialogTitle>Add Ambulance</DialogTitle>
        <DialogContent>
            <FormControl variant="outlined" margin="normal" required fullWidth color="secondary" error={error.type.length > 0}>
                <InputLabel id="demo-simple-select-outlined-label">Type</InputLabel>
                <Select labelId="type" id="type" value={type} onChange={(e) => setType(e.target.value)} label="type" >
                <MenuItem value=""> <em>None</em> </MenuItem>
                <MenuItem value={"Type 1"}>Type 1</MenuItem>
                <MenuItem value={"Type 2"}>Type 2</MenuItem>
                <MenuItem value={"Type 3"}>Type 3</MenuItem>
                </Select>
            </FormControl>

            <FormControl variant="outlined" margin="normal" required fullWidth color="secondary" error={error.year.length > 0}>
                <InputLabel id="demo-simple-select-outlined-label">Year</InputLabel>
                <Select labelId="year" id="year" value={year} onChange={(e) => setYear(e.target.value)} label="year" >
                <MenuItem value=""> <em>None</em> </MenuItem>
                <MenuItem value={"2015"}>2015</MenuItem>
                <MenuItem value={"2016"}>2016</MenuItem>
                <MenuItem value={"2017"}>2017</MenuItem>
                <MenuItem value={"2018"}>2018</MenuItem>
                <MenuItem value={"2019"}>2019</MenuItem>
                <MenuItem value={"2020"}>2020</MenuItem>
                <MenuItem value={"2021"}>2021</MenuItem>
                <MenuItem value={"2022"}>2022</MenuItem>
                <MenuItem value={"2023"}>2023</MenuItem>
                </Select>
            </FormControl>

            <TextField variant="outlined" margin="normal" required fullWidth id="policeNumber" label="policeNumber" name="policeNumber" type="policeNumber" value={policeNumber} onChange={(e) => setPoliceNumber(e.target.value)} helperText={error.policeNumber} error={error.policeNumber.length > 0} color="secondary"/>
          
        </DialogContent>
      <DialogActions>
        <Button onClick={handleReset}>Cancel</Button>
        
        {!selectedRow && (
          <Button onClick={handleFinish}>Add Ambulance</Button>
        )}
        {selectedRow && (
          <Button onClick={handleFinish}>Use Ambulance</Button>
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

export default function transportation() {
  const [refreshList, setRefreshList ] = useState(false);
  const [ambulance, setAmbulance] = React.useState([])
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
    { field: 'type', headerName: 'Type', width: 100 },
    { field: 'year', headerName: 'Year', width: 100 },
    { field: 'policeNumber', headerName: 'Police Number', width: 200 },
    { field: 'status', headerName: 'Status', width: 150 },
    { field: 'reason', headerName: 'Reson', width: 100 },
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
        const handleClickOpenBan = () => {
            setSelectedRow(params.row);
            setOpenBan(true);
        };

        if(params.row.status == "unusable"){
          return null;
        }
  
        return (
          <div>
            <Button variant="outlined" color="primary" onClick={handleClickOpenBan} style={{textTransform: "none"}}>
              Ban
            </Button>
          </div>
        );
      },
    },
  ];

  React.useEffect(() => {
    fetchDataByCollection("ambulance").then(d => {
      setAmbulance(
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
        <title>Transportation - SiLVoam Hospital</title>
      </Head>
      <main className={scss.main}>
        <Box sx={{ display: 'flex' }}>
          <SimpleDialog setRefreshList={setRefreshList} selectedRow={selectedRow} open={open} onClose={handleClose} />
          <BanDialog setRefreshList={setRefreshList} selectedRow={selectedRow} open={openBan} onClose={handleCloseBan} />
          <SideMenu/>
          <div style={{ flexGrow: 1 }}>
          <h1 style={{ fontSize: '50px', fontWeight: 'bold', marginLeft: '30px', marginTop: '30px', marginBottom:'10px'}}>Transportation</h1>
          <div style={{ display: 'flex', alignItems: 'center', margin: '0px 25px'}}>
            <Button
              style={{ fontSize: '15px', fontWeight: 'bold', background: '#7000ff', textTransform: "none", height:"55px", position:'absolute', right:'30px', marginTop:'70px' }}
              variant="outlined"
              color="primary"
              onClick={handleClickOpen}
            >
              Add New Ambulance
            </Button>
          </div>

          <Box component="main" sx={{ p: 3, marginTop:'50px'}}>
            <div style={{ height: 500, width: '100%' }}>
              <DataGrid
                rows={ambulance.map((eachAmbulance) => ({
                  id: eachAmbulance.id,
                  type: eachAmbulance.type,
                  year: eachAmbulance.year,
                  policeNumber: eachAmbulance.policeNumber,
                  status: eachAmbulance.status,
                  reason: eachAmbulance.reason,
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