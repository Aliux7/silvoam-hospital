import React, { useState, useEffect } from 'react';
import { ListItem, useTheme } from '@mui/material';
import Head from 'next/head';
import scss from '../../styles/Home.module.scss';
import { Box } from '@mui/system';
import SideMenu from '../../components/SideMenu/SideMenu';
import { fireStore } from '../../firebase/firebase-config';
import { collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc } from "firebase/firestore";
import { fetchJobByRoomID, fetchJobWhichIsLate, fetchJobWhichUnfinished } from '../../firebase/fetch-data';
import ThemeToggleButton from '../../components/ThemeToggleButton/ThemeToggleButton';



const Setting = (props) => {
  const { ColorModeContext } = props;
  const theme = useTheme();

  return (
    <React.Fragment>
      <Head>
        <title>Setting - SiLVoam Hospital</title>
      </Head>
      <main className={scss.main}>
        <Box sx={{ display: 'flex' }}>
          <SideMenu/>
          <div style={{ flexGrow: 1 }}>
            <Box component="main" sx={{ p: 3 }}>
            <h1 style={{ fontSize: '50px', fontWeight: 'bold', marginLeft: '30px', marginTop: '30px', marginBottom: '10px' }}>Setting</h1>
              Ini Setting
              <ListItem disablePadding sx={{ display: 'block' }}>
                <ThemeToggleButton ColorModeContext={ColorModeContext} />
              </ListItem>
            </Box>
          </div>
        </Box>
      </main>
    </React.Fragment>
  );
};

export default Setting;
