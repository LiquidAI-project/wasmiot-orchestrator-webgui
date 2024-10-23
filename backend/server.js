// backend/server.js

const express = require('express');
const axios = require('axios');
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

app.get('/file/device', async (req, res) => {
  try {
    // Forward the request to the actual server (localhost:3000)
    const response = await axios.get('http://localhost:3000/file/device');
    
    // Send the response back to the React app
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error forwarding the request to the actual server' });
  }
});

app.post('/file/module', upload.single('module'), async (req, res) => {
    try {
      const formData = new FormData();
      formData.append('name', req.body.name);
      formData.append('module', req.file.buffer, req.file.originalname); // Add the file with the correct field name and original filename
  
      const response = await axios.post('http://localhost:3000/file/module', formData, {
        headers: {
          ...formData.getHeaders(), // Set the appropriate headers for multipart/form-data
        },
      });
  
      res.json(response.data);
    } catch (error) {
      console.error('Error forwarding the file upload:', error);
      res.status(500).json({ error: 'Error forwarding the file upload to the actual server' });
    }
  });

// TODO: POST /file/module/{module_id}/upload

app.get('/file/module', async (req, res) => {
    try {
      // Forward the request to the actual server (localhost:3000)
      const response = await axios.get('http://localhost:3000/file/module');
      
      // Send the response back to the React app
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: 'Error forwarding the request to the actual server' });
    }
  });


app.get('/file/module/:id', async (req, res) => {
const { id } = req.params;

try {
    // Forward the get request to the actual backend or handle the getting logic here
    const response = await axios.get(`http://localhost:3000/file/module/${id}`);
    
    res.json(response.data); // Respond with the result
} catch (error) {
    console.error(`Error deleting module with id: ${id}`, error);
    res.status(500).json({ error: 'Error deleting module' });
}
});


app.delete('/file/module/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Forward the delete request to the actual backend or handle the deletion logic here
        const response = await axios.delete(`http://localhost:3000/file/module/${id}`);
        
        res.json(response.data); // Respond with the result
    } catch (error) {
        console.error(`Error deleting module with id: ${id}`, error);
        res.status(500).json({ error: 'Error deleting module' });
    }
    });


app.get('/file/manifest', async (req, res) => {
    try {
        // Forward the request to the actual server (localhost:3000)
        const response = await axios.get('http://localhost:3000/file/manifest');
        
        // Send the response back to the React app
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error forwarding the request to the actual server' });
    }
    });

app.delete('/file/manifest/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Forward the delete request to the actual backend or handle the deletion logic here
        const response = await axios.delete(`http://localhost:3000/file/manifest/${id}`);
        
        res.json(response.data); // Respond with the result
    } catch (error) {
        console.error(`Error deleting manifest with id: ${id}`, error);
        res.status(500).json({ error: 'Error deleting manifest' });
    }
    });





app.listen(port, () => {
  console.log(`Proxy backend running on http://localhost:${port}`);
});
