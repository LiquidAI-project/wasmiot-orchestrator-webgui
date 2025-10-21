import * as React from 'react';
import { useState, useEffect } from 'react';
import { Select, FormControl, InputLabel, MenuItem, Button, Alert, Box, TextField } from '@mui/material';
import axios from 'axios';
import FormData from 'form-data';
import { fetchManifests } from '../utils';
import SendIcon from '@mui/icons-material/Send';

const baseUrl = process.env.REACT_APP_API_URL ?? '';

// ----- Helper functions -----

// Get the node object for a given device ID from the selected deployment
function getNodeForDevice(selectedDeployment, deviceId) {
    const full = selectedDeployment?.fullManifest || selectedDeployment?.full_manifest;
    if (!full) return null;
    const did = String(deviceId);
    return full[did] || null;
}

// Fetch the latest successful step result from the supervisor's /request-history
async function fetchLatestStepResult(supervisorBaseUrl, deploymentId, moduleName, funcName) {
    if (!supervisorBaseUrl) throw new Error('no supervisor base url');
    const base = supervisorBaseUrl.replace(/\/+$/, '');
    const url = `${base}/request-history`;
    const { data } = await axios.get(url, { timeout: 5000 });
    if (!Array.isArray(data)) throw new Error('unexpected history format');

    const matching = data
        .filter(e =>
            e?.deployment_id === String(deploymentId) &&
            e?.module_name === moduleName &&
            e?.function_name === funcName &&
            e?.success === true
        )
        .sort((a, b) => new Date(b.work_queued_at) - new Date(a.work_queued_at));

    if (!matching.length) return null;
    const latest = matching[0];

    return {
        requestId: latest.request_id,
        result: latest.result ?? null,
        url: `${base}/request-history/${latest.request_id}`,
        raw: latest,
    };
}

// Build a map of module ID to module name from the selected deployment
function buildModuleNameMap(selectedDeployment) {
    const map = {};
    const full = selectedDeployment?.fullManifest || selectedDeployment?.full_manifest;
    if (!full) return map;
    for (const key of Object.keys(full)) {
        const node = full[key];
        const modules = node?.modules || [];
        for (const m of modules) {
            if (m?.id && m?.name) map[String(m.id)] = m.name;
        }
    }
    return map;
}

// Get output mounts for a specific step of a deployment
function getOutputMountsForStep(selectedDeployment, deviceId, moduleName, funcName) {
    const node = getNodeForDevice(selectedDeployment, deviceId);
    const mounts = node?.mounts || {};
    const perModule = mounts[moduleName] || {};
    const perFunc = perModule[funcName] || null;
    const outputs = perFunc?.output || [];
    return outputs.map(o => ({
        path: o.path,
        mediaType: o.media_type,
        stage: o.stage ?? null,
    }));
}

// Get the supervisor base URL for a specific step of a deployment
function getSupervisorBaseUrl(selectedDeployment, deviceId, moduleName, funcName) {
    const node = getNodeForDevice(selectedDeployment, deviceId);
    const endpoints = node?.endpoints || {};
    const mod = endpoints[moduleName] || {};
    const ep = mod[funcName] || null;
    return ep?.url || null;
}


// Build a candidate URL to the output file using: /module_results/{module_name}/{filename}
function buildOutputUrl(supervisorBaseUrl, moduleName, filename) {
    if (!supervisorBaseUrl) return null;
    const safeName = encodeURIComponent(filename);
    const safeMod = encodeURIComponent(moduleName);
    return `${supervisorBaseUrl.replace(/\/+$/, '')}/module_results/${safeMod}/${safeName}`;
}

// Placeholder for potential base URL overrides. Maybe needed later for non-linux platforms,
// where docker internal addresses are not directly reachable from the host.
function getBaseUrlOverride(base) {
    return base;
}

// Check if media type is an image
function isImageType(mt) {
    return typeof mt === 'string' && mt.toLowerCase().startsWith('image/');
}

// Component to preview output based on media type
function OutputPreview({ url, mediaType, cacheKey }) {
    const [broken, setBroken] = React.useState(false);

    if (!url) return null;

    if (isImageType(mediaType) && !broken) {
        return (
            <div style={{ marginTop: 6 }}>
                <img
                    key={cacheKey || url}
                    src={url}
                    alt="output preview"
                    style={{ maxWidth: '100%', maxHeight: 320, display: 'block', borderRadius: 8 }}
                    onError={() => setBroken(true)}
                />
                <small><a href={url} target="_blank" rel="noreferrer">open image</a></small>
            </div>
        );
    }

    return (
        <div style={{ marginTop: 6 }}>
            <a href={url} target="_blank" rel="noreferrer">{url}</a>
            {!isImageType(mediaType) ? <small> — preview not possible</small> : <small> — preview failed</small>}
        </div>
    );
}


