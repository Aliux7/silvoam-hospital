import React, { useState } from 'react';
import { Autocomplete, Avatar, Card, CardActionArea, CardActions, CardContent, CardMedia, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, FormControlLabel, FormLabel, InputBase, InputLabel, List, ListItem, ListItemAvatar, ListItemText, MenuItem, Modal, Radio, RadioGroup, Select, TextField, Typography, makeStyles, useTheme } from '@mui/material';
import Head from 'next/head';
import scss from '../../../styles/Home.module.scss';
import { Box } from '@mui/system';
import SideMenu from '../../../components/SideMenu/SideMenu';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { fetchDataByCategory, fetchDataByCollection, fetchDataById, fetchDataByRole, fetchDataByRoomID, fetchDataByShift, fetchDataByStatus } from "../../../firebase/fetch-data";
import { auth, fireStore } from "../../../firebase/firebase-config.js";
import { Button } from '@mui/material';
import { collection, doc, query, where, getDocs, setDoc, getFirestore, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';
import { blue, green } from '@mui/material/colors';
import { useMemo } from 'react';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import SearchIcon from '@mui/icons-material/Search';
import NextLink from 'next/link';

function SimpleDialog(props) {
  //Roll Back
  const { onClose, open, selectedRow, setRefreshList, currentCategory} = props;

  //Attribute Add/Edit job
  const [patient, setPatient] = useState("");
  const [category, setCategory] = useState("");
  const [medicine, setMedicine] = useState("");
  const [room, setRoom] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState({ patient: "", category: "", medicine: "", room: "", note: "", status: ""});

  //setValue for gender
  const handleReset = () => {
    setPatient('')
    setCategory('');
    setMedicine('');
    setRoom('');
    setNote('');
    setStatus('');
    onClose();
  };

  const [patientList, setPatientList] = useState([]);
  React.useEffect(() => {
    fetchDataByCollection("patients").then(d => {
      setPatientList(
        d.docs.map((dd => {
          const ddd = {label: dd.data().name, id: dd.id};
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

  const [medicineList, setMedicineList] = useState([]);
  React.useEffect(() => {
    fetchDataByCollection("medicine").then(d => {
      setMedicineList(
        d.docs.map((dd => {
          const ddd = {label: dd.data().name, id: dd.id};
          return ddd;
        }))
      );
    })
  }, []);
  
  const handleFinish = async (variant) => {

    if(selectedRow){
      const prescriptionData = {
        patient: patient.trim(),
        category: category.trim(),
        medicine: medicine.trim(),
        room: room.trim(),
        note: note.trim(),
        status: status.trim(),
      };

      const prescriptionRef = doc(fireStore, 'prescription', selectedRow.id);
      await updateDoc(prescriptionRef, prescriptionData);
      enqueueSnackbar('Prescription data has been update!', { variant });
      setRefreshList((prevState) => !prevState);
      handleReset();
    }else{
      const prescriptionData = {
        patient: patient.trim(),
        category: category.trim(),
        medicine: medicine.trim(),
        room: room.trim(),
        note: note.trim(),
        status: "queued",
      };

      let isValid = true;
      let errors = { patient: "", category: "", medicine: "", room: "", note: ""};
  
      if (patient.trim().length < 1) {
          isValid = false;
          errors.patient = "Patient must be filled.";
      }
      if (category.trim().length < 1){
          isValid = false;
          errors.category = "Category must be filled"
      }
      if (medicine.trim().length < 1){
          isValid = false;
          errors.medicine = "Medicine must be filled"
      }
      if (room.trim().length < 1){
        isValid = false;
        errors.room = "Room must be filled"
      }
      if (note.trim().length < 1){
        isValid = false;
        errors.note = "Note must be filled"
      }
      
      setError(errors);

      if (isValid) {
        //Add job in collection jobs
        await addDoc(collection(fireStore, 'prescription'), prescriptionData);
        enqueueSnackbar('prescription add successfully!', { variant });
        setRefreshList((prevState) => !prevState);
        handleReset();
      }
    }
  };
  
  const handleClose = () => {
    onClose();
  };
  
  React.useEffect(() => {
    if (selectedRow) {
      setPatient(selectedRow.patient)
      setCategory(selectedRow.category);
      setMedicine(selectedRow.medicine);
      setRoom(selectedRow.room);
      setNote(selectedRow.note);
    }else{
      setPatient('')
      setCategory('');
      setMedicine('');
      setRoom('');
      setNote('');
    }
  }, [selectedRow, onClose]);

  return (
    <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open} PaperProps={{ style: { width: '500px' } }}>
      <DialogTitle>Add Prescription</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={patientList}
            getOptionLabel={(option) => option.label}
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
                disabled={selectedRow !== "" && selectedRow.status == "complete"}
              />
            )}
          />

          <FormControl variant="outlined" margin="normal" required fullWidth color="secondary" helperText={error.category} error={error.category.length > 0}>
              <InputLabel id="demo-simple-select-outlined-label">Category</InputLabel>
              <Select labelId="category" id="category" value={category} onChange={(e) => setCategory(e.target.value)} label="category" >
                  <MenuItem value=""> <em>None</em> </MenuItem>
                  <MenuItem value={"normal"}>normal</MenuItem>
                  <MenuItem value={"urgent"}>urgent</MenuItem>
              </Select>
          </FormControl>

        <Autocomplete
          options={medicineList}
          getOptionLabel={(option) => option.label}
          value={medicine ? medicineList.find(option => option.id === medicine) : null}
          onChange={(event, value) => setMedicine(value.id)}
          renderInput={(params) => (
            <TextField
            {...params}
              placeholder="Search medicine"
              color="secondary"
              margin="normal"
              fullWidth
              id="medicine"
              name="medicine"
              type="medicine"
              helperText={error.medicine}
              error={error.medicine.length > 0}
            />
          )}
        />

        <Autocomplete
          options={roomList}
          getOptionLabel={(option) => option.id}
          value={room ? roomList.find(option => option.id === room) : null}
          onChange={(event, value) => {
            setRoom(value.id);
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
            />
          )}
        />

        <TextField variant="outlined" margin="normal" required fullWidth id="note" label="note" name="note" value={note} onChange={(e) => setNote(e.target.value)} helperText={error.note} error={error.note.length > 0} color="secondary" multiline rows={3}/>
        
        {selectedRow && (
              <FormControl variant="outlined" margin="normal" required fullWidth color="secondary">
                <InputLabel id="demo-simple-select-outlined-label">status</InputLabel>
                <Select labelId="status" id="status" value={status} onChange={(e) => setStatus(e.target.value)} label="status" >
                    <MenuItem value={"queued"}>queued</MenuItem>
                    <MenuItem value={"in progress"}>in progress</MenuItem>
                    <MenuItem value={"completed"}>completed</MenuItem>
                </Select>
              </FormControl>
            )}

      </DialogContent>
      <DialogActions>
        <Button onClick={handleReset}>Cancel</Button>
        {!selectedRow && (
          <Button onClick={handleFinish}>Add prescription</Button>
        )}
        {selectedRow && (
          <Button onClick={handleFinish}>Update prescription</Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
  
export default function prescription() {
  const [refreshList, setRefreshList ] = useState(false);
  const [prescriptions, setPrescriptions] = React.useState([])
  const [open, setOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [currentCategory, setCurrentCategory] = React.useState('');

  React.useEffect(() => {
    setCurrentCategory(localStorage.getItem("category"));
  }, [])

  const handleClickOpen = () => {
    setSelectedRow('')
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  
  const columns = [
    { field: 'id', headerName: 'ID', width: 200 },
    { field: 'patient', headerName: 'Patient', width: 200 },
    { field: 'category', headerName: 'Category', width: 150 },
    { field: 'medicine', headerName: 'Medicine', width: 200 },
    { field: 'room', headerName: 'Room', width: 150 },
    { field: 'status', headerName: 'Status', width: 150 },
    { field: 'note', headerName: 'Note', width: 150 },
    { field: 'actions', headerName: 'Action', width: 150,
      renderCell: (params) => {
        const handleClickOpen = () => {
          setSelectedRow(params.row);
          setOpen(true);
        };
        
        if(params.row.status === "late"){
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
  ];

  React.useEffect(() => {
    fetchDataByCollection("prescription").then(d => {
      setPrescriptions(
        d.docs.map((dd => {
          const ddd = {id: dd.id, ...dd.data()};
          console.log(ddd);
          return ddd;
        }))
      );
    })
  }, [refreshList]);

  
  
  return (
    <React.Fragment>
    <SnackbarProvider maxSnack={3} style={{ backgroundColor: green[500] }} >
      <Head>
        <title>Prescription - SiLVoam Hospital</title>
      </Head>
      <main className={scss.main}>
        <SimpleDialog setRefreshList={setRefreshList} selectedRow={selectedRow} open={open} onClose={handleClose} currentCategory={currentCategory}/>
        <Box sx={{ display: 'flex' }}>
          <SideMenu/>
          <div style={{ flexGrow: 1 }}>
          <h1 style={{ fontSize: '50px', fontWeight: 'bold', marginLeft: '30px', marginTop: '30px', marginBottom:'10px'}}>Prescription</h1>
          <div style={{ display: 'flex', alignItems: 'center', margin: '0px 25px'}}>
            <TextField
              placeholder='Search Prescription Name'
              style={{ marginRight: 'auto', width: '60%' }}
              color="secondary"
              onChange={(e) => setSearch(e.target.value)}
            />
            <div>
                <NextLink href={"/dashboard/jobs/medicine"}>
                <Card sx={{ width: 250 }}>
                    <CardActionArea>
                    <CardContent>
                        <Typography gutterBottom variant="h6" component="div">
                        Medicine
                        </Typography>
                    </CardContent>
                    <div style={{ position: 'absolute', bottom: 0, right: 0 }}>
                        <CardMedia
                        component="img"
                        height="50"
                        width="50"
                        image={`../../images/Medicine.png`}
                        />
                    </div>
                    </CardActionArea>
                </Card>
                </NextLink>
            </div>
            <Button
              style={{ fontSize: '15px', fontWeight: 'bold', background: '#7000ff', textTransform: "none", height:"55px", marginLeft: '25px' }}
              variant="outlined"
              color="primary"
              onClick={handleClickOpen}
            >
              Add New Prescription
            </Button>
          </div>
          <Box component="main" sx={{ p: 3 }}>
            <div style={{ height: 500, width: '100%' }}>
              <DataGrid
                rows={prescriptions.map((prescription) => ({
                  id: prescription.id,
                  patient: prescription.patient,
                  category: prescription.category,
                  medicine: prescription.medicine,
                  room: prescription.room,
                  note: prescription.note,
                  status: prescription.status,
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