import React, { useState } from 'react';
import { Avatar, Card, CardActions, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Modal, Radio, RadioGroup, Typography, makeStyles, useTheme } from '@mui/material';
import Head from 'next/head';
import scss from '../../styles/Home.module.scss';
import { Box } from '@mui/system';
import SideMenu from '../../components/SideMenu/SideMenu';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { fetchDataByCollection, fetchDataById, fetchDataByShift } from "../../firebase/fetch-data";
import { auth, fireStore } from "../../firebase/firebase-config.js";
import { Button } from '@mui/material';
import { DialogContentText } from '@mui/material';
import { collection, doc, query, where, getDocs, setDoc, getFirestore, deleteDoc, updateDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { blue, green } from '@mui/material/colors';
import { SnackbarProvider, useSnackbar } from 'notistack';


function EditDialog(props) {
  const { onClose, value: valueProp, open, selectedRow, setRefreshList, ...other } = props;
  const [value, setValue] = React.useState(valueProp);
  const radioGroupRef = React.useRef(null);
  const [ options, setOptions ] = React.useState([]);
  const { enqueueSnackbar } = useSnackbar();
  
  React.useEffect(() => {
    fetchDataByCollection("roles").then(d => {
      setOptions(
        d.docs.map((dd => {
          const ddd = {id: dd.id, ...dd.data()};
          return ddd.roleName;
        }))
      );
    })
  }, []);

  React.useEffect(() => {
    if (!open) {
      setValue(valueProp);
    }
  }, [valueProp, open]);

  const handleEntering = () => {
    if (radioGroupRef.current != null) {
      radioGroupRef.current.focus();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const handleOk = async (variant) => {
    const documentRef = doc(fireStore, 'users', selectedRow);
    await updateDoc(documentRef, { role: value });
    setRefreshList((prevState) => !prevState);
    enqueueSnackbar('User role has been changed successfully!', { variant });
    onClose(value);
  };

  const handleChange = (event) => {
    setValue(event.target.value);
  };


  return (
    <Dialog
      sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
      maxWidth="xs"
      TransitionProps={{ onEntering: handleEntering }}
      open={open}
      {...other}
    >
      <DialogTitle>Change Role</DialogTitle>
      <DialogContent dividers>
        <RadioGroup
          ref={radioGroupRef}
          aria-label="ringtone"
          name="ringtone"
          value={value}
          onChange={handleChange}
        >
          {options.map((option) => (
            <FormControlLabel
              value={option}
              key={option}
              control={<Radio />}
              label={option}
            />
          ))}
        </RadioGroup>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleOk}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
}

function DeleteDialog(props) {
  const { onClose, open, selectedRow, setRefreshList} = props;
  const { enqueueSnackbar } = useSnackbar();
  
  const handleCancel = () => {
    onClose();
  };

  const handleDelete = async (variant) => {
    const userReqDocRef = doc(getFirestore(), 'users', selectedRow);
    await deleteDoc(userReqDocRef);

    setRefreshList((prevState) => !prevState);
    enqueueSnackbar('User deleted successfully!', { variant });
    onClose();
  };

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Are you sure"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Do you really want to delete these account? This process cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleDelete} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default function manageUser() {

    const [ refreshList, setRefreshList ] = useState(false);
    const [items, setItems] = React.useState([])
    const columns = [
      { field: 'id', headerName: 'ID', width: 200 },
      { field: 'email', headerName: 'Email', width: 200 },
      { field: 'name', headerName: 'Name', width: 200 },
      { field: 'phone', headerName: 'Phone', width: 200 },
      { field: 'role', headerName: 'Role', width: 200 },
      { field: 'shift', headerName: 'Shift', width: 150 },
      { field: 'edit', headerName:'', width: 100,
        renderCell: (params) => {
          const [open, setOpen] = React.useState(false);
          const [selectedValue, setSelectedValue] = React.useState('');
          const [selectedRow, setSelectedRow] = React.useState('');

          const handleClickOpen = () => {
            setSelectedRow(params.row.id);
            setOpen(true);
          };

          const handleClose = (value) => {
            setOpen(false);
            setSelectedValue(value);
          };

          if (params.row.email === 'admin@gmail.com') {
            return null;
          }

          return (
            <div>
              <Button variant="outlined" onClick={handleClickOpen} style={{textTransform: "none"}}>
                Edit
              </Button>
              <EditDialog
                selectedRow={selectedRow}
                selectedValue={selectedValue}
                setRefreshList={setRefreshList} 
                open={open}
                onClose={handleClose}
              />
            </div>
          );
        },
      },
      { field: 'delete', headerName:'', width: 100,
        renderCell: (params) => {
          const [open, setOpen] = React.useState(false);
          const [selectedRow, setSelectedRow] = React.useState('');

          const handleClickOpen = () => {
            setSelectedRow(params.row.id);
            setOpen(true);
          };

          const handleClose = () => {
            setOpen(false);
          };

          if (params.row.email === 'admin@gmail.com') {
            return null;
          }

          return (
            <div>
              <Button variant="outlined" onClick={handleClickOpen} style={{textTransform: "none"}} >
                Delete
              </Button>
              <DeleteDialog
                open={open}
                onClose={handleClose}
                setRefreshList={setRefreshList} 
                selectedRow={selectedRow}
              />
            </div>
          );
        },
      },
    ];
  
    
    const handleEditClickOpen = (rowId) => {
      setSelectedRow(rowId);
      setEditOpen(true);
    };
  
    const handleEditClose = (value) => {
      setEditOpen(false);
      setSelectedValue(value);
    };
  
    const handleDeleteClickOpen = (rowId) => {
      setSelectedRow(rowId);
      setDeleteOpen(true);
    };
  
    const handleDeleteClose = (value) => {
      setDeleteOpen(false);
      setSelectedValue(value);
    };

    
    React.useEffect(() => {
      fetchDataByCollection("users").then(d => {
        setItems(
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
            <title>Staff - SiLVoam Hospital</title>
          </Head>
          <main className={scss.main}>
              <Box sx={{ display: 'flex' }}>
                <SideMenu/>

                <div style={{ flexGrow: 1 }}>
                <h1 style={{ fontSize: '50px', fontWeight: 'bold', marginLeft: '30px', marginTop: '30px', marginBottom:'10px'}}>Staff</h1>

                <Box component="main" sx={{ p: 3 }}>
                  <div style={{ height: 500, width: '100%' }}>
                    <DataGrid
                      rows={items.map((user) => ({
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        phone: user.phone,
                        role: user.role,
                        shift: user.shift,
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