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

 
function NodeWithModal({ data, id }) {

  const [deviceDetails, setDeviceDetails] = useState(data.deviceDetails || {});
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [deviceCardName, setDeviceCardName] = useState('');
  const [deviceCardFile, setDeviceCardFile] = useState(null);
  const [error, setError] = useState(null);

  const handleStyle = { left: 10 };
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
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
  const handleReset = () => {
    setDeviceCardName('');
    setDeviceCardFile(null);
    setUploadSuccess(false);
    setError(null);
  };

  useEffect(() => {
    async function postDeviceCard() {
      if (deviceCardFile === null || deviceCardFile === undefined) {
        console.log("Device card file changed to null/undefined, not doing anything");
        return;
      }
  
      setError(null); // Clear any existing errors
      const formData = new FormData();
      let deviceId = "asdf" // TODO:
      formData.append('deviceId', deviceId); 
      formData.append('deviceCard', deviceCardFile);
      console.log(deviceCardFile);
  
      try {
          const response = await axios.post(`http://localhost:5001/file/device/${deviceId}/upload/card`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
          });
          setUploadSuccess(true);
          console.log("Note: devices were not refreshed");
          // fetchDevices(setDevices); // Refresh devices (TODO: Make sure this also refreshes the card in current node)
      } catch (error) {
          console.error('Error uploading the card:', error);
          setError('Error uploading the card. Please try again.');
          setUploadSuccess(false);
      }
  
  
      console.log("New device card file detected UwU");
    }
    postDeviceCard()

  }, [deviceCardFile])

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
                <Typography component="legend">Metadata card</Typography>
              </AccordionSummary>
              <AccordionDetails>
                Current card:
                <pre>{JSON.stringify(data.deviceDetails.metadataCard, null, 2) }</pre>
                <br/>

                {/* <Button type="submit" endIcon={<PublishIcon />} fullWidth variant="outlined" color="primary" sx={{ marginTop: 2 }}>
                  Upload a new metadata card
                </Button> */}

                {/* <Box component="form" onSubmit={handleDeviceCardSubmit}> */}
                <Box component="form">
                  {uploadSuccess && (
                      <Alert
                          severity="success"
                          // action={
                          //     <Button color="inherit" size="small" onClick={handleReset}>
                          //         Upload Another
                          //     </Button>
                          // }
                      >
                          Card uploaded successfully!
                      </Alert>
                  )}
                  {error && <Alert severity="error">{error}</Alert>}

                  {!uploadSuccess && (
                      <>
                          {/* <TextField
                              required
                              id="module-name"
                              label="Module name"
                              value={moduleName}
                              onChange={(e) => setModuleName(e.target.value)}
                              variant="standard"
                              fullWidth
                              margin="normal"
                          /> */}
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

                          {/* <Box sx={{ mt: 2 }}>
                              <Button
                                  type="submit"
                                  variant="outlined"
                                  endIcon={<ArrowForwardIosIcon />}
                              >
                                  Submit
                              </Button>
                          </Box> */}
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