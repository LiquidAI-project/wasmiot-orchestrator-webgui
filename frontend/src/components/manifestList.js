import * as React from 'react';
import { useEffect, useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {fetchManifests, handleManifestDelete} from '../utils';
import axios from 'axios';
import Divider from '@mui/material/Divider';

const baseUrl = process.env.REACT_APP_API_URL ?? '';

function ManifestList({
    manifests, setManifests, devices, setDevices, modules, setModules
}) {

    const [validationLogs, setValidationLogs] = useState([]);

    const updateValidationLogs = async() => {
        const validationLogsResponse = await axios.get(`${baseUrl}/deploymentCertificates`);
        const fetchedLogs = validationLogsResponse.data;
        setValidationLogs(fetchedLogs);
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
        fetchManifests(setManifests);
    }, []);

    useEffect(() => {
        updateValidationLogs();
    }, [manifests]);

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
                        {/* <Divider textAlign="center">Procedure sequence</Divider> */}
                        
                        <pre>
                            Procedure sequence:<br/><br/>
                            {createManifestDetails(manifest)}
                        </pre>
                        {/* <Divider textAlign="center">Validation certificate</Divider> */}
                        <Divider textAlign="center"></Divider>
                        <pre>
                        Validation certificate:<br/><br/>
                            {(() => {
                                const validationLog = validationLogs.find(log => log.deploymentId === manifest._id);
                                if (validationLog) {
                                return (
                                    <>
                                    Validation status:{" "}
                                    <span style={{ color: validationLog.valid ? "green" : "red" }}>
                                        {validationLog.valid ? "valid" : "invalid"}
                                    </span>
                                    <br />
                                    Validation certificate:<br />
                                    {JSON.stringify(validationLog, null, 2)}
                                    </>
                                );
                                } else {
                                return "No validation log found.";
                                }
                            })()}
                        </pre>
                        <Divider textAlign="center"></Divider>
                        <br/>
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
                            disabled 
                            onClick={() => handleManifestDelete(manifest._id)}
                        > 
                            <DeleteIcon fontSize="small" />
                        </Button>
                    </AccordionDetails>
                </Accordion>
            ))}
        </>
    );
}

export default ManifestList;
