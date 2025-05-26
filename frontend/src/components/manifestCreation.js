import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, FormControl, InputLabel, Select, MenuItem, IconButton, Typography, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import {fetchModules, fetchManifests} from '../utils';

const baseUrl = process.env.REACT_APP_API_URL ?? '';

function ManifestCreation({ devices, setDevices, modules, setModules, manifests, setManifests }) {
    const [manifestName, setManifestName] = useState('');
    const [procedures, setProcedures] = useState([{ device: '', module: '', func: '' }]);
    const [submissionStatus, setSubmissionStatus] = useState(0); // 0 = neutral, 1 = submitted, validation succeeded 2 = submitted, validation failed 3 = failed submission
    const [submissionMessage, setSubmissionMessage] = useState(""); // Contains the message for submission status, such as error message, or reason why validation failed
    const [validationFailureReasoning, setValidationFailureReasoning] = useState([]) // Contains reason for validation failure

    // Handle manifest name input change
    const handleManifestNameChange = (event) => setManifestName(event.target.value);

    // Reset form to initial state
    const resetForm = () => {
        setManifestName('');
        setProcedures([{ device: '', module: '', func: '' }]);
        setSubmissionStatus(0);
        setSubmissionMessage("");
        setValidationFailureReasoning([]);
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
            const response = await axios.post(`${baseUrl}/file/manifest`, payload);
            const manifestId = response.data;
            fetchManifests(setManifests);
            
            const validationLogsResponse = await axios.get(`${baseUrl}/deploymentCertificates`);
            const validationLogs = validationLogsResponse.data;
            let certificate = validationLogs.find(log => log.deploymentId === manifestId);

            if (!certificate.valid) {
                setValidationFailureReasoning(certificate.validationLogs);
                setSubmissionMessage("Manifest submitted succesfully, but failed to validate.");
                setSubmissionStatus(2);
            } else {
                setSubmissionStatus(1);
                setSubmissionMessage("Manifest submitted and validated succesfully.");
            }
        } catch (error) {
            setSubmissionStatus(3);
            setSubmissionMessage("Failed to submit manifest.");
            console.error("Error submitting form:", error);
        }
    };

    // Populate the initial module list
    useEffect(() => {
        fetchModules(setModules);
    }, []);

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>

            {submissionStatus === 0 && (
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

            {submissionStatus === 1 && (
                <Alert severity="success" action={
                    <Button color="inherit" size="small" onClick={resetForm}>
                        Create another manifest
                    </Button>
                }>
                    { submissionMessage }
                </Alert>
            )}
            {submissionStatus === 2 && (
                <Alert severity="warning" action={
                    <Button color="inherit" size="small" onClick={resetForm}>
                        Create another manifest
                    </Button>
                }>
                    { submissionMessage }
                    <pre>
                    { JSON.stringify(validationFailureReasoning, undefined, 2) }
                    </pre>
                </Alert>
            )}
            {submissionStatus === 3 && (
                <Alert severity="error">
                    Something went wrong while submitting the manifest.
                </Alert>
            )}

            
        </Box>
    );
}

export default ManifestCreation;