// Component to display the steps of a deployment along with their results and outputs
function StepsView({ selectedDeployment, intermediateResults }) {
    if (!selectedDeployment?.sequence?.length) return null;

    const moduleNameMap = buildModuleNameMap(selectedDeployment);

    return (
        <Box sx={{ mt: 2 }}>
            <strong>Steps:</strong>
            <Box component="ol" sx={{ pl: 3 }}>
                {selectedDeployment.sequence.map((step, idx) => {
                    const deviceId = step.device;
                    const moduleId = String(step.module);
                    const moduleName = moduleNameMap[moduleId] || `module:${moduleId}`;
                    const funcName = step.func || 'unknown';

                    const outMounts = getOutputMountsForStep(selectedDeployment, deviceId, moduleName, funcName);
                    const baseUrlRaw = getSupervisorBaseUrl(selectedDeployment, deviceId, moduleName, funcName);
                    const baseUrl = getBaseUrlOverride(baseUrlRaw);

                    const perStep = intermediateResults?.[idx];


                    return (
                        <li key={`${moduleId}-${idx}`}>
                            <div><strong>{moduleName}</strong></div>
                            <em>{funcName}</em>

                            <div>
                                <em>result:</em>{' '}
                                {perStep
                                    ? <code>{JSON.stringify(perStep.result)}</code>
                                    : <small>unavailable</small>
                                }
                                {perStep?.url && (
                                    <>
                                        {' '}<small>•</small>{' '}
                                        <a href={perStep.url} target="_blank" rel="noreferrer">
                                            view response
                                        </a>
                                    </>
                                )}
                            </div>

                            {outMounts.length ? (
                                <div style={{ marginTop: 6 }}>
                                    <em>outputs:</em>
                                    <ul>
                                        {outMounts.map((m, i) => {
                                            const url = buildOutputUrl(baseUrl, moduleName, m.path);
                                            const cacheKey = perStep?.requestId || Date.now(); // fallback if missing
                                            const urlWithCb = url ? `${url}${url.includes('?') ? '&' : '?'}cb=${cacheKey}` : null;
                                            return (
                                                <li key={i}>
                                                    <small>mediatype: {m.mediaType}</small>
                                                    {urlWithCb && <OutputPreview url={urlWithCb} mediaType={m.mediaType} cacheKey={cacheKey} />}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ) : (
                                <div><em>outputs:</em> <small>none</small></div>
                            )}
                        </li>
                    );
                })}
            </Box>
        </Box>
    );
}

// ----- Main Execution Component -----
function Execution({ manifests, setManifests, module, setModules, selectedDeployment, setSelectedDeployment }) {
    const [selectedManifestId, setSelectedManifestId] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState(null);
    const [parameters, setParameters] = useState([]);
    const [formValues, setFormValues] = useState({});
    const [executionResult, setExecutionResult] = useState(null);
    const [intermediateResults, setIntermediateResults] = useState({});
    const [paramsKey, setParamsKey] = useState('');


    async function collectIntermediaryResults(deploymentId, deploymentObj) {
        try {
            if (!deploymentObj?.sequence?.length) return;

            const results = {};
            const moduleNameMap = buildModuleNameMap(deploymentObj);

            // For each step, get the supervisors /request-history and pick latest match
            await Promise.all(
                deploymentObj.sequence.map(async (step, idx) => {
                    const deviceId = step.device;
                    const moduleId = String(step.module);
                    const moduleName = moduleNameMap[moduleId] || `module:${moduleId}`;
                    const funcName = step.func || 'unknown';

                    const baseRaw = getSupervisorBaseUrl(deploymentObj, deviceId, moduleName, funcName);
                    const base = getBaseUrlOverride(baseRaw);

                    try {
                        const latest = await fetchLatestStepResult(base, deploymentId, moduleName, funcName);
                        results[idx] = latest ?? null;
                    } catch (e) {
                        results[idx] = null;
                    }
                })
            );


            setIntermediateResults(results);
        } catch (e) {
            console.warn('collectIntermediaryResults failed:', e);
        }
    }


    // Filter manifests to show only active ones
    const activeManifests = manifests.filter(manifest => manifest);

    // Update form fields when a new manifest is selected
    const handleManifestChange = (event) => {
        const manifestId = event.target.value;
        setSelectedManifestId(manifestId);

        // clear current UI state
        setIsSubmitted(false);
        setError(null);
        setFormValues({});
        setParameters([]);
        setExecutionResult(null);
        setIntermediateResults({});

        const result = manifests.find(manifest => manifest._id === manifestId) || null;
        setSelectedDeployment(result);

        if (!result?.sequence?.length) return;

        const full = result.fullManifest || result.full_manifest;
        const rootKey = full && Object.keys(full)[0];
        const node = (rootKey && full[rootKey]) || null;
        const moduleId = result.sequence[0].module;
        const moduleInfo = node?.modules?.find(m => m.id === moduleId);

        if (!moduleInfo) return;

        const moduleName = moduleInfo.name;
        const ep = node?.endpoints?.[moduleName];
        if (!ep) return;

        const firstFnKey = Object.keys(ep)[0];
        setParamsKey(`${manifestId}:${firstFnKey}`);  // new: remount key for params
        const functionParams = ep[firstFnKey]?.request?.parameters;
        setParameters(Array.isArray(functionParams) ? functionParams : []);

        setParameters(Array.isArray(functionParams) ? functionParams : []);
    };


    // Update form values on parameter input
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormValues(prevValues => ({ ...prevValues, [name]: value }));
    };

    // Handle submission of manifest execution
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!selectedManifestId) {
            setError("Please select a manifest to execute.");
            return;
        }

        // Create FormData from form values
        const formData = new FormData();
        for (const [key, value] of Object.entries(formValues)) {
            formData.append(key, value);
        }

        try {
            const execResponse = await axios.post(`${baseUrl}/execute/${selectedManifestId}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            const data = execResponse?.data ?? null;

            // Helper to normalize any payload shape into a possible final result
            const extractFinal = (payload) => {
                if (payload == null) return null;
                if (typeof payload === 'object') {
                    if (Object.prototype.hasOwnProperty.call(payload, 'result')) return payload.result;
                    if (Object.prototype.hasOwnProperty.call(payload, 'request_id')) {
                        return Object.prototype.hasOwnProperty.call(payload, 'result') ? payload.result : null;
                    }
                }
                return payload;
            };

            let overall = null;

            const maybeResultUrl = (data && typeof data === 'object') ? data.resultUrl : undefined;
            if (maybeResultUrl) {
                const rr = await axios.get(maybeResultUrl);
                overall = extractFinal(rr?.data ?? null);
            } else {
                overall = extractFinal(data);
            }

            // Collect per-step intermediary results from supervisors
            const depObj = activeManifests.find(m => m._id === selectedManifestId) || selectedDeployment;
            await collectIntermediaryResults(selectedManifestId, depObj);

            // If the final result is null for some reason, use the last step’s own result
            if (overall == null && depObj?.sequence?.length) {
                console.warn('Final result is null, falling back to last step result');
                const lastIdx = depObj.sequence.length - 1;
                const last = intermediateResults[lastIdx]?.result ?? null;
                overall = last ?? null;
            }

            setExecutionResult(overall);
            setIsSubmitted(true);
            setError(null);
        } catch (error) {
            console.error("Error during execution:", error);
            setError('Execution failed. Please try again.');
            setIsSubmitted(false);
        }
    };


    useEffect(() => {
        fetchManifests(setManifests);
    }, [setManifests]);

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
            <FormControl fullWidth margin="normal">
                <InputLabel id="manifest-select-label">Select Deployment to Execute</InputLabel>
                <Select
                    labelId="manifest-select-label"
                    value={selectedManifestId}
                    onChange={handleManifestChange}
                >
                    {activeManifests.map((manifest) => (
                        <MenuItem key={manifest._id} value={manifest._id}>
                            {manifest.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Render input fields based on the parameters */}
            <div key={paramsKey}>
                {parameters.map((param) => (
                    <TextField
                        key={`${selectedManifestId}:${param.name}`}
                        name={param.name}
                        label={param.name}
                        required={!!param.required}
                        value={formValues[param.name] ?? ''}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        type={param.schema?.type === 'integer' ? 'number' : 'text'}
                    />
                ))}
            </div>

            <Button type="submit" endIcon={<SendIcon />} fullWidth variant="outlined" color="primary" sx={{ marginTop: 2 }}>
                Execute
            </Button>

            {isSubmitted && (
                <Alert severity="success" sx={{ marginTop: 2 }} onClose={() => { setIsSubmitted(false); }}>
                    Successfully executed manifest "{activeManifests.find(m => m._id === selectedManifestId)?.name}"!
                    <StepsView
                        selectedDeployment={activeManifests.find(m => m._id === selectedManifestId) || selectedDeployment}
                        intermediateResults={intermediateResults}
                    />
                    <Box sx={{ mt: 2 }}>
                        <strong>Final result:</strong>
                        <pre style={{ margin: 0 }}>
                            {JSON.stringify(executionResult, null, 2)}
                        </pre>
                    </Box>
                </Alert>
            )}

            {error && <Alert severity="error" sx={{ marginTop: 2 }} onClose={() => { setError(null); }}>{error}</Alert>}
        </Box>
    );
}

export default Execution;
