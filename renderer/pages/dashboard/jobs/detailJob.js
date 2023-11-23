import React, { useState } from 'react';
import { Autocomplete, Avatar, Card, CardActions, CardContent, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, FormLabel, InputBase, List, ListItem, ListItemAvatar, ListItemText, Modal, Radio, RadioGroup, TextField, Typography, makeStyles, useTheme } from '@mui/material';
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

function SimpleDialog(props) {
  //Roll Back
  const { onClose, open, selectedRow, setRefreshList, currentCategory} = props;

  //Attribute Add/Edit job
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [patient, setPatient] = useState("");
  const [assignedDate, setAssignedDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [room, setRoom] = useState("");
  const [bed, setBed] = useState("");
  const [staff, setStaff] = useState("");
  const [error, setError] = useState({ name: "", patient: "", assignedDate: "", dueDate: "", room: "", staff: "", bed: ""});

  //setValue for gender
  const handleReset = () => {
    setName('')
    setStatus('');
    setCategory('');
    setPatient('');
    setAssignedDate('');
    setDueDate('');
    setRoom('');
    setBed('');
    setStaff('');
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

  const [staffList, setStaffList] = useState([]);
  React.useEffect(() => {
    fetchDataByRole("users", currentCategory).then(d => {
      setStaffList(
        d.docs.map((dd => {
          const ddd = {label: dd.data().name, id: dd.id};
          return ddd;
        }))
      );
    })
  }, [currentCategory]);

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
  
  const handleFinish = async (variant) => {
    if(selectedRow){
      //update job where doc.id = selectedRow.id in collection jobs
      const jobRef = doc(fireStore, 'jobs', selectedRow.id);
      await updateDoc(jobRef, { status: 'complete' });
      const combinedValue = selectedRow.room + '-' + selectedRow.bed;
      console.log(selectedRow.room);
      console.log(selectedRow.bed);
      console.log(combinedValue);
      const bedRef = doc(fireStore, 'beds', combinedValue);
      await updateDoc(bedRef, { status: 'Available' });
      enqueueSnackbar('job data has been update!', { variant });
    }else{
      let isValid = true;
      let errors = {name: "", patient: "", assignedDate: "", dueDate: "", room: "", staff: "", bed: ""};
  
      if (name.trim().length < 1) {
          isValid = false;
          errors.name = "Name must be filled.";
      }
      if (assignedDate.trim().length < 1){
          isValid = false;
          errors.assignedDate = "Assigned date must be filled"
      }
      if (dueDate.trim().length < 1){
          isValid = false;
          errors.dueDate = "Due Date must be filled"
      }
      
      if (staff.trim().length < 1){
        isValid = false;
        errors.staff = "Staff must be filled"
      }
      
      setError(errors);

      if (isValid) {
        const jobData = {
          name: name.trim(),
          status: "unfinished",
          category: currentCategory,
          patient: patient.trim(),
          assignedDate: assignedDate.trim(),
          dueDate: dueDate.trim(),
          room: room.trim(),
          bed: bed,
          staff: staff.trim(),
        };
          //Add job in collection jobs
        const newjobRef = await addDoc(collection(fireStore, 'jobs'), jobData);
        enqueueSnackbar('job add successfully!', { variant });
        }
    }

    
    setRefreshList((prevState) => !prevState);
    handleReset();
  };
  
  const handleClose = () => {
    onClose();
  };
  
  React.useEffect(() => {
    if (selectedRow) {
      setName(selectedRow.name);
      setStatus(selectedRow.status);
      setCategory(selectedRow.category);
      setPatient(selectedRow.patient);
      setAssignedDate(selectedRow.assignedDate);
      setDueDate(selectedRow.dueDate);
      setRoom(selectedRow.room);
      setBed(selectedRow.bed);
      setStaff(selectedRow.staff);
    }else{
      setName('')
      setStatus('');
      setCategory('');
      setPatient('');
      setAssignedDate('');
      setDueDate('');
      setRoom('');
      setBed('');
      setStaff('');
    }
  }, [selectedRow, onClose]);

  return (
    <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
      <DialogTitle>Add job</DialogTitle>
        <DialogContent>
          <TextField variant="outlined" margin="normal" required fullWidth id="name" label="Name" name="name" type="name" value={name} onChange={(e) => setName(e.target.value)} helperText={error.name} error={error.name.length > 0} color="secondary" disabled={selectedRow !== "" && selectedRow.status == "complete"}/>
          <Autocomplete
          disabled={selectedRow !== "" && selectedRow.status == "complete"}
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
        <TextField variant="outlined" margin="normal" required fullWidth id="assignedDate" label="Assigned Date" name="assignedDate" type="date" value={assignedDate} onChange={(e) => setAssignedDate(e.target.value)} helperText={error.assignedDate} error={error.assignedDate.length > 0} color="secondary" style={{ marginTop: '26px' }} InputLabelProps={{ shrink: true,}} disabled={selectedRow !== "" && selectedRow.status == "complete"}/>
        <TextField variant="outlined" margin="normal" required fullWidth id="dueDate" label="Due Date" name="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} helperText={error.dueDate} error={error.dueDate.length > 0} color="secondary" style={{ marginTop: '26px' }} InputLabelProps={{ shrink: true,}} disabled={selectedRow !== "" && selectedRow.status == "complete"}/>

        <Autocomplete
          disabled={selectedRow !== "" && selectedRow.status == "complete"}
          options={staffList}
          getOptionLabel={(option) => option.label}
          value={staff ? staffList.find(option => option.id === staff) : null}
          onChange={(event, value) => setStaff(value.id)}
          renderInput={(params) => (
            <TextField
            {...params}
              placeholder="Search staff"
              color="secondary"
              margin="normal"
              fullWidth
              id="staff"
              name="staff"
              type="staff"
              helperText={error.staff}
              error={error.staff.length > 0}
              disabled={selectedRow !== "" && selectedRow.status == "complete"}
            />
          )}
        />

        <Autocomplete
          disabled={selectedRow !== "" && selectedRow.status == "complete"}
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
              disabled={selectedRow !== "" && selectedRow.status == "complete"}
            />
          )}
        />

      {showSecondAutocomplete && (
        <Autocomplete
        disabled={selectedRow !== "" && selectedRow.status == "complete"}
        options={bedList}
        getOptionLabel={(option) => option.id}
        value={bed ? bedList.find(option => option.id === bed) : null}
        onChange={(event, value) => {
          setBed(value.id);
          handleFirstAutocompleteChange(event, value);
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
            disabled={selectedRow !== "" && selectedRow.status == "complete"}
          />
        )}
      />
      )}
        
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReset}>Cancel</Button>
        {!selectedRow && (
          <Button onClick={handleFinish}>Add job</Button>
        )}
        {selectedRow && (
          <Button onClick={handleFinish}>Update job</Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
  
export default function detailJob() {
  const [refreshList, setRefreshList ] = useState(false);
  const [jobs, setJobs] = React.useState([])
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
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'patient', headerName: 'Patient', width: 150 },
    { field: 'assignedDate', headerName: 'Assigned Date', width: 150 },
    { field: 'dueDate', headerName: 'Due Date', width: 120 },
    { field: 'room', headerName: 'Room', width: 100 },
    { field: 'bed', headerName: 'Bed', width: 100 },
    { field: 'staff', headerName: 'Staff', width: 150 },
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
    console.log(currentCategory);
    fetchDataByCategory("jobs", currentCategory).then(d => {
      setJobs(
        d.docs.map((dd => {
          const ddd = {id: dd.id, ...dd.data()};
          return ddd;
        }))
      );
    })
  }, [refreshList, currentCategory]);

  
  
  return (
    <React.Fragment>
    <SnackbarProvider maxSnack={3} style={{ backgroundColor: green[500] }} >
      <Head>
        <title>{currentCategory} Job - SiLVoam Hospital</title>
      </Head>
      <main className={scss.main}>
        <SimpleDialog setRefreshList={setRefreshList} selectedRow={selectedRow} open={open} onClose={handleClose} currentCategory={currentCategory}/>
        <Box sx={{ display: 'flex' }}>
          <SideMenu/>
          <div style={{ flexGrow: 1 }}>
          <h1 style={{ fontSize: '50px', fontWeight: 'bold', marginLeft: '30px', marginTop: '30px', marginBottom:'10px'}}>{currentCategory}</h1>
          <div style={{ display: 'flex', alignItems: 'center', margin: '0px 25px'}}>
            <TextField
              placeholder='Search job name'
              style={{ marginRight: 'auto', width: '60%' }}
              color="secondary"
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button
              style={{ fontSize: '15px', fontWeight: 'bold', background: '#7000ff', textTransform: "none", height:"55px", marginLeft: '25px' }}
              variant="outlined"
              color="primary"
              onClick={handleClickOpen}
            >
              Add New Job
            </Button>
          </div>
          <Box component="main" sx={{ p: 3 }}>
            <div style={{ height: 500, width: '100%' }}>
              <DataGrid
                rows={jobs.filter((job) => {
                  return search.toLowerCase() === '' ? job : job.name.toLowerCase().includes(search) ;
                }).map((job) => ({
                  id: job.id,
                  name: job.name,
                  status: job.status,
                  category: job.category,
                  patient: job.patient,
                  assignedDate: job.assignedDate,
                  dueDate: job.dueDate,
                  room: job.room,
                  staff: job.staff,
                  bed: job.bed,
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