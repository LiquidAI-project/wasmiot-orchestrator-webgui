const express = require('express');
const axios = require('axios');
const formidable = require('formidable');
const fs = require('fs');
const cors = require('cors');
const FormData = require('form-data');
const multer = require('multer'); // Middleware for handling file uploads
const app = express();
const port = 5001;

// Enable CORS
app.use(cors());
app.use(express.json());

// Middleware for handling multipart/form-data
const upload = multer();

// Proxy requests to actual server

// DEVICES

app.get('/file/device', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:3000/file/device');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error getting a list of devices' });
  }
});

app.delete('/file/device', async (req, res) => {
  try {
    const response = await axios.delete('http://localhost:3000/file/device');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error deleting all devices' });
  }
});

app.post('/file/device/discovery/reset', async (req, res) => {
  try {
    const response = await axios.post('http://localhost:3000/file/device/discovery/reset');
    res.json(response.data);
  } catch (error) {
    console.error('Error resetting device discovery:', error);
    res.status(500).json({ error: 'Error resetting device discovery' });
  }
});

// MODULES

app.post('/file/module', upload.single('module'), async (req, res) => {
  try {
    const formData = new FormData();
    formData.append('name', req.body.name);
    formData.append('module', req.file.buffer, req.file.originalname);

    const response = await axios.post('http://localhost:3000/file/module', formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error forwarding the file upload:', error);
    res.status(500).json({ error: 'Error forwarding the file upload to the actual server' });
  }
});

app.get('/file/module', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:3000/file/module');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error forwarding the request to the actual server' });
  }
});

app.delete('/file/module', async (req, res) => {
  try {
    const response = await axios.delete('http://localhost:3000/file/module');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error deleting all modules' });
  }
});


app.get('/file/module/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const response = await axios.get(`http://localhost:3000/file/module/${id}`);
    res.json(response.data);
  } catch (error) {
    console.error(`Error getting module with id: ${id}`, error);
    res.status(500).json({ error: 'Error getting module' });
  }
});

app.post('/file/module/:id/upload', async (req, res) => {
  const { id } = req.params;

  // Create a new form to parse incoming form-data
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
      if (err) {
          console.error('Error parsing form data:', err);
          return res.status(500).json({ error: 'Error parsing form data' });
      }

      console.log('Received fields:', fields);
      console.log('Received files:', files); // Log the files received

      // Create a new FormData instance to forward data
      const formData = new FormData();

      // Append each field from the form to the FormData
      for (const fieldName in fields) {
          if (Array.isArray(fields[fieldName])) {
              fields[fieldName].forEach((value) => {
                  formData.append(fieldName, value);
              });
          } else {
              formData.append(fieldName, fields[fieldName]);
          }
      }

      // Append each file in the form to the FormData
      for (const fileKey in files) {
          const file = files[fileKey];
          if (file && file.filepath) { // Ensure the file exists and has a valid path
              formData.append(fileKey, fs.createReadStream(file.filepath), file.originalFilename);
          } else {
              console.error(`File not found for key: ${fileKey}`);
          }
      }

      try {
          // Forward the formData to the target backend address
          const response = await axios.post(`http://localhost:3000/file/module/${id}/upload`, formData, {
              headers: {
                  ...formData.getHeaders(),
              },
          });

          // Send back the response from the target server
          res.json(response.data);
      } catch (error) {
          console.error(`Error forwarding module with id: ${id}`, error);
          res.status(500).json({ error: 'Error forwarding module data' });
      }
  });
});


app.delete('/file/module/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const response = await axios.delete(`http://localhost:3000/file/module/${id}`);
    res.json(response.data);
  } catch (error) {
    console.error(`Error deleting module with id: ${id}`, error);
    res.status(500).json({ error: 'Error deleting module' });
  }
});

// MANIFESTS

app.get('/file/manifest', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:3000/file/manifest');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error forwarding the request to the actual server' });
  }
});

app.delete('/file/manifest', async (req, res) => {
  try {
    const response = await axios.delete('http://localhost:3000/file/manifest');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error deleting all manifests' });
  }
});


app.post('/file/manifest', async (req, res) => {
  const { name, sequence, ...procedures } = req.body;

  // Prepare the payload for the actual server
  const payload = {
    name,
    sequence,
    ...procedures
  };

  try {
    // Forward the request to the actual server
    const response = await axios.post('http://localhost:3000/file/manifest', payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    // Return the response from the actual server to the client
    res.json(response.data);
  } catch (error) {
    console.error('Error submitting manifest:', error);
    res.status(500).json({ error: 'Error forwarding the manifest submission to the actual server' });
  }
});

app.delete('/file/manifest/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const response = await axios.delete(`http://localhost:3000/file/manifest/${id}`);
    res.json(response.data);
  } catch (error) {
    console.error(`Error deleting manifest with id: ${id}`, error);
    res.status(500).json({ error: 'Error deleting manifest' });
  }
});

app.post('/file/manifest/:id', async (req, res) => {
  const { id } = req.params;
  const payload = req.body; 

  try {
      const response = await axios.post(`http://localhost:3000/file/manifest/${id}`, payload, {
          headers: { 'Content-Type': 'application/json' }
      });
      res.json(response.data);
  } catch (error) {
      console.error(`Error deploying manifest with id: ${id}`, error);
      res.status(500).json({ error: 'Error deploying manifest' });
  }
});

app.post('/execute/:manifestId', async (req, res) => {
  const { manifestId } = req.params;

  try {
    // Forward the request to the execution endpoint as JSON
    console.log(req.body);
    const executionResponse = await axios.post(`http://localhost:3000/execute/${manifestId}`, req.body, {
      headers: { 'Content-Type': 'application/json' },
    });

    // Return the execution response back to the client
    res.json({ result: executionResponse.data });
  } catch (error) {
    console.error(`Error executing manifest with id: ${manifestId}`, error);
    res.status(500).json({ error: 'Error executing manifest' });
  }
});




app.listen(port, () => {
  console.log(`Proxy backend running on http://localhost:${port}`);
});
