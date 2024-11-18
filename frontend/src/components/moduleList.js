import * as React from 'react';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';
import {fetchModules, handleModuleDelete} from '../utils';


function ModuleList({modules, setModules}) {

    // Function to fetch a list of modules
    // TODO: Move to a separate file, duplicates of this exist elsewhere
    // const fetchModules = async () => {
    //     try {
    //         const response = await axios.get('http://localhost:5001/file/module');
    //         const newModules = response.data; 
    //         updateModulesList(newModules);
    //     } catch (error) {
    //         console.error('Error fetching modules:', error);
    //     }
    // };

    // Update the list of modules
    // TODO: Move elsewhere, duplicates of this function exist
    // const updateModulesList = (newModules) => {
    //     setModules((prevModules) => {
    //     const prevModuleIds = new Set(prevModules.map((module) => module._id));
    //     const newModuleIds = new Set(newModules.map((module) => module._id));
    //     const updatedModules = prevModules.filter((module) => newModuleIds.has(module._id));
    //     newModules.forEach((newModule) => {
    //         if (!prevModuleIds.has(newModule._id)) {
    //         updatedModules.push(newModule);
    //         }
    //     });
    //     return updatedModules;
    //     });
    // };

    // Function to handle deletion
    // const handleModuleDelete = async (moduleId) => {
    //     try {
    //         const response = await axios.delete(`http://localhost:5001/file/module/${moduleId}`);
    //         console.log(`Deleted module with id: ${moduleId}`, response.data);
    //     } catch (error) {
    //         console.error(`Error deleting module with id: ${moduleId}`, error);
    //     }
    //     fetchModules();
    // };

    // Populate the initial modulelist
    useEffect(() => {
        fetchModules(setModules);
    }, []);

    return (
        <>
            {modules.map((module) => (
                <Accordion key={`${module._id}-accordion`}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls={`${module._id}-content`}
                        id={`${module._id}-header`}
                    >
                        {module.name}
                    </AccordionSummary>
                    <AccordionDetails>
                        TODO: Module details
                        <br/>
                        <Button 
                        key={module._id} 
                        variant="outlined" 
                        color="error"
                        onClick={() => handleModuleDelete(module._id, setModules)}
                        > 
                        Delete {module.name}
                        </Button>
                    </AccordionDetails>
                </Accordion>
            ))}
        </>
    )
}

export default ModuleList;