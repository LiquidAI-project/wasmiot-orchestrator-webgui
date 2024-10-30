import * as React from 'react';
import { useState, useEffect } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

function ManifestList({
    manifests, setManifests, devices, setDevices, modules, setModules
}) {
    // Fetch the list of manifests
    const fetchManifests = async () => {
        try {
            const response = await axios.get('http://localhost:5001/file/manifest');
            const newManifests = response.data; 
            updateManifestsList(newManifests);
        } catch (error) {
            console.error('Error fetching manifests:', error);
        }
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

    // Function to handle deletion of a manifest
    const handleManifestDelete = async (manifestId) => {
        try {
            const response = await axios.delete(`http://localhost:5001/file/manifest/${manifestId}`);
            console.log(`Deleted manifest with id: ${manifestId}`, response.data);
        } catch (error) {
            console.error(`Error deleting manifest with id: ${manifestId}`, error);
        }
        fetchManifests();
    };

    // Helper function to get the device name by ID
    const getDeviceName = (deviceId) => {
        const device = devices.find(device => device._id === deviceId);
        return device ? device.name : 'Unknown Device';
    };

    // Helper function to get the module name by ID
    const getModuleName = (moduleId) => {
        const module = modules.find(module => module._id === moduleId);
        return module ? module.name : 'Unknown Module';
    };

    // Function to create manifest details from the manifests array
    const createManifestDetails = (manifest) => {
        return manifest.sequence.map((step, index) => {
            const deviceName = getDeviceName(step.device);
            const moduleName = getModuleName(step.module);
            return `Procedure ${index + 1}: Use ${deviceName} for ${moduleName}:${step.func}`;
        }).join('\n');
    };

    useEffect(() => {
        fetchManifests();
    }, []);

    return (
        <>
            {manifests.map((manifest) => (
                <Accordion key={manifest._id}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls={`${manifest._id}-content`}
                        id={`${manifest._id}-header`}
                    >
                        {manifest.name}
                    </AccordionSummary>
                    <AccordionDetails>
                        <pre>{createManifestDetails(manifest)}</pre> {/* Display manifest details */}
                        <Button 
                            variant="outlined" 
                            size="small" 
                            color="inherit" 
                            disabled 
                            sx={{ marginLeft: 'auto' }} // Align the button to the right
                        >
                            <EditIcon fontSize="small" />
                        </Button>
                        <Button 
                            variant="outlined" 
                            size="small" 
                            color="inherit" 
                            // disabled 
                            onClick={() => handleManifestDelete(manifest._id)}
                        > 
                        <DeleteIcon fontSize="small" />
                            {/* Delete {manifest.name} */}
                        </Button>
                    </AccordionDetails>
                </Accordion>
            ))}
        </>
    );
}

export default ManifestList;
