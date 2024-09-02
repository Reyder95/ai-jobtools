import { Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material";
import UndoIcon from '@mui/icons-material/Undo';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DownloadIcon from '@mui/icons-material/Download';
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from 'file-saver'
import jsPDF from "jspdf";
import CoverLetterTemplate from "../interfaces";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

interface Field {
    id: number,
    value: string
  }

interface Props {
    coverLetter: string;
    prescript: string,
    postscript: string
}

export default function AdditionalInfo(props: Props) {
    const [aiCoverLetter, setAiCoverLetter] = useState<string>('');
    const [company, setCompany] = useState<string>('');
    const [role, setRole] = useState<string>('')
    const [coverLetterTemplate, setCoverLetterTemplate] = useState<string>('')
    const [open, setOpen] = useState<boolean>(false)
    const [fileType, setFileType] = useState<string>('');
    const [jobDescription, setJobDescription] = useState<string>('');
    const [additionalInformation, setAdditionalInformation] = useState<string>('');

    const handleFileTypeChange = (event: SelectChangeEvent) => {
        setFileType(event.target.value as string)
    }

    const handleClickOpen = () => {
      setOpen(true)
    }

    const handleDialogClose = () => {
      setOpen(false);
    }

    const handleFileGeneration = () => {
        if (aiCoverLetter != '')
        {
          const finalLetter = props.prescript + "\n\n" + aiCoverLetter + "\n\n" + props.postscript;
    
          if (fileType == 'pdf') {
            const doc = new jsPDF();
            const maxWidth = 180;
            doc.setFontSize(10);
            doc.text(finalLetter, 15, 15, { lineHeightFactor: 1.5, maxWidth: maxWidth });
            doc.save('coverletter.pdf');
          }
          else if (fileType == 'docx') {
            const doc = new Document({
              sections: [
                {
                  properties: {},
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun(finalLetter),
                      ],
                    }),
                  ],
                },
              ],
            });
    
            Packer.toBlob(doc).then((blob) => {
              saveAs(blob, 'coverletter.docx')
            })
            
          }
        }
    
      }

      const submitPrompt = async() => {
        let companyNamePrompt = `The company name is: ${company}`
        let rolePrompt = `The role at the company is: ${role}`;
        let coverLetterPrompt = `The Cover Letter Template:\n\n${props.coverLetter}`
        let additionalInformationPrompt = 'Additional Information About The Company Or Myself:\n' + additionalInformation;
        let jobDescriptionPrompt = 'The Job Description is:\n ' + jobDescription;
    
        const combinedPrompt = companyNamePrompt + "\n\n" + rolePrompt + "\n\n" + coverLetterPrompt + '\n\n' + additionalInformationPrompt + '\n\n' + jobDescriptionPrompt;
    
        try {
          const response = await fetch('/api/generate', {
            method: 'POST',
            body: combinedPrompt
          })
    
          if (!response.ok)
            throw new Error('Failed to generate cover letter')
    
          const data = await response.json();
    
          setAiCoverLetter(data);
        } catch (error) {
          console.error(error);
          alert('An error occurred while generating the cover letter. Please try again')
        }
      }

    const handleDisableButton = () => {
        if (company.trim() == '' || role.trim() == '')
            return true;
        return false;
    }

    return (
        <Box>
            <Container sx={{ mt: 4, lineHeight: 2 }}>
                <Container maxWidth="sm">
                    <Box sx={{ whiteSpace: 'pre-line', mt: 3, color: '#111', p: 2, borderRadius: 0.7, lineHeight: 1.5, backgroundColor: 'rgba(229, 229, 229, 0.8)' }}>
                        {
                            aiCoverLetter == '' ? props.coverLetter : aiCoverLetter
                        }
                        
                    </Box>

                    <Grid sx={{ mt: 2 }} container spacing={2}>
                        <Grid item xs={6}>
                            <TextField 
                            required
                            variant="filled"
                            fullWidth
                            label="Company"
                            value={company}
                            onChange={(event) => setCompany(event.target.value)}
                            sx ={{
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
                                    color: '#E5E5E5', // Change color based on selection,
                                    fontWeight: 700
                                  },
                            }}
                            InputProps={{
                                style: {
                                    color: '#E5E5E5',
                                    fontWeight: 700
                                }
                            }}
                            InputLabelProps={{
                                style: {
                                    color: '#E5E5E5',
                                    fontWeight: 600,
                                }
                            }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField 
                            required
                            variant="filled"
                            fullWidth
                            label="Role"
                            value={role}
                            onChange={(event) => setRole(event.target.value)}
                            sx ={{
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
                                    color: '#E5E5E5', // Change color based on selection,
                                    fontWeight: 700
                                  },
                            }}
                            InputProps={{
                                style: {
                                    color: '#E5E5E5',
                                    fontWeight: 700
                                }
                            }}
                            InputLabelProps={{
                                style: {
                                    color: '#E5E5E5',
                                    fontWeight: 600,
                                }
                            }}
                            />
                        </Grid>
                    </Grid>
                    <Grid sx={{ mt: 2 }} container spacing={2}>
                        <Grid item xs={12}>
                        <TextField 
                            multiline
                            maxRows={10}
                            variant="filled"
                            fullWidth
                            label="Job Description"
                            value={jobDescription}
                            onChange={(event) => setJobDescription(event.target.value)}
                            sx ={{
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
                                    color: '#E5E5E5', // Change color based on selection,
                                    fontWeight: 700
                                  },
                            }}
                            InputProps={{
                                style: {
                                    color: '#E5E5E5',
                                    fontWeight: 700
                                }
                            }}
                            InputLabelProps={{
                                style: {
                                    color: '#E5E5E5',
                                    fontWeight: 600,
                                }
                            }}
                            />
                        </Grid>
                    </Grid>
                    <Grid sx={{ mt: 2 }} container spacing={2}>
                        <Grid item xs={12}>
                        <TextField 
                            multiline
                            variant="filled"
                            fullWidth
                            label="Additional Information"
                            value={additionalInformation}
                            onChange={(event) => setAdditionalInformation(event.target.value)}
                            sx ={{
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
                                    color: '#E5E5E5', // Change color based on selection,
                                    fontWeight: 700
                                  },
                            }}
                            InputProps={{
                                style: {
                                    color: '#E5E5E5',
                                    fontWeight: 700
                                }
                            }}
                            InputLabelProps={{
                                style: {
                                    color: '#E5E5E5',
                                    fontWeight: 600,
                                }
                            }}
                            />
                        </Grid>
                    </Grid>
                    <Grid sx={{ mt: 1 }} container spacing={2}>
                        <Grid item xs={8}>
                            <Button onClick={() => setOpen(true)} disabled={aiCoverLetter == ''} disableElevation variant="contained" sx={{ backgroundColor: '#666490', '&:hover': { backgroundColor: '#58567D' } }} fullWidth>Generate</Button>
                        </Grid>
                        <Grid item xs={4}>
                            <Button onClick={submitPrompt} disabled={handleDisableButton()} disableElevation variant="contained" sx={{ backgroundColor: '#666490', '&:hover': { backgroundColor: '#58567D' } }} fullWidth>Generate</Button>
                        </Grid>
                        
                    </Grid>
                </Container>

                <Dialog onClose={handleDialogClose} open={open}>
                <DialogTitle>Download Cover Letter</DialogTitle>
                <DialogContent>
      
                <TextField value={props.prescript} fullWidth multiline variant="standard" label="Prescript"/>
                <TextField value={props.postscript} fullWidth multiline variant="standard" label="Postscript"/>
                <FormControl sx={{ mt: 3 }} fullWidth>
      
                  <InputLabel id="filetype-select-label">File Type</InputLabel>
                  <Select
                    variant="standard"
                    labelId="filetype-select-label"
                    id="filetype-select"
                    value={fileType}
                    label="File Type"
                    onChange={handleFileTypeChange}
                    displayEmpty
                  >
                    <MenuItem value="">
                      None
                    </MenuItem>
                    <MenuItem value={'pdf'}>PDF</MenuItem>
                    <MenuItem value={'docx'}>DOCX</MenuItem>
                  </Select>
                </FormControl>
                  <Button onClick={handleFileGeneration} fullWidth sx={{ mt: 2 }}>Generate</Button>
                </DialogContent>
      
              </Dialog>
            </Container>
            {/* <Container sx={{ marginTop: 4, lineHeight: 2 }}>
                <Box sx={{ mb: 4, whiteSpace: 'pre-line' }}>
                  {aiCoverLetter}
                </Box>
              </Container>
      
              <Container sx={{ position: "relative" }} className={styles.formControl} maxWidth="md">
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <h4>Core Information</h4>
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={6}>  
                    <TextField value={company} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setCompany(event.target.value)} fullWidth label="Company" variant="standard"/>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField value={role} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setRole(event.target.value)} fullWidth label="Role" variant="standard"/>
                  </Grid>
                </Grid>
      
                {
                  !choice ? 
                <Grid sx={{ display: 'flex', alignItems: 'center', marginTop: 1 }} container spacing={2}>
                  <Grid sx={{ mt: 2, alignItems: 'center' }} item xs={0.7}>
                    <IconButton onClick={() => setChoice(true)} ><UndoIcon/></IconButton>
                  </Grid> 
                  <Grid item xs={11.3}>
                    <TextField value={coverLetterTemplate} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setCoverLetterTemplate(event.target.value)} variant="standard" fullWidth multiline label="Cover Letter Template"/>
                  </Grid> 
                </Grid> :
                <Grid sx={{ marginTop: 1 }} container spacing={2}>
                  <Grid item xs={6}>
                    <Button onClick={() => setCoverLetterDialogOpen(true)} fullWidth>Select Cover Letter</Button>
                  </Grid> 
                  <Grid item xs={6}>
                    <Button onClick={() => setChoice(false)} fullWidth>Manually Type One</Button>
                  </Grid>
                </Grid>
                }
      
      
                <Grid sx={{marginTop: 1, marginBottom: -3}} container spacing={2}>
                  <Grid item xs={12}>
                    <h4>Additional Information</h4>
                  </Grid>
                </Grid>
      
                {fields.map((field) => (
                 <Grid key={field.id} sx={{marginTop: -1}} container spacing={2}>
                  <Grid item xs={12}>
                   <Box sx={{ display: 'flex', alignItems: 'center' }}>
                     <IconButton sx={{ mt: 1.9, mr: 1 }} onClick={() => handleRemoveField(field.id)} aria-label="close">
                       <CloseIcon/>
                     </IconButton>
                     <TextField multiline value={field.value} onChange={(event : React.ChangeEvent<HTMLInputElement>) => handleFieldChange(field.id, event)} fullWidth label="Info" variant="standard"/>
      
                   </Box> 
                 </Grid> 
                 </Grid>
                ))}
      
      
                <Grid sx={{ marginTop: 1 }} container spacing={2}>
                  <Grid item xs={12}>
                    <Button onClick={handleAddField}>
                      <AddCircleIcon/> <span style={{ marginLeft: 10 }}>New Field</span>
                    </Button>
                  </Grid>
                </Grid>
      
                <Box sx={{ position: "absolute", bottom: 10, right: 4 }}>
                  <Button onClick={submitPrompt}>Submit</Button>
                </Box>
      
                <Box sx={{ position: "absolute", top: 10, right: 0 }}>
                  <Button onClick={handleClickOpen}>
                    <DownloadIcon/>
                  </Button>
                </Box>
                
              </Container>
      
              <Dialog onClose={handleDialogClose} open={open}>
                <DialogTitle>Download Cover Letter</DialogTitle>
                <DialogContent>
      
                <TextField value={prescript} onChange={(event) => setPrescript(event.target.value)} fullWidth multiline variant="standard" label="Prescript"/>
                <TextField value={postscript} onChange={(event) => setPostscript(event.target.value)} fullWidth multiline variant="standard" label="Postscript"/>
                <FormControl sx={{ mt: 3 }} fullWidth>
      
                  <InputLabel id="filetype-select-label">File Type</InputLabel>
                  <Select
                    variant="standard"
                    labelId="filetype-select-label"
                    id="filetype-select"
                    value={fileType}
                    label="File Type"
                    onChange={handleFileTypeChange}
                    displayEmpty
                  >
                    <MenuItem value="">
                      None
                    </MenuItem>
                    <MenuItem value={'pdf'}>PDF</MenuItem>
                    <MenuItem value={'docx'}>DOCX</MenuItem>
                  </Select>
                </FormControl>
                  <Button onClick={handleFileGeneration} fullWidth sx={{ mt: 2 }}>Generate</Button>
                </DialogContent>
      
              </Dialog>
      
              <Dialog
              maxWidth="md"
              fullWidth
              onClose={handleCoverLetterDialogClose}
              open={coverLetterDialogOpen}
              >
                <DialogTitle>Select a Cover Letter</DialogTitle>
                <DialogContent>
                  <FormControl sx={{ mt: 3 }} fullWidth>
                    <InputLabel id="coverletter-select-label">Select a Cover Letter</InputLabel>
                    <Select
                    variant="standard"
                    labelId="coverletter-select-label"
                    id="coverletter-select"
                    value={selectedCoverLetterIndex !== undefined ? selectedCoverLetterIndex : ''}
                    label="Select a Cover Letter"
                    onChange={handleCoverLetterChange}
                    >
                      {
                        coverLetters.map((coverletter : CoverLetterTemplate, index) => (
                          <MenuItem value={index} key={index}>{coverletter.name}</MenuItem>
                        ))
                      }
                    </Select>
                  </FormControl>
      
                  <Box sx={{ mt: 2, whiteSpace: 'pre-line' }}>
                    {
                      selectedCoverLetterIndex !== undefined && selectedCoverLetterIndex > -1 ? coverLetters[selectedCoverLetterIndex].template : "No Cover Letter Selected!"
                    }
                  </Box>
      
      
                </DialogContent>
      
                <DialogActions>
                  <Button onClick={handleCoverLetterDialogClose}>Cancel</Button>
                  <Button onClick={handleConfirmCoverLetter}>Confirm</Button>
                </DialogActions>
              </Dialog> */}
        </Box>
    )
}