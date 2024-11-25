import * as React from 'react';
import PropTypes from 'prop-types';
import Slider, { SliderThumb } from '@mui/material/Slider';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';


function OpacitySlider({backgroundOpacity, setBackgroundOpacity}) {

    // From https://mui.com/material-ui/react-slider/
    const CustomSliderShadow = '0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.13),0 0 0 1px rgba(0,0,0,0.02)';
    const CustomSlider = styled(Slider)(({ theme }) => ({
        color: '#007bff',
        height: 5,
        padding: '15px 0',
        '& .MuiSlider-thumb': {
          height: 20,
          width: 20,
          backgroundColor: '#fff',
          boxShadow: '0 0 2px 0px rgba(0, 0, 0, 0.1)',
          '&:focus, &:hover, &.Mui-active': {
            boxShadow: '0px 0px 3px 1px rgba(0, 0, 0, 0.1)',
            // Reset on touch devices, it doesn't add specificity
            '@media (hover: none)': {
              boxShadow: CustomSliderShadow,
            },
          },
          '&:before': {
            boxShadow:
              '0px 0px 1px 0px rgba(0,0,0,0.2), 0px 0px 0px 0px rgba(0,0,0,0.14), 0px 0px 1px 0px rgba(0,0,0,0.12)',
          },
        },
        '& .MuiSlider-valueLabel': {
          fontSize: 12,
          fontWeight: 'normal',
          top: -6,
          backgroundColor: 'unset',
          color: theme.palette.text.primary,
          '&::before': {
            display: 'none',
          },
          '& *': {
            background: 'transparent',
            color: '#000',
            ...theme.applyStyles('dark', {
              color: '#fff',
            }),
          },
        },
        '& .MuiSlider-track': {
          border: 'none',
          height: 5,
        },
        '& .MuiSlider-rail': {
          opacity: 0.5,
          boxShadow: 'inset 0px 0px 4px -2px #000',
          backgroundColor: '#d0d0d0',
        },
        ...theme.applyStyles('dark', {
          color: '#0a84ff',
        }),
    }));


    const handleSliderChange = (event, newValue) => {
        try {
            document.getElementById("app").style.setProperty('--bg-opacity', newValue / 100);
        } catch (e) {
            console.log(`Error happened: ${e}`)
            document.getElementById("app").style.setProperty('--bg-opacity', 0);
        }
    };

	const commitSliderChange = (event, newValue) => {
		setBackgroundOpacity(newValue);
	};

    // Set opacity during component load
    React.useEffect(() => {
      handleSliderChange(undefined, backgroundOpacity);
    }, []);

    return (
        <>
        {/* <Box sx={{ width: 320, display: 'flex', alignItems: 'center' }}> */}
        <Box sx={{ alignItems: 'center', p: 2 }}>
            <Typography sx={{ mr: 2 }}>Background opacity</Typography>
            <br/>
            <CustomSlider 
				aria-label="opacity slider" 
				defaultValue={backgroundOpacity} 
				valueLabelDisplay="on" 
				onChange={handleSliderChange} 
				onChangeCommitted={commitSliderChange}
			/>
        </Box>
    </>
    );
}

export default OpacitySlider;