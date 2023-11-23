import React, { useState } from 'react';
import { Autocomplete, Avatar, Card, CardActionArea, CardActions, CardContent, CardMedia, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, FormControlLabel, FormLabel, InputBase, InputLabel, List, ListItem, ListItemAvatar, ListItemText, MenuItem, Modal, Radio, RadioGroup, Select, TextField, Typography, makeStyles, useTheme } from '@mui/material';
import Head from 'next/head';
import scss from '../../styles/Home.module.scss';
import { Box } from '@mui/system';
import SideMenu from '../../components/SideMenu/SideMenu';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { fetchDataByCategory, fetchDataByCollection, fetchDataById, fetchDataByRole, fetchDataByRoomID, fetchDataByShift, fetchDataByStatus } from "../../firebase/fetch-data";
import { auth, fireStore } from "../../firebase/firebase-config.js";
import { Button } from '@mui/material';
import { collection, doc, query, where, getDocs, setDoc, getFirestore, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';
import { blue, green } from '@mui/material/colors';
import { useMemo } from 'react';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';

function SimpleDialog(props) {
  //Roll Back
  const { onClose, open, selectedRow, setRefreshList} = props;

  //Attribute Add/Edit job
  const [patient, setPatient] = useState("");
  const [type, setType] = useState("");
  const [error, setError] = useState({ patient: "", type: ""});

  //setValue for gender
  const handleReset = () => {
    setPatient('')
    setType('');
    onClose();
  };

  
  const handleFinish = async (variant) => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(currentDate.getDate()).padStart(2, '0');
    const todayDate = `${year}-${month}-${day}`;
                
    const certificateData = {
        patient: patient.trim(),
        createAt: todayDate,
        type: type.trim(),
        status: "pending",
    };

    if(selectedRow){
        const certificateRef = doc(fireStore, 'certificate', selectedRow.id);
        await updateDoc(certificateRef, certificateData);
        enqueueSnackbar('Certificate data has been update!', { variant });
        setRefreshList((prevState) => !prevState);
        handleReset();
    }else{
      let isValid = true;
      let errors = { patient: "", type: ""};
  
      if (patient.trim().length < 1) {
          isValid = false;
          errors.patient = "Patient must be filled.";
      }
      if (type < 0){
          isValid = false;
          errors.type = "Type must be filled.";
      }
      
      setError(errors);

      if (isValid) {
        await addDoc(collection(fireStore, 'certificate'), certificateData);
        enqueueSnackbar('Certificate add successfully!', { variant });
        const notificationData = {
          division: 'Doctor',
          description: 'Request Approvement for Certificate',
          date: todayDate,
        };

        await addDoc(collection(fireStore, 'notification'), notificationData);

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
      setType(selectedRow.type);
    }else{
      setPatient('')
      setType('');
    }
  }, [selectedRow, onClose]);

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

  return (
    <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open} sx={{ '& .MuiDialog-paper': {  width: '500px',}, }}>
      <DialogTitle>Add Certificate</DialogTitle>
        <DialogContent>
        <Autocomplete
            options={patientList}
            getOptionLabel={(option) => option.label}
            value={patient ? patientList.find(option => option.name === patient) : null}
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
              />
            )}
          />

          <FormControl variant="outlined" margin="normal" required fullWidth color="secondary">
            <InputLabel id="demo-simple-select-outlined-label">Type</InputLabel>
            <Select labelId="type" id="type" value={type} onChange={(e) => setType(e.target.value)} label="type" >
                <MenuItem value=""> <em>None</em> </MenuItem>
                <MenuItem value={"Death Certificate"}>Death Certificate</MenuItem>
                <MenuItem value={"Birth Certificate"}>Birth Certificate</MenuItem>
            </Select>
          </FormControl>


        </DialogContent>
      <DialogActions>
        <Button onClick={handleReset}>Cancel</Button>
          <Button onClick={handleFinish}>Add Certificate</Button>
      </DialogActions>
    </Dialog>
  );
}
  
