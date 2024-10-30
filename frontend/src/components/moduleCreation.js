import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button, Box, TextField, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import axios from 'axios';

function ModuleCreation({
    modules, setModules, 
    moduleName, setModuleName, 
    moduleFile, setModuleFile, 
    moduleId, setModuleId,
    error, setError
}) {
    const [uploadSuccess, setUploadSuccess] = useState(false);

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

    // Fetch modules from the server
    const fetchModules = async () => {
        try {
            const response = await axios.get('http://localhost:5001/file/module');
            updateModulesList(response.data);
        } catch (error) {
            console.error('Error fetching modules:', error);
        }
    };

    // Update the modules list
    const updateModulesList = (newModules) => {
        setModules((prevModules) => {
            const prevModuleIds = new Set(prevModules.map((module) => module._id));
            const newModuleIds = new Set(newModules.map((module) => module._id));
            const updatedModules = prevModules.filter((module) => newModuleIds.has(module._id));
            newModules.forEach((newModule) => {
                if (!prevModuleIds.has(newModule._id)) {
                    updatedModules.push(newModule);
                }
            });
            return updatedModules;
        });
    };

    // Submit module data to the server
    const handleModuleSubmit = async (event) => {
        event.preventDefault();
        if (!moduleName || !moduleFile) {
            setError('Both the module name and file are required.');
            setUploadSuccess(false);
            return;
        }
        setError(null); // Clear any existing errors
        const formData = new FormData();
        formData.append('name', moduleName);
        formData.append('module', moduleFile);

        try {
            const response = await axios.post('http://localhost:5001/file/module', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setModuleId(response.data.id);
            setUploadSuccess(true);
            fetchModules();
        } catch (error) {
            console.error('Error uploading the module:', error);
            setError('Error uploading the module. Please try again.');
            setUploadSuccess(false);
        }
    };

    // Reset form fields
    const handleReset = () => {
        setModuleName('');
        setModuleFile(null);
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
                        >
                            Upload module
                            <VisuallyHiddenInput
                                type="file"
                                onChange={(e) => setModuleFile(e.target.files[0])}
                            />
                        </Button>
                        {moduleFile && <Box sx={{ ml: 2 }}>Selected file: {moduleFile.name}</Box>}
                    </Box>

                    <Box sx={{ mt: 2 }}>
                        <Button
                            type="submit"
                            variant="outlined"
                            endIcon={<ArrowForwardIosIcon />}
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
