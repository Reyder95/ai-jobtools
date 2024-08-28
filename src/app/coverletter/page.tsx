'use client'

import NavBar from "@/components/navbar";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { useRouter } from "next/navigation";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";

export default function CoverLetter() {

    const router = useRouter();

    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState<boolean>(true)

    const [prescript, setPrescript] = useState<string>('')
    const [postscript, setPostscript] = useState<string>('')

    useEffect(() => {
        onAuthStateChanged(auth, async(observedUser) => {
          if (observedUser) {
            setUser(observedUser)
            setLoading(false)

            const userDocRef = doc(db, 'users', observedUser.uid)

            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const data = userDoc.data();

                console.log("Cover Letter Data:", data)

                setPrescript(data.prescript)
                setPostscript(data.postscript)
            }
          } else {
            setLoading(false)
          }
        })
      }, [])

    const handleSaveAdornments = async () => {
        if (!prescript.trim() && !postscript.trim()) {
            alert("Please enter at least a prescript or a postscript!");
            return;
        }

        if (!user) {
            alert("You are not signed in!")
            return;
        }

        try {
            const userDocRef = doc(db, 'users', user.uid);

            const coverLetterData = {
                prescript: prescript,
                postscript: postscript
            }

            await setDoc(userDocRef, coverLetterData, { merge: true })

            console.log("Cover letter data uploaded successfully!")
        } catch (error) {
            console.error(error)
        }
        
    }

    return (
        <Box>
            <NavBar loading={loading} user={user} page="Cover Letter Setup"  />

            <Container maxWidth="md" sx={{ mt: 3 }}>
                <Box>
                    <Typography variant="h6" fontWeight="600" >Adornments</Typography>
                    <TextField value={prescript} onChange={(event) => setPrescript(event.target.value) } variant="standard" multiline label="Pre Script" fullWidth/>
                    <TextField value={postscript} onChange={(event) => setPostscript(event.target.value) } variant="standard" multiline label="Post Script" fullWidth/>
                    <Button onClick={handleSaveAdornments} variant="contained" sx={{ mt: 2, float: 'right' }}>Save Adornments</Button>
                </Box>


            </Container>
        </Box>
    )
}