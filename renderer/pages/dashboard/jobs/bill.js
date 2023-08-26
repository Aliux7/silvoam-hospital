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
  const [status, setStatus] = useState("");
  const [error, setError] = useState({ status: ""});

  const handleReset = () => {
    setStatus('');
    onClose();
  };

  const handleFinish = async (variant) => {
    let isValid = true;
    let errors = { status: ""};

    console.log(status);
    if (status == null || status.trim().length < 1) {
        isValid = false;
        errors.status = "Status must be filled.";
    }
    
    setError(errors);
    
    if (isValid) {
      const billRef = doc(fireStore, 'bill', selectedRow.id);
      await updateDoc(billRef, { status: status });
      enqueueSnackbar('Bill status has been updated!', { variant });
      setRefreshList((prevState) => !prevState);
      handleReset();
    }
  };
  
  const handleClose = () => {
    onClose();
  };
  
  React.useEffect(() => {
    if (selectedRow) {
        setStatus(selectedRow.status);
    }else{
        setStatus('');
    }
  }, [selectedRow, onClose]);

  return (
    <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
      <DialogTitle>Update Bill</DialogTitle>
        <DialogContent>
          <Typography>Patient ID : {selectedRow.patient}</Typography>
            <FormControl variant="outlined" margin="normal" required fullWidth color="secondary" error={error.status.length > 0}>
                <InputLabel id="demo-simple-select-outlined-label">Status</InputLabel>
                <Select labelId="status" id="status" value={status} onChange={(e) => setStatus(e.target.value)} label="type" >
                <MenuItem value={"Unpaid"}>Unpaid</MenuItem>
                <MenuItem value={"Paid"}>Paid</MenuItem>
                </Select>
            </FormControl>
        </DialogContent>
      <DialogActions>
        <Button onClick={handleReset}>Cancel</Button>
        <Button onClick={handleFinish}>Update status bill</Button>
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
  const [bills, setBills] = React.useState([])
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
    { field: 'id', headerName: 'ID', width: 200 },
    { field: 'date', headerName: 'Date', width: 200 },
    { field: 'patient', headerName: 'Patient ID', width: 200 },
    { field: 'staff', headerName: 'Staff ID', width: 200 },
    { field: 'payment', headerName: 'Payment Date', width: 200 },
    { field: 'status', headerName: 'Status', width: 200 },
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
              
            </Button>
          </div>
        );
      },
    },
  ];

  React.useEffect(() => {
    fetchDataByCollection("bill").then(d => {
      setBills(
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
        <title>Bill - SiLVoam Hospital</title>
      </Head>
      <main className={scss.main}>
        <Box sx={{ display: 'flex' }}>
          <SimpleDialog setRefreshList={setRefreshList} selectedRow={selectedRow} open={open} onClose={handleClose} />
          <BanDialog setRefreshList={setRefreshList} selectedRow={selectedRow} open={openBan} onClose={handleCloseBan} />
          <SideMenu/>
          <div style={{ flexGrow: 1 }}>
          <h1 style={{ fontSize: '50px', fontWeight: 'bold', marginLeft: '30px', marginTop: '30px', marginBottom:'10px'}}>Bill</h1>
          <div style={{ display: 'flex', alignItems: 'center', margin: '0px 25px'}}>
            <Button
              style={{ fontSize: '15px', fontWeight: 'bold', background: '#7000ff', textTransform: "none", height:"55px", position:'absolute', right:'30px', marginTop:'70px' }}
              variant="outlined"
              color="primary"
              onClick={handleClickOpen}
            >
              Add New Bill
            </Button>
          </div>

          <Box component="main" sx={{ p: 3, marginTop:'50px'}}>
            <div style={{ height: 500, width: '100%' }}>
              <DataGrid
                rows={bills.map((bill) => ({
                  id: bill.id,
                  date: bill.date,
                  patient: bill.patientID,
                  staff: bill.doctor,
                  payment: bill.paymentDate,
                  status: bill.status,
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