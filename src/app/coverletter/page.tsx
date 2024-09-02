'use client'

import styles from "./page.module.css";
import { Container, Grid, TextField, Box, IconButton, Button, Dialog, DialogTitle, FormControl, InputLabel, Select, SelectChangeEvent, MenuItem, DialogContent, DialogActions, Typography, Fade } from "@mui/material";
import { Document, Packer, Paragraph, TextRun } from 'docx'
import { saveAs } from 'file-saver'
import { useEffect, useState } from "react";
import jsPDF from 'jspdf'
import NavBar from "@/components/navbar"
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

import { CoverLetterState } from "../interfaces";
import AdditionalInfo from "./additional_info";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface CoverLetterTemplate {
  name: string,
  template: string
}

export default function Home() {

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ]



  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true);

  const [coverLetters, setCoverLetters] = useState<CoverLetterTemplate[]>([]);

  const [choice, setChoice] = useState<boolean>(true);

  const [coverLetterDialogOpen, setCoverLetterDialogOpen] = useState<boolean>(false);
  const [selectedCoverLetterIndex, setSelectedCoverLetterIndex] = useState<number>(-1);
  const [intermediaryCoverLetterIndex, setIntermediaryCoverLetterIndex] = useState<number>(-1);

  const [prescript, setPrescript] = useState<string>('');
  const [postscript, setPostscript] = useState<string>('')

  const [coverLetterState, setCoverLetterState] = useState<CoverLetterState>(CoverLetterState.COVER_LETTER)

  const [headerVisible, setHeaderVisible] = useState<boolean>(false)
  const [nextVisible, setNextVisible] = useState<boolean>(false);
  const [noCoverVisible, setNoCoverVisible] = useState<boolean>(false);
  const [additionalInfoVisible, setAdditionalInfoVisible] = useState<boolean>(true);
  const [coverLetterVisible, setCoverLetterVisible] = useState<boolean>(true);

  const [transitioningNext, setTransitioningNext] = useState<boolean>(false);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  useEffect(() => {
    onAuthStateChanged(auth, async (observedUser) => {
      if (observedUser) {
        setUser(observedUser)
        setLoading(false)

        const userDocRef = doc(db, 'users', observedUser.uid)

        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const data = userDoc.data();

            console.log("Cover Letter Data:", data)

            const today = new Date();
            const fullYear = today.getFullYear();
            const halfYear = String(today.getFullYear())[2] + String(today.getFullYear())[3]
            const paddedDay = String(today.getDate()).padStart(2, "0")
            const normalDay = String(today.getDate());
            const paddedMonth = String(today.getMonth()).padStart(2, "0");
            const normalMonth = String(today.getMonth())
            const wordedMonth = months[today.getMonth()];

            let newPrescript = data.prescript.replace("[month-00]", paddedMonth);
            newPrescript = newPrescript.replace("[month-0]", normalMonth);
            newPrescript = newPrescript.replace("[month]", wordedMonth);
            
            newPrescript = newPrescript.replace("[day-00]", paddedDay);
            newPrescript = newPrescript.replace("[day]", normalDay);

            newPrescript = newPrescript.replace("[year-0000]", fullYear);
            newPrescript = newPrescript.replace("[year-00]", halfYear);

            setPrescript(newPrescript)
            setPostscript(data.postscript)

            setCoverLetters(data.coverLetters);
        }
      } else {
        setLoading(false)
      }
    })
  }, [])

  useEffect(() => {
    const handleAnimations = async () => {
      setHeaderVisible(true)
      await sleep(200)
      setNextVisible(true)
      setNoCoverVisible(true)
      console.log(additionalInfoVisible)
    }

    handleAnimations()
  }, [])

  const handleChangeCoverLetter = (event: any) => {
    setIntermediaryCoverLetterIndex(event.target.value as number)
    setNoCoverVisible(false)
  }

  const handleFadeEnd = () => {
    if (!transitioningNext) {
      setSelectedCoverLetterIndex(intermediaryCoverLetterIndex)
      setIntermediaryCoverLetterIndex(-1)
      setNoCoverVisible(true)
    }
  }
  const handleSwitchCoverLetterState = () => {
    setCoverLetterVisible(false)
  }

  const handleCoverLetterFadeEnd = () => {
    setCoverLetterState(CoverLetterState.ADDITIONAL_INFO);
    setAdditionalInfoVisible(true);
  }

  return (
    <main>
      <NavBar page="Cover Letter" loading={loading} user={user}/>
      {
        coverLetterState == CoverLetterState.ADDITIONAL_INFO ?
              <Fade in={additionalInfoVisible} timeout={300}>
                <div>
                  {
                    coverLetters[selectedCoverLetterIndex] != undefined ? <AdditionalInfo prescript={prescript} postscript={postscript} coverLetter={coverLetters[selectedCoverLetterIndex].template} /> : ""
                  }
                  
                </div>
              </Fade>
             : 
            <Fade onExited={handleCoverLetterFadeEnd} in={coverLetterVisible} timeout={300}>
              <Box>
                <Container maxWidth="md" sx={{ mt: 20 }} >
                  <Fade  in={headerVisible} timeout={800}>
                    <Box>
                      <Grid container spacing={2}>
                        <Grid item xs={10}>
                          <Typography sx={{ color: '#E5E5E5' }} fontWeight="600" variant="h5">Select Your Cover Letter Template</Typography>
                        </Grid>
                        <Grid item xs={2}>
                          <Button disableElevation onClick={() => handleSwitchCoverLetterState()} variant="contained" disabled={selectedCoverLetterIndex == -1} sx={{ backgroundColor: '#666490', '&:hover': { backgroundColor: '#58567D' } }} fullWidth endIcon={<ChevronRightIcon/>}>Next</Button>
                        </Grid>
                      </Grid>

                    </Box>

                  </Fade>

                  <Fade in={nextVisible} timeout={800}>
                    <FormControl                     
                    sx={{
                      mt: 3,
                      borderRadius: '0px !important',
                      '& .MuiInputBase-root': {
                        borderRadius: 1.3
                      },
                      '& .MuiFilledInput-root': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1) !important', // Adjust opacity
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.15) !important', // Hover opacity
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'rgba(255, 255, 255, 0.2) !important', // Focused opacity
                        },
                      },
                      '& .MuiSelect-select': {
                        color: selectedCoverLetterIndex !== undefined ? '#E5E5E5' : '#E5E5E5', // Change color based on selection,
                        fontWeight: 700
                      },
                      }} variant="filled" fullWidth>
                      <InputLabel 
                      sx={{ 
                        color: '#E5E5E5',
                        fontWeight: 600,
                        '&.Mui-focused': {
                          color: '#E5E5E5'
                        }
                       }}
                      id="coverletter-select-label">Cover Letters</InputLabel>
                      <Select
                      variant="filled"
                      labelId="coverletter-select-label"
                      id="coverletter-select"
                      value={selectedCoverLetterIndex !== undefined ? selectedCoverLetterIndex : ''}
                      label="Select a Cover Letter"
                      onChange={(event : any) => { handleChangeCoverLetter(event) }} 
                      sx={{
                        '& .MuiFilledInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)', // Adjust opacity
                          borderRadius: 0, // Ensure consistent border-radius
                          boxShadow: 'none', // Remove box shadow if needed
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.15)', // Hover opacity
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)', // Focused opacity
                          },
                        },
                        '& .MuiSelect-icon': {
                          color: '#E5E5E5', // Adjust icon color if needed
                        },
                      }}
                      >
                        {
                          coverLetters.map((coverletter : CoverLetterTemplate, index) => (
                            <MenuItem value={index} key={index}>{coverletter.name}</MenuItem>
                          ))
                        }
                      </Select>
                    </FormControl>
                  </Fade>
                      
                  <Container maxWidth="sm">
                    {
                      selectedCoverLetterIndex === -1 ? <Fade onExited={handleFadeEnd} in={noCoverVisible} timeout={300} ><Typography sx={{ color: '#E5E5E5', mt: 3 }} fontWeight="600" variant="h6">No Cover Letter Selected...</Typography></Fade> : 
                      <Fade onExited={handleFadeEnd} in={noCoverVisible} timeout={300}><Box sx={{ whiteSpace: 'pre-line', mt: 3, color: '#111', p: 2, borderRadius: 0.7, lineHeight: 1.5, backgroundColor: 'rgba(229, 229, 229, 0.8)' }}>
                      {
                        coverLetters[selectedCoverLetterIndex].template
                      }
                    </Box></Fade> 
                    }

                  </Container>

                </Container>
              </Box>
            </Fade>

      }

    </main>
  );
}
