import React, { useState } from 'react';
import { Box, Button, Alert } from '@mui/material';
import axios from 'axios';

function DeleteAllModulesButton() {
    const [statusMessage, setStatusMessage] = useState(null);
    const [alertSeverity, setAlertSeverity] = useState('');

    const handleDeleteModules = async () => {
        try {
            const response = await axios.delete('http://localhost:5001/file/module/');

            // Success response
            setStatusMessage(`Deleted ${response.data.deletedCount} modules successfully.`);
            setAlertSeverity('success');
        } catch (error) {
            // Error response
            setStatusMessage('Error deleting modules.');
            setAlertSeverity('error');
        }
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
                onClick={handleDeleteModules}
                variant="contained"
                color="primary"
                sx={{ width: 400 }}
            >
                Delete All Modules
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

export default DeleteAllModulesButton;
