import React, { useEffect } from 'react';
import Head from 'next/head';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Link from '../../components/Link';
import {Box, styled} from '@mui/material';
import { auth } from '../../firebase/firebase-config';
import Router from 'next/router';
import SideMenu from '../../components/SideMenu/SideMenu';
import scss from '../../styles/Home.module.scss';


const Root = styled('div')(({theme}) => {
    return {
        textAlign: 'center',
        paddingTop: theme.spacing(4),
    };
});

const Home: React.FC = () => {

    const user = auth.currentUser;
    
    useEffect(() => {
        if(user == null){
            Router.push('/auth/login')
        }else{}
        console.log(Router.pathname)            
    }, [])

    return (
        <React.Fragment>
        </React.Fragment>
    );
};

export default Home;
