import * as React from 'react';
import { useState, useEffect } from 'react';
import Accordion from '@mui/material/Accordion';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import axios from 'axios';

function DeviceList({devices, setDevices}) {

    const Device = styled(Paper)(({ theme }) => ({
        backgroundColor: '#fff',
        ...theme.typography.body2,
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
      }));

    // Function to fetch devices from the backend periodically
    const fetchDevices = async () => {
        try {
        const response = await axios.get('http://localhost:5001/file/device');
        const newDevices = response.data; // Assuming the data is a list of device objects with name and _id
        updateDevicesList(newDevices);
        } catch (error) {
        console.error('Error fetching devices:', error);
        }
    };
    // Update the list of devices
    const updateDevicesList = (newDevices) => {
        setDevices((prevDevices) => {
        const prevDeviceIds = new Set(prevDevices.map((device) => device._id));
        const newDeviceIds = new Set(newDevices.map((device) => device._id));
        const updatedDevices = prevDevices.filter((device) => newDeviceIds.has(device._id));
        newDevices.forEach((newDevice) => {
            if (!prevDeviceIds.has(newDevice._id)) {
            updatedDevices.push(newDevice);
            }
        });
        return updatedDevices;
        });
    };
    
    // Poll devices every 30 seconds
    useEffect(() => {
        fetchDevices();
        const intervalId = setInterval(fetchDevices, 30000);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <>
        {devices.map((device) => (
            <Accordion key={`${device._id}-accordion`}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`${device._id}-content`}
                id={`${device._id}-header`}
              >
                {device.name}
              </AccordionSummary>
              <AccordionDetails>
                <Box component="fieldset" sx={{ display: 'flex', alignItems: 'left', mb: 2, gap: 2 }}>
                  <Typography component="legend">Communication</Typography>
                  <pre>{JSON.stringify(device.communication, null, 2) }</pre>
                </Box>
                <Box component="fieldset" sx={{ display: 'flex', alignItems: 'left', mb: 2, gap: 2 }}>
                  <Typography component="legend">Description</Typography>
                  <pre>{JSON.stringify(device.description, null, 2) }</pre>
                </Box>
                <Box component="fieldset" sx={{ display: 'flex', alignItems: 'left', mb: 2, gap: 2 }}>
                  <Typography component="legend">Health</Typography>
                  <pre>{JSON.stringify(device.health, null, 2) }</pre>
                </Box>
                <br/>
              </AccordionDetails>
          </Accordion>
          ))}
        </>
    )
}

export default DeviceList;