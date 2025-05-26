import * as React from 'react';
import { useCallback, useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Handle, Position } from '@xyflow/react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid2'; 
import Divider from '@mui/material/Divider';
import PublishIcon from '@mui/icons-material/Publish';
import { Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';

const baseUrl = process.env.REACT_APP_API_URL ?? '';

function NodeWithModal({ data, id }) {

  const [deviceDetails, setDeviceDetails] = useState(data.deviceDetails || {});

  const [nodeCardUploadSuccess, setNodeCardUploadSuccess] = useState(false);
  const [deviceCardName, setDeviceCardName] = useState('');
  const [deviceCardFile, setDeviceCardFile] = useState(null);
  const [nodeCardError, setNodeCardError] = useState(null);
  const [deviceCard, setDeviceCard] = useState(null);

  const [dataSourceCardUploadSuccess, setDataSourceCardUploadSuccess] = useState(false);
  const [dataSourceCardName, setDataSourceCardName] = useState('');
  const [dataSourceCardFile, setDataSourceCardFile] = useState(null);
  const [dataSourceCardError, setDataSourceCardError] = useState(null);
  const [dataSourceCard, setDataSourceCard] = useState(null);

  const handleStyle = { left: 10 };
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: 600,
    maxHeight: '90vh',
    overflowY: 'auto',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };
  // Hidden file input style
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
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Reset form fields
  // const handleReset = () => {
  //   setDeviceCardName('');
  //   setDeviceCardFile(null);
  //   setNodeCardUploadSuccess(false);
  //   setNodeCardError(null);
  // };

  const fetchNodeCards = async () => {
    try {
      const response = await axios.get(`${baseUrl}/nodeCards`);
      return response.data;
    } catch (error) {
        console.error('Error fetching zones and risk levels:', error);
    }
  };

  const updateDeviceCard = async () => {
    let allNodeCards = await fetchNodeCards();
    let deviceNodeCards = [];
    for (let i = 0; i < allNodeCards.length; i++) {
      if (allNodeCards[i].nodeid === data.deviceDetails._id) {
        deviceNodeCards.push(allNodeCards[i]);
      }
    }
    if (deviceNodeCards.length > 0) {
      setDeviceCard(deviceNodeCards);
      return;
    }
    setDeviceCard("No device/node card found");
  };

  const fetchDataSourceCards = async () => {
    try {
      const response = await axios.get(`${baseUrl}/dataSourceCards`);
      return response.data;
    } catch (e) {
      console.error('Error fetching datasource cards', e);
    }
  }

  const updateDataSourceCard = async () => {
    let allDataSourceCards = await fetchDataSourceCards();
    let deviceDataSourceCards = [];
    for (let i = 0; i < allDataSourceCards.length; i++) {
      if (allDataSourceCards[i].nodeid === data.deviceDetails._id) {
        deviceDataSourceCards.push(allDataSourceCards[i]);
      }
    }
    if (deviceDataSourceCards.length > 0) {
      setDataSourceCard(deviceDataSourceCards);
      return;
    }
    setDataSourceCard("No datasource cards found for this device");
  };

  useEffect(() => {
    async function postDeviceCard() {
      if (deviceCardFile === null || deviceCardFile === undefined) {
        return;
      }
  
      setNodeCardError(null); // Clear any existing errors
      let deviceId = data.deviceDetails._id;

      const reader = new FileReader();     
      reader.onload = async(e) => {
        const jsonData = JSON.parse(e.target.result);
        for (let i = 0; i < jsonData.asset.length; i++){
          jsonData.asset[i].uid = deviceId;
        }
        const response = await axios.post(`${baseUrl}/nodeCards`, jsonData);
        if (response.status === 200) {
          setNodeCardError("");
          setNodeCardUploadSuccess(true);
          updateDeviceCard();  // Refresh device card data
        } else {
          setNodeCardError("Failed to submit node card");
        }
      };      
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
      };      
      reader.readAsText(deviceCardFile); 
    }
    postDeviceCard()

  }, [deviceCardFile])


  useEffect(() => {
    async function postDataSourceCard() {
      if (dataSourceCardFile === null || dataSourceCardFile === undefined) {
        return;
      }
  
      setDataSourceCardError(null); // Clear any existing errors
      let deviceId = data.deviceDetails._id;

      const reader = new FileReader();     
      reader.onload = async(e) => {
        const jsonData = JSON.parse(e.target.result);
        for (let i = 0; i < jsonData.asset.length; i++){
          for (let j = 0; j < jsonData.asset[i].relation.length; j++) {
            if (jsonData.asset[i].relation[j].type === "nodeid") {
              jsonData.asset[i].relation[j].value = deviceId;
            }
          }
        }
        const response = await axios.post(`${baseUrl}/dataSourceCards`, jsonData);
        if (response.status === 200) {
          setDataSourceCardError("");
          setDataSourceCardUploadSuccess(true);
          updateDataSourceCard();  // Refresh device datasource card data
        } else {
          setDataSourceCardError("Failed to submit datasource card");
        }
      };      
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
      };      
      reader.readAsText(dataSourceCardFile); 
    }
    postDataSourceCard()

  }, [dataSourceCardFile])


  useEffect(() => {
    updateDeviceCard();
    updateDataSourceCard();
  }, []);

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div className="node-with-modal">
        {data.label}
        <IconButton onClick={handleOpen} aria-label="more" size="small">
          <MoreVertIcon fontSize="inherit" />
        </IconButton>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={modalStyle}>
            {/* {data.deviceDetails.name} */}
            <pre>
            {`Device name: ${data.deviceDetails.name}`}<br/>
            {`Device id: ${data.deviceDetails._id}`}
            </pre>
            {
              (data.deviceDetails.currentModule !== "" || data.deviceDetails.currentFunction !== "" || data.deviceDetails.positionInSequence !== "") ?
              <>
                <h4>Information on current execution:</h4>
                <pre>
                  Position in sequence: {deviceDetails.positionInSequence}<br/>
                  Module: {deviceDetails.currentModule}<br/>
                  Function: {deviceDetails.currentFunction}
                </pre>
                <br/>
                <Divider textAlign="left"></Divider>
                <br/>
                <br/>
              </>
              :
              <></>
            }
            <h4>Device details:</h4>

            <Accordion key={`${data.deviceDetails._id}-accordion-0`}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`${data.deviceDetails._id}-content-0`}
                id={`${data.deviceDetails._id}-header-0`}
              >
                <Typography component="legend">Node card</Typography>
              </AccordionSummary>
              <AccordionDetails>
                Current node card for this device:
                <pre>
                  {deviceCard && JSON.stringify(deviceCard, null, 2) }
                </pre>
                <br/>
                <Box component="form">
                  {nodeCardUploadSuccess && (
                      <Alert severity="success">
                          Card uploaded successfully!
                      </Alert>
                  )}
                  {nodeCardError && <Alert severity="error">{nodeCardError}</Alert>}
                  {!nodeCardUploadSuccess && (
                      <>
                          <Box sx={{ display: 'flex', alignItems: 'left' }}>
                              <Button
                                  variant="outlined"
                                  fullWidth
                                  component="label"
                                  endIcon={<PublishIcon />}
                              >
                                  Upload new card
                                  <VisuallyHiddenInput
                                      type="file"
                                      onChange={(e) => setDeviceCardFile(e.target.files[0])}
                                  />
                              </Button>
                              {deviceCardFile && <Box sx={{ ml: 2 }}>Selected file: {deviceCardFile.name}</Box>}
                          </Box>
                      </>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion key={`${data.deviceDetails._id}-accordion-00`}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`${data.deviceDetails._id}-content-00`}
                id={`${data.deviceDetails._id}-header-00`}
              >
                <Typography component="legend">Datasource cards</Typography>
              </AccordionSummary>
              <AccordionDetails>
              Current datasource cards for this device:
                <pre>
                  {dataSourceCard && JSON.stringify(dataSourceCard, null, 2) }
                </pre>
                <br/>
                <Box component="form">
                  {dataSourceCardUploadSuccess && (
                      <Alert severity="success">
                          Datasource card uploaded successfully!
                      </Alert>
                  )}
                  {dataSourceCardError && <Alert severity="error">{dataSourceCardError}</Alert>}
                  {!dataSourceCardUploadSuccess && (
                      <>
                          <Box sx={{ display: 'flex', alignItems: 'left' }}>
                              <Button
                                  variant="outlined"
                                  fullWidth
                                  component="label"
                                  endIcon={<PublishIcon />}
                              >
                                  Upload new datasource card
                                  <VisuallyHiddenInput
                                      type="file"
                                      onChange={(e) => setDataSourceCardFile(e.target.files[0])}
                                  />
                              </Button>
                              {dataSourceCardFile && <Box sx={{ ml: 2 }}>Selected file: {dataSourceCardFile.name}</Box>}
                          </Box>
                      </>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion key={`${data.deviceDetails._id}-accordion-1`}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`${data.deviceDetails._id}-content-1`}
                id={`${data.deviceDetails._id}-header-1`}
              >
                <Typography component="legend">Health</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <pre>{JSON.stringify(data.deviceDetails.health, null, 2) }</pre>
              </AccordionDetails>
            </Accordion>
            <Accordion key={`${data.deviceDetails._id}-accordion-2`}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`${data.deviceDetails._id}-content-2`}
                id={`${data.deviceDetails._id}-header-2`}
              >
                <Typography component="legend">Description</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <pre>{JSON.stringify(data.deviceDetails.description, null, 2) }</pre>
              </AccordionDetails>
            </Accordion>
            <Accordion key={`${data.deviceDetails._id}-accordion-3`}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`${data.deviceDetails._id}-content-3`}
                id={`${data.deviceDetails._id}-header-3`}
              >
                <Typography component="legend">Communication</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <pre>{JSON.stringify(data.deviceDetails.communication, null, 2) }</pre>
              </AccordionDetails>
            </Accordion>
          </Box>
        </Modal>
      </div>
      <Handle type="source" position={Position.Bottom} id="a" />
      <Handle
        type="source"
        position={Position.Bottom}
        id="b"
        style={handleStyle}
      />
    </>
  );
}

export default NodeWithModal;