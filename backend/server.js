const express = require('express');
const axios = require('axios');
const formidable = require('formidable');
const fs = require('fs');
const cors = require('cors');
const FormData = require('form-data');
const multer = require('multer'); // Middleware for handling file uploads
const { Console } = require('console');
const app = express();
const port = process.env.BACKEND_PORT || 5001;
const address = process.env.ORCHESTRATOR_ADDRESS || "http://localhost:3000/";

// Enable CORS
app.use(cors());
app.use(express.json());

// Middleware for handling multipart/form-data
const upload = multer();

// DEVICES

app.get('/nodeCards', async (req, res) => { // TODO: Add support for liming by date, like /nodeCards?date=2021-01-01T00:00:00.000Z
  try {
    const response = await axios.get(`${address}nodeCards`);
    res.json(response.data);
  } catch (e) {
    console.log(e)
    res.status(500).json({error: "Error getting node cards"});
  }
});

app.post('/nodeCards', async (req, res) => {
  const { id } = req.params;
  const payload = req.body;

  try {
    const response = await axios.post(`${address}nodeCards`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    res.json(response.data);
  } catch (error) {
    console.error(`Error while posting a node card:`, error);
    res.status(500).json({ error: 'Error submitting a node card.' });
  }
});

app.get('/zoneRiskLevels', async (req, res) => {
  try {
    const response = await axios.get(`${address}zoneRiskLevels`);
    res.json(response.data);
  } catch (e) {
    console.log(e)
    res.status(500).json({error: "Error getting zones and risk levels"});
  }
});

app.post('/zoneRiskLevels', async (req, res) => {
  const { id } = req.params;
  const payload = req.body;

  try {
    const response = await axios.post(`${address}zoneRiskLevels`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    res.json(response.data);
  } catch (error) {
    console.error(`Error while posting zone risk levels:`, error);
    res.status(500).json({ error: 'Error submitting zones and risk levels.' });
  }
});

app.get('/file/device', async (req, res) => {
  try {
    const response = await axios.get(`${address}file/device`);
    res.json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error getting a list of devices' });
  }
});

app.delete('/file/device', async (req, res) => {
  try {
    const response = await axios.delete(`${address}file/device`);
    res.json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error deleting all devices' });
  }
});

app.post('/file/device/discovery/reset', async (req, res) => {
  try {
    const response = await axios.post(`${address}file/device/discovery/reset`);
    res.json(response.data);
  } catch (error) {
    console.error('Error resetting device discovery:', error);
    res.status(500).json({ error: 'Error resetting device discovery' });
  }
});

app.post('/file/device/:id/upload/card', async (req, res) => {
  const { id } = req.params;

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form data:', err);
      return res.status(500).json({ error: 'Error parsing form data' });
    }

    const formData = new FormData();

    for (const fieldName in fields) {
      if (Array.isArray(fields[fieldName])) {
        fields[fieldName].forEach((value) => {
          formData.append(fieldName, value);
        });
      } else {
        formData.append(fieldName, fields[fieldName]);
      }
    }

    for (const fileKey in files) {
      const file = files[fileKey];
      if (file && file[0].filepath) {
        formData.append(fileKey, fs.createReadStream(file[0].filepath), file[0].originalFilename);
      } else {
        console.error(`File not found for key: ${fileKey}`);
      }
    }

    

    try {
      // const response = await axios.post(`${address}file/module/${id}/upload`, formData, {
      //   headers: {
      //     ...formData.getHeaders(),
      //   },
      // });

      // res.json(response.data);
      // TODO: Implement actual upload
      res.status(201).json({status: "Succesfully received device card upload."});
    } catch (error) {
      console.error(`Error forwarding device card with device id: ${id}`, error);
      res.status(500).json({ error: 'Error forwarding device card data' });
    }
  });
});

// MODULES

