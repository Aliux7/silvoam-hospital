import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import scss from '../../../styles/Home.module.scss';
import { Box } from '@mui/system';
import SideMenu from '../../../components/SideMenu/SideMenu';
import { Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, ListItemButton, ListItemText, TextField, Typography } from '@mui/material';
import { fetchBedByRoomID, fetchBedsByCondition, fetchBedsByRoomID, fetchDataByCollection, fetchDataById, fetchDataByRoomID, fetchDataStartWith, fetchJobByRoomID, fetchPatientByRoomID } from '../../../firebase/fetch-data';
import { DataGrid } from '@mui/x-data-grid';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { green } from '@mui/material/colors';
import { fireStore } from '../../../firebase/firebase-config';
// Generate Sales Data

function SimpleDialog(props) {
    const { onClose, selectedValue, open, roomID, jobs } = props;
  
    const handleClose = () => {
      onClose(selectedValue);
    };
  
    const handleListItemClick = (value) => {
      onClose(value);
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
                const handleClickOpen =  async () => {
                    const jobRef = doc(fireStore, 'jobs', params.row.id);
                    await updateDoc(jobRef, { status: 'complete' });
                    enqueueSnackbar('job data has been update!', { variant: 'success' });
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

    return (
      <Dialog onClose={handleClose} open={open}>
        <DialogTitle>Job Detail Room {roomID}</DialogTitle>
        <List sx={{ pt: 0 }}>
            <DataGrid
                rows={jobs.map((job) => ({
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
        </List>
      </Dialog>
    );
  }
   
const roomTypes = ['Private', 'Sharing', 'VIP', 'Royale', 'Emergency Unit'];

function RoomDialog(props) {
    const { onClose, selectedValue, open, choosenFloor, currentBuildingFloor, setRefreshList} = props;
  
    const handleClose = () => {
      onClose(selectedValue);
    };
  
    const handleListItemClick = async (value) => {
        const count = Object.keys(choosenFloor).length + 1;
        const formattedCount = String(count).padStart(3, "0");
        const result = currentBuildingFloor + formattedCount;
        const data = {
            roomType: value,
        };
        const userDocRef = doc(getFirestore(), 'rooms', result);
        setDoc(userDocRef, data).then((res => {
            setRefreshList((prevState) => !prevState);
        }))
        enqueueSnackbar('job data has been update!', { variant: 'success' });
        onClose(value);
    };

  
    return (
      <Dialog onClose={handleClose} open={open}>
        <DialogTitle>Set Room Type</DialogTitle>
        <List sx={{ pt: 0 }}>
          {roomTypes.map((roomType) => (
            <ListItem disableGutters>
              <ListItemButton onClick={() => handleListItemClick(roomType)} key={roomType}>
                <ListItemText primary={roomType} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Dialog>
    );
  }

function BedDialog(props) {
    const { onClose, selectedValue, open, choosenBedInfo, setRefreshList} = props;
    const [patient, setPatient] = useState("");
    const [name, setName] = useState("");
    const [room, setRoom] = useState("");
  
    const [patientData, setPatientData] = useState("");
      useEffect(() => {
        const fetchData = async () => {
          try {
            const result = await fetchPatientByRoomID("patients", choosenBedInfo.roomID, choosenBedInfo.bedNumber.trim());
            if (result.docs.length > 0) {
              const patient = {id: result.docs[0].id, ...result.docs[0].data()};
              setPatientData(patient);
            } else {
              setPatientData(null);
            }
          } catch (error) {
            console.error(error);
          }
        };
        fetchData();
      }, [choosenBedInfo]);

    const handleClose = () => {
      onClose(selectedValue);
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
      setRoomList(choosenBedInfo['roomList']);
    })

    const handleAssignPatient = async () => {
      const docID = choosenBedInfo['roomID'] + "-" + choosenBedInfo['bedNumber'].trim();
      const documentRef = doc(fireStore, 'beds', docID);
      await updateDoc(documentRef, { status: 'Filled with patients' });
      
      const documentRef1 = doc(fireStore, 'patients', patient);
      const documentSnapshot = await getDoc(documentRef1);
      const roomID = documentSnapshot.data().roomID;
      const bedNumber = documentSnapshot.data().bedNumber;
      console.log(roomID);
      if(roomID != ""){
        const combinedValue = roomID + '-' + bedNumber;
        console.log(combinedValue);
        const documentBeds = doc(fireStore, 'beds', combinedValue);
        await updateDoc(documentBeds, {
          status: 'Available'
        });
      }

      await updateDoc(documentRef1, {
        bedNumber: choosenBedInfo['bedNumber'].trim(),
        doctor: 'Kelson',
        roomID: choosenBedInfo['roomID'],
        sickness: name,
      });

      enqueueSnackbar('Patient assign successfully!', { variant: "success" });
      setRefreshList((prevState) => !prevState);
      onClose();
    }

    const handleDeleteBed = async () => {
      const bedsCollectionRef = collection(fireStore, 'beds');
      const querySnapshot = await getDocs(query(bedsCollectionRef, where('roomID', '==', choosenBedInfo['roomID']), where('number', '==', Number(choosenBedInfo['bedNumber'].trim()))));
      console.log(querySnapshot);
      querySnapshot.forEach((docSnapshot) => {
        deleteDoc(doc(bedsCollectionRef, docSnapshot.id));
        console.log(`Deleted document with ID: ${docSnapshot.id}`);
      });
      enqueueSnackbar('Bed delete successfully!', { variant: "success" });
      setRefreshList((prevState) => !prevState);
      onClose();
    };
    
    const handleMoveBed = async () => {
      handleAddBed(room);
    }

    const handleAddBed = async (roomID) => {
      roomList.map((room) => {
        if (room.id == roomID) {
          const data = {
            number: room.capacity,
            roomID: roomID,
            status: 'Available'
          };
            const userDocRef = doc(fireStore, 'beds', `${roomID}-${room.capacity}`);
            setDoc(userDocRef, data).then((res) => {
              setRefreshList((prevState) => !prevState);
            });
            enqueueSnackbar('Add bed successfully!', { variant: 'success' });
            handleDeleteBed();
        }
      });
    };

    if(choosenBedInfo.status === "Filled with patients" || choosenBedInfo.status === " Filled with patients"){
  
      const handleCompleteUseBed = async () => {
        const document = await fetchBedsByCondition('beds', choosenBedInfo.roomID, Number(choosenBedInfo.bedNumber.trim()));
        if (document) {
          const documentRef = doc(fireStore, 'beds', document.docs[0].id);
          await updateDoc(documentRef, { status: 'Available' });
          
          const patientRef = doc(fireStore, 'patients', patientData.id);
          await updateDoc(patientRef, {
            bedNumber: '',
            doctor: '',
            roomID: '',
            sickness: ''
          });
  
          const currentDate = new Date();
          const year = currentDate.getFullYear();
          const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
          const day = String(currentDate.getDate()).padStart(2, '0');
          const todayDate = `${year}-${month}-${day}`;
  
          const jobData = {
            name: 'Clean Bed',
            status: "unfinished",
            category: 'Cleaning Service',
            assignedDate: todayDate,
            dueDate: todayDate,
            room: choosenBedInfo.roomID,
            bed: choosenBedInfo.bedNumber,
          };
  
          addDoc(collection(fireStore, 'jobs'), jobData);

          const billData = {
            date: todayDate,
            doctor: "Kelson",
            patientID: patientData.id,
            paymentDate: "",
            status: "Unpaid",
            price: "450.000"
          }

          addDoc(collection(fireStore, 'bill'), billData);

  
          enqueueSnackbar('Bed status has been updated!', { variant: "success" });
          setRefreshList((prevState) => !prevState);
          onClose();
        } else {
          console.log('Document not found!');
        }
      }
  
  
      if(patientData){
        return (
          <Dialog onClose={handleClose} open={open}>
            <DialogTitle>Patient Info</DialogTitle>
            <DialogContent>
              <div style={{width:'300px'}}>
                {patientData.id}
                <h3>Patient Name: {patientData.name}</h3>
                <p>Patient Gender: {patientData.gender}</p>
                <p>Patient Birthday: {patientData.dateOfBirth}</p>
                <p>Patient Doctor: {patientData.doctor}</p>
                <p>Patient Sickness: {patientData.sickness}</p>
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCompleteUseBed}>Complete using the bed</Button>
            </DialogActions>
          </Dialog>
        );
      }
    }else if(choosenBedInfo.status === " Available" || choosenBedInfo.status === "Available"){
      return (
        <Dialog onClose={handleClose} open={open}>
          <DialogTitle>Assign Patient</DialogTitle>
          <DialogContent>
            <div style={{width:'300px'}}>
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
                  />
                )}
              />
              <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Sickness"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  color="secondary"
              />
              <Autocomplete
                options={roomList}
                getOptionLabel={(option) => option.id}
                value={room ? roomList.find(option => option.id === room) : null}
                onChange={(event, value) => setRoom(value.id)}
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
                  />
                )}
              />
            </div>
          </DialogContent>
          <DialogActions>
              <Button onClick={handleMoveBed}>Move Bed</Button>
              <Button onClick={handleDeleteBed}>Delete Bed</Button>
              <Button onClick={handleAssignPatient}>Assign Patient</Button>
          </DialogActions>
        </Dialog>
      );
    }
    else{
      return null;
    }
  }


export default function rooms() {
    const [building, setBuilding] = useState();
    const [floor, setFloor] = useState();
    const [roomFilter, setRoomFilter] = useState([]);
    const [choosenFloor, setChoosenFloor] = useState({});
    const [jobs, setJobs] = useState([]); 
    const [currentBuildingFloor, setCurrentBuildingFLoor] = useState();
    const [ refreshList, setRefreshList ] = useState(false);
    const [search, setSearch] = React.useState('');

    const [showSecondAutocomplete, setShowSecondAutocomplete] = useState(false);
    const [showThirdAutocomplete, setShowThirdAutocomplete] = useState(false);
    const [startChar, setStartChar] = useState("");
    
    const [roomList, setRoomList] = useState([]);
    const handleFirstAutocompleteChange = (event, value) => {
        setBuilding(value);
        setFloor();
        setShowSecondAutocomplete(Boolean(value));
    };
    
    const handleSecondAutocompleteChange = (event, value) => {
        setShowThirdAutocomplete(Boolean(value));
    };

    const buildings = [
        { buildingLetter: 'A' },
        { buildingLetter: 'B' },
        { buildingLetter: 'C' },
    ];

    const floors = [
        { id: 1 },
        { id: 2 },
        { id: 3 },
        { id: 4 },
        { id: 5 },
        { id: 6 },
        { id: 7 }
    ];

    const filterBedList = (startChar) => {
        if(startChar){
            const combinedResult = `${building.buildingLetter}${startChar.id}`;
            const filteredList = roomList.filter((room) => room.id.startsWith(combinedResult));
            setRoomFilter(filteredList);
            setCurrentBuildingFLoor(combinedResult);
        }
    };

    useEffect(() => {
      if (roomList && roomList.length > 0 && building && floors) {
        console.log("test")
        filterBedList(startChar)
      }
    }, [roomList]);
    
    React.useEffect(() => {
        fetchDataByCollection("rooms").then((querySnapshot) => {
            const data = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            }));
            console.log("hai")
            setRoomList(data);
        });
    }, [refreshList]);

    React.useEffect(() => {
        console.log(roomFilter)
        if (roomFilter && roomFilter.length > 0) {
          const roomIDs = roomFilter.map((room) => room.id);
      
          const fetchPromises = roomIDs.map((roomID) =>
            fetchBedsByRoomID("beds", roomID)
              .then((bedsData) =>
                bedsData.docs.map((doc) => ({ roomID, id: doc.id, ...doc.data() }))
              )
              .catch((error) => {
                console.error(error);
                return [];
              })
          );
          
          Promise.all(fetchPromises)
            .then((results) => {
              const beds = results.flat();
      
              const bedsByRoom = beds.reduce((acc, bed) => {
                if (acc[bed.roomID]) {
                  acc[bed.roomID].push({ number: bed.number, status: bed.status });
                } else {
                  acc[bed.roomID] = [{ number: bed.number, status: bed.status }];
                }
                return acc;
              }, {});
      
              const roomData = roomIDs.reduce((acc, roomID) => {
                const bedData = bedsByRoom[roomID];
                if (bedData) {
                  const status = bedData.map((bed) => bed.status).join(', ');
                  const numbers = bedData.map((bed) => bed.number).join(', ');
                  acc[roomID] = { status, numbers };
                } else {
                  acc[roomID] = { status: '', numbers: '' }; // Empty data for rooms without beds
                }
                return acc;
              }, {});
              console.log("hello")
              setChoosenFloor(roomData);
              console.log(roomData);
            })
            .catch((error) => {
              console.error(error);
            });
        }
      }, [roomFilter]);

      
      
      
    const [open, setOpen] = React.useState(false);
    const [selectedValue, setSelectedValue] = React.useState();    
    const [openBedDialog, setOpenBedDialog] = React.useState(false);
    const [choosenBedInfo, setChoosenBedInfo] = React.useState(false);

    const handleClickOpen = async (roomID) => {
        setOpen(true);
        setSelectedValue(roomID);
      
        try {
          const jobsData = await fetchJobByRoomID("jobs", roomID);
          setJobs(jobsData.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
          console.error(error);
        }
      };

    const handleClose = (value) => {
        setOpen(false);
    };
    
    const handleAddBed = async (roomID) => {
      roomList.map((room) => {
        const numbersCount = choosenFloor[roomID].numbers.split(',').length;
        if (room.id == roomID) {
          if (room.capacity == numbersCount && choosenFloor[roomID].status == "") {
            const numbers = choosenFloor[roomID].numbers.split(',').map(item => parseInt(item.trim()));
            for (let i = 1; i <= room.capacity; i++) {
              if (!numbers.includes(i)) {
                const data = {
                  number: String(i),
                  roomID: roomID,
                  status: 'Unusable'
                };
                const userDocRef = doc(fireStore, 'beds', `${roomID}-${i}`);
                setDoc(userDocRef, data).then((res) => {
                  setRefreshList((prevState) => !prevState);
                });

                const currentDate = new Date();
                const year = currentDate.getFullYear();
                const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
                const day = String(currentDate.getDate()).padStart(2, '0');
                const todayDate = `${year}-${month}-${day}`;

                const jobData = {
                  name: 'Clean Bed',
                  status: "unfinished",
                  category: 'Cleaning Service',
                  assignedDate: todayDate,
                  dueDate: todayDate,
                  room: roomID,
                  bed: i,
                };

                addDoc(collection(fireStore, 'jobs'), jobData);
                enqueueSnackbar('Add bed successfully!', { variant: 'success' });
                break;
              }
            }
          } else if (room.capacity > numbersCount) {
            const numbers = choosenFloor[roomID].numbers.split(',').map(item => parseInt(item.trim()));
            for (let i = 1; i <= room.capacity; i++) {
              if (!numbers.includes(i)) {
                const data = {
                  number: i,
                  roomID: roomID,
                  status: 'Unusable'
                };
                const userDocRef = doc(fireStore, 'beds', `${roomID}-${i}`);
                setDoc(userDocRef, data).then((res) => {
                  setRefreshList((prevState) => !prevState);
                });

                const currentDate = new Date();
                const year = currentDate.getFullYear();
                const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
                const day = String(currentDate.getDate()).padStart(2, '0');
                const todayDate = `${year}-${month}-${day}`;

                const jobData = {
                  name: 'Clean Bed',
                  status: "unfinished",
                  category: 'Cleaning Service',
                  assignedDate: todayDate,
                  dueDate: todayDate,
                  room: roomID,
                  bed: i,
                };

                addDoc(collection(fireStore, 'jobs'), jobData);
                enqueueSnackbar('Add bed successfully!', { variant: 'success' });
                break;
              }
            }
          } else {
            enqueueSnackbar('Room Is Full', { variant: 'error' });
          }
        }
      });
    };

    const [openRoomDialog, setOpenRoomDialog] = React.useState(false);
    const handleRoomDialog = () => {
        setOpenRoomDialog(true);
    }
    const handleCloseRoomDialog = (value) => {
        setOpenRoomDialog(false);
      };

    const handleCloseBedDialog = (value) => {
      setOpenBedDialog(false);
    };

    const handleBedClick = (roomID, bedNumber, status, roomList) => {
      setChoosenBedInfo({ roomID, bedNumber, status, roomList });
    };
    
    useEffect(() => {
      console.log(choosenBedInfo);
      if(choosenBedInfo){
        setOpenBedDialog(true);
      }
    }, [choosenBedInfo]);

    const handleChangeChar = (event, value) => {
      console.log(value)
        setFloor(value);
        setStartChar(value)
        filterBedList(value);
        handleSecondAutocompleteChange(event, value);
    }  

    return (
        <React.Fragment>
            <SnackbarProvider maxSnack={3} style={{ backgroundColor: green[500] }} >
            <Head>
                <title>Rooms - SiLVoam Hospital</title>
            </Head>
            <main className={scss.main}>
                <Box sx={{ display: 'flex' }}>
                <SideMenu/>
                <div style={{ flexGrow: 1 }}>
                    <h1 style={{ fontSize: '50px', fontWeight: 'bold', margin:'0px', marginLeft: '30px', marginTop: '30px'}}>Rooms</h1>
                        <Box component="main" sx={{ p: 3}}>
                            <div style={{ height: 'maxHeight', width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', margin: '0px 25px'}}>
                                <SimpleDialog selectedValue={selectedValue} open={open} onClose={handleClose} roomID={selectedValue} jobs={jobs}/>
                                <BedDialog open={openBedDialog} onClose={handleCloseBedDialog} choosenBedInfo={choosenBedInfo} setRefreshList={setRefreshList}/>
                                <RoomDialog open={openRoomDialog} onClose={handleCloseRoomDialog} choosenFloor={choosenFloor} currentBuildingFloor={currentBuildingFloor} setRefreshList={setRefreshList}/>
                                    <Autocomplete
                                      style={{ width: 300, marginLeft: '10px' }}
                                        options={buildings}
                                        getOptionLabel={(option) => option.buildingLetter}
                                        getOptionSelected={(option, value) => option.buildingLetter === value.buildingLetter}
                                        value={building}
                                        onChange={(event, value) => {
                                            setBuilding(value);
                                            handleFirstAutocompleteChange(event, value);
                                            setFloor(null);
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                placeholder="Search building"
                                                color="secondary"
                                                margin="normal"
                                                fullWidth
                                                id="building"
                                                name="building"
                                                type="building"
                                            />
                                        )}
                                    />
                                    {showSecondAutocomplete && (
                                        <Autocomplete
                                        style={{ width: 300, marginLeft: '10px' }}
                                        options={floors}
                                        getOptionLabel={(option) => option.id}
                                        getOptionSelected={(option, value) => option.id === value.id}
                                        value={floor}
                                        onChange={handleChangeChar}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                placeholder="Search floor"
                                                color="secondary"
                                                margin="normal"
                                                fullWidth
                                                id="room"
                                                name="room"
                                                type="room"
                                            />
                                        )}
                                        />
                                    )}
                                    {showThirdAutocomplete && (
                                        <Button
                                        style={{ fontSize: '15px', fontWeight: 'bold', background: '#7000ff', textTransform: "none", height:"55px", marginRight: '150px', position:'absolute', right:'0px' }}
                                        variant="outlined"
                                        color="primary"
                                        onClick={handleRoomDialog}
                                        >
                                        Add New Room
                                        </Button>
                                    )}
                                </div>
                                <div style={{ marginLeft:'35px'}}>
                                <TextField
                                  placeholder='Search room'
                                  style={{ marginRight: 'auto', width: '45%' }}
                                  color="secondary"
                                  onChange={(e) => setSearch(e.target.value)}
                                />
                                </div>
                                <br/><br/>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                                    {Object.entries(choosenFloor).map(([roomID, roomData]) => {
                                        const roomType = roomFilter.find((room) => room.id === roomID)?.roomType || '';
                                        return(
                                        <div
                                        key={roomID}
                                        style={{
                                            border: '1px solid black',
                                            padding: '10px',
                                            margin: '10px',
                                            textAlign: 'center',
                                            position: 'relative',
                                            backgroundColor: '#333333',
                                            color: 'white',
                                            width: 400,
                                            minHeight: 400,
                                        }}
                                        >
                                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                                            {roomData.numbers.split(',').map((number, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                backgroundColor:
                                                    roomData.status.split(',')[index] === 'Available' ? 'green' :
                                                    roomData.status.split(',')[index] === ' Available' ? 'green' :
                                                    roomData.status.split(',')[index] === 'Unusable' ? 'red' :
                                                    roomData.status.split(',')[index] === ' Unusable' ? 'red' :
                                                    roomData.status.split(',')[index] === 'Filled with patients' ? 'yellow' :
                                                    roomData.status.split(',')[index] === ' Filled with patients' ? 'yellow' : '',
                                                padding: '5px',
                                                margin: '5px',
                                                borderRadius: '5px',
                                                width: 100,
                                                height: 100,
                                                display: 'flex', flexWrap: 'wrap', justifyContent: 'center', 
                                                cursor: 'pointer'
                                                }}
                                                
                                                onClick={() => handleBedClick(roomID, number, roomData.status.split(',')[index], roomList)}
                                            >
                                                <div style={{ color: 'white' }}>
                                                <span>{number}</span>
                                                <br />
                                                <span>{roomData.status.split(',')[index]}</span>
                                                </div>
                                            </div>
                                            ))}
                                        </div>
                                        <div style={{bottom:'10px', position: 'absolute', display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                                            <p>{`${roomID} (${roomType})`}</p>
                                            <Button variant="outlined" color="primary" onClick={() => handleClickOpen(roomID)} style={{textTransform: "none", height:"30px", margin:'auto', marginLeft:'20px'}}> Job Details </Button>
                                            <Button variant="outlined" color="primary" onClick={() => handleAddBed(roomID)} style={{textTransform: "none", height:"30px", margin:'auto', marginLeft:'20px'}}> Add Bed </Button>
                                        </div>
                                    </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </Box>
                    </div>
                </Box>
            </main>
        </SnackbarProvider>
        </React.Fragment>
    );
}