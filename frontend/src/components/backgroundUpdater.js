import * as React from 'react';
import { useState, useEffect } from 'react';
import { IconButton, TextField, Box } from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';

function BackgroundUpdater({}) {

    // Handles updating background
    const updateBackground = () => {
        try {
            const url = document.getElementById("backgroundUrl").value;
            const appElement = document.getElementById("app");
            appElement.style.setProperty('--background-image-url', `url("${url}")`);
        } catch (e) {
            console.log(`Failed to update background image: ${e}`);
        }
    };
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1 }}>
            <TextField
                id="backgroundUrl"
                label="Background image url"
                defaultValue="https://puheviestinnanpaivat2014.wordpress.com/wp-content/uploads/2014/03/agora-1-krs-aula-auditorio-2-alfa.jpg"
                fullWidth
            />
            <IconButton onClick={updateBackground}>
                <SyncIcon />
            </IconButton>
        </Box>
    );
}

export default BackgroundUpdater;