app.post('/file/module',   upload.fields([{ name: 'module', maxCount: 1 }, { name: 'card', maxCount: 1 }]), async (req, res) => {
  try {
    const formData = new FormData();
    formData.append('name', req.body.name);
    if (req.files['module'] && req.files['module'][0]) {
      const moduleFile = req.files['module'][0];
      formData.append('module', moduleFile.buffer, moduleFile.originalname);
    }
    if (req.files['card'] && req.files['card'][0]) {
      const cardFile = req.files['card'][0];
      // TODO: Uncomment and modify once orchestrator is updated
      // formData.append('card', cardFile.buffer, cardFile.originalname);
    }

    const response = await axios.post(`${address}file/module`, formData, {
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
    const response = await axios.get(`${address}file/module`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error forwarding the request to the actual server' });
  }
});

app.delete('/file/module', async (req, res) => {
  try {
    const response = await axios.delete(`${address}file/module`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error deleting all modules' });
  }
});

app.get('/file/module/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const response = await axios.get(`${address}file/module/${id}`);
    res.json(response.data);
  } catch (error) {
    console.error(`Error getting module with id: ${id}`, error);
    res.status(500).json({ error: 'Error getting module' });
  }
});

app.post('/file/module/:id/upload', async (req, res) => {
  const { id } = req.params;

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form data:', err);
      return res.status(500).json({ error: 'Error parsing form data' });
    }

    const formData = new FormData();

    for (const fieldName in fields) {
      if (Array.isArray(fields[fieldName])) {
        fields[fieldName].forEach((value) => {
          formData.append(fieldName, value);
        });
      } else {
        formData.append(fieldName, fields[fieldName]);
      }
    }

    for (const fileKey in files) {
      const file = files[fileKey];
      if (file && file.filepath) {
        formData.append(fileKey, fs.createReadStream(file.filepath), file.originalFilename);
      } else {
        console.error(`File not found for key: ${fileKey}`);
      }
    }

    try {
      const response = await axios.post(`${address}file/module/${id}/upload`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });

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
    const response = await axios.delete(`${address}file/module/${id}`);
    res.json(response.data);
  } catch (error) {
    console.error(`Error deleting module with id: ${id}`, error);
    res.status(500).json({ error: 'Error deleting module' });
  }
});

// MANIFESTS

app.get('/deploymentCertificates', async (req, res) => {
  try {
    const response = await axios.get(`${address}deploymentCertificates`);
    res.json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error while fetching deployment certificate list from orchestrator' });
  }
});

app.get('/file/manifest', async (req, res) => {
  try {
    const response = await axios.get(`${address}file/manifest`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error forwarding the request to the actual server' });
  }
});

app.delete('/file/manifest', async (req, res) => {
  try {
    const response = await axios.delete(`${address}file/manifest`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error deleting all manifests' });
  }
});

app.post('/file/manifest', async (req, res) => {
  const { name, sequence, ...procedures } = req.body;

  const payload = {
    name,
    sequence,
    ...procedures,
  };

  try {
    const response = await axios.post(`${address}file/manifest`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error submitting manifest:', error);
    res.status(500).json({ error: 'Error forwarding the manifest submission to the actual server' });
  }
});

app.delete('/file/manifest/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const response = await axios.delete(`${address}file/manifest/${id}`);
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
    const response = await axios.post(`${address}file/manifest/${id}`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    res.json(response.data);
  } catch (error) {
    console.error(`Error deploying manifest with id: ${id}`, error);
    res.status(500).json({ error: 'Error deploying manifest' });
  }
});

app.post('/execute/:manifestId', upload.none(), async (req, res) => {
  const { manifestId } = req.params;

  try {
    const executionResponse = await axios.post(
      `${address}execute/${manifestId}`,
      req.body,
      { headers: { 'Content-Type': 'application/json' } },
    );

    res.json({ result: executionResponse.data });
  } catch (error) {
    res.status(500).json({ error: 'Error executing manifest' });
  }
});

app.listen(port, () => {
  console.log(`Proxy backend running on http://localhost:${port}`);
});
