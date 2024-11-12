import axios from 'axios';

// Update the list of manifests
export const updateManifestsList = (newManifests, setManifests) => {
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

// Fetch the list of manifests
export const fetchManifests = async (setManifests) => {
    try {
        const response = await axios.get('http://localhost:5001/file/manifest');
        const newManifests = response.data; 
        updateManifestsList(newManifests, setManifests);
    } catch (error) {
        console.error('Error fetching manifests:', error);
    }
};

// Function to handle deletion of a manifest
export const handleManifestDelete = async (manifestId) => {
    try {
        const response = await axios.delete(`http://localhost:5001/file/manifest/${manifestId}`);
        console.log(`Deleted manifest with id: ${manifestId}`, response.data);
    } catch (error) {
        console.error(`Error deleting manifest with id: ${manifestId}`, error);
    }
    fetchManifests();
};

// Function to fetch devices from the backend periodically
export const fetchDevices = async (setDevices) => {
    try {
        const response = await axios.get('http://localhost:5001/file/device');
        const newDevices = response.data; // Assuming the data is a list of device objects with name and _id
        updateDevicesList(newDevices, setDevices);
    } catch (error) {
        console.error('Error fetching devices:', error);
    }
};

// Update the list of devices
export const updateDevicesList = (newDevices, setDevices) => {
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

