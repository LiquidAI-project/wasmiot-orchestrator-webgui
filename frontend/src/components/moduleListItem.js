import * as React from 'react';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';
import {fetchModules, handleModuleDelete} from '../utils';
import Divider from '@mui/material/Divider';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PublishIcon from '@mui/icons-material/Publish';
import { Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';

    
function ModuleListItem({module, moduleCard, modules, setModules, moduleCards, setModuleCards}) {

    const [moduleCardFile, setModuleCardFile] = useState(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [error, setError] = useState("");

    const fetchModuleCards = async() => {
        const moduleCardsResponse = await axios.get('moduleCards');
        const fetchedLogs = moduleCardsResponse.data;
        setModuleCards(fetchedLogs);
    };

    // Hidden file input style
    const VisuallyHiddenInput = styled('input')({
        opacity: 0,
        position: 'absolute',
        zIndex: -1,
        width: '100%',
        height: '100%',
        left: 0,
        top: 0,
        cursor: 'pointer',
    });

    // Submit module data to the server
    useEffect(() => {
        async function handleModuleCardSubmit() {
            try {
                if (moduleCardFile === null || moduleCardFile === undefined) {
                    return;
                }
    
                // Convert the module card to json, throw error if it fails
                const reader = new FileReader();
                let jsonData = {}
                reader.onload = async(e) => {
                    const jsonData = JSON.parse(e.target.result);
                    setError(null); // Clear any existing errors
                    for (let i = 0; i < jsonData.permission.length; i++) {
                        jsonData.permission[i].target = module._id;
                    }
                    console.log(jsonData);
                    const response2 = await axios.post('moduleCards', jsonData);
                    if (response2.status === 200) {
                        setUploadSuccess(true);
                        fetchModuleCards();
                    } else {
                        setError('Module card upload failed.');
                        setUploadSuccess(false);
                    }
                    
                };      
                reader.onerror = (error) => {
                    console.error("Error reading file:", error);
                };      
                reader.readAsText(moduleCardFile);
            } catch (error) {
                console.error('Error uploading the modulecard:', error);
                setError('Error uploading the module card.');
                setUploadSuccess(false);
            }
        };
        handleModuleCardSubmit();
    }, [moduleCardFile]);

    return (
        <>
            <Accordion key={`${module._id}-accordion`}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`${module._id}-content`}
                    id={`${module._id}-header`}
                >
                    {module.name}
                </AccordionSummary>
                <AccordionDetails>
                    Filename: {module.wasm.originalFilename}
                    <br/>
                    <br/>
                    <Accordion key={`${module._id}-accordion-inner-1`}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls={`${module._id}-content-inner-1`}
                            id={`${module._id}-header-inner-1`}
                        >
                        Module card:
                        </AccordionSummary>
                        <AccordionDetails>
                            <pre>
                                {(() => {
                                    if (moduleCard) {
                                    return (
                                        <>
                                        {JSON.stringify(moduleCard, null, 2)}
                                        </>
                                    );
                                    } else {
                                    return "No module card found.";
                                    }
                                })()}
                            </pre>

                            <Box component="form">
                                {uploadSuccess && (
                                    <Alert severity="success">
                                        Card uploaded successfully!
                                    </Alert>
                                )}
                                {error && <Alert severity="error">{error}</Alert>}
                                {!uploadSuccess && (
                                    <>
                                        <Box sx={{ display: 'flex', alignItems: 'left' }}>
                                            <Button
                                                variant="outlined"
                                                fullWidth
                                                component="label"
                                                endIcon={<PublishIcon />}
                                            >
                                                Upload new module card
                                                <VisuallyHiddenInput
                                                    type="file"
                                                    onChange={(e) => setModuleCardFile(e.target.files[0])}
                                                />
                                            </Button>
                                            {moduleCardFile && <Box sx={{ ml: 2 }}>Selected file: {moduleCardFile.name}</Box>}
                                        </Box>
                                    </>
                                )}
                            </Box>

                        </AccordionDetails>
                    </Accordion>
                    
                    <Divider textAlign="center"></Divider>
                    <Accordion key={`${module._id}-accordion-inner-2`}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls={`${module._id}-content-inner-2`}
                            id={`${module._id}-header-inner-2`}
                        >
                        Module details:
                        </AccordionSummary>
                        <AccordionDetails>
                            <pre>
                                {JSON.stringify(module, null, 2)}
                            </pre>
                        </AccordionDetails>
                    </Accordion>
                    
                    <Divider textAlign="center"></Divider>
                    <br/>
                    <Button 
                        variant="outlined" 
                        size="small" 
                        color="inherit" 
                        disabled 
                        sx={{ marginLeft: 'auto' }} // Align the button to the right
                    >
                        <EditIcon fontSize="small" />
                    </Button>
                    <Button 
                        variant="outlined" 
                        size="small" 
                        color="inherit" 
                        onClick={() => handleModuleDelete(module._id, setModules)}
                    > 
                        <DeleteIcon fontSize="small" />
                    </Button>
                </AccordionDetails>
            </Accordion>
        </>
    );
}

export default ModuleListItem;