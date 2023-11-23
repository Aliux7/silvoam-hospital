import React, { useState } from 'react';
import { Avatar, Card, CardActions, CardContent, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, FormControlLabel, FormLabel, InputBase, InputLabel, List, ListItem, ListItemAvatar, ListItemText, MenuItem, Modal, Radio, RadioGroup, Select, TextField, Typography, makeStyles, useTheme } from '@mui/material';
import Head from 'next/head';
import scss from '../../styles/Home.module.scss';
import { Box } from '@mui/system';
import SideMenu from '../../components/SideMenu/SideMenu';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { fetchBillByPatientID, fetchDataByCollection, fetchDataById, fetchDataByShift } from "../../firebase/fetch-data";
import { auth, fireStore } from "../../firebase/firebase-config.js";
import { Button } from '@mui/material';
import { collection, doc, query, where, getDocs, setDoc, getFirestore, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { blue, green } from '@mui/material/colors';
import { useMemo } from 'react';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import SearchIcon from '@mui/icons-material/Search';

function SimpleDialog(props) {
  //Roll Back
  const { onClose, open, selectedRow, setRefreshList} = props;

  //Attribute Add/Edit Patient
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = React.useState('Male');
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState({ name: "", email: "", phone: "", gender: "", dateOfBirth: "", address: ""});
  //setValue for gender
  const handleChange = (event) => {
    setGender(event.target.value);
  };

  const handleReset = () => {
    setName('')
    setEmail('');
    setPhone('');
    setGender('');
    setDateOfBirth('');
    setAddress('');
    onClose();
  };

  const handleFinish = async (variant) => {
    let isValid = true;
    let errors = { name: "", email: "", phone: "", gender: "", dateOfBirth: "", address: ""};

    if (name.trim().length < 1) {
        isValid = false;
        errors.name = "Name must be filled.";
    }
    if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email.trim())) {
        isValid = false;
        errors.email = "Please enter a valid email address.";
    }
    if (!/^\d+$/.test(phone.trim())) {
        isValid = false;
        errors.phone = "Please enter a valid 10-digit phone number.";
      }
    if (gender.trim().length < 1) {
        isValid = false;
        errors.gender = "Gender must be choosen";
    }
    if (dateOfBirth.trim().length < 1){
        isValid = false;
        errors.dateOfBirth = "Birthday must be filled"
    }
    if (address.trim().length < 1){
        isValid = false;
        errors.address = "Address must be filled"
    }
    
    setError(errors);
    
    if (isValid) {
      const patientData = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        gender: gender.trim(),
        dateOfBirth: dateOfBirth.trim(),
        address: address.trim(),
      };

      if(selectedRow){
        //update patient where doc.id = selectedRow.id in collection patients
        const patientRef = doc(fireStore, 'patients', selectedRow.id);
        await setDoc(patientRef, patientData, { merge: true });
        enqueueSnackbar('Patient data has been update!', { variant });
      }else{
        //Add patient in collection patients
        const newPatientRef = await addDoc(collection(fireStore, 'patients'), patientData);
        enqueueSnackbar('Patient add successfully!', { variant });
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
      setName(selectedRow.name);
      setEmail(selectedRow.email);
      setPhone(selectedRow.phone);
      setGender(selectedRow.gender);
      setDateOfBirth(selectedRow.dateOfBirth);
      setAddress(selectedRow.address);
    }else{
      setName('');
      setEmail('');
      setPhone('');
      setGender('');
      setDateOfBirth('');
      setAddress('');
    }
  }, [selectedRow, onClose]);

  return (
    <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
      <DialogTitle>Add Patient</DialogTitle>
        <DialogContent>
          <TextField variant="outlined" margin="normal" required fullWidth id="name" label="Name" name="name" type="name" value={name} onChange={(e) => setName(e.target.value)} helperText={error.name} error={error.name.length > 0} color="secondary"/>
          <TextField variant="outlined" margin="normal" required fullWidth id="phone" label="Phone" name="phone" type="phone" value={phone} onChange={(e) => setPhone(e.target.value)} helperText={error.phone} error={error.phone.length > 0} color="secondary" style={{ marginBottom: '16px' }}/>

          <FormLabel style={{ marginLeft: '10px' }} component="legend">Gender</FormLabel>
          <RadioGroup style={{ marginLeft: '10px' }} aria-label="gender" name="gender1" value={gender} onChange={handleChange}>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '36px'}}>
              <FormControlLabel value="Female" control={<Radio />} label="Female" />
              <FormControlLabel value="Male" control={<Radio />} label="Male" />
            </div>
            {error.gender && (
              <Typography variant="body2" color="error">
                {error.gender}
              </Typography>
            )}
          </RadioGroup>
        <TextField variant="outlined" margin="normal" required fullWidth id="date" label="Birthday" name="date" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} helperText={error.dateOfBirth} error={error.dateOfBirth.length > 0} color="secondary" style={{ marginTop: '26px' }} InputLabelProps={{ shrink: true,}}/>
        <TextField variant="outlined" margin="normal" required fullWidth id="email" label="Email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} helperText={error.email} error={error.email.length > 0} color="secondary"/>
        <TextField variant="outlined" margin="normal" required fullWidth id="address" label="Address" name="address" type="address" value={address} onChange={(e) => setAddress(e.target.value)} helperText={error.address} error={error.address.length > 0} color="secondary"/>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReset}>Cancel</Button>
        
        {!selectedRow && (
          <Button onClick={handleFinish}>Add Patient</Button>
        )}
        {selectedRow && (
          <Button onClick={handleFinish}>Update Patient</Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

function SimpleDialog1(props) {
  //Roll Back
  const { onClose, open, selectedRow, setRefreshList} = props;

  const [bills, setBills] = useState("");

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

    const todayDate = "";
    if(status === "Paid"){
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
      const day = String(currentDate.getDate()).padStart(2, '0');
      todayDate = `${year}-${month}-${day}`;
    }
    
    if (isValid) {
      const billRef = doc(fireStore, 'bill', bills.id);
      await updateDoc(billRef, { status: status, paymentDate: todayDate });
      enqueueSnackbar('Bill status has been updated!', { variant });
      setRefreshList((prevState) => !prevState);
      handleReset();
    }
  };
  
  React.useEffect(() => {
    if(selectedRow != ""){
      console.log(bills)
      fetchBillByPatientID("bill", selectedRow.id).then(d => {
        if(d.docs[0]){
          console.log(d);
          const firstBillData = d.docs[0].data();
          const firstBillId = d.docs[0].id;
          setBills({ id: firstBillId, data: firstBillData });
          console.log(bills.data)
        }else{
          setBills("");
        }
      })
    }
  }, [selectedRow]);

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

  if(selectedRow == ""){
    return null;
  }

  if(bills == null || bills == ""){
    return (
      <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
        <DialogTitle>No Bill</DialogTitle>
      </Dialog>
    )
  }

  return (
    <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
      <DialogTitle>Update Bill</DialogTitle>
        <DialogContent>
          <Typography>Patient ID   : {selectedRow.id}</Typography>
          <Typography>Patient Name : {selectedRow.name}</Typography>
          <Typography>Doctor       : {bills.data.doctor}</Typography>
          <Typography>Bill Date    : {bills.data.date}</Typography>
          <Typography>Bill Price    : {bills.data.price}</Typography>
          <Typography>Payment Date : {bills.data.paymentDate}</Typography>
          <Typography>Status       : {bills.data.status}</Typography>
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
  
export default function managePatient() {
  const [refreshList, setRefreshList ] = useState(false);
  const [patients, setPatients] = React.useState([])
  const [open, setOpen] = React.useState(false);
  const [openBill, setOpenBill] = React.useState(false);
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

  const handleCloseBill = () => {
    setOpenBill(false);
  };
  
  const columns = [
    { field: 'id', headerName: 'ID', width: 200 },
    { field: 'email', headerName: 'Email', width: 150 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'phone', headerName: 'Phone', width: 150 },
    { field: 'gender', headerName: 'Gender', width: 150 },
    { field: 'dateOfBirth', headerName: 'Date Of Birth', width: 150 },
    { field: 'address', headerName: 'Address', width: 150 },
    { field: 'bill', headerName: 'Bill', width: 100,
      renderCell: (params) => {
        const handleClickOpen = () => {
          setSelectedRow(params.row);
          console.log(selectedRow);
          setOpenBill(true);
        };

  
        return (
          <div>
            <Button variant="outlined" color="primary" onClick={handleClickOpen} style={{textTransform: "none"}}>
              Bill
            </Button>
          </div>
        );
      },
    },
    { field: 'actions', headerName: 'Action', width: 150,
      renderCell: (params) => {
        const handleClickOpen = () => {
          setSelectedRow(params.row);
          console.log(selectedRow);
          setOpen(true);
        };

  
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
    fetchDataByCollection("patients").then(d => {
      setPatients(
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
        <title>Patient - SiLVoam Hospital</title>
      </Head>
      <main className={scss.main}>
        <Box sx={{ display: 'flex' }}>
          <SimpleDialog setRefreshList={setRefreshList} selectedRow={selectedRow} open={open} onClose={handleClose} />
          <SimpleDialog1 setRefreshList={setRefreshList} selectedRow={selectedRow} open={openBill} onClose={handleCloseBill} />
          <SideMenu/>
          <div style={{ flexGrow: 1 }}>
          <h1 style={{ fontSize: '50px', fontWeight: 'bold', marginLeft: '30px', marginTop: '30px', marginBottom:'10px'}}>Patient</h1>
          <div style={{ display: 'flex', alignItems: 'center', margin: '0px 25px'}}>
            <TextField
              placeholder='Search patient name'
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
              Add New Patient
            </Button>
          </div>

          <Box component="main" sx={{ p: 3 }}>
            <div style={{ height: 500, width: '100%' }}>
              <DataGrid
                rows={patients.filter((patient) => {
                  return search.toLowerCase() === '' ? patient : patient.name.toLowerCase().includes(search) ;
                }).map((patient) => ({
                  id: patient.id,
                  email: patient.email,
                  name: patient.name,
                  phone: patient.phone,
                  gender: patient.gender,
                  dateOfBirth: patient.dateOfBirth,
                  address: patient.address,
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