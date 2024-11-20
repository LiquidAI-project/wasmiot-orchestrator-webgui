import * as React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
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
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

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

    const handleModuleChange = (event) => {
        const selectedId = event.target.value;
        setSelectedModuleId(selectedId);
        setModuleId(selectedId);
        setIsSubmitted(false);
    };

    useEffect(() => {
        if (!selectedModuleId) return;

        const fetchModuleDescription = async () => {
            try {
                const response = await axios.get(`http://localhost:5001/file/module/${selectedModuleId}`);
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

    useEffect(() => {
        if (moduleId) {
            setSelectedModuleId(moduleId);
        }
    }, [moduleId]);

    useEffect(() => {
        if (moduleDescription && moduleDescription.exports) {
            const newFormFields = moduleDescription.exports.map((exportItem, index) => ({
                name: exportItem.name,
                parameterCount: exportItem.parameterCount,
                method: "GET",
                mountName: "",
                mounts: []
            }));
            setFormFields(newFormFields);
        } else {
            setFormFields([]);
        }
    }, [moduleDescription]);

    const handleMethodChange = (index, newMethod) => {
        setFormFields((prevFields) => {
            const updatedFields = [...prevFields];
            updatedFields[index].method = newMethod;
            return updatedFields;
        });
    };

    const handleMountNameChange = (index, newMountName) => {
        setFormFields((prevFields) => {
            const updatedFields = [...prevFields];
            updatedFields[index].mountName = newMountName;
            return updatedFields;
        });
    };

    const addMount = (index) => {
        const mountName = formFields[index].mountName;
        if (!mountName) return;

        setFormFields((prevFields) => {
            const updatedFields = [...prevFields];
            const newMount = { name: mountName, type: "Deployment", file: null };
            updatedFields[index].mounts = [...updatedFields[index].mounts, newMount];
            updatedFields[index].mountName = "";
            return updatedFields;
        });
    };

    const handleMountTypeChange = (fieldIndex, mountIndex, newType) => {
        setFormFields((prevFields) => {
            const updatedFields = [...prevFields];
            updatedFields[fieldIndex].mounts[mountIndex].type = newType;
            return updatedFields;
        });
    };

    const handleFileChange = (fieldIndex, mountIndex, file) => {
        setFormFields((prevFields) => {
            const updatedFields = [...prevFields];
            updatedFields[fieldIndex].mounts[mountIndex].file = file;
            return updatedFields;
        });
    };

    const removeMount = (fieldIndex, mountIndex) => {
        setFormFields((prevFields) => {
            const updatedFields = [...prevFields];
            updatedFields[fieldIndex].mounts.splice(mountIndex, 1);
            return updatedFields;
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData();

        formFields.forEach((field, fieldIndex) => {
            const prefix = `${field.name}`;
            formData.append(`${prefix}[method]`, field.method);
            formData.append(`${prefix}[mountName]`, field.mountName);

            for (let i = 0; i < field.parameterCount; i++) {
                formData.append(`${prefix}[param${i}]`, "integer");
            }
            formData.append(`${prefix}[output]`, "integer");

            field.mounts.forEach((mount, mountIndex) => {
                const mountPrefix = `${prefix}[mounts][${mountIndex}]`;
                formData.append(`${mountPrefix}[name]`, mount.name);
                formData.append(`${mountPrefix}[stage]`, mount.type);
                if (mount.file) {
                    formData.append(mount.name, mount.file);
                }
            });
            setSelectedModuleId('');
        });

        try {
            const response = await axios.post(`http://localhost:5001/file/module/${selectedModuleId}/upload`, formData, {
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

            {error && <Alert severity="error" sx={{ mt: 2 }} onClose={()=>{setError(null);}}>{error}</Alert>}
            {isSubmitted && (
                <Alert severity="success" sx={{ mt: 2 }} onClose={()=>{setIsSubmitted(false);}}>
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

                            <TextField
                                label="Output"
                                defaultValue="integer"
                                fullWidth
                                margin="dense"
                            />

                            {field.mounts.map((mount, mountIndex) => (
                                <Box key={`${mount.name}-${mountIndex}`} component="fieldset" sx={{ border: '1px solid #ccc', padding: 2, marginTop: 2 }}>
                                    <Typography component="legend">{mount.name}</Typography>

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

                                    <FormControl fullWidth margin="normal">
                                        <InputLabel>Mount Type</InputLabel>
                                        <Select
                                            value={mount.type}
                                            onChange={(e) => handleMountTypeChange(fieldIndex, mountIndex, e.target.value)}
                                        >
                                            <MenuItem value="Deployment">Deployment</MenuItem>
                                            <MenuItem value="Execution">Execution</MenuItem>
                                            <MenuItem value="Output">Output</MenuItem>
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

                    {selectedModuleId && (
                        <Button type="submit" variant="contained" color="primary" sx={{ marginTop: 2 }}>
                            Submit
                        </Button>
                    )}
                </>
            )}
        </Box>
    );
}

export default ModuleDescription;
