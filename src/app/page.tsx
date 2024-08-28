'use client'

import styles from "./page.module.css";
import { Container, Grid, TextField, Box, IconButton, Button, Dialog, DialogTitle, FormControl, InputLabel, Select, SelectChangeEvent, MenuItem, DialogContent } from "@mui/material";
import { Document, Packer, Paragraph, TextRun } from 'docx'
import { saveAs } from 'file-saver'
import { useEffect, useState } from "react";
import CloseIcon from '@mui/icons-material/Close';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DownloadIcon from '@mui/icons-material/Download';
import jsPDF from 'jspdf'
import NavBar from "@/components/navbar"
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

interface Field {
  id: number,
  value: string
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

  const [open, setOpen] = useState<boolean>(false)

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true);

  const [fileType, setFileType] = useState<string>('');
  const [prescript, setPrescript] = useState<string>('');
  const [postscript, setPostscript] = useState<string>('')

  const [fields, setFields] = useState<Field[]>([{ id: 1, value: '' }])
  const [company, setCompany] = useState<string>('');
  const [role, setRole] = useState<string>('')
  const [coverLetterTemplate, setCoverLetterTemplate] = useState<string>('')
  const [aiCoverLetter, setAiCoverLetter] = useState<string>('');

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
        }
      } else {
        setLoading(false)
      }
    })
  }, [])

  const handleFileGeneration = () => {
    if (aiCoverLetter != '')
    {
      const finalLetter = prescript + "\n\n" + aiCoverLetter + "\n\n" + postscript;

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

  const handleFileTypeChange = (event: SelectChangeEvent) => {
    setFileType(event.target.value as string)
  }

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleDialogClose = () => {
    setOpen(false);
  }

  const handleFieldChange = (id: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const newFields = fields.map((field) => 
      field.id === id ? { ...field, value: event.target.value } : field
    );

    setFields(newFields);
  }

  const handleAddField = () => {
    console.log(fields)
    setFields([...fields, { id: fields.length > 0 ? fields[fields.length - 1].id + 1 : 1, value: ''}]);
  }

  const handleRemoveField = (id: number) => {
    setFields(fields.filter((field) => field.id !== id));
    console.log(id);
    console.log(fields);
  }

  const submitPrompt = async() => {
    let companyNamePrompt = `The company name is: ${company}`
    let rolePrompt = `The role at the company is: ${role}`;
    let coverLetterPrompt = `The Cover Letter Template:\n\n${coverLetterTemplate}`
    let additionalInformation = 'Additional Information Regarding the Company:\n';

    for (const field of fields) {
      additionalInformation += `- ${field.value}\n`
    }

    const combinedPrompt = companyNamePrompt + "\n\n" + rolePrompt + "\n\n" + coverLetterPrompt + '\n\n' + additionalInformation;

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
      alert('An error occurred while generating flashcards. Please try again.')
    }
  }

  return (
    <main>
      <NavBar page="Cover Letter" loading={loading} user={user}/>
      <div className={styles.coverLetterBody}>
        <Container sx={{ marginTop: 4, lineHeight: 2 }}>
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

          <Grid sx={{ marginTop: 1 }} container spacing={2}>
            <Grid item xs={12}>
              <TextField value={coverLetterTemplate} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setCoverLetterTemplate(event.target.value)} variant="standard" fullWidth multiline label="Cover Letter Template"/>
            </Grid>
          </Grid>

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
            >
              <MenuItem value={'pdf'}>PDF</MenuItem>
              <MenuItem value={'docx'}>DOCX</MenuItem>
            </Select>
          </FormControl>
            <Button onClick={handleFileGeneration} fullWidth sx={{ mt: 2 }}>Generate</Button>
          </DialogContent>

        </Dialog>
        
        
      </div>
    </main>
  );
}
