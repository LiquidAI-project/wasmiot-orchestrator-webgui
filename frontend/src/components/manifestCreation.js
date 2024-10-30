import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, FormControl, InputLabel, Select, MenuItem, IconButton, Typography, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

function ManifestCreation({ devices, setDevices, modules, setModules, manifests, setManifests }) {
    const [manifestName, setManifestName] = useState('');
    const [procedures, setProcedures] = useState([{ device: '', module: '', func: '' }]);
    const [submissionSuccess, setSubmissionSuccess] = useState(false);
    const [submissionError, setSubmissionError] = useState(false);

    // Handle manifest name input change
    const handleManifestNameChange = (event) => setManifestName(event.target.value);

    // Reset form to initial state
    const resetForm = () => {
        setManifestName('');
        setProcedures([{ device: '', module: '', func: '' }]);
        setSubmissionSuccess(false);
        setSubmissionError(false);
    };

    // Handle device change for a specific procedure
    const handleDeviceChange = (index, deviceId) => {
        setProcedures((prevProcedures) => {
            const updatedProcedures = [...prevProcedures];
            updatedProcedures[index].device = deviceId;
            updatedProcedures[index].module = ''; // Reset module and function on device change
            updatedProcedures[index].func = '';
            return updatedProcedures;
        });
    };

    // Handle module change for a specific procedure
    const handleModuleChange = (index, moduleId) => {
        setProcedures((prevProcedures) => {
            const updatedProcedures = [...prevProcedures];
            updatedProcedures[index].module = moduleId;
            updatedProcedures[index].func = ''; // Reset function on module change
            return updatedProcedures;
        });
    };

    // Handle function change for a specific procedure
    const handleFuncChange = (index, funcName) => {
        setProcedures((prevProcedures) => {
            const updatedProcedures = [...prevProcedures];
            updatedProcedures[index].func = funcName;
            return updatedProcedures;
        });
    };

    // Add a new procedure fieldset
    const addProcedure = () => {
        setProcedures((prevProcedures) => [
            ...prevProcedures,
            { device: '', module: '', func: '' }
        ]);
    };

    // Remove a procedure fieldset
    const removeProcedure = (index) => {
        setProcedures((prevProcedures) => prevProcedures.filter((_, i) => i !== index));
    };

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();
        const sequence = procedures.map((proc) => ({
            device: proc.device,
            module: proc.module,
            func: proc.func
        }));
        const payload = { name: manifestName, sequence };

        try {
            await axios.post('http://localhost:5001/file/manifest', payload);
            setSubmissionSuccess(true);
            setSubmissionError(false);
            fetchManifests();
        } catch (error) {
            setSubmissionError(true);
            setSubmissionSuccess(false);
            console.error("Error submitting form:", error);
        }
    };

    // Populate the initial module list
    useEffect(() => {
        fetchModules();
    }, []);

    // Fetch list of modules
    const fetchModules = async () => {
        try {
            const response = await axios.get('http://localhost:5001/file/module');
            updateModulesList(response.data);
        } catch (error) {
            console.error('Error fetching modules:', error);
        }
    };

    // Fetch the list of manifests
    const fetchManifests = async () => {
        try {
            const response = await axios.get('http://localhost:5001/file/manifest');
            updateManifestsList(response.data);
        } catch (error) {
            console.error('Error fetching manifests:', error);
        }
    };

    // Update the list of modules
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

    // Update the list of manifests
    const updateManifestsList = (newManifests) => {
        setManifests((prevManifests) => {
            const prevManifestIds = new Set(prevManifests.map((manifest) => manifest._id));
            const newManifestIds = new Set(newManifests.map((manifest) => manifest._id));
            const updatedManifests = prevManifests.filter((manifest) => newManifestIds.has(manifest._id));
            newManifests.forEach((newManifest) => {
                if (!prevManifestIds.has(newManifest._id)) {
                    updatedManifests.push(newManifest);
                }
            });
            return updatedManifests;
        });
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
            {submissionSuccess && (
                <Alert severity="success" action={
                    <Button color="inherit" size="small" onClick={resetForm}>
                        Create another manifest
                    </Button>
                }>
                    Manifest submitted successfully!
                </Alert>
            )}
            {submissionError && <Alert severity="error">Something went wrong while submitting the manifest.</Alert>}

            {!submissionSuccess && (
                <>
                    <TextField
                        label="Manifest name"
                        value={manifestName}
                        onChange={handleManifestNameChange}
                        fullWidth
                        margin="normal"
                    />

                    {procedures.map((procedure, index) => (
                        <Box key={index} component="fieldset" sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                            <Typography component="legend">Procedure {index + 1}</Typography>

                            {/* Device dropdown */}
                            <FormControl fullWidth>
                                <InputLabel>Device</InputLabel>
                                <Select
                                    value={procedure.device}
                                    onChange={(e) => handleDeviceChange(index, e.target.value)}
                                >
                                    <MenuItem value="null" key="null">Any device</MenuItem>
                                    {devices.map((device) => (
                                        <MenuItem key={device._id} value={device._id}>
                                            {device.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Module dropdown */}
                            <FormControl fullWidth>
                                <InputLabel>Module</InputLabel>
                                <Select
                                    value={procedure.module}
                                    onChange={(e) => handleModuleChange(index, e.target.value)}
                                >
                                    {modules.map((module) => (
                                        <MenuItem key={module._id} value={module._id}>
                                            {module.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Function dropdown */}
                            <FormControl fullWidth>
                                <InputLabel>Function</InputLabel>
                                <Select
                                    value={procedure.func}
                                    onChange={(e) => handleFuncChange(index, e.target.value)}
                                >
                                    {(modules.find(module => module._id === procedure.module)?.exports || []).map((exp, idx) => (
                                        <MenuItem key={idx} value={exp.name}>
                                            {exp.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Delete button */}
                            <IconButton onClick={() => removeProcedure(index)}>
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    ))}

                    {/* Add Procedure Button */}
                    <Button
                        variant="contained"
                        onClick={addProcedure}
                        sx={{ mt: 2 }}
                    >
                        {procedures.length === 0 ? "Add a procedure" : "Add another procedure"}
                    </Button>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2, ml: 2 }}
                    >
                        Submit Manifest
                    </Button>
                </>
            )}
        </Box>
    );
}

export default ManifestCreation;
