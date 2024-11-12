import React, { useState } from 'react';
import { Box, Button, Alert } from '@mui/material';
import axios from 'axios';

function ResetDeviceDiscoveryButton() {
    const [statusMessage, setStatusMessage] = useState(null);
    const [alertSeverity, setAlertSeverity] = useState('');

    const handleResetDeviceDiscovery = async () => {
        try {
            const response = await axios.post('http://localhost:5001/file/device/discovery/reset');

            // Success response
            setStatusMessage('Device discovery reset successfully.');
            setAlertSeverity('success');
        } catch (error) {
            // Error response
            setStatusMessage('Error resetting device discovery.');
            setAlertSeverity('error');
        }
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
                onClick={handleResetDeviceDiscovery}
                variant="outlined"
                color="error"
                sx={{ width: 400 }}
            >
                Reset Device Discovery
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

export default ResetDeviceDiscoveryButton;
