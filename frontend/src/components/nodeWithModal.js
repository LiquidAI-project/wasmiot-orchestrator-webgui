import * as React from 'react';
import { useCallback, useState } from 'react';
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

 
function NodeWithModal({ data, id }) {

  // const onChange = useCallback((evt) => {
  //   console.log(evt.target.value);
  // }, []);
  let deviceDetails = data.deviceDetails;
  // console.log(data);
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
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
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
            {/* {deviceDetails.name} */}
            <Accordion key={`${deviceDetails._id}-accordion-1`}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`${deviceDetails._id}-content-1`}
                id={`${deviceDetails._id}-header-1`}
              >
                <Typography component="legend">Health</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box component="fieldset" sx={{ display: 'flex', alignItems: 'left', mb: 2, gap: 2 }}>
                  <Typography component="legend">Health</Typography>
                  <pre>{JSON.stringify(deviceDetails.health, null, 2) }</pre>
                </Box>
                <br/>
              </AccordionDetails>
            </Accordion>
            <Accordion key={`${deviceDetails._id}-accordion-2`}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`${deviceDetails._id}-content-2`}
                id={`${deviceDetails._id}-header-2`}
              >
                <Typography component="legend">Description</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box component="fieldset" sx={{ display: 'flex', alignItems: 'left', mb: 2, gap: 2 }}>
                  <Typography component="legend">Description</Typography>
                  <pre>{JSON.stringify(deviceDetails.description, null, 2) }</pre>
                </Box>
              </AccordionDetails>
            </Accordion>
            <Accordion key={`${deviceDetails._id}-accordion-3`}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`${deviceDetails._id}-content-3`}
                id={`${deviceDetails._id}-header-3`}
              >
                <Typography component="legend">Communication</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box component="fieldset" sx={{ display: 'flex', alignItems: 'left', mb: 2, gap: 2 }}>
                  <Typography component="legend">Communication</Typography>
                  <pre>{JSON.stringify(deviceDetails.communication, null, 2) }</pre>
                </Box>
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