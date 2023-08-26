import React, { useEffect, useState } from 'react';
import { Avatar, Card, CardActionArea, CardActions, CardContent, CardMedia, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, ListItemAvatar, ListItemText, Modal, Table, TableBody, TableCell, TableContainer, TableFooter, TablePagination, TableRow, Typography, makeStyles, useTheme } from '@mui/material';
import Head from 'next/head';
import scss from '../../styles/Home.module.scss';
import { Box, maxHeight } from '@mui/system';
import SideMenu from '../../components/SideMenu/SideMenu';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { fetchDataByCollection, fetchDataById, fetchDataByShift } from "../../firebase/fetch-data";
import { Button } from '@mui/material';
import NextLink from 'next/link';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import DeleteIcon from '@mui/icons-material/Delete';
import LastPageIcon from '@mui/icons-material/LastPage';
import { collection, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { fireStore } from '../../firebase/firebase-config';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { green } from '@mui/material/colors';
import NoteAltIcon from '@mui/icons-material/NoteAlt';


const menuRouteList = ["Cleaning Service","Administration Staff","Doctor","Ambulance Driver","Kitchen Staff","Nurses","Pharmacist"]

function TablePaginationActions(props) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <div >
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </div>
  );
}

export default function dashboard() {
  
  //Dashboard Card Item
  const [ refreshList, setRefreshList ] = useState(false);
  const [items, setItems] = React.useState([])
  const [role, setRole] = useState('');

  React.useEffect(() => {
    setRole(localStorage.getItem('role'));
  }, [])
  
  React.useEffect(() => {
    fetchDataByCollection("roles").then(d => {
      setItems(
        d.docs.map((dd => {
          const ddd = {id: dd.id, ...dd.data()};
          return ddd;
        }))
      );
    })
  }, [refreshList]);

  //Notification
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(role);
        const querySnapshot = await getDocs(query(collection(fireStore, 'notification'), where('division', '==', role)));
        const data = querySnapshot.docs.map((doc) => doc.data());
        setRows(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching notification data:', error);
        setLoading(false);
      }
    };
  
    fetchData();
  
    console.log("NGAMBIL");
    const intervalId = setInterval(fetchData, 20000);
    return () => clearInterval(intervalId);
  }, [refreshList, role]);
  

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleDeleteRow = async (row) => {
      const notificationRef = collection(fireStore, 'notification');
      const querySnapshot = await getDocs(query(notificationRef,
        where('division', '==', row.division),
        where('description', '==', row.description),
        where('date', '==', row.date)
      ));
  
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
        console.log('Document successfully deleted!');
      });
      setRefreshList((prevState) => !prevState);
      enqueueSnackbar('Remove notification successfully!', { variant: 'success' });
  };

  return (
    <React.Fragment>
      <SnackbarProvider maxSnack={3} style={{ backgroundColor: green[500] }} >
      <Head>
          <title>Dashboard - SiLVoam Hospital</title>
      </Head>
        <main className={scss.main}>
          <Box sx={{ display: 'flex' }}>
              <SideMenu/>
              <div style={{ flexGrow: 1 }}>
              <h1 style={{ fontSize: '50px', fontWeight: 'bold', marginLeft: '30px', marginTop: '30px', marginBottom:'10px'}}>Dashboard</h1>
              <Box component="main" sx={{ p: 3 }}>
              <div style={{ height: 'maxHeight', width: '100%' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                  {/* {items.map((item, index) => ( */}
                    <div>
                      <NextLink href={"/dashboard/jobs/detailJob"}>
                        <Card sx={{ width: 330 }}>
                          <CardActionArea onClick={() => localStorage.setItem("category", role)}>
                            <CardContent>
                              <Typography gutterBottom variant="h5" component="div">
                                {/* {item.roleName} */}
                                {role} Jobs
                              </Typography>
                            </CardContent>
                            <br/><br/><br/>
                            <div style={{ position: 'absolute', bottom: 0, right: 0 }}>
                              <CardMedia
                                component="img"
                                height="70"
                                width="70"
                                image={`../../images/${role}.png`}
                              />
                            </div>
                          </CardActionArea>
                        </Card>
                      </NextLink>
                    </div>
                  {/* ))} */}
                  <div>
                    <NextLink href={"/dashboard/jobs/rooms"}>
                      <Card sx={{ width: 330 }}>
                        <CardActionArea>
                          <CardContent>
                            <Typography gutterBottom variant="h5" component="div">
                              Rooms
                            </Typography>
                          </CardContent>
                          <br/><br/><br/>
                          <div style={{ position: 'absolute', bottom: 0, right: 0 }}>
                            <CardMedia
                              component="img"
                              height="70"
                              width="70"
                              image={`../../images/Hospital.png`}
                            />
                          </div>
                        </CardActionArea>
                      </Card>
                    </NextLink>
                  </div>
                  {role === 'Administration Staff' && (
                  <div>
                    <NextLink href={"/dashboard/jobs/transportation"}>
                      <Card sx={{ width: 330 }}>
                        <CardActionArea>
                          <CardContent>
                            <Typography gutterBottom variant="h5" component="div">
                              Transportation
                            </Typography>
                          </CardContent>
                          <br/><br/><br/>
                          <div style={{ position: 'absolute', bottom: 0, right: 0 }}>
                            <CardMedia
                              component="img"
                              height="70"
                              width="70"
                              image={`../../images/Transportation.png`}
                            />
                          </div>
                        </CardActionArea>
                      </Card>
                    </NextLink>
                  </div>
                  )}
                  {(role ===  'Doctor' || role === 'Nurses') && (
                    <div>
                      <NextLink href={"/dashboard/jobs/appointment"}>
                        <Card sx={{ width: 330 }}>
                          <CardActionArea>
                            <CardContent>
                              <Typography gutterBottom variant="h5" component="div">
                                Appointment
                              </Typography>
                            </CardContent>
                            <br/><br/><br/>
                            <div style={{ position: 'absolute', bottom: 0, right: 0 }}>
                              <CardMedia
                                component="img"
                                height="70"
                                width="70"
                                image={`../../images/Appointment.png`}
                              />
                            </div>
                          </CardActionArea>
                        </Card>
                      </NextLink>
                    </div>
                  )}
                  {(role ===  'Doctor' || role === 'Pharmacist') && (
                    <div>
                      <NextLink href={"/dashboard/jobs/prescription"}>
                        <Card sx={{ width: 330 }}>
                          <CardActionArea>
                            <CardContent>
                              <Typography gutterBottom variant="h5" component="div">
                                Prescription
                              </Typography>
                            </CardContent>
                            <br/><br/><br/>
                            <div style={{ position: 'absolute', bottom: 0, right: 0 }}>
                              <CardMedia
                                component="img"
                                height="70"
                                width="70"
                                image={`../../images/Prescription.png`}
                              />
                            </div>
                          </CardActionArea>
                        </Card>
                      </NextLink>
                    </div>

                  )}
                </div>
              </div>
              </Box>
              {/* Notification */}
              <h1 style={{ fontSize: '40px', fontWeight: 'bold', marginLeft: '30px', marginTop: '30px', marginBottom:'10px'}}>Notification</h1>
              <Box component="main" sx={{ p: 3 }}>
                <div style={{ height: 500, width: '100%' }}>
                  <TableContainer component={Paper}>
                    <Table aria-label="custom pagination table">
                      <TableBody>
                        {(rowsPerPage > 0
                          ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          : rows
                        ).map((row) => (
                          <TableRow key={row.name}>
                            <TableCell component="th" scope="row">
                              {row.description}
                            </TableCell>
                            <TableCell style={{ width: 160 }} align="right">
                              {row.date}
                            </TableCell>
                            <TableCell style={{ width: 160 }}>
                              <IconButton aria-label="delete" onClick={() => handleDeleteRow(row)}>
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}

                        {emptyRows > 0 && (
                          <TableRow style={{ height: 53 * emptyRows }}>
                            <TableCell colSpan={3} />
                          </TableRow>
                        )}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TablePagination
                            rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                            colSpan={3}
                            count={rows.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            SelectProps={{
                              inputProps: { 'aria-label': 'rows per page' },
                              native: true,
                            }}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                          />
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </TableContainer>
                </div>
                </Box>
                </div>  

            </Box>
        </main>
        </SnackbarProvider>
    </React.Fragment>
  );
}