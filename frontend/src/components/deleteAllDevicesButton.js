import React, { useState } from 'react';
import { Box, Button, Alert } from '@mui/material';
import axios from 'axios';

const baseUrl = process.env.REACT_APP_API_URL ?? '';

function DeleteAllDevicesButton() {
    const [statusMessage, setStatusMessage] = useState(null);
    const [alertSeverity, setAlertSeverity] = useState('');

    const handleDeleteDevices = async () => {
        try {
            const response = await axios.delete(`${baseUrl}/file/device/`);

            // Success response
            setStatusMessage(`Deleted ${response.data.deletedCount} devices successfully.`);
            setAlertSeverity('success');
        } catch (error) {
            // Error response
            setStatusMessage('Error deleting devices.');
            setAlertSeverity('error');
        }
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
            <Button
                onClick={handleDeleteDevices}
                variant="outlined"
                color="error"
                fullWidth
            >
                Delete All Devices
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

export default DeleteAllDevicesButton;
