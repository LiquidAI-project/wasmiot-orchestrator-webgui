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

