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

const baseUrl = process.env.REACT_APP_API_URL ?? '';

function ModuleList({modules, setModules}) {

    const [moduleCards, setModuleCards] = useState([]);

    const fetchModuleCards = async() => {
        const moduleCardsResponse = await axios.get(`${baseUrl}/moduleCards`);
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
    
}

export default ModuleList;