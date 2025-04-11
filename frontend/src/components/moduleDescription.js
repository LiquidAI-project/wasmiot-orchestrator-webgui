// React imports
import * as React from 'react';
import { useState, useEffect } from 'react';

// MUI imports
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    TextField,
    Button,
    Box,
    Typography,
    IconButton,
    Alert
} from '@mui/material';

// Miscellaneous imports
import axios from 'axios';

function ModuleDescription({
    moduleId, setModuleId, 
    modules, setModules,
}) {
    const [selectedModuleId, setSelectedModuleId] = useState('');
    const [moduleDescription, setModuleDescription] = useState(null);
    const [formFields, setFormFields] = useState([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState(null); // State for error message
    const [moduleName, setModuleName] = useState(''); // State for storing the module name

    // Updates the selected module and fetches its description
    const handleModuleChange = (event) => {
        const selectedId = event.target.value;
        setSelectedModuleId(selectedId);
        setModuleId(selectedId);
        setIsSubmitted(false);
    };

    // Fetch module description when a module is selected
    useEffect(() => {
        if (!selectedModuleId) return;

        const fetchModuleDescription = async () => {
            try {
                const response = await axios.get(`file/module/${selectedModuleId}`);
                setModuleDescription(response.data[0]);
                setModuleName(response.data[0]?.name || ''); // Update the module name
                console.log("Fetched module description:", response.data[0]);
            } catch (error) {
                console.error("Error fetching module description:", error);
                setError('Error fetching module description. Please try again.');
            }
        };

        fetchModuleDescription();
    }, [selectedModuleId]);

    // Pre-fills module ID if provided initially
    useEffect(() => {
        if (moduleId) {
            setSelectedModuleId(moduleId);
        }
    }, [moduleId]);

    // Generates form fields dynamically from the module description
    useEffect(() => {
        if (moduleDescription && moduleDescription.exports) {
            const newFormFields = moduleDescription.exports.map((exportItem) => ({
                name: exportItem.name,
                parameterCount: exportItem.parameterCount,
                method: "GET",
                mountName: "",
                mounts: [],
                output: "integer" // Default output type
            }));
            setFormFields(newFormFields);
        } else {
            setFormFields([]);
        }
    }, [moduleDescription]);

    // Updates HTTP method for a specific field
    const handleMethodChange = (index, newMethod) => {
        setFormFields((prevFields) => {
            const updatedFields = [...prevFields];
            updatedFields[index].method = newMethod;
            return updatedFields;
        });
    };

    // Updates the output type for a specific field
    const handleOutputChange = (index, newOutput) => {
        setFormFields((prevFields) => {
            const updatedFields = [...prevFields];
            updatedFields[index].output = newOutput;
            return updatedFields;
        });
    };

    // Updates the temporary input for mount name
    const handleMountNameChange = (index, newMountName) => {
        setFormFields((prevFields) => {
            const updatedFields = [...prevFields];
            updatedFields[index].mountName = newMountName;
            return updatedFields;
        });
    };

    // Adds a new mount with a default type and clears the input
    const addMount = (index) => {
        const mountName = formFields[index].mountName;
        if (!mountName) return;

        setFormFields((prevFields) => {
            const updatedFields = [...prevFields];
            const newMount = { name: mountName, type: "deployment", file: null };
            updatedFields[index].mounts = [...updatedFields[index].mounts, newMount];
            updatedFields[index].mountName = "";
            return updatedFields;
        });
    };

    // Updates the mount type for a specific mount
    const handleMountTypeChange = (fieldIndex, mountIndex, newType) => {
        setFormFields((prevFields) => {
            const updatedFields = [...prevFields];
            updatedFields[fieldIndex].mounts[mountIndex].type = newType;
    
            const hasOutputMount = updatedFields[fieldIndex].mounts.some(m => m.type === "output");
    
            if (!hasOutputMount) {
                // Reset to default when all output mounts are gone
                updatedFields[fieldIndex].output = "integer";
            }
    
            return updatedFields;
        });
    };
    

    // Updates the file for a specific mount
    const handleFileChange = (fieldIndex, mountIndex, file) => {
        setFormFields((prevFields) => {
            const updatedFields = [...prevFields];
            updatedFields[fieldIndex].mounts[mountIndex].file = file;
            return updatedFields;
        });
    };

    // Removes a specific mount
    const removeMount = (fieldIndex, mountIndex) => {
        setFormFields((prevFields) => {
            const updatedFields = [...prevFields];
            updatedFields[fieldIndex].mounts.splice(mountIndex, 1);
            return updatedFields;
        });
    };

    // Prepares and submits the form data
    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData();

        formFields.forEach((field, fieldIndex) => {
            // Not sure if the orderind of items matters for orchestrator, but these
            // are ordered in a way to replicate the original version as closely as possible
            const prefix = `${field.name}`;

            for (let i = 0; i < field.parameterCount; i++) {
                formData.append(`${prefix}[param${i}]`, "integer");
            }

            formData.append(`${prefix}[output]`, field.output);
            formData.append(`${prefix}[method]`, field.method);
            
            let mountName = undefined;
            let stage = undefined;
            field.mounts.forEach((mount, mountIndex) => {
                const mountPrefix = `${prefix}[mounts][${mountIndex}]`;
                formData.append(`${mountPrefix}[name]`, mount.name);
                formData.append(`${mountPrefix}[stage]`, mount.type);
                mountName = mount.name;
                stage = mount.type;
                if (mount.file) {
                    formData.append(mount.name, mount.file);
                } else {
                    formData.append(mount.name, undefined);
                }
            });

            // Add mount name and stage fields
            // TODO: Test if the deployment/execution etc work correctly without these fields
            if (mountName === undefined) {
                formData.append(`${prefix}[mountName]`, field.mountName);
            } else {
                formData.append(`${prefix}[mountName]`, mountName);
            }
            if (stage !== undefined) {
                formData.append(`${prefix}[stage]`, stage);
            }
            
            setSelectedModuleId('');
        });

        try {
            const response = await axios.post(`file/module/${selectedModuleId}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            console.log("Form submitted successfully:", response.data);
            setIsSubmitted(true);
            setError(null); // Clear any existing error
        } catch (error) {
            console.error("Error submitting form:", error);
            setError(`Error submitting module description for ${moduleName}. Please try again.`);
            setIsSubmitted(false); // Reset submission status on error
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
            <FormControl fullWidth>
                <InputLabel id="module-select-label">Select Module</InputLabel>
                <Select
                    labelId="module-select-label"
                    value={selectedModuleId}
                    label="Select Module"
                    onChange={handleModuleChange}
                >
                    {modules.map((module) => (
                        <MenuItem key={module._id} value={module._id}>
                            {module.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {error && <Alert severity="error" sx={{ mt: 2 }} onClose={() => { setError(null); }}>{error}</Alert>}
            {isSubmitted && (
                <Alert severity="success" sx={{ mt: 2 }} onClose={() => { setIsSubmitted(false); }}>
                    Description for {moduleName} has been successfully uploaded!
                </Alert>
            )}

            {selectedModuleId && (
                <>
                    {formFields.map((field, fieldIndex) => (
                        <Box key={field.name} component="fieldset" sx={{ border: '1px solid #ccc', padding: 2, marginTop: 2 }}>
                            <Typography component="legend">{field.name}</Typography>

                            <FormControl fullWidth margin="normal">
                                <InputLabel>Method</InputLabel>
                                <Select
                                    value={field.method}
                                    onChange={(e) => handleMethodChange(fieldIndex, e.target.value)}
                                >
                                    <MenuItem value="GET">GET</MenuItem>
                                    <MenuItem value="POST">POST</MenuItem>
                                </Select>
                            </FormControl>

                            {Array.from({ length: field.parameterCount }).map((_, idx) => (
                                <TextField
                                    key={`param-${fieldIndex}-${idx}`}
                                    label={`Parameter #${idx}`}
                                    defaultValue="integer"
                                    fullWidth
                                    margin="dense"
                                />
                            ))}

                            {!field.mounts.some((m) => m.type === "output") && (
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Output</InputLabel>
                                    <Select
                                        value={field.output}
                                        onChange={(e) => handleOutputChange(fieldIndex, e.target.value)}
                                    >
                                        <MenuItem value="integer">integer</MenuItem>
                                        <MenuItem value="string">string</MenuItem>
                                    </Select>
                                </FormControl>
                            )}

                            {field.mounts.map((mount, mountIndex) => (
                                <Box key={`${mount.name}-${mountIndex}`} component="fieldset" sx={{ border: '1px solid #ccc', padding: 2, marginTop: 2 }}>
                                    <Typography component="legend">{mount.name}</Typography>

                                    {mount.type !== "output" ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
                                            <Button
                                                variant="outlined"
                                                component="label"
                                                startIcon={<CloudUploadIcon />}
                                            >
                                                Choose file
                                                <input
                                                    type="file"
                                                    hidden
                                                    onChange={(e) => {
                                                        const selectedFile = e.target.files[0];
                                                        console.log("Selected file:", selectedFile);
                                                        handleFileChange(fieldIndex, mountIndex, selectedFile);
                                                    }}
                                                />
                                            </Button>
                                            {mount.file && (
                                                <Typography sx={{ marginLeft: 2 }}>
                                                    {mount.file.name} ({(mount.file.size / 1024).toFixed(2)} KB)
                                                </Typography>
                                            )}
                                        </Box>
                                    ) : (
                                        <FormControl fullWidth margin="normal">
                                            <InputLabel>Output MIME Type</InputLabel>
                                            <Select
                                                value={formFields[fieldIndex].output}
                                                onChange={(e) => {
                                                    // Clear uploaded file if switching to output
                                                    handleFileChange(fieldIndex, mountIndex, null);
                                                    handleOutputChange(fieldIndex, e.target.value);
                                                }}
                                            >
                                                <MenuItem value="image/jpeg">image/jpeg</MenuItem>
                                                <MenuItem value="image/jpg">image/jpg</MenuItem>
                                                <MenuItem value="image/png">image/png</MenuItem>
                                            </Select>
                                        </FormControl>
                                    )}

                                    <FormControl fullWidth margin="normal">
                                        <InputLabel>Mount Type</InputLabel>
                                        <Select
                                            value={mount.type}
                                            onChange={(e) => {
                                                const newType = e.target.value;
                                                // Clear file if changing from a file-accepting type to output-type
                                                if (newType === "output") {
                                                    handleFileChange(fieldIndex, mountIndex, null);
                                                    handleOutputChange(fieldIndex, "image/jpeg"); // set default output
                                                }
                                                handleMountTypeChange(fieldIndex, mountIndex, newType);
                                            }}
                                        >
                                            <MenuItem value="deployment">deployment</MenuItem>
                                            <MenuItem value="execution">execution</MenuItem>
                                            <MenuItem value="output">output</MenuItem>
                                        </Select>
                                    </FormControl>

                                    <IconButton onClick={() => removeMount(fieldIndex, mountIndex)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            ))}


                            <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 1 }}>
                                <TextField
                                    label="Mount name"
                                    value={field.mountName}
                                    onChange={(e) => handleMountNameChange(fieldIndex, e.target.value)}
                                    fullWidth
                                />
                                <Button onClick={() => addMount(fieldIndex)} variant="outlined" sx={{ marginLeft: 1 }}>
                                    Add mount
                                </Button>
                            </Box>
                        </Box>
                    ))}

                    <Button type="submit" variant="contained" color="primary" sx={{ marginTop: 2 }}>
                        Submit
                    </Button>
                </>
            )}
        </Box>
    );
}

export default ModuleDescription;
