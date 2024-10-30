import * as React from 'react';
import { useState } from 'react';
import { Select, FormControl, InputLabel, MenuItem, Button, Alert, Box } from '@mui/material';
import axios from 'axios';

function Deployment({ manifests, setManifests }) {
    const [selectedManifestId, setSelectedManifestId] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState(null);

    const handleManifestChange = (event) => {
        setSelectedManifestId(event.target.value);
        setIsSubmitted(false); // Reset submission status on selection change
        setError(null); // Clear any existing error
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        if (!selectedManifestId) {
            setError("Please select a manifest to deploy.");
            return;
        }

        const payload = { id: selectedManifestId }; // Set moduleId to selectedManifestId

        try {
            const response = await axios.post(`http://localhost:5001/file/manifest/${selectedManifestId}`, payload);
            console.log("Deployment successful:", response.data);
            setIsSubmitted(true);
            setError(null); // Clear any existing error
        } catch (error) {
            console.error("Error during deployment:", error);
            setError('Deployment failed. Please try again.');
            setIsSubmitted(false); // Reset submission status on error
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
            <FormControl fullWidth margin="normal">
                <InputLabel id="manifest-select-label">Select Manifest to Deploy</InputLabel>
                <Select
                    labelId="manifest-select-label"
                    value={selectedManifestId}
                    onChange={handleManifestChange}
                >
                    {manifests.map((manifest) => (
                        <MenuItem key={manifest._id} value={manifest._id}>
                            {manifest.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <Button type="submit" variant="contained" color="primary" sx={{ marginTop: 2 }}>
                Deploy
            </Button>

            {isSubmitted && (
                <Alert severity="success" sx={{ marginTop: 2 }}>
                    Successfully deployed manifest {manifests.find(m => m._id === selectedManifestId)?.name}!
                </Alert>
            )}
            {error && <Alert severity="error" sx={{ marginTop: 2 }}>{error}</Alert>} {/* Error message */}
        </Box>
    );
}

export default Deployment;
