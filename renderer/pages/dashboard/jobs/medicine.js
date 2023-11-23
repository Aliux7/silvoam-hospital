import React, { useState } from 'react';
import { Autocomplete, Avatar, Card, CardActionArea, CardActions, CardContent, CardMedia, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, FormLabel, InputBase, List, ListItem, ListItemAvatar, ListItemText, Modal, Radio, RadioGroup, TextField, Typography, makeStyles, useTheme } from '@mui/material';
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
import DeleteIcon from '@mui/icons-material/Delete';

function SimpleDialog(props) {
  //Roll Back
  const { onClose, open, selectedRow, setRefreshList} = props;

  //Attribute Add/Edit job
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [error, setError] = useState({ name: "", price: "", stock: ""});

  //setValue for gender
  const handleReset = () => {
    setName('')
    setPrice(0);
    setStock(0);
    onClose();
  };

  const handleFinish = async (variant) => {
    const medicineData = {
        name: name.trim(),
        price: price,
        stock: stock,
    };

    if(selectedRow){
        //update job where doc.id = selectedRow.id in collection jobs
        const jobRef = doc(fireStore, 'medicine', selectedRow.id);
        await updateDoc(jobRef, medicineData);
        enqueueSnackbar('job data has been update!', { variant });
        setRefreshList((prevState) => !prevState);
        handleReset();
    }else{
      let isValid = true;
      let errors = {name: "", price: "", stock: ""};
  
      if (name.trim().length < 1) {
          isValid = false;
          errors.name = "Name must be filled.";
      }
      if (price < 0){
          isValid = false;
          errors.price = "Price cannot negatif"
      }
      if (stock < 0){
          isValid = false;
          errors.stock = "stock cannot negatif"
      }
      
      setError(errors);

      if (isValid) {
        //Add job in collection jobs
        await addDoc(collection(fireStore, 'medicine'), medicineData);
        enqueueSnackbar('job add successfully!', { variant });
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
      setName(selectedRow.name);
      setPrice(selectedRow.price);
      setStock(selectedRow.stock);
    }else{
      setName('')
      setPrice(0);
      setStock(0);
    }
  }, [selectedRow, onClose]);

  return (
    <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
      <DialogTitle>Add Medicine</DialogTitle>
        <DialogContent>
          <TextField variant="outlined" margin="normal" required fullWidth id="name" label="Name" name="name" type="name" value={name} onChange={(e) => setName(e.target.value)} helperText={error.name} error={error.name.length > 0} color="secondary"/>
          <TextField variant="outlined" margin="normal" required fullWidth id="price" label="Price" name="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} helperText={error.price} error={error.price.length > 0} color="secondary"/>
          <TextField variant="outlined" margin="normal" required fullWidth id="stock" label="stock" name="stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} helperText={error.stock} error={error.stock.length > 0} color="secondary"/>
         

      </DialogContent>
      <DialogActions>
        <Button onClick={handleReset}>Cancel</Button>
        {!selectedRow && (
          <Button onClick={handleFinish}>Add Medicine</Button>
        )}
        {selectedRow && (
          <Button onClick={handleFinish}>Update Medicine</Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
  
export default function medicine() {
  const [refreshList, setRefreshList ] = useState(false);
  const [medicines, setMedicines] = React.useState([])
  const [open, setOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState('');
  const [search, setSearch] = React.useState('');

  const handleClickOpen = () => {
    setSelectedRow('')
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  
  const columns = [
    { field: 'id', headerName: 'ID', width: 300 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'price', headerName: 'Price', width: 200 },
    { field: 'stock', headerName: 'Stock', width: 200 },
    { field: 'update', headerName: 'Update', width: 100,
      renderCell: (params) => {
        const handleClickOpen = async () => {
            setSelectedRow(params.row);
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
    { field: 'delete', headerName: 'Delete', width: 100,
      renderCell: (params) => {
        const handleClickDelete = async () => {
            await deleteDoc(doc(collection(fireStore, 'medicine'), params.row.id));
            enqueueSnackbar('Medicine data has been deleted!', { variant: 'success' });
            setRefreshList((prevState) => !prevState);
        };
        return (
          <div>
            <Button variant="outlined" color="primary" onClick={handleClickDelete} style={{textTransform: "none"}}>
              <DeleteIcon />
            </Button>
          </div>
        );
      },
    },
  ];

  React.useEffect(() => {
    fetchDataByCollection("medicine").then(d => {
        setMedicines(
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
        <title>Medicine - SiLVoam Hospital</title>
      </Head>
      <main className={scss.main}>
        <SimpleDialog setRefreshList={setRefreshList} selectedRow={selectedRow} open={open} onClose={handleClose}/>
        <Box sx={{ display: 'flex' }}>
          <SideMenu/>
          <div style={{ flexGrow: 1 }}>
          <h1 style={{ fontSize: '50px', fontWeight: 'bold', marginLeft: '30px', marginTop: '30px', marginBottom:'10px'}}>Medicine</h1>
          <div style={{ display: 'flex', alignItems: 'center', margin: '0px 25px'}}>
            <TextField
              placeholder='Search Medicine Name'
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
              Add New Medicine
            </Button>
          </div>
          <Box component="main" sx={{ p: 3 }}>
            <div style={{ height: 500, width: '100%' }}>
              <DataGrid
                rows={medicines.filter((medicine) => {
                  return search.toLowerCase() === '' ? medicine : medicine.name.toLowerCase().includes(search) ;
                }).map((medicine) => ({
                  id: medicine.id,
                  name: medicine.name,
                  price: medicine.price,
                  stock: medicine.stock,
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