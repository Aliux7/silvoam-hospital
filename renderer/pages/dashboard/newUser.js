import React, { useState } from 'react';
import { Avatar, Card, CardActions, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, ListItemAvatar, ListItemText, Modal, Typography, makeStyles, useTheme } from '@mui/material';
import Head from 'next/head';
import scss from '../../styles/Home.module.scss';
import { Box } from '@mui/system';
import SideMenu from '../../components/SideMenu/SideMenu';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { fetchDataByCollection, fetchDataById, fetchDataByShift } from "../../firebase/fetch-data";
import { auth, fireStore } from "../../firebase/firebase-config.js";
import { Button } from '@mui/material';
import { collection, doc, query, where, getDocs, setDoc, getFirestore, deleteDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { blue } from '@mui/material/colors';


function SimpleDialog(props) {
  const { onClose, selectedValue, open, selectedRow, setRefreshList} = props;
  const [shiftItems, setShiftItems] = React.useState([])
  const [users, setUsers] = React.useState([])
  const [showSecondContent, setShowSecondContent] = React.useState(false);
  const [currentValue, setCurrentValue] = React.useState('');
  const [currentShift, setCurrentShift] = React.useState('');

  const handleFinish = async () => {
    const collectionRef = collection(fireStore, 'usersRequest');
    const snapshot = await getDocs(collectionRef);

    snapshot.forEach((document)  => {
      if(document.id == selectedRow){
        const { email, password, name, phone, role } = document.data();
        createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const data = {
              email: email,
              name: name,
              phone: phone,
              role: role,
              shift: currentShift,  
          };
      
          const userDocRef = doc(getFirestore(), 'users', userCredential.user.uid);
          await setDoc(userDocRef, data);

          const userReqDocRef = doc(getFirestore(), 'usersRequest', selectedRow);
          await deleteDoc(userReqDocRef);

          setRefreshList((prevState) => !prevState);
      })
      }
    });
    onClose(selectedValue);
  };

  const handleClose = () => {
    onClose(selectedValue);
  };


  const handleListItemClick = (value) => {
    setCurrentShift(value);
    fetchDataByShift("users", value).then(d => {
      if(!d || !d.docs){
        return;
      }
      setUsers(
        d.docs.map((dd => {
          const ddd = {id: dd.id, ...dd.data()};
          return ddd;
        }))
      );
    })
    setShowSecondContent(true);
    // onClose(value);
  };

  const handleBackButtonClick = () => {
    setShowSecondContent(false);
    setCurrentValue('');
  };


  React.useEffect(() => {
    fetchDataByCollection("shift").then(d => {
      setShiftItems(
        d.docs.map((dd => {
          const ddd = {id: dd.id, ...dd.data()};
          return ddd;
        }))
      );
    })
  }, []);

  return (
    <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
      <DialogContent>
        {showSecondContent ? (
          <div>
            <DialogTitle id="simple-dialog-title">Staff with {currentValue} shift</DialogTitle>
            {users.map((user) => (
                <ListItem button>
                  <ListItemText primary={user.name + " (" + user.role + ")"}/>
                </ListItem>
              ))}
            <Button onClick={handleBackButtonClick}>Back</Button>
            <Button onClick={handleFinish} color="primary" >
              Finsih
            </Button>
          </div>
        ) : (
          <div>
            <DialogTitle id="simple-dialog-title">Assign Shift</DialogTitle>
            <List>
              {shiftItems.map((shiftItem) => (
                <ListItem button onClick={() => handleListItemClick(shiftItem.shiftName)} key={shiftItem.shiftName}>
                  <ListItemText primary={shiftItem.shiftName + " : " + shiftItem.startHour + ":00" + " - " + shiftItem.endHour + ":00"} />
                </ListItem>
              ))}
            </List>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function newUser() {
  
  const [ refreshList, setRefreshList ] = useState(false);
  const [items, setItems] = React.useState([])
  const columns = [
    { field: 'id', headerName: 'ID', width: 200 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'phone', headerName: 'Phone', width: 200 },
    { field: 'role', headerName: 'Role', width: 200 },
    { field: 'actions', headerName: 'Action', width: 150,
      renderCell: (params) => {
          const [open, setOpen] = React.useState(false);
          const [selectedValue, setSelectedValue] = React.useState();
          const [selectedRow, setSelectedRow] = React.useState('');
  
          const handleClickOpen = () => {
            setSelectedRow(params.row.id);
            setOpen(true);
          };
        
          const handleClose = (value) => {
            setOpen(false);
            setSelectedValue(value);
          };
  
        return (
          <div>
            <Button variant="outlined" color="primary" onClick={handleClickOpen} style={{textTransform: "none"}}>
              Approve
            </Button>
            <SimpleDialog setRefreshList={setRefreshList} selectedRow={selectedRow} selectedValue={selectedValue} open={open} onClose={handleClose} />
          </div>
        );
      },
    },
  ];

  React.useEffect(() => {
    fetchDataByCollection("usersRequest").then(d => {
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
        <Head>
                <title>New User - SiLVoam Hospital</title>
        </Head>
        <main className={scss.main}>
          <Box sx={{ display: 'flex' }}>
              <SideMenu/>
                <div style={{ flexGrow: 1 }}>
                <h1 style={{ fontSize: '50px', fontWeight: 'bold', marginLeft: '30px', marginTop: '30px', marginBottom:'10px'}}>New User</h1>
                <Box component="main" sx={{ p: 3 }}>
                <div style={{ height: 500, width: '100%' }}>
                  <DataGrid
                    rows={items.map((user) => ({
                      id: user.id,
                      email: user.email,
                      name: user.name,
                      phone: user.phone,
                      role: user.role,
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
    </React.Fragment>
  );
}