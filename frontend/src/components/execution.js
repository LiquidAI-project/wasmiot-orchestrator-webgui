import * as React from 'react';
import { useState, useEffect } from 'react';
import { Select, FormControl, InputLabel, MenuItem, Button, Alert, Box, TextField } from '@mui/material';
import axios from 'axios';
import FormData from 'form-data';
import {fetchManifests} from '../utils';
import SendIcon from '@mui/icons-material/Send';

const baseUrl = process.env.REACT_APP_API_URL ?? '';

function Execution({ manifests, setManifests, module, setModules, selectedDeployment, setSelectedDeployment }) {
    const [selectedManifestId, setSelectedManifestId] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState(null);
    const [parameters, setParameters] = useState([]);
    const [formValues, setFormValues] = useState({});
    const [executionResult, setExecutionResult] = useState(null);

    // Filter manifests to show only active ones
    // const activeManifests = manifests.filter(manifest => manifest.active);
    const activeManifests = manifests.filter(manifest => manifest);

    // Update form fields when a new manifest is selected
    const handleManifestChange = (event) => {
        const manifestId = event.target.value;
        setSelectedManifestId(manifestId);
        const result = manifests.find(manifest => manifest._id === manifestId);
        setSelectedDeployment(result);
        setIsSubmitted(false);
        setError(null);

        // Reset form values
        setFormValues({});

        // Get the module ID from the sequence
        const selectedManifest = activeManifests.find(manifest => manifest._id === manifestId);
        if (!selectedManifest || !selectedManifest.sequence?.length) return;

        const moduleId = selectedManifest.sequence[0].module;
        const moduleInfo = selectedManifest.fullManifest[Object.keys(selectedManifest.fullManifest)[0]].modules
            .find(module => module.id === moduleId);

        if (!moduleInfo) return;

        const moduleName = moduleInfo.name;

        // Retrieve function parameters
        const endpoints = selectedManifest.fullManifest[Object.keys(selectedManifest.fullManifest)[0]].endpoints;
        const moduleFunctions = endpoints[moduleName];

        if (!moduleFunctions) return;

        const functionParams = moduleFunctions[Object.keys(moduleFunctions)[0]].request.parameters;
        
        // Update parameters to generate input fields
        setParameters(functionParams || []);
    };

    // Update form values on parameter input
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormValues(prevValues => ({ ...prevValues, [name]: value }));
    };

    // Handle submission of manifest execution
    const handleSubmit = async (event) => {
        event.preventDefault();
    
        if (!selectedManifestId) {
            setError("Please select a manifest to execute.");
            return;
        }
    
        // Create FormData from form values
        const formData = new FormData();
        for (const [key, value] of Object.entries(formValues)) {
            formData.append(key, value);
        }
    
        try {
            const execResponse = await axios.post(`${baseUrl}/execute/${selectedManifestId}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
    
            const resultUrl = execResponse.data.resultUrl;

            if (resultUrl) {
                const resultResponse = await axios.get(resultUrl);
                console.log("Execution result (via resultUrl):", resultResponse.data);
                setExecutionResult(resultResponse.data);
            } else {
                console.log("Execution result (inline):", execResponse.data.result);
                setExecutionResult(execResponse.data.result ?? null);
            }

            setIsSubmitted(true);
            setError(null);
        } catch (error) {
            console.error("Error during execution:", error);
            setError('Execution failed. Please try again.');
            setIsSubmitted(false);
        }
    };

    useEffect(() => {
        fetchManifests(setManifests);
    }, []); 

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
            <FormControl fullWidth margin="normal">
                <InputLabel id="manifest-select-label">Select Deployment to Execute</InputLabel>
                <Select
                    labelId="manifest-select-label"
                    value={selectedManifestId}
                    onChange={handleManifestChange}
                >
                    {activeManifests.map((manifest) => (
                        <MenuItem key={manifest._id} value={manifest._id}>
                            {manifest.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Render input fields based on the parameters */}
            {parameters.map((param) => (
                <TextField
                    key={param.name}
                    name={param.name}
                    label={param.name}
                    required={param.required}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    type={param.schema?.type === 'integer' ? 'number' : 'text'}
                />
            ))}

            <Button type="submit" endIcon={<SendIcon />} fullWidth variant="outlined" color="primary" sx={{ marginTop: 2 }}>
                Execute
            </Button>

            {isSubmitted && (
                <Alert severity="success" sx={{ marginTop: 2 }} onClose={()=>{setIsSubmitted(false);}}>
                    Successfully executed manifest "{activeManifests.find(m => m._id === selectedManifestId)?.name}"!
                    <br />
                    Result: <br></br><pre>      
                        {JSON.stringify(executionResult, null, 2)}
                        </pre>                    
                </Alert>
            )}
            {error && <Alert severity="error" sx={{ marginTop: 2 }} onClose={()=>{setError(null);}}>{error}</Alert>}
        </Box>
    );
}

export default Execution;
