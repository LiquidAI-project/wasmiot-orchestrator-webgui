import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button, Box, TextField, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import axios from 'axios';
import {fetchModules} from '../utils';

function ModuleCreation({
    modules, setModules, 
    moduleName, setModuleName, 
    moduleFile, setModuleFile, 
    moduleId, setModuleId,
    error, setError
}) {
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [moduleCard, setModuleCard] = useState(null);

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
    const handleModuleSubmit = async (event) => {
        try {
            event.preventDefault();
            if (!moduleName) {
                setError('Module name is missing, please add it');
                setUploadSuccess(false);
                return;
            }
            if (!moduleFile) {
                setError('Module file is missing, please upload it');
                setUploadSuccess(false);
                return;
            }
            if (!moduleCard) {
                setError('Module metadata card is missing, please upload it');
                setUploadSuccess(false);
                return;
            }

            // Convert the module card to json, throw error if it fails
            const reader = new FileReader();
            let jsonData = {}
            reader.onload = async(e) => {
                console.log("Reading json...");
                const jsonData = JSON.parse(e.target.result);
                console.log("Done, result:");
                console.log(jsonData);
                console.log("Uploading module...");
                setError(null); // Clear any existing errors
                const formData = new FormData();
                formData.append('name', moduleName);
                formData.append('module', moduleFile);
                const response1 = await axios.post('file/module', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setModuleId(response1.data.id);
                console.log("Module uploaded. Module id:");
                console.log(response1.data.id);
                // Modify the uploaded card module id to match the received id, then upload the card
                console.log("Modifying module card...");
                for (let i = 0; i < jsonData.permission.length; i++) {
                    jsonData.permission[i].target = response1.data.id;
                }
                console.log("Finished modifying module card, modified card:");
                console.log(jsonData);
                console.log("Uploading module card...");
                const response2 = await axios.post('moduleCards', jsonData);
                if (response2.status === 200) {
                    setUploadSuccess(true);
                    fetchModules(setModules);
                } else {
                    setError('Module uploaded succesfully, but failed to upload module card. Check that the card is correct.');
                    setUploadSuccess(false);
                }
                


                // const response = await axios.post('nodeCards', jsonData);
                // if (response.status === 200) {
                // setNodeCardError("");
                // setNodeCardUploadSuccess(true);
                // updateDeviceCard();  // Refresh device card data
                // } else {
                // setNodeCardError("Failed to submit node card");
                // }
            };      
            reader.onerror = (error) => {
                console.error("Error reading file:", error);
            };      
            reader.readAsText(moduleCard);
        } catch (error) {
            console.error('Error uploading the module:', error);
            setError('Error uploading the module. Check that you uploaded corret wasm-module and module card (json).');
            setUploadSuccess(false);
        }
    };

    // Reset form fields
    const handleReset = () => {
        setModuleName('');
        setModuleFile(null);
        setModuleCard(null);
        setUploadSuccess(false);
        setError(null);
    };

    return (
        <Box component="form" onSubmit={handleModuleSubmit} sx={{ p: 2 }}>
            {uploadSuccess && (
                <Alert
                    severity="success"
                    action={
                        <Button color="inherit" size="small" onClick={handleReset}>
                            Upload Another
                        </Button>
                    }
                >
                    Module uploaded successfully!
                </Alert>
            )}
            {error && <Alert severity="error">{error}</Alert>}

            {!uploadSuccess && (
                <>
                    <TextField
                        required
                        id="module-name"
                        label="Module name"
                        value={moduleName}
                        onChange={(e) => setModuleName(e.target.value)}
                        variant="standard"
                        fullWidth
                        margin="normal"
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', pt: 2 }}>
                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<CloudUploadIcon />}
                            style={{width: "300px"}}
                        >
                            Upload module *
                            <VisuallyHiddenInput
                                type="file"
                                onChange={(e) => setModuleFile(e.target.files[0])}
                            />
                        </Button>
                        {moduleFile && <Box sx={{ ml: 2 }}>Selected card: {moduleFile.name}</Box>}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', pt: 2 }}>
                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<CloudUploadIcon />}
                            style={{width: "300px"}}
                        >
                            Upload metadata card *
                            <VisuallyHiddenInput
                                type="file"
                                onChange={(e) => setModuleCard(e.target.files[0])}
                            />
                        </Button>
                        {moduleCard && <Box sx={{ ml: 2 }}>Selected card: {moduleCard.name}</Box>}
                    </Box>

                    <Box sx={{ mt: 2 }}>
                        <Button
                            type="submit"
                            variant="outlined"
                            endIcon={<ArrowForwardIosIcon />}
                            style={{width: "300px"}}
                        >
                            Submit
                        </Button>
                    </Box>
                </>
            )}
        </Box>
    );
}

export default ModuleCreation;
