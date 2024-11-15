import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import DeviceList from './components/deviceList';
import ResetDeviceDiscoveryButton from './components/resetDeviceDiscoveryButton';
import DeleteAllDevicesButton from './components/deleteAllDevicesButton';
import DeleteAllModulesButton from './components/deleteAllModulesButton';
import DeleteAllManifestsButton from './components/deleteAllManifestsButton';
import ModuleList from './components/moduleList';
import ModuleCreation from './components/moduleCreation';
import ModuleDescription from './components/moduleDescription';
import ManifestCreation from './components/manifestCreation';
import ManifestList from './components/manifestList';
import ManifestUpdate from './components/manifestUpdate';
import Deployment from './components/deployment';
import Execution from './components/execution';
import DeviceMap from './components/deviceMap';
import Grid from '@mui/material/Grid2';
import axios from 'axios';
import './index.css';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';


const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  ...theme.applyStyles('dark', {
    backgroundColor: '#1A2027',
  }),
}));

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


export default function App() {
  const [devices, setDevices] = useState([]); // List of devices
  const [modules, setModules] = useState([]); // List of modules
  const [manifests, setManifests] = useState([]); // List of manifests
  const [value, setValue] = useState(0);  // Tracks the current tab number
  const [moduleName, setModuleName] = useState(''); // Name of the module being uploaded
  const [moduleFile, setModuleFile] = useState(null); // Module file to be uploaded
  const [moduleId, setModuleId] = useState(''); // Module id of the recently uploaded module
  const [error, setError] = useState(''); // Holds the latest error
  const [selectedDeployment, setSelectedDeployment] = useState(null);

  // Handles changing a tab
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Handles enabling/disabling background
  const enableBackground = (event) => {
    if(event.target.checked){
      document.getElementById("app").style.backgroundImage='url("https://www.drawio.com/assets/img/blog/floorplan-apartment-ground-floor.png")';
      document.getElementById("app").style.backgroundSize='contain';
      console.log("Enabling background");
    } else {
      document.getElementById("app").style.backgroundImage="none";
      console.log("Disabling background");
    }
  };

  return (
    <>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs">
            <Tab label="Devices" id="simple-tab-0" aria-controls="simple-tabpanel-0"/>
            <Tab label="Modules" id="simple-tab-1" aria-controls="simple-tabpanel-1"/>
            <Tab label="Manifests" id="simple-tab-2" aria-controls="simple-tabpanel-2"/>
          </Tabs>
        </Box>

        <CustomTabPanel value={value} index={0}>

        <Grid container spacing={2}>
          <Grid size={{ xs: 6, md: 4 }}>
            <Divider textAlign="center">View controls</Divider>
              <FormGroup>
                <FormControlLabel control={<Checkbox onChange={enableBackground} />} label="Show background" />
              </FormGroup>
            <Divider textAlign="center">Deploy</Divider>
            <Deployment manifests={manifests} setManifests={setManifests}/>
            <Divider textAlign="center">Execute</Divider>
            <Execution 
              manifests={manifests} setManifests={setManifests} 
              module={modules} setModules={setModules} 
              selectedDeployment={setSelectedDeployment} setSelectedDeployment={setSelectedDeployment}
            />
            <Divider textAlign="center">Actions</Divider> <br/>
            <ResetDeviceDiscoveryButton /> <br/>
            <DeleteAllDevicesButton /> <br/>
            <DeleteAllModulesButton /> <br/>
            <DeleteAllManifestsButton /> <br/>
          </Grid>
          <Grid size={{ xs: 6, md: 8 }}>
            <DeviceMap 
              devices={devices} setDevices={setDevices}
              selectedDeployment={selectedDeployment} setSelectedDeployment={setSelectedDeployment}
            />
          </Grid>
        </Grid>


        </CustomTabPanel>

        <CustomTabPanel value={value} index={1}>
          <Divider textAlign="left"><b>Upload new module:</b></Divider>
          <ModuleCreation 
              modules={modules} setModules={setModules}
              moduleName={moduleName} setModuleName={setModuleName}
              moduleFile={moduleFile} setModuleFile={setModuleFile} 
              moduleId={moduleId} setModuleId={setModuleId}
              error={error} setError={setError}
          />
          <br/>
          <br/>
          <Divider textAlign="left"><b>Update module description:</b></Divider>
          <br/>
          <ModuleDescription
              moduleId={moduleId} setModuleId={setModuleId}
              modules={modules} setModules={setModules}
          />
          <br/>
          <br/>
          <Divider textAlign="left"><b>Manage existing modules:</b></Divider>
          <br/>
          <br/>
            <ModuleList modules={modules} setModules={setModules} />

        </CustomTabPanel>

        <CustomTabPanel value={value} index={2}>
          <br/>
          <br/>
          <Divider textAlign="left"><b>Create new manifest:</b></Divider>
          <br/>
          <br/>
          <ManifestCreation devices={devices} setDevices={setDevices} modules={modules} setModules={setModules} manifests={manifests} setManifests={setManifests} />
          <br/>
          <br/>
          <Divider textAlign="left"><b>Manage existing manifests:</b></Divider>
          <br/>
          <br/>
          <ManifestList manifests={manifests} setManifests={setManifests} devices={devices} setDevices={setDevices} modules={modules} setModules={setModules} />

        </CustomTabPanel>

      </Box>
    </>
  );
}
