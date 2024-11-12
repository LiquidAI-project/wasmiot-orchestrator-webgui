import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { ReactFlow, Controls, Background, applyNodeChanges, applyEdgeChanges, } from '@xyflow/react';
import '@xyflow/react/dist/style.css';


function DeviceMap({ nodes, setNodes, edges, setEdges, devices, setDevices }) {
    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [],
    );
    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [],
    );

    // Update nodes/edges on the devices map every time there are changes to devices
    useEffect(() => {
        // Construct the nodes and edges based on devices list.
        // Orchestrator is assumed to be the device with name "orchestrator".
        let newDevices = [];
        for (let i = 0; i < devices.length; i++) {
            let newDevice = {
                "_id": devices[i]._id,
                "name": devices[i].name,
                "ip": devices[i].communication.addresses[0], // Can they have multiple addresses?
                "port": devices[i].communication.port,
            };
            if (devices[i].name !== "orchestrator"){
                newDevice.cpuName = devices[i].description.platform.cpu.humanReadableName
                newDevice.cpuSpeed = `${(devices[i].description.platform.cpu.clockSpeed.Hz / 1000000000).toFixed(2)} Ghz`
                newDevice.cpuUsage = `${(devices[i].health.report.cpuUsage).toFixed(2)}`
                newDevice.memory = `${(devices[i].description.platform.memory.bytes / 1000000000).toFixed(2)} Gbs`
            }
            newDevices.push(newDevice);
        }

        // Separate orchestrator and sort the rest of the devices by name
        newDevices = newDevices.sort((a, b) => {
            if (a.name === "orchestrator") return -1;    // Orchestrator goes first
            if (b.name === "orchestrator") return 1;
            return a.name.localeCompare(b.name);         // Alphabetical order for the rest
        });

        let newNodes = [];
        let newEdges = [];

        for (let i = 0; i < newDevices.length; i++) {
            let x = i*100;
            let y = i*100;
            if (i < 1) {
                // TODO: What was this for again?
            }
            newNodes.push(
                {
                    id: `${i + 1}`,
                    data: { label: `${newDevices[i].name}` },
                    position: { x: i*100, y: i*100 },
                    // type: 'input',
                },
            );

            if (i > 0) {
                newEdges.push(
                    {
                        id: `1-${i + 1}`, 
                        source: `1`, 
                        target: `${i+1}`,
                        // label: `From 1 to ${i+1}`, 
                        // type: 'step' 
                    }
                );
            }
        }
        let updateNeeded = false;
        if (newNodes.length !== nodes.length) {
            updateNeeded = true;
        } else {
          for (let i = 0; i < nodes.length; i++) {
            // Check that nodes have same names and same order
            if (nodes[i].data.label !== newNodes[i].data.label){
                updateNeeded = true;
                break;
            }
          }
        }
        if (updateNeeded) {
            setNodes(newNodes);
            setEdges(newEdges);
        }
    }, [devices]);

    return (
        <div style={{ height: '40vh' }} id="app">
            <ReactFlow  nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} fitView>
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    );
}


export default DeviceMap;