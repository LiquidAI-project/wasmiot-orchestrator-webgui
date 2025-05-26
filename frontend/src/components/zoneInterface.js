import * as React from 'react';
import { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { Button, Box, Alert, Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PublishIcon from '@mui/icons-material/Publish';
import axios from 'axios';

const baseUrl = process.env.REACT_APP_API_URL ?? '';

function ZoneInterface({ zonesAndRiskLevels, setZonesAndRiskLevels }) {
    const [error, setError] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [zoneFile, setZoneFile] = useState(null);

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

    const fetchZoneRiskLevels = async () => {
        try {
            const response = await axios.get(`${baseUrl}/zoneRiskLevels`);
            setZonesAndRiskLevels(response.data);
        } catch (error) {
            console.error('Error fetching zones and risk levels:', error);
        }
    };

    const submitZonesAndRiskLevels = async () => {
        if (!zoneFile) {
            setError("No file selected.");
            return;
        }

        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const jsonData = JSON.parse(event.target.result);
                const response = await axios.post(`${baseUrl}/zoneRiskLevels`, jsonData);
                if (response.status === 200) {
                    setIsSubmitted(true);
                    setError("");
                    fetchZoneRiskLevels();  // Refresh data
                }
            } catch (parseError) {
                setError("Invalid JSON format.");
                console.error('Invalid JSON format:', parseError);
            }
        };

        reader.readAsText(zoneFile);
    };

    useEffect(() => {
        fetchZoneRiskLevels();
    }, []);

    return (
        <Box component="form" sx={{ p: 2 }}>
            {/* Upload Button */}
            <Box sx={{ display: 'flex', alignItems: 'center', pt: 2 }}>
                <Button
                    variant="outlined"
                    component="label"
                    endIcon={<PublishIcon />}
                    fullWidth
                    //style={{ width: "300px" }}
                >
                    Upload zones and risk levels (json) *
                    <VisuallyHiddenInput
                        type="file"
                        onChange={(e) => setZoneFile(e.target.files[0])}
                    />
                </Button>
                {zoneFile && <Box sx={{ ml: 2 }}>Selected file: {zoneFile.name}</Box>}
            </Box>

            {/* Submit Button */}
            <Button
                variant="outlined"
                onClick={submitZonesAndRiskLevels}
                sx={{ mt: 2 }}
                fullWidth
            >
                Submit
            </Button>

            {/* Success and Error Alerts */}
            {isSubmitted && (
                <Alert severity="success" sx={{ marginTop: 2 }} onClose={() => setIsSubmitted(false)}>
                    Zone and risk level definitions successfully uploaded.
                </Alert>
            )}
            {error && (
                <Alert severity="error" sx={{ marginTop: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Accordion to Display Zones and Risk Levels */}
            <Accordion sx={{ mt: 3 }}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography>Current Zones and Risk Levels</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                        {JSON.stringify(zonesAndRiskLevels, null, 2)}
                    </pre>
                </AccordionDetails>
            </Accordion>
        </Box>
    );
}

export default ZoneInterface;
