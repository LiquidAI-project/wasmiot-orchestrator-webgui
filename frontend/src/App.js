import * as React from 'react';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import TextField from '@mui/material/TextField';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';
import axios from 'axios';

const moduleSteps = ['Name and upload new module', 'Modify module descriptions'];


const Device = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const VisuallyHiddenInput = styled('input')({
  opacity: 0,
  position: 'absolute',
  zIndex: -1,
  width: '100%',
  height: '100%',
  left: 0,
  top: 0,
  cursor: 'pointer',
});

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function App() {
  const [devices, setDevices] = useState([]);
  const [modules, setModules] = useState([]);
  const [manifests, setManifests] = useState([]);
  const [value, setValue] = useState(0);
  const [moduleName, setModuleName] = useState('');
  const [moduleFile, setModuleFile] = useState(null);
  const [moduleId, setModuleId] = useState('');
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNextModuleStepper = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  const handleReset = () => {
    setActiveStep(0);
  };

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

  const fetchModule = async (moduleId) => {
    try {
      const response = await axios.get(`http://localhost:5001/file/module/${moduleId}`);
      console.log(`Fetched module with id: ${moduleId}`, response.data);
    } catch (error) {
      console.error(`Error fetching module with id: ${moduleId}`, error);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await axios.get('http://localhost:5001/file/module');
      const newModules = response.data; 
      updateModulesList(newModules);
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const fetchManifests = async () => {
    try {
      const response = await axios.get('http://localhost:5001/file/manifest');
      const newManifests = response.data; 
      updateManifestsList(newManifests);
    } catch (error) {
      console.error('Error fetching manifests:', error);
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

  // Update the list of modules
  const updateModulesList = (newModules) => {
    setModules((prevModules) => {
      const prevModuleIds = new Set(prevModules.map((module) => module._id));
      const newModuleIds = new Set(newModules.map((module) => module._id));
      const updatedModules = prevModules.filter((module) => newModuleIds.has(module._id));
      newModules.forEach((newModule) => {
        if (!prevModuleIds.has(newModule._id)) {
          updatedModules.push(newModule);
        }
      });
      return updatedModules;
    });
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
  

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleFileChange = (event) => {
    setModuleFile(event.target.files[0]);
  };

  const handleModuleSubmit = async (event) => {
    event.preventDefault();
    if (!moduleName || !moduleFile) {
      console.error('Both the module name and file are required.');
      return;
    }
    const formData = new FormData();
    formData.append('name', moduleName);
    formData.append('module', moduleFile);
    try {
      const response = await axios.post('http://localhost:5001/file/module', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Upload successful:', response.data);
      setModuleId(response.data.id)
    } catch (error) {
      console.error('Error uploading the module:', error);
    }
    fetchModules();
    handleNextModuleStepper();
  };

    // Function to handle deletion
    const handleModuleDelete = async (moduleId) => {
      try {
        const response = await axios.delete(`http://localhost:5001/file/module/${moduleId}`);
        console.log(`Deleted module with id: ${moduleId}`, response.data);
      } catch (error) {
        console.error(`Error deleting module with id: ${moduleId}`, error);
      }
      fetchModules();
    };

      // Function to handle deletion
      const handleManifestDelete = async (manifestId) => {
        try {
          const response = await axios.delete(`http://localhost:5001/file/manifest/${manifestId}`);
          console.log(`Deleted manifest with id: ${manifestId}`, response.data);
        } catch (error) {
          console.error(`Error deleting manifest with id: ${manifestId}`, error);
        }
        fetchManifests();
      };

  // Poll devices every 30 seconds, also initialize other lists such as modules
  useEffect(() => {
    fetchDevices();
    fetchModules();
    fetchManifests();
    const intervalId = setInterval(fetchDevices, 30000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs">
            <Tab label="Devices" {...a11yProps(0)} />
            <Tab label="Modules" {...a11yProps(1)} />
            <Tab label="Manifests" {...a11yProps(2)} />
            <Tab label="Deployment" {...a11yProps(3)} />
            <Tab label="Execution" {...a11yProps(4)} />
          </Tabs>
        </Box>

        <CustomTabPanel value={value} index={0}>
          <h3>List of active devices:</h3>
          <br/>
            {devices.map((device) => (
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`${device._id}-content`}
                  id={`${device._id}-header`}
                >
                  {device.name}
                </AccordionSummary>
                <AccordionDetails>
                  TODO: Device details
                  <br/>
                </AccordionDetails>
            </Accordion>
            ))}
            <br/>
            <br/>
            <hr></hr>
            <br/>
            <br/>
            <h3>Manage devices:</h3>
            <br/>
            <Button variant="outlined" color="primary">Reset device discovery</Button>
            <br/>
            <br/>
            <Button variant="outlined" color="error">Remove all devices</Button>
        </CustomTabPanel>

        <CustomTabPanel value={value} index={1}>
          <h3>Upload new module:</h3>

          <Box sx={{ width: '100%' }}>
            <Stepper activeStep={activeStep}>
              {moduleSteps.map((label, index) => (
                <Step key={label}>
                  <StepLabel optional={index === 1 ? <Typography variant="caption">Optional</Typography> : null}>
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            {activeStep === moduleSteps.length ? (
              <React.Fragment>
                <Typography sx={{ mt: 2, mb: 1 }}>
                  Module succesfully uploaded with descriptions.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                  <Box sx={{ flex: '1 1 auto' }} />
                  <Button onClick={handleReset}>Upload another</Button>
                </Box>
              </React.Fragment>
            ) : (
              <React.Fragment>
                {activeStep === 0 && (

                  <form onSubmit={handleModuleSubmit}>
                    <TextField
                      required
                      id="module-name"
                      label="Module name"
                      name="module"
                      value={moduleName}
                      onChange={(e) => setModuleName(e.target.value)}
                      variant="standard"
                      fullWidth
                      margin="normal"
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<CloudUploadIcon />}
                    >
                      Upload module
                      <VisuallyHiddenInput
                        required
                        type="file"
                        onChange={handleFileChange}
                      />
                    </Button>
                    <br/>

                    {moduleFile && <p>Selected file: {moduleFile.name}</p>}

                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    
                      <Box sx={{ flex: '1 1 auto' }} />
                      <Button variant="outlined" endIcon={<ArrowForwardIosIcon />} type="submit" >
                        Submit
                      </Button>
                    </Box>
                  </form>

                )}

                {activeStep === 1 && (
                  <form >
                    <Typography sx={{ mt: 2, mb: 1 }}>Module description</Typography>
                    <TextField
                      required
                      label="Module description"
                      variant="outlined"
                      // value={form2Data}
                      // onChange={(e) => setForm2Data(e.target.value)}
                      fullWidth
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                      <Box sx={{ flex: '1 1 auto' }} />
                      <Button type="submit">
                        {activeStep === moduleSteps.length - 1 ? 'Finish' : 'Next'}
                      </Button>
                    </Box>
                  </form>
                )}
              </React.Fragment>
            )}
          </Box>
          <br/>
          <br/>
          <hr></hr>
          <br/>
          <br/>
          <h3>Manage existing modules:</h3>
          {modules.map((module) => (
              <Accordion>
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
                    onClick={() => handleModuleDelete(module._id)}
                  > 
                    Delete {module.name}
                  </Button>
                </AccordionDetails>
            </Accordion>
          ))}

        </CustomTabPanel>

        <CustomTabPanel value={value} index={2}>
          <h3>Create new manifest:</h3>
          <p>TODO: ...</p>
          <br/>
          <br/>
          <hr></hr>
          <br/>
          <br/>
          <h3>Manage existing manifests:</h3>
          {manifests.map((manifest) => (
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`${manifest._id}-content`}
                  id={`${manifest._id}-header`}
                >
                  {manifest.name}
                </AccordionSummary>
                <AccordionDetails>
                  TODO: Manifest details
                  <br/>
                  <Button 
                    key={manifest._id} 
                    variant="outlined" 
                    color="error"
                    onClick={() => handleManifestDelete(manifest._id)}
                  > 
                    Delete {manifest.name}
                  </Button>
                </AccordionDetails>
            </Accordion>
          ))}
        </CustomTabPanel>

        <CustomTabPanel value={value} index={3}>

        </CustomTabPanel>

        <CustomTabPanel value={value} index={4}>

        </CustomTabPanel>
      </Box>
    </>
  );
}
