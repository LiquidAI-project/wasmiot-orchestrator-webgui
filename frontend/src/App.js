import * as React from 'react';
import { useState, useEffect } from 'react';
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
import axios from 'axios';

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

  // Handles changing a tab
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs">
            <Tab label="Devices" id="simple-tab-0" aria-controls="simple-tabpanel-0"/>
            <Tab label="Modules" id="simple-tab-1" aria-controls="simple-tabpanel-1"/>
            <Tab label="Manifests" id="simple-tab-2" aria-controls="simple-tabpanel-2"/>
            <Tab label="Deployment" id="simple-tab-3" aria-controls="simple-tabpanel-3"/>
            <Tab label="Execution" id="simple-tab-4" aria-controls="simple-tabpanel-4"/>
          </Tabs>
        </Box>

        <CustomTabPanel value={value} index={0}>
        <Divider textAlign="left"><b>List of active devices</b></Divider>
          <br/>
          <br/>
          <DeviceList devices={devices} setDevices={setDevices}/>
          <br/>
          <br/>
          <Divider textAlign="left"><b>General management:</b></Divider>
          <br/>
          <br/>
          <ResetDeviceDiscoveryButton />
          <br/>
          <DeleteAllDevicesButton />
          <br/>
          <DeleteAllModulesButton />
          <br/>
          <DeleteAllManifestsButton />
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

        <CustomTabPanel value={value} index={3}>
          <br/>
          <br/>
          <Divider textAlign="left"><b>Deploy a manifest</b></Divider>
          <br/>
          <br/>
          <Deployment manifests={manifests} setManifests={setManifests}/>
        </CustomTabPanel>

        <CustomTabPanel value={value} index={4}>
          <br/>
          <br/>
          <Divider textAlign="left"><b>Execute a manifest</b></Divider>
          <br/>
          <br/>
          <Execution manifests={manifests} setManifests={setManifests} module={modules} setModules={setModules}/>
        </CustomTabPanel>
      </Box>
    </>
  );
}
