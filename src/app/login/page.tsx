'use client'

import NavBar from "@/components/navbar";
import { Box, Button, Container } from "@mui/material";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';  
import { auth } from '@/app/firebase'
import { useEffect, useState } from "react";

export default function Login() {

    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
          if (user) {
            setUser(user)
          } else {
            console.log("user is not signed in!");
          }
        })
      }, [])

    const handleGoogleLogin = () => {
        const provider = new GoogleAuthProvider();

        signInWithPopup(auth, provider)
        .then((result) => {
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential?.accessToken;

            const user = result.user;

            console.log(user);
        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;

            const email = error.customData.email;

            const credential = GoogleAuthProvider.credentialFromError(error);
            alert(errorMessage)
            console.log(errorMessage)
        })
    }

    return (
        <Box>
            <NavBar user={user}/>
            <Container maxWidth="sm" disableGutters>
                <Box sx={{ display: 'flex', backgroundColor: '#D8D9DF', mt: 10, p: 3, borderRadius: 1 }}>
                    <Button onClick={handleGoogleLogin}>Click to login with Google!</Button>
                </Box>
            </Container>
        </Box>
    )
}