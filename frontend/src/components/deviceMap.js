import * as React from 'react';
import { 
    useState, 
    useEffect, 
    useCallback 
} from 'react';
import { 
    ReactFlow, 
    Controls, 
    Background, 
    applyNodeChanges, 
    applyEdgeChanges, 
    addEdge, 
    useNodesState, 
    useEdgesState, 
    MarkerType, 
    Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { fetchDevices, fetchModules } from '../utils';
import NodeWithModal from './nodeWithModal';
import FloatingEdge from './floatingEdge';
import FloatingConnectionLine from './floatingConnectionLine';
import { useOnViewportChange } from '@xyflow/react';


function DeviceMap({ 
    devices, setDevices, 
    selectedDeployment, setSelectedDeployment, 
    modules, setModules, 
    nodes, setNodes, onNodesChange, 
    edges, setEdges, onEdgesChange,
    viewportState, setViewportState
}) {
    const nodeTypes = { nodeWithModal: NodeWithModal };
    const edgeTypes = { floating: FloatingEdge };

    const [orchestratorId, setOrchestratorId] = useState("");
    const onConnect = useCallback(
      (params) =>
        setEdges((eds) =>
          addEdge(
            {
              ...params,
              type: 'floating',
              markerEnd: { type: MarkerType.Arrow },
            },
            eds,
          ),
        ),
      [setEdges],
    );
    

    // Update nodes/edges on the devices map every time there are changes to devices
    useEffect(() => {
        // Construct the nodes and edges based on devices list.
        // Orchestrator is assumed to be the device with name "orchestrator".
        let newDevices = [];
        
        for (let i = 0; i < devices.length; i++) {
            try {
                let newDevice = {
                    "_id": devices[i]._id,
                    "name": devices[i].name,
                    "ip": devices[i].communication.addresses[0], // Can they have multiple addresses?
                    "port": devices[i].communication.port,
                    "communication": devices[i].communication,
                    "description": devices[i].description,
                    "health": devices[i].health,
                    "metadataCard": devices[i].metadataCard
                };
                if (devices[i].name !== "orchestrator"){
                    newDevice.cpuName = devices[i].description.platform.cpu.humanReadableName
                    newDevice.cpuSpeed = `${(devices[i].description.platform.cpu.clockSpeedHz / 1000000000).toFixed(2)} Ghz`
                    newDevice.cpuUsage = `${(devices[i].health.report.cpuUsage).toFixed(2)}`
                    newDevice.memory = `${(devices[i].description.platform.memory.bytes / 1000000000).toFixed(2)} Gbs`
                } else {
                    setOrchestratorId(devices[i]._id);
                }
                newDevices.push(newDevice);
            } catch (e) {
                console.log("ERROR while reading devices list returned from orchestrator!!");
                console.log(e);
            }
        }

        // Separate orchestrator and sort the rest of the devices by name
        newDevices = newDevices.sort((a, b) => {
            if (a.name === "orchestrator") return -1;    // Orchestrator goes first
            if (b.name === "orchestrator") return 1;
            return a.name.localeCompare(b.name);         // Alphabetical order for the rest
        });

        let newNodes = [];
        // let newEdges = [];

        // const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        const center = {x: 200, y: 200};
        for (let i = 0; i < newDevices.length; i++) {
            let x = center.x;
            let y = center.y;
            if (i > 0) {
                let degrees = i * (360 / newDevices.length - 1);
                let radians = degrees * (Math.PI / 180);
                x = 250 * Math.cos(radians) + center.x;
                y = 250 * Math.sin(radians) + center.y;
            }

            newNodes.push(
                {
                    id: newDevices[i]._id,
                    data: {
                        label: `${newDevices[i].name}`,
                        deviceDetails: {
                            _id: newDevices[i]._id,
                            name: newDevices[i].name,
                            communication: newDevices[i].communication,
                            description: newDevices[i].description,
                            health: newDevices[i].health,
                            metadataCard: newDevices[i].metadataCard,
                            positionInSequence: "",
                            currentModule: "",
                            currentFunction: ""
                        },
                    },
                    position: { x: x, y: y },
                    type: 'nodeWithModal',
                },
            );

        }

        // TODO: Use these grouping examples for visualizing device zones??
        // Add extra grouping examples
        // newNodes.push(
        //     {
        //         id: 'highrisk',
        //         data: { label: 'High Risk' },
        //         position: { x: 400, y: -200 },
        //         style: { 
        //             backgroundColor: 'rgba(255, 0, 0, 0.2)',
        //             width: 300, 
        //             height: 300 
        //         },
        //     },
        //     {
        //         id: "high example 1",
        //         data: { 
        //             label: "Risky device 1",
        //             deviceDetails: {
        //                 _id: "",
        //                 name: "",
        //                 communication: {},
        //                 description: {},
        //                 health: {}
        //             },
        //         },
        //         position: { x: 10, y: 50 },
        //         type: 'nodeWithModal',
        //         parentId: 'highrisk',
        //         extent: 'parent',
        //     },
        //     {
        //         id: "high example 2",
        //         data: { 
        //             label: "Risky device 2",
        //             deviceDetails: {
        //                 _id: "",
        //                 name: "",
        //                 communication: {},
        //                 description: {},
        //                 health: {}
        //             },
        //         },
        //         position: { x: 10, y: 100 },
        //         type: 'nodeWithModal',
        //         parentId: 'highrisk',
        //         extent: 'parent',
        //     },
        //     {
        //         id: 'lowrisk',
        //         data: { label: 'Low Risk' },
        //         position: { x: 400, y: 200 },
        //         style: { 
        //             backgroundColor: 'rgba(0, 0, 255, 0.2)',
        //             width: 300, 
        //             height: 300 
        //         },
        //     },
        //     {
        //         id: "low example 1",
        //         data: { 
        //             label: "Normal device 1",
        //             deviceDetails: {
        //                 _id: "",
        //                 name: "",
        //                 communication: {},
        //                 description: {},
        //                 health: {}
        //             },
        //         },
        //         position: { x: 10, y: 50 },
        //         type: 'nodeWithModal',
        //         parentId: 'lowrisk',
        //         extent: 'parent',
        //     },
        // );

        // Check if a full update/redraw is needed
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
        }
    }, [devices]);


    // Poll devices every 30 seconds
    useEffect(() => {
        fetchDevices(setDevices);
        const intervalId = setInterval(function() {fetchDevices(setDevices)}, 30000);
        return () => clearInterval(intervalId);
    }, []);

    // Populate the list of modules
    useEffect(() => {
        fetchModules(setModules);
    }, []);

    // Update edges when a manifest/deployment is selected (or unselected)
    useEffect(() => {

        if (selectedDeployment === null){
            return;
        }
        let newEdges = [];
        if (selectedDeployment.sequence.length > 1){
            for (let i = 1; i < selectedDeployment.sequence.length; i++) {

                let sourceId = selectedDeployment.sequence[i-1].device;
                let targetId = selectedDeployment.sequence[i].device;
                let sourceNode = nodes.find(node => node.id === sourceId);
                let targetNode = nodes.find(node => node.id === targetId);

                sourceNode.data.deviceDetails.positionInSequence = `${i-1}`
                sourceNode.data.deviceDetails.currentFunction = selectedDeployment.sequence[i-1].func;
                let sourceModule = modules.find(m => m._id === selectedDeployment.sequence[i-1].module);
                if (sourceModule !== undefined) {
                    sourceNode.data.deviceDetails.currentModule = sourceModule.name;
                }

                targetNode.data.deviceDetails.positionInSequence = `${i}`
                targetNode.data.deviceDetails.currentFunction = selectedDeployment.sequence[i].func;
                let targetModule = modules.find(m => m._id === selectedDeployment.sequence[i].module);
                if (targetModule !== undefined) {
                    targetNode.data.deviceDetails.currentModule = targetModule.name;
                }

                newEdges.push(
                    {
                        id: `${sourceId}-${targetId}`, 
                        source: sourceId, 
                        target: targetId,
                        type: "floating",
                        animated: true,
                        style: { stroke: "black", strokeWidth: 1 },
                        label: `Step ${i}`, 
                    }
                );
            }
        }

        setEdges(newEdges);
        setNodes(nodes);

    }, [selectedDeployment]);
    
    const handleViewportChange = (viewport) => {
        setViewportState(viewport);
    };

    return (
        <div id="app">
            <ReactFlow  
                nodes={nodes} 
                edges={edges} 
                onNodesChange={onNodesChange} 
                onEdgesChange={onEdgesChange} 
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onConnect={onConnect}
                connectionLineComponent={FloatingConnectionLine}
                defaultViewport = {viewportState}

                onViewportChange={handleViewportChange}
            >
                {/* <Background style = { { backgroundImage: 'url("https://puheviestinnanpaivat2014.wordpress.com/wp-content/uploads/2014/03/agora-1-krs-aula-auditorio-2-alfa.jpg")'}}/> */}
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    );
}


export default DeviceMap;