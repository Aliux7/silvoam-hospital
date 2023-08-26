import React, { useState } from 'react';
import Head from 'next/head';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Link from '../../components/Link';
import { DialogContentText, Box, styled, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import Router from 'next/router';
import { collection, doc, setDoc } from 'firebase/firestore';
import { fireStore } from '../../firebase/firebase-config';
import scss from '../../styles/Home.module.scss';

const staffRef = collection(fireStore, "usersRequest");

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

async function insertStaff(name: string, email: string, phone: string, password: string, role: string){
    await setDoc(doc(staffRef), {
        name: name, email: email, phone: phone, password: password, role: role});
}

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");
    const [error, setError] = useState({ name: "", email: "", phone: "", password: "", role: ""});
    
    const handleRegister = () => {
        let isValid = true;
        let errors = { name: "", email: "", phone: "", password: "", role: ""};

        if (name.trim().length < 6) {
            isValid = false;
            errors.name = "Name must be at least 6 characters long.";
        }

        if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email.trim())) {
            isValid = false;
            errors.email = "Please enter a valid email address.";
        }

        if (!/^\d+$/.test(phone.trim())) {
            isValid = false;
            errors.phone = "Please enter a valid 10-digit phone number.";
          }

        if (password.trim().length < 6) {
            isValid = false;
            errors.password = "Password must be at least 6 characters long.";
        }

        if (!role){
            isValid = false;
            errors.role = "Role must be choose."
        }
        setError(errors);

        if (isValid) {
            insertStaff(name, email, phone, password, role);
            Router.push('/auth/login');
        }
    };

    const handleLogin = () => {
        Router.push('/auth/login');
    };

    return (
        <React.Fragment>
            <Head>
                <title>Register - SiLVoam Hospital Portal</title>
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
                        id="name"
                        label="Name"
                        name="name"
                        autoFocus
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        helperText={error.name}
                        error={error.name.length > 0}
                        color="secondary"
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="email"
                        label="Email"
                        type="email"
                        id="email"
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
                        name="phone"
                        label="Phone"
                        type="phone"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        helperText={error.phone}
                        error={error.phone.length > 0}
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
                    <FormControl 
                        variant="outlined" 
                        margin="normal"
                        required
                        fullWidth
                        color="secondary"
                        error={error.role.length > 0}
                        >
                        <InputLabel id="demo-simple-select-outlined-label">Role</InputLabel>
                        <Select
                        labelId="role"
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        label="Role"
                        >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        <MenuItem value={"Ambulance Driver"}>Ambulance Driver</MenuItem>
                        <MenuItem value={"Cleaning Service"}>Cleaning Service</MenuItem>
                        <MenuItem value={"Doctor"}>Doctor</MenuItem>
                        <MenuItem value={"Administration Staff"}>Administration Staff</MenuItem>
                        <MenuItem value={"Kitchen Staff"}>Kitchen Staff</MenuItem>
                        <MenuItem value={"Pharmacist"}>Pharmacist</MenuItem>
                        <MenuItem value={"Nurses"}>Nurses</MenuItem>
                        </Select>
                    </FormControl>

                    <Box marginTop={2}>
                        <Button variant="contained" color="secondary" onClick={handleRegister} fullWidth>
                            Register
                        </Button>
                        <Button  color="secondary" onClick={handleLogin} fullWidth>
                            Login
                        </Button>
                    </Box>
                </Box>
            </main>
        </React.Fragment>
    );
};

export default Register