function UploadDialog(props) {
  //Roll Back
  const { onClose, open, selectedRow, setRefreshList} = props;

  //Attribute Add/Edit job
  const [patient, setPatient] = useState("");
  const [type, setType] = useState("");
  const [error, setError] = useState({ patient: "", type: ""});

  //setValue for gender
  const handleReset = () => {
    setPatient('')
    setType('');
    onClose();
  };

  
  const handleFinish = async (variant) => {
    const certificateRef = doc(fireStore, 'certificate', selectedRow.id);
    await updateDoc(certificateRef, {
      status: "Approved",
      approvedBy: localStorage.getItem("name"),
    });
    enqueueSnackbar('Certificate data has been update!', { variant });
    setRefreshList((prevState) => !prevState);
    handleReset();
  };
  
  const handleClose = () => {
    onClose();
  };
  
  React.useEffect(() => {
    if (selectedRow) {
      setPatient(selectedRow.patient)
      setType(selectedRow.type);
    }else{
      setPatient('')
      setType('');
    }
  }, [selectedRow, onClose]);

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

  return (
    <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open} sx={{ '& .MuiDialog-paper': {  width: '500px',}, }}>
      <DialogTitle>Upload Signature</DialogTitle>
        <DialogContent>
          <input type = "file"></input>
          
        </DialogContent>
      <DialogActions>
        <Button onClick={handleReset}>Cancel</Button>
        <Button onClick={handleFinish}>Upload Signature</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function certificate() {
  const [refreshList, setRefreshList ] = useState(false);
  const [certificates, setCertificates] = React.useState([])
  const [open, setOpen] = React.useState(false);
  const [openUpload, setOpenUpload] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [role, setRole] = useState('');

  React.useEffect(() => {
    setRole(localStorage.getItem('role'));
  }, [])

  const handleClickOpen = () => {
    setSelectedRow('')
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  
  const handleCloseUpload = () => {
    setOpenUpload(false);
  };
  
  const columns = [
    { field: 'id', headerName: 'ID', width: 200 },
    { field: 'type', headerName: 'Type', width: 200 },
    { field: 'createAt', headerName: 'Create At', width: 200 },
    { field: 'patientName', headerName: 'Patient Name', width: 200 },
    { field: 'approvedBy', headerName: 'Approved By', width: 200 },
    { field: 'status', headerName: 'Status', width: 200 },
    { field: 'upload', headerName: 'Upload', width: 100,
      renderCell: (params) => {
        const handleClickOpen = async () => {
            setSelectedRow(params.row);
            setOpenUpload(true);
        };

        if(role != 'Doctor'){
          return null;
        }

        if(params.row.status == "Approved"){
          return null;
        }

        return (
          <div>
            <Button variant="outlined" color="primary" onClick={handleClickOpen} style={{textTransform: "none"}}>
                Upload
            </Button>
          </div>
        );
      },
    },
  ];

  React.useEffect(() => {
    fetchDataByCollection("certificate").then(d => {
      setCertificates(
        d.docs.map((dd => {
          const ddd = {id: dd.id, ...dd.data()};
          return ddd;
        }))
      );
    })
  }, [refreshList]);

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
  
  return (
    <React.Fragment>
    <SnackbarProvider maxSnack={3} style={{ backgroundColor: green[500] }} >
      <Head>
        <title>Certificate - SiLVoam Hospital</title>
      </Head>
      <main className={scss.main}>
        <SimpleDialog setRefreshList={setRefreshList} selectedRow={selectedRow} open={open} onClose={handleClose}/>
        <UploadDialog setRefreshList={setRefreshList} selectedRow={selectedRow} open={openUpload} onClose={handleCloseUpload}/>
        <Box sx={{ display: 'flex' }}>
          <SideMenu/>
          <div style={{ flexGrow: 1 }}>
          <h1 style={{ fontSize: '50px', fontWeight: 'bold', marginLeft: '30px', marginTop: '30px', marginBottom:'10px'}}>Certificate</h1>
          <div style={{ display: 'flex', alignItems: 'center', margin: '0px 25px'}}>
            <TextField
              placeholder='Search Patient Name'
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
              Add New Certificate
            </Button>
          </div>
          <Box component="main" sx={{ p: 3 }}>
            <div style={{ height: 500, width: '100%' }}>
            <DataGrid
              rows={certificates
                .filter(certificate => {
                  const patient = patientList.find(p => p.id === certificate.patient);
                  const patientName = patient ? patient.label.toLowerCase() : '';

                  return search.toLowerCase() === '' ? certificate : patientName.includes(search.toLowerCase());
                })
                .map(certificate => {
                  const patient = patientList.find(p => p.id === certificate.patient);
                  const patientName = patient ? patient.label : '';

                  return {
                    id: certificate.id,
                    type: certificate.type,
                    createAt: certificate.createAt,
                    patientName: patientName,
                    approvedBy: certificate.approvedBy,
                    status: certificate.status,
                  };
                })}
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