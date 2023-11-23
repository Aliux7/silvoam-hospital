import React, {useRef, useState} from 'react';  
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, List, ListItem, ListItemText, MenuItem, Select, TextField, Typography, useTheme } from '@mui/material';
import Head from 'next/head';
import scss from '../../styles/Home.module.scss';
import { Box } from '@mui/system';
import SideMenu from '../../components/SideMenu/SideMenu';
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from '@fullcalendar/react';
import listPlugin from "@fullcalendar/list";
import moment from 'moment';
import { fetchDataByCollection } from '../../firebase/fetch-data';
import { fireStore } from '../../firebase/firebase-config';
import { collection, deleteDoc, doc, getDoc, getFirestore, setDoc, updateDoc } from 'firebase/firestore';

function FormDialog({ open, handleClose, handleSubscribe  }) {
  const [title, setTitle] = useState('');
  const [staffList, setStaffList] = useState([]);
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState('');


  React.useEffect(() => {
    fetchDataByCollection("users").then(d => {
      setStaffList(
        d.docs.map((dd => {
          const ddd = {id: dd.id, ...dd.data()};
          return ddd;
        }))
      );
    })
  }, [])

  const handleSubmit = () => {
    handleSubscribe(title, staffName, staffRole);
    handleClose();
    setTitle('')
  };

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" PaperProps={{ style: { width: '500px' } }} widisableEnforceFocus>
      <DialogTitle id="form-dialog-title">Add Job</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="title"
          label="Title Job"
          type="title"
          value={title}
          color="secondary"
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
        />
        <FormControl 
          variant="outlined" 
          margin="normal"
          required
          fullWidth
          color="secondary"
          >
          <InputLabel id="demo-simple-select-outlined-label">Staff Name</InputLabel>
          <Select
          labelId="staffName"
          id="staffName"
          value={staffName}
          onChange={(e) => {setStaffName(e.target.value); const selectedStaff = staffList.find(staff => staff.id === e.target.value);
            if (selectedStaff) {
              setStaffRole(selectedStaff.role);
            } else {
              setStaffRole('');
            }}}
          label="Staff Name"
          >
          <MenuItem value="">
              <em>None</em>
          </MenuItem>
          {staffList.map((staff) => (
            <MenuItem key={staff.id} value={staff.id}>{staff.name} - {staff.role}</MenuItem>
          ))}
          </Select>
      </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Subscribe
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function schedule() {
  const [currentEvents, setCurrentEvents] = useState([]);
  const [refreshList, setRefreshList] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [mappedEvents, setMappedEvents] = useState([]);
  const calendarRef = useRef(null);
  const [selectDate, setSelectDate] = useState();

  const handleDateClick = (arg) => {
    setSelectDate(arg);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleEventClick = async (selected) => {
    if (window.confirm(`Are you sure you want to delete the event '${selected.event.title}'`)) {
      const jobDocRef = doc(getFirestore(), 'jobs', selected.event.id);
      await deleteDoc(jobDocRef);
      setRefreshList((prevState) => !prevState);
    }
  };

  const handleSubscribe = async (title, staffName, staffRole) => {
    const { idontknow, startStr, endStr, allDay } = selectDate;
    const jobRef = collection(fireStore, "jobs");
  
    if (startStr) {
      await setDoc(doc(jobRef), {
        name: title,
        status: "unfinished",
        category: staffRole,
        patient: "",
        assignedDate: startStr,
        dueDate: endStr,
        staff: staffName,
      
      }); 
      setRefreshList((prevState) => !prevState);
    } else {
    }
    console.log(staffName);
    console.log(title);
    console.log(startStr);
    console.log(endStr);
  };

  const handleEventDrop = async (info) => {
    const updatedEvent = info.event;
    const { id, title, start, end, allDay } = updatedEvent;

    const formattedStartDate = moment(start).subtract(0, 'day').format('YYYY-MM-DD');
    const formattedEndDate = moment(end).subtract(0, 'day').format('YYYY-MM-DD');

    const documentRef = doc(fireStore, 'jobs', id);
    await updateDoc(documentRef, { assignedDate: formattedStartDate, dueDate: formattedEndDate });
    
    setRefreshList((prevState) => !prevState);
  };
  

  React.useEffect(() => {
    fetchDataByCollection("jobs").then(d => {
      setJobs(
        d.docs.map((dd => {
          const ddd = {id: dd.id, ...dd.data()};
          return ddd;
        }))
      );
    })
  }, [refreshList]);

  React.useEffect(() => {
    const events = jobs.map((event) => ({
      id: event.id,
      title: event.name,
      date: event.assignedDate,
      end: event.dueDate,
    }));

    setMappedEvents(events);
  }, [jobs]);
  
  return (
    <React.Fragment>
      <Head>
          <name>Calender - SiLVoam Hospital</name>
      </Head>
      <main className={scss.main}>
        <Box sx={{ display: 'flex' }}>
          <SideMenu/>
          <div style={{ flexGrow: 1 }}>
            <h1 style={{ fontSize: '50px', fontWeight: 'bold', marginLeft: '30px', marginTop: '30px', marginBottom:'10px'}}>Schedule</h1>
            <Box component="main" sx={{ p: 3 }}>
              <div>
              <FormDialog
                open={openDialog}
                handleClose={handleCloseDialog}
                handleSubscribe={handleSubscribe}
              />

                  {/* CALENDAR SIDEBAR */}
                 <Box display="flex" justifyContent="space-between" >
                  <Box
                  flex="1 1 10%"
                  p="15px"
                  borderRadius="4px"
                  >
                  <Typography variant="h5">Events</Typography>
                  <List sx={{ overflow: 'auto', maxHeight: '520px', '&::-webkit-scrollbar': { width: '0.4em', }, '&::-webkit-scrollbar-thumb': { backgroundColor: 'transparent',},}}>
                      {jobs.map((event) => (
                        <ListItem key={event.id} sx={{ margin: "10px 0", borderRadius: "4px", backgroundColor: "#7000ff", padding:"0 30px", textAlign: "center", width:"170px"}}>
                          <ListItemText primary={event.name} secondary={event.assignedDate} />
                        </ListItem>
                      ))}
                  </List>
                </Box>

                <Box flex="1 1 100%" ml="15px">
                  <FullCalendar
                    height="75vh"
                    plugins={[
                    dayGridPlugin,
                    timeGridPlugin,
                    interactionPlugin,
                    listPlugin,
                    ]}
                    headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
                    }}
                    initialView="dayGridMonth"
                    editable={true}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    select={handleDateClick}
                    eventClick={handleEventClick}
                    eventsSet={(events) => setCurrentEvents(events)}
                    eventDrop={handleEventDrop}
                    ref={calendarRef} 
                    events={mappedEvents}
                  />
                </Box>
              </Box>
            </div>
          </Box>
          </div> 
        </Box>
      </main>
    </React.Fragment>
  );
}