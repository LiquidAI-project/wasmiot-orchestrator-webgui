import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button, Box, TextField, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import axios from 'axios';
import {fetchModules} from '../utils';

const baseUrl = process.env.REACT_APP_API_URL ?? '';

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
    
            setError(null); // Clear any existing errors
            const formData = new FormData();
            formData.append('name', moduleName);
            formData.append('module', moduleFile);
    
            const response1 = await axios.post(`${baseUrl}/file/module`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
    
            const uploadedModuleId = response1.data.id;
            setModuleId(uploadedModuleId);
            console.log("Module uploaded. Module id:", uploadedModuleId);
    
            // If moduleCard is provided, upload it
            if (moduleCard) {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const jsonData = JSON.parse(e.target.result);
                        for (let i = 0; i < jsonData.permission.length; i++) {
                            jsonData.permission[i].target = uploadedModuleId;
                        }
    
                        const response2 = await axios.post(`${baseUrl}/moduleCards`, jsonData);
                        if (response2.status === 200) {
                            setUploadSuccess(true);
                            fetchModules(setModules);
                        } else {
                            setError('Module uploaded, but failed to upload metadata card.');
                            setUploadSuccess(false);
                        }
                    } catch (err) {
                        console.error("Invalid JSON in metadata card:", err);
                        setError("Metadata card file is not valid JSON.");
                    }
                };
                reader.onerror = (error) => {
                    console.error("Error reading metadata card file:", error);
                    setError("Error reading metadata card file.");
                };
                reader.readAsText(moduleCard);
            } else {
                // No module card: consider upload successful
                setUploadSuccess(true);
                fetchModules(setModules);
            }
        } catch (error) {
            console.error('Error uploading the module:', error);
            setError('Error uploading the module. Please check the file and try again.');
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
                            Upload metadata card (optional)
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
