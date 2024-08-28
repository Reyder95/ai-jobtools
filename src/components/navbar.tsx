'use client'

import { AppBar, Avatar, Box, Button, IconButton, Menu, MenuItem, Toolbar, Typography } from "@mui/material"
import MenuIcon from '@mui/icons-material/Menu';
import Link from "next/link";
import styles from "./components.module.css";
import { auth } from '@/app/firebase';
import { signOut } from "firebase/auth";
import { useState } from "react";
import { useRouter } from 'next/navigation'

interface Props {
    user: any,
    loading: boolean
    page: string
}

export default function NavBar(props: Props) {

    const router = useRouter();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const open = Boolean(anchorEl);

    const handleNameClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleNameClose = () => {
        setAnchorEl(null)
    }

    const handleSignOut = () => {
        signOut(auth).then(() => {
            window.location.reload();
            
        }).catch((error) => {
            console.log(error)
        })
    }

    const handleCoverLetter = () => {
        router.push('/coverletter')
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
                        {props.page}
                    </Typography>
                    { 
                        props.loading ? (
                            <Box>
                                Loading...
                            </Box>
                        ) : 
                        props.user ? (
                            <p>
                                <Button 
                                onClick={handleNameClick} 
                                color="inherit">
                                    <Typography 
                                    fontWeight="600" 
                                    component="div" 
                                    sx={{ 
                                        flexGrow: 1, 
                                        display: 'flex', 
                                        justifyContent: 'center', 
                                        alignItems: 'center' 
                                    }}
                                    id="name-button"
                                    aria-controls={open ? 'profile-options' : undefined}
                                    aria-haspopup="true"
                                    aria-expanded={open ? 'true' : undefined}
                                    >
                                        <Avatar 
                                            sx={{ 
                                                mr: 2 
                                            }} 
                                            alt="Profile Pic" 
                                            src={
                                                props.user.photoURL
                                            } 
                                            />
                                        {props.user.displayName}
                                    </Typography>
                                </Button>
                            </p>
                        ) : (
                            <Link className={styles.login} href="/login"><Button color="inherit"><Typography fontWeight="600" component="div" sx={{ flexGrow: 1 }}>Login</Typography></Button></Link>
                        )
                    }
                    
                </Toolbar>
            </AppBar>

            <Menu
                id="profile-options"
                anchorEl={anchorEl}
                open={open}
                onClose={handleNameClose}
                MenuListProps={{
                    'aria-labelledby': 'name-button'
                }}
            >
                <MenuItem onClick={handleCoverLetter}>Cover Letter Setup</MenuItem>
                <MenuItem>Resume Set Up</MenuItem>
                <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
            </Menu>
        </Box>
    )
}