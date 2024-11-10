import * as React from 'react';
import { useEffect } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {fetchManifests, handleManifestDelete} from '../utils';

function ManifestList({
    manifests, setManifests, devices, setDevices, modules, setModules
}) {

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
        fetchManifests(setManifests);
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
