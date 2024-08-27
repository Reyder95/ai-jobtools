'use client'

import { AppBar, Box, Button, IconButton, Toolbar, Typography } from "@mui/material"
import MenuIcon from '@mui/icons-material/Menu';
import Link from "next/link";
import styles from "./components.module.css";
import { auth } from '@/app/firebase';
import { signOut } from "firebase/auth";
import { useState } from "react";

interface Props {
    user: any
}

export default function NavBar(props: Props) {

    const handleSignOut = () => {
        signOut(auth).then(() => {
            window.location.reload();
            
        }).catch((error) => {
            console.log(error)
        })
    }

    return (
        <Box sx={{ flexGrow: 1}}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Cover Letter
                    </Typography>
                    { 
                        props.user ? (
                            <p><Button onClick={handleSignOut} color="inherit"><Typography fontWeight="600" component="div" sx={{ flexGrow: 1 }}>Sign Out</Typography></Button></p>
                        ) : (
                            <Link className={styles.login} href="/login"><Button color="inherit"><Typography fontWeight="600" component="div" sx={{ flexGrow: 1 }}>Login</Typography></Button></Link>
                        )
                    }
                    
                </Toolbar>
            </AppBar>
        </Box>
    )
}