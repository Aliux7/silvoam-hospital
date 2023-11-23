import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Link from '../../components/Link';
import { DialogContentText, Box, styled, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import Router from 'next/router';
import { addDoc, collection, doc, getDocs, getFirestore, query, setDoc, where } from 'firebase/firestore';
import { auth, fireStore } from '../../firebase/firebase-config';
import scss from '../../styles/Home.module.scss';
import SideMenu from '../../components/SideMenu/SideMenu';
import { DataGrid } from '@mui/x-data-grid';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { green } from '@mui/material/colors';
import { fetchReportByDivision } from '../../firebase/fetch-data';

const columns = [
    { field: 'id', headerName: 'ID', width: 200 },
    { field: 'reportBy', headerName: 'Reported By', width: 200 },
    { field: 'message', headerName: 'Problem', width: 400 },
    { field: 'roomID', headerName: 'Room ID', width: 100 },
    { field: 'patient', headerName: 'Patient', width: 100 },
    { field: 'date', headerName: 'Date Reported', width: 150 },
  ];

export default function report() {
    const [message, setMessage] = useState("");
    const [division, setDivision] = useState("");
    const [patient, setPatient] = useState("");
    const [room, setRoom] = useState("");
    const [role, setRole] = useState('');
    const [rows, setRows] = useState();
    const [error, setError] = useState({ message: "", division: "", patient: "", room: ""});
    
    React.useEffect(() => {
        setRole(localStorage.getItem('role'));
      }, [])

    const handleSubmit = () => {
        let isValid = true;
        let errors = { message: "", division: "", patient: "", room: ""};
        
        if (message.trim().length < 1) {
            isValid = false;
            errors.message = "Message cannot be empty.";
        }
        
        if (division.trim().length < 1) {
            isValid = false;
            errors.division = "division must be choose.";
        }
        
        if (patient.trim().length < 1) {
            isValid = false;
            errors.patient = "patient must be choose.";
        }
        
        if (room.trim().length < 1) {
            isValid = false;
            errors.room = "room must be choose.";
        }

        setError(errors);

        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const todayDate = `${year}-${month}-${day}`;

        if (isValid) {
            const data = {
                message: message,
                division: division,
                patient: patient,
                room: room,
                reportBy: localStorage.getItem('email'),
                date: todayDate,
            };

            addDoc(collection(fireStore, 'report'), data);
  
            const notificationData = {
              division: division,
              description: `(Problem Report)`,
              date: todayDate,
            };
  
            addDoc(collection(fireStore, 'notification'), notificationData);
            enqueueSnackbar('Report upload successfully!', { variant: 'success' });
        }
    };

    const [reportList, setReportList] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            fetchReportByDivision("report", role).then(d => {
                setReportList(
                  d.docs.map((dd => {
                    const ddd = {id: dd.id, ...dd.data()};
                    return ddd;
                  }))
                );
              })
          };
        
          fetchData();
        
          const intervalId = setInterval(fetchData, 20000);
          return () => clearInterval(intervalId);
    }, [role]);

    return (
        <React.Fragment>    
            <SnackbarProvider maxSnack={3} style={{ backgroundColor: green[500] }} >
            <Head>
                <title>Problem Report - SiLVoam Hospital Portal</title>
            </Head>
            <main className={scss.main}>
                <Box sx={{ display: 'flex' }}>
                    <SideMenu />
                    <div style={{ flexGrow: 1, marginLeft: '20px'}}>
                        <Box component="main" sx={{ p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: '10px'}}>
                            <h1 style={{ fontSize: '50px', fontWeight: 'bold', marginTop: '30px', marginBottom:'10px'}}>Report Problem</h1>
                            <div style={{ backgroundColor: '#212121', width:'35%', padding: '30px', borderRadius: '10px'}}>
                                <TextField variant="outlined" margin="normal" required fullWidth id="message" label="message" name="message" value={message} onChange={(e) => setMessage(e.target.value)} helperText={error.message} error={error.message.length > 0} color="secondary" multiline rows={3}/>
                                <FormControl variant="outlined" margin="normal" required fullWidth color="secondary" error={error.division.length > 0}>
                                    <InputLabel id="demo-simple-select-outlined-label">division</InputLabel>
                                    <Select labelId="division" id="division" value={division} onChange={(e) => setDivision(e.target.value)} label="division" >
                                        <MenuItem value="">
                                            <em>None</em>
                                        </MenuItem>
                                        <MenuItem value={"Ambulance Driver"}>Ambulance Driver</MenuItem>
                                        <MenuItem value={"Cleaning Service"}>Cleaning Service</MenuItem>
                                        <MenuItem value={"Doctor"}>Doctor</MenuItem>
                                        <MenuItem value={"Administration Staff"}>Administration Staff</MenuItem>
                                        <MenuItem value={"Kitchen Staff"}>Kitchen Staff</MenuItem>
                                        <MenuItem value={"Pharmacist"}>Pharmacist</MenuItem>
                                        <MenuItem value={"Nurses"}>Nurses</MenuItem>
                                    </Select>
                                </FormControl>
                                <TextField variant="outlined" margin="normal" required fullWidth id="patient" label="patient" name="patient" value={patient} onChange={(e) => setPatient(e.target.value)} helperText={error.patient} error={error.patient.length > 0} color="secondary"/>
                                <TextField variant="outlined" margin="normal" required fullWidth id="room" label="room" name="room" value={room} onChange={(e) => setRoom(e.target.value)} helperText={error.room} error={error.room.length > 0} color="secondary"/>
                                <Button variant="contained" color="secondary" onClick={handleSubmit} fullWidth style={{marginTop: '20px'}}>
                                    Submit
                                </Button>
                            </div>
                            <div style={{justifyContent:'left', width:'80vw', marginTop:'50px'}}>
                                <h2 style={{ fontWeight: 'bold', marginTop: '30px', marginBottom:'10px'}}>Report List</h2>
                                <DataGrid
                                    rows={reportList.map((job) => ({
                                        id: job.id,
                                        reportBy: job.reportBy,
                                        message: job.message,
                                        roomID: job.room,
                                        patient: job.patient,
                                        date: job.date,
                                      }))}
                                    columns={columns}
                                    initialState={{
                                    pagination: {
                                        paginationModel: { page: 0, pageSize: 5 },
                                    },
                                    }}
                                    pageSizeOptions={[5, 10]}
                                />
                            </div>
                        </Box>
                    </div>
                </Box>
            </main>
            </SnackbarProvider>
        </React.Fragment>
    );
};
