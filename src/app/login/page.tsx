'use client'

import NavBar from "@/components/navbar";
import { Box, Button, Container } from "@mui/material";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';  
import { auth } from '@/app/firebase'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {

    const [user, setUser] = useState<any>(null)

    const [loading, setLoading] = useState<boolean>(true);

    const router = useRouter();

    useEffect(() => {
        
        onAuthStateChanged(auth, (user) => {
          if (user) {
            setUser(user)
            setLoading(false)

            router.push('/')
          } else {
            setLoading(false)
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

            if (typeof window !== 'undefined') {
                // Client-side only code
                router.push('/');
              }

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
            <NavBar page="Login" loading={loading} user={user}/>
            <Container maxWidth="sm" disableGutters>
                <Box sx={{ display: 'flex', backgroundColor: '#D8D9DF', mt: 10, p: 3, borderRadius: 1 }}>
                    <Button onClick={handleGoogleLogin}>Click to login with Google!</Button>
                </Box>
            </Container>
        </Box>
    )
}