import * as React from 'react';
import{ useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { Drawer, Menu } from '@mui/material'
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { signOut } from "next-auth/react"
import { auth, fireStore } from '../../firebase/firebase-config';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import Settings from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PersonIcon from '@mui/icons-material/Person';
import Router from 'next/router';
import ThemeToggleButton from '../ThemeToggleButton/ThemeToggleButton';
import MyApp from '../../pages/_app';
import GroupsIcon from '@mui/icons-material/Groups';
import NextLink from 'next/link';
import { fetchDataById, fetchDataByShift, fetchJobWhichUnfinished } from '../../firebase/fetch-data';
import TodayIcon from '@mui/icons-material/Today';
import AddIcon from '@mui/icons-material/Add';
import LocalHotelIcon from '@mui/icons-material/LocalHotel';
import CheckIcon from '@mui/icons-material/Check';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AirportShuttleIcon from '@mui/icons-material/AirportShuttle';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { PiCertificateFill } from 'react-icons/pi';


const Clock = () => {
  const [currentTime, setCurrentTime] = useState("");

  React.useEffect(() => {
    const timer = setInterval(() => {
      const date = new Date();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      const formattedTime = `${hours} : ${minutes} : ${seconds}`;
      setCurrentTime(formattedTime);

      // Check if it's midnight
      if (hours === '00' && minutes === '00' && seconds === '01') {
        // Add job to Firestore
        addJobToFirestore();
        checkAndUpdateJobsStatus();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const checkAndUpdateJobsStatus = async () => {
    const today = new Date();
    const todayDate = today.toISOString().slice(0, 10);

      
      const querySnapshot = await fetchJobWhichUnfinished("jobs");
  
      querySnapshot.forEach(async (docSnapshot) => {
        const jobData = docSnapshot.data();
        const jobRef = doc(fireStore, 'jobs', docSnapshot.id);
  
        if(jobData.dueDate < todayDate){
          await updateDoc(jobRef, { status: 'late' });
          console.log(`Updated job status to "late" for job ID: ${docSnapshot.id}`);

          const currentDate = new Date();
          const year = currentDate.getFullYear();
          const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
          const day = String(currentDate.getDate()).padStart(2, '0');
          const todayDate = `${year}-${month}-${day}`;

          const notificationData = {
            division: jobData.category,
            description: `${jobData.name} ${jobData.room} ${jobData.bed} LATE`,
            date: todayDate,
          };

          await addDoc(collection(fireStore, 'notification'), notificationData);
        }
  
      });
  
      console.log('Job status update completed.');
  };
  



  const addJobToFirestore = async () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(currentDate.getDate()).padStart(2, '0');
    const todayDate = `${year}-${month}-${day}`;

    const jobDataArray = [
      {
        name: "Preparing Food",
        status: "unfinished",
        category: "Kitchen Staff",
        patient: "",
        assignedDate: todayDate,
        dueDate: todayDate,
        room: "",
        bed: "",
        staff: "",
      },
      {
        name: "Serving Food",
        status: "unfinished",
        category: "Kitchen Staff",
        patient: "",
        assignedDate: todayDate,
        dueDate: todayDate,
        room: "",
        bed: "",
        staff: "",
      },
      {
        name: "Cleaning Room",
        status: "unfinished",
        category: "Cleaning Service",
        patient: "",
        assignedDate: todayDate,
        dueDate: todayDate,
        room: "",
        bed: "",
        staff: "",
      },
      {
        name: "Checking Patient",
        status: "unfinished",
        category: "Nurses",
        patient: "",
        assignedDate: todayDate,
        dueDate: todayDate,
        room: "",
        bed: "",
        staff: "",
      }
    ];

    try {
      for (const jobData of jobDataArray) {
        const newJobRef = await addDoc(collection(fireStore, 'jobs'), jobData);
        console.log('Job added successfully:', newJobRef.id);
      }
    } catch (error) {
      console.error('Error adding job:', error);
    }
  };

  return <div>{currentTime}</div>;
};

const drawerWidth = 240;
const menuRouteList = ["dashboard","managePatient","schedule","certificate","manageUser","newUser","report","setting"]
const menuListTranslations = ["Dashboard","Patient","Calender","Certificate","Staff","New User","Problem Report","Setting"];
const menuListIcons = [
    <DashboardIcon/>,
    <LocalHotelIcon/>,
    <TodayIcon/>,
    <PiCertificateFill size={24}/>,
    <GroupsIcon/>,
    <PersonAddIcon/>,
    <ReportProblemIcon/>,
    <Settings/>,
];


const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});
  
const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
      width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}));

const logoutAction = () => {
    auth.signOut()
    .then(() => {
    // Logout berhasil
        localStorage.clear();
        localStorage.removeItem('token');
        Router.push('/auth/login')
    })
    .catch((error) => {
        console.error('Error during logout:', error);
    });
};  

export type SideBarProps = {
  ColorModeContext: React.Context<{ toggleColorMode: () => void }>;
};
  
