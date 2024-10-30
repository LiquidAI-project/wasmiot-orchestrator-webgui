import React, { useState } from 'react';
import { Box, Button, Alert } from '@mui/material';
import axios from 'axios';

function DeleteAllManifestsButton() {
    const [statusMessage, setStatusMessage] = useState(null);
    const [alertSeverity, setAlertSeverity] = useState('');

    const handleDeleteManifests = async () => {
        try {
            const response = await axios.delete('http://localhost:5001/file/manifest/');

            // Success response
            setStatusMessage(`Deleted ${response.data.deletedCount} manifests successfully.`);
            setAlertSeverity('success');
        } catch (error) {
            // Error response
            setStatusMessage('Error deleting manifests.');
            setAlertSeverity('error');
        }
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
                onClick={handleDeleteManifests}
                variant="contained"
                color="primary"
                sx={{ width: 400 }}
            >
                Delete All Manifests
            </Button>
            {statusMessage && (
                <Alert
                    severity={alertSeverity}
                    sx={{ display: 'inline-flex', alignItems: 'center' }}
                    action={
                        alertSeverity === 'success' && (
                            <Button
                                color="inherit"
                                size="small"
                                onClick={() => setStatusMessage(null)}
                            >
                                Dismiss
                            </Button>
                        )
                    }
                >
                    {statusMessage}
                </Alert>
            )}
        </Box>
    );
}

export default DeleteAllManifestsButton;
