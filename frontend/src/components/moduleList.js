import * as React from 'react';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';
import {fetchModules, handleModuleDelete} from '../utils';
import Divider from '@mui/material/Divider';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ModuleListItem from './moduleListItem';


function ModuleList({modules, setModules}) {

    const [moduleCards, setModuleCards] = useState([]);

    const fetchModuleCards = async() => {
        const moduleCardsResponse = await axios.get('http://localhost:5001/moduleCards');
        const fetchedLogs = moduleCardsResponse.data;
        setModuleCards(fetchedLogs);
    };

    // Populate the initial modulelist
    useEffect(() => {
        fetchModules(setModules);
        fetchModuleCards();
    }, []);

    // Update the module card list every time module list changes (means new module uploaded etc)
    useEffect(() => {
        fetchModuleCards();
    }, [modules]);

    return (
        <>
            {modules.map((module) => (
                <ModuleListItem 
                    module={module} 
                    moduleCard={moduleCards.find(card => card.moduleid === module._id)}
                    modules={modules}
                    setModules={setModules}
                    moduleCards={moduleCards}
                    setModuleCards={setModuleCards}
                />
            ))}
        </>
    );
    
/*     return (
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
                        Filename: {module.wasm.originalFilename}
                        <br/>
                        <br/>
                        <Accordion key={`${module._id}-accordion-inner-1`}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls={`${module._id}-content-inner-1`}
                                id={`${module._id}-header-inner-1`}
                            >
                            Module card:
                            </AccordionSummary>
                            <AccordionDetails>
                                <pre>
                                    {(() => {
                                        const moduleCard = moduleCards.find(card => card.moduleid === module._id);
                                        if (moduleCard) {
                                        return (
                                            <>
                                            {JSON.stringify(moduleCard, null, 2)}
                                            </>
                                        );
                                        } else {
                                        return "No module card found.";
                                        }
                                    })()}
                                </pre>
                            </AccordionDetails>
                        </Accordion>
                        
                        <Divider textAlign="center"></Divider>
                        <Accordion key={`${module._id}-accordion-inner-2`}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls={`${module._id}-content-inner-2`}
                                id={`${module._id}-header-inner-2`}
                            >
                            Module details:
                            </AccordionSummary>
                            <AccordionDetails>
                                <pre>
                                    {JSON.stringify(module, null, 2)}
                                </pre>
                            </AccordionDetails>
                        </Accordion>
                        
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
                            onClick={() => handleModuleDelete(module._id, setModules)}
                        > 
                            <DeleteIcon fontSize="small" />
                        </Button>
                    </AccordionDetails>
                </Accordion>
            ))}
        </>
    ) */
}

export default ModuleList;