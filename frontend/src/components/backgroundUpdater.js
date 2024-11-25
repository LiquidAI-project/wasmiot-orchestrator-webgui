import * as React from 'react';
import { useState, useEffect } from 'react';
import { IconButton, TextField, Box } from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';

function BackgroundUpdater({backgroundUrl, setBackgroundUrl}) {

    // Handles updating background
    const updateBackground = () => {
        try {
            const url = document.getElementById("backgroundUrl").value;
            setBackgroundUrl(url);
            const appElement = document.getElementById("app");
            appElement.style.setProperty('--background-image-url', `url("${url}")`);
        } catch (e) {
            console.log(`Failed to update background image: ${e}`);
        }
    };

    // Run during component load to set background
    useEffect(() => {
        updateBackground();
    }, []);

    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1 }}>
            <TextField
                id="backgroundUrl"
                label="Background image url"
                defaultValue={backgroundUrl}
                fullWidth
            />
            <IconButton onClick={updateBackground}>
                <SyncIcon />
            </IconButton>
        </Box>
    );
}

export default BackgroundUpdater;