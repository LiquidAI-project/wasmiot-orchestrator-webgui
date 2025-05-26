import axios from 'axios';
import { Position, MarkerType } from '@xyflow/react';

const baseUrl = process.env.REACT_APP_API_URL ?? '';

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
        const response = await axios.get(`${baseUrl}/file/manifest`);
        const newManifests = response.data; 
        updateManifestsList(newManifests, setManifests);
    } catch (error) {
        console.error('Error fetching manifests:', error);
    }
};

// Function to handle deletion of a manifest
export const handleManifestDelete = async (manifestId) => {
    try {
        const response = await axios.delete(`${baseUrl}/file/manifest/${manifestId}`);
        console.log(`Deleted manifest with id: ${manifestId}`, response.data);
    } catch (error) {
        console.error(`Error deleting manifest with id: ${manifestId}`, error);
    }
    fetchManifests();
};

// Function to fetch devices from the backend periodically
// Also gets related metadata cards
export const fetchDevices = async (setDevices) => {
    try {
        const response = await axios.get(`${baseUrl}/file/device`);
        const newDevices = response.data; // Assuming the data is a list of device objects with name and _id
        // TODO: Get metadata cards here
        let metadataCards = []
        for (let i = 0; i < newDevices.length; i++) {
          // Currently assigns semi-fake data
          newDevices[i].metadataCard = {
            "name": `Metadata name ${i+1}`,
            "id": `Metadata id ${i+1}`,
            "zone": (i % 2 == 0) ? "safe" : "unsafe"
          }
        }
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

// Fetches the list of modules from orchestrator
export const fetchModules = async (setModules) => {
  try {
      const response = await axios.get(`${baseUrl}/file/module`);
      const newModules = response.data; 
      updateModulesList(newModules, setModules);
  } catch (error) {
      console.error('Error fetching modules:', error);
  }
};

// Funtion to update the list of modules
export const updateModulesList = (newModules, setModules) => {
  setModules((prevModules) => {
  const prevModuleIds = new Set(prevModules.map((module) => module._id));
  const newModuleIds = new Set(newModules.map((module) => module._id));
  const updatedModules = prevModules.filter((module) => newModuleIds.has(module._id));
  newModules.forEach((newModule) => {
      if (!prevModuleIds.has(newModule._id)) {
      updatedModules.push(newModule);
      }
  });
  return updatedModules;
  });
};

// Function to delete a module
export const handleModuleDelete = async (moduleId, setModules) => {
  try {
      const response = await axios.delete(`${baseUrl}/file/module/${moduleId}`);
      console.log(`Deleted module with id: ${moduleId}`, response.data);
  } catch (error) {
      console.error(`Error deleting module with id: ${moduleId}`, error);
  }
  fetchModules(setModules);
};


////////////////////////////////////////
// From: https://reactflow.dev/examples/edges/floating-edges
////////////////////////////////////////
 
// this helper function returns the intersection point
// of the line between the center of the intersectionNode and the target node
function getNodeIntersection(intersectionNode, targetNode) {
  // https://math.stackexchange.com/questions/1724792/an-algorithm-for-finding-the-intersection-point-between-a-center-of-vision-and-a
  const { width: intersectionNodeWidth, height: intersectionNodeHeight } =
    intersectionNode.measured;
  const intersectionNodePosition = intersectionNode.internals.positionAbsolute;
  const targetPosition = targetNode.internals.positionAbsolute;
 
  const w = intersectionNodeWidth / 2;
  const h = intersectionNodeHeight / 2;
 
  const x2 = intersectionNodePosition.x + w;
  const y2 = intersectionNodePosition.y + h;
  const x1 = targetPosition.x + targetNode.measured.width / 2;
  const y1 = targetPosition.y + targetNode.measured.height / 2;
 
  const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h);
  const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h);
  const a = 1 / (Math.abs(xx1) + Math.abs(yy1));
  const xx3 = a * xx1;
  const yy3 = a * yy1;
  const x = w * (xx3 + yy3) + x2;
  const y = h * (-xx3 + yy3) + y2;
 
  return { x, y };
}
 
// returns the position (top,right,bottom or right) passed node compared to the intersection point
function getEdgePosition(node, intersectionPoint) {
  const n = { ...node.internals.positionAbsolute, ...node };
  const nx = Math.round(n.x);
  const ny = Math.round(n.y);
  const px = Math.round(intersectionPoint.x);
  const py = Math.round(intersectionPoint.y);
 
  if (px <= nx + 1) {
    return Position.Left;
  }
  if (px >= nx + n.measured.width - 1) {
    return Position.Right;
  }
  if (py <= ny + 1) {
    return Position.Top;
  }
  if (py >= n.y + n.measured.height - 1) {
    return Position.Bottom;
  }
 
  return Position.Top;
}
 
// returns the parameters (sx, sy, tx, ty, sourcePos, targetPos) you need to create an edge
export function getEdgeParams(source, target) {
  const sourceIntersectionPoint = getNodeIntersection(source, target);
  const targetIntersectionPoint = getNodeIntersection(target, source);
 
  const sourcePos = getEdgePosition(source, sourceIntersectionPoint);
  const targetPos = getEdgePosition(target, targetIntersectionPoint);
 
  return {
    sx: sourceIntersectionPoint.x,
    sy: sourceIntersectionPoint.y,
    tx: targetIntersectionPoint.x,
    ty: targetIntersectionPoint.y,
    sourcePos,
    targetPos,
  };
}

////////////////////////////////////////
//
////////////////////////////////////////
 


