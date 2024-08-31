'use client'

import NavBar from "@/components/navbar";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, Fade, Grid, IconButton, TextField, Tooltip, Typography } from "@mui/material";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { useRouter } from "next/navigation";
import { arrayUnion, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import InfoIcon from '@mui/icons-material/Info';
import styles from "./page.module.css";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

interface CoverLetterTemplate {
    name: string,
    template: string
}

export default function CoverLetter() {

    const router = useRouter();

    const [open, setOpen] = useState<boolean>(false)
    const [alertOpen, setAlertOpen] = useState<boolean>(false);

    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState<boolean>(true)

    const [prescript, setPrescript] = useState<string>('')
    const [postscript, setPostscript] = useState<string>('')

    const [coverLetterName, setCoverLetterName] = useState<string>('');
    const [coverLetterTemplate, setCoverLetterTemplate] = useState<string>('');

    const [coverLetters, setCoverLetters] = useState<CoverLetterTemplate[]>([])

    const [indexDelete, setIndexDelete] = useState<number>(-1);
    const [indexDeleteName, setIndexDeleteName] = useState<string>("");

    const [editState, setEditState] = useState<boolean>(false);
    const [editIndex, setEditIndex] = useState<number>(-1);

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
                setCoverLetters(data.coverLetters)

                
            }
          } else {
            setLoading(false)
          }
        })
      }, [])

    const handleSubmitCoverLetterTemplate = async () => {
        try {

            if (coverLetterName.trim() == '' && coverLetterTemplate.trim() == '') {
                alert('Please enter something in for both the Name and Template');
                return;
            }  

            let myCoverLetter : CoverLetterTemplate = {
                name: coverLetterName,
                template: coverLetterTemplate
            }

            let myCoverLetterArray = [myCoverLetter]

            const userDocRef = doc(db, 'users', user.uid);

            const docSnap = await getDoc(userDocRef);

            if (editState) {
                let newCoverLetters = [...coverLetters]
                newCoverLetters[editIndex] = myCoverLetter;

                setCoverLetters(newCoverLetters)

                if (docSnap.exists()) {
                    if (docSnap.data().coverLetters) {
                        await updateDoc(userDocRef, {
                            coverLetters: newCoverLetters
                        })
                    }
                }
            }



            if (docSnap.exists()) {

                if (docSnap.data().coverLetters) {
                    await updateDoc(userDocRef, {
                        coverLetters: arrayUnion(...myCoverLetterArray)
                    })
                } else {
                    await updateDoc(userDocRef, {
                        coverLetters: myCoverLetterArray
                    })
                }


            } else {
                await setDoc(userDocRef, {
                    coverLetters: myCoverLetterArray
                })
            }

            coverLetters.push(myCoverLetter)

            handleDialogClose()

            console.log("Items added to array successfully");

        } catch (error) {
            console.error(error)
        }
    }

    const handleAlertClickOpen = (index: number) => {
        setIndexDelete(index)
        setIndexDeleteName(coverLetters[index].name)
        setAlertOpen(true)
    }

    const handleAlertClose = () => {
        setAlertOpen(false);
    }

    const handleEditDialog = (index: number) => {
        setEditState(true);
        setEditIndex(index)

        setCoverLetterName(coverLetters[index].name)
        setCoverLetterTemplate(coverLetters[index].template)

        handleClickOpen(true);
    }

    const handleClickOpen = (editState: boolean) => {

        setOpen(true)
    }

    const handleDialogClose = () => {
      setOpen(false);
    }

    const handleExited = () => {
        setEditState(false)
    }

    const handleDeleteCoverLetter = async () => {
        handleAlertClose();
        const newCoverLetters = [...coverLetters];

        console.log("TEST")

        newCoverLetters.splice(indexDelete, 1);

        console.log(newCoverLetters);

        setCoverLetters(newCoverLetters)

        try {
            const userDocRef = doc(db, 'users', user.uid);

            const docSnap = await getDoc(userDocRef)

            if (docSnap.exists()) {
                if (docSnap.data().coverLetters) {
                    await updateDoc(userDocRef, {
                        coverLetters: newCoverLetters
                    })
                    
                }
            }
        } catch(error) {
            console.error(error)
        }
    }

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
                <Box sx={{ backgroundColor: '#383565', p: 1, borderRadius: 1 }}>
                    <Typography className={styles.heading} variant="h6" fontWeight="600" >Adornments</Typography>
                    <TextField 
                    sx={{ mt: 2,
                        '& .MuiFilledInput-root': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)', // Adjust the opacity here
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.15)', // Adjust the opacity on hover
                        }},
                        '&.Mui-focused': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)', // Adjust the opacity when focused
                          },
                        '&::before, &::after': {
                          content: 'none', // Reset pseudo-elements
                        },
                     }}
                    InputProps={{ 
                        style: { 
                            color: '#E5E5E5' 
                            } 
                        }} 
                    InputLabelProps={{
                        style: {
                            fontWeight: '600',
                            color: '#E5E5E5'
                        }
                    }}
                    value={prescript} 
                    onChange={(event) => setPrescript(event.target.value) } 
                    variant="standard" 
                    multiline 
                    label="Pre Script" 
                    fullWidth
                    />
                    <TextField sx={{ mt: 2,
                        '& .MuiFilledInput-root': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)', // Adjust the opacity here
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.15)', // Adjust the opacity on hover
                        }},
                        '&.Mui-focused': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)', // Adjust the opacity when focused
                          },
                        '&::before, &::after': {
                          content: 'none', // Reset pseudo-elements
                        },
                    }} 
                    InputProps={{ 
                        style: { 
                            color: '#E5E5E5',
                            
                            } 
                    }} 
                    InputLabelProps={{
                        style: {
                            color: '#E5E5E5',
                            fontWeight: '600',
                        }
                    }}
                    value={postscript} onChange={(event) => setPostscript(event.target.value) } variant="standard" multiline label="Post Script" fullWidth/>
                    <Box sx={{ textAlign: 'right' }}>
                        <Button onClick={handleSaveAdornments} disableElevation variant="contained" sx={{ mt: 2, backgroundColor: '#666490', '&:hover': { backgroundColor: '#58567D' }, borderRadius: 0.7 }}>Save Adornments</Button>
                    </Box>
                    
                </Box>

                <Box className={styles.heading} sx={{ mt: 4, backgroundColor: '#383565', p: 1, borderRadius: 1 }}>
                    <Box sx={{ mb: 2, display: 'flex', alignItems: 'middle' }}>
                        <Typography variant="h6" fontWeight="600" >Cover Letter Templates</Typography>
                        <Box>
                            <Button onClick={() => handleClickOpen(false)} size="small" sx={{ ml: 2, backgroundColor: '#666490', '&:hover': { backgroundColor: '#58567D' }, borderRadius: 0.7 }} disableElevation startIcon={<AddIcon/>} variant="contained">Add</Button>
                        </Box>
                        
                    </Box>
                    
                    {
                        coverLetters.map((letter, index) => (
                            <Box>
                                <Grid sx={{ mt: 2 }} container>
                                  <Grid item xs={0.8}>
                                    <IconButton onClick={() => handleAlertClickOpen(index)} color="error" sx={{ mt: 0.3}}><DeleteIcon fontSize="inherit"/></IconButton>
                                  </Grid>
                                  <Grid item xs={0.8}>
                                    <IconButton onClick={() => handleEditDialog(index)} color="primary" sx={{ mt: 0.3}}><EditIcon fontSize="inherit"/></IconButton>
                                  </Grid>
                                  <Grid item xs={10.4}>
                                  <Accordion className={styles.accordion}>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon/>}
                                        aria-controls="panel-content"
                                        id="panel-header"
                                    >
                                        {letter.name}
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ whiteSpace: 'pre-line' }}>
                                    <Typography variant="body1" sx={{ lineHeight: 1.5 }}>
                                        {letter.template}
                                    </Typography>

                                </AccordionDetails>
                            </Accordion>
                                  </Grid>
                                </Grid>
                            

                            </Box>

                        ))
                    }
                </Box>

            </Container>

            <Dialog TransitionComponent={Fade} TransitionProps={{ onExited: handleExited }} fullWidth maxWidth="lg" onClose={handleDialogClose} open={open}>
                <DialogTitle>{!editState ?
                    "Create a Template!" : "Edit " + coverLetters[editIndex].name
                    }
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ display: 'flex', alignItems: 'center' }} variant="subtitle1" fontSize="15px" >How do I do this? 
                        <Tooltip title="Paste or write your cover letter here. For anything you'd like the AI to fill in, use brackets like [this].">
                            <InfoIcon className={styles.infoIcon} sx={{ mb: "2.5px", ml: 1 }} fontSize="inherit"/>
                        </Tooltip>
                    </Typography>

                    <TextField onChange={(event) => setCoverLetterName(event.target.value)} value={coverLetterName} sx={{ mt: 3 }} multiline variant="standard" label="Name of Cover Letter" fullWidth />

                    <TextField onChange={(event) => setCoverLetterTemplate(event.target.value)} value={coverLetterTemplate} sx={{ mt: 3 }} multiline variant="standard" label="Cover Letter Template" fullWidth />
                    <Button onClick={handleSubmitCoverLetterTemplate} sx={{ mt: 2, float: 'right' }} >{ !editState ? "Submit" : "Edit Cover Letter"}</Button>
                </DialogContent>
            </Dialog>

            <Dialog  onClose={handleAlertClose} open={alertOpen}>
                <DialogTitle>Are you sure you want to delete {
                    indexDeleteName
                }?</DialogTitle>
                <DialogContent>
                    This cannot be undone!
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleAlertClose}>Cancel</Button>
                    <Button onClick={handleDeleteCoverLetter}>Confirm</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}