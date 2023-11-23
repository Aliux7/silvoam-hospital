import React, { useContext, useState } from 'react';
import Head from 'next/head';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Link from '../../components/Link';
import { DialogContentText, Box, styled } from '@mui/material';
import Router from 'next/router';
import { auth, fireStore } from '../../firebase/firebase-config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import scss from '../../styles/Home.module.scss';
import { fetchDataById } from '../../firebase/fetch-data';

// const staffAuth = collection(fireStore, "usersRequest");

const Root = styled('div')(({ theme }) => {
    return {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: theme.spacing(4),
        background: '#F0F0F0'
    };
});

function Login() {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [validateAuth, setValidateAuth] = useState("");
    const [error, setError] = useState({ email: "", password: "", validateAuth: ""});

    const handleLogin = () => {
        let isValid = true;
        let errors = { email: "", password: "", validateAuth: "" };

        if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email.trim())) {
            isValid = false;
            errors.email = "Please enter a valid email address.";
        }

        if (password.trim().length < 6) {
            isValid = false;
            errors.password = "Password must be at least 6 characters long.";
        }

        setError(errors);

        if (isValid) {
            signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                const uid  = auth.currentUser.uid;
                let userData = null;
                fetchDataById("users", uid).then(d => {
                    if(d){
                        userData = {email: email, name: d.data().name, role: d.data().role, shift: d.data().shift}
                    }
                })
                if(auth.currentUser){
                    const uid  = auth.currentUser.uid;
                    fetchDataById("users", uid).then(d => {
                      if(d){
                        localStorage.clear();
                        localStorage.setItem("role",d.data().role);
                        localStorage.setItem("name",d.data().name);
                        localStorage.setItem("email",d.data().email);
                        Router.push('/dashboard/dashboard');
                      }
                    })
                  }
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                errors.validateAuth = errorMessage;
                setPassword("");
                setEmail("");
            });
        };
    };

    const handleRegister = () => {
        Router.push('/auth/register');
    };

    return (
        <React.Fragment>
            <Head>
                <title>Login - SiLVoam Hospital Portal</title>
            </Head>
            <main className={scss.authMain}>
                <Typography variant="h3" gutterBottom>
                    SiLVoam Hospital
                </Typography>
                <Box width={1/3} minWidth={240} marginY={2}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="id"
                        label="Employee ID"
                        name="id"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        helperText={error.email}
                        error={error.email.length > 0}
                        color="secondary"
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        helperText={error.password}
                        error={error.password.length > 0}
                        color="secondary"
                    />
                    {error.validateAuth && <p style={{ color: 'red' }}>User not found</p>}
                    <Box marginTop={2}>
                        <Button variant="contained" color="secondary" onClick={handleLogin} fullWidth>
                            Login
                        </Button>
                        <Button  color="secondary" onClick={handleRegister} fullWidth>
                            Register
                        </Button>
                    </Box>
                </Box>
            </main>
        </React.Fragment>
    );
};

export default Login