const SideMenu = (props: SideBarProps ) => {
    const { ColorModeContext } = props;
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);
    const [role, setRole] = useState('');

    React.useEffect(() => {
      setRole(localStorage.getItem('role'));
    }, [])

    const filteredMenuRouteList = menuRouteList.filter((route, index) => {
      if(role === "Administration Staff") return true;
      else if(role === "Doctor") return index === 0 || index === 1 || index === 2 || index === 3 || index === 6 || index === 7;
      else if(role === "Nurses") return index === 0 || index === 1 || index === 2 || index === 3 || index === 6 || index === 7;
      else if(role === "Cleaning Service") return index === 0 || index === 2 || index === 6 || index === 7;
      else if(role === "Ambulance Driver") return index === 0 || index === 2 || index === 6 || index === 7;
      else if(role === "Kitchen Staff") return index === 0 || index === 2 || index === 6 || index === 7;
      else if(role === "Pharmacist") return index === 0 || index === 2 || index === 6 || index === 7;
      else return;
    });
    
    const filteredMenuListTranslations = menuListTranslations.filter((translation, index) => {
      if(role === "Administration Staff") return true;
      else if(role === "Doctor") return index === 0 || index === 1 || index === 2 || index === 3 || index === 6 || index === 7;
      else if(role === "Nurses") return index === 0 || index === 1 || index === 2 || index === 3 || index === 6 || index === 7;
      else if(role === "Cleaning Service") return index === 0 || index === 2 || index === 6 || index === 7;
      else if(role === "Ambulance Driver") return index === 0 || index === 2 || index === 6 || index === 7;
      else if(role === "Kitchen Staff") return index === 0 || index === 2 || index === 6 || index === 7;
      else if(role === "Pharmacist") return index === 0 || index === 2 || index === 6 || index === 7;
      else return;
    });
    
    const filteredMenuListIcons = menuListIcons.filter((icon, index) => {
      if(role === "Administration Staff") return true;
      else if(role === "Doctor") return index === 0 || index === 1 || index === 2 || index === 3 || index === 6 || index === 7;
      else if(role === "Nurses") return index === 0 || index === 1 || index === 2 || index === 3 || index === 6 || index === 7;
      else if(role === "Cleaning Service") return index === 0 || index === 2 || index === 6 || index === 7;
      else if(role === "Ambulance Driver") return index === 0 || index === 2 || index === 6 || index === 7;
      else if(role === "Kitchen Staff") return index === 0 || index === 2 || index === 6 || index === 7;
      else if(role === "Pharmacist") return index === 0 || index === 2 || index === 6 || index === 7;
      else return;
    });
    
    const handleDrawerToggle = () => {
        setOpen(!open);
    };  

    const handleListItemButtonClick = (text: string) => {
        text === "Sign Out" ? signOut() : null;
        setOpen(false);
    }    

    if (typeof window !== "undefined") {
      document.addEventListener("keydown", (e) => {
        const index = parseInt(e.key, 10);
        if (e.ctrlKey && !isNaN(index) && index >= 1 && index <= menuRouteList.length) {
          const route = menuRouteList[index - 1];
          Router.push(`/dashboard/${route}`);
        }
        if (e.key === "Escape") {
          logoutAction();
        }
      });
    }
    



  return (
    
    <Drawer variant="permanent" open={open} sx={{
      width: drawerWidth,
      flexShrink: -1,
      whiteSpace: 'nowrap',
      boxSizing: 'border-box',
      ...(open && {
        ...openedMixin(theme),
        '& .MuiDrawer-paper': openedMixin(theme),
      }),
      ...(!open && {
        ...closedMixin(theme),
        '& .MuiDrawer-paper': closedMixin(theme),
      }),
    }}>
        <DrawerHeader>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginRight: '45px' }}>
            <Clock/>
          </div>
          <IconButton onClick={handleDrawerToggle}>
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          
          {filteredMenuListTranslations.map((text, index) => (
            <ListItem key={text} disablePadding sx={{ display: 'block' }}>
              <NextLink
               href={`/dashboard/${filteredMenuRouteList[index]}`} 
              >
                <ListItemButton
                onClick={() => setOpen(false)}
                title={text}
                aria-label={text}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  
                  
                  '&:hover': {
                    backgroundColor: '#383838', // Change the background color on hover
                  },
                  }}
                  >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                    }}
                  >
                    {filteredMenuListIcons[index]}
                  </ListItemIcon>
                  <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
              </NextLink>
            </ListItem>
          ))}
        </List>
        <Divider/>
        
        <ListItem disablePadding sx={{ display: 'block', position: 'absolute', bottom: 15 }}>
          <ListItemButton onClick={logoutAction} 
            sx={{
              minHeight: 48,
              justifyContent: open ? 'initial' : 'center',
              px: 2.5,
              '&:hover': {
                backgroundColor: '#383838', // Change the background color on hover
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : 'auto',
                justifyContent: 'center',
              }}
            >
              <ExitToAppIcon/>
            </ListItemIcon>
            <ListItemText primary={"Sign Out"} sx={{ opacity: open ? 1 : 0 }} />
          </ListItemButton>
        </ListItem>
      </Drawer>
  )
}

export default SideMenu;