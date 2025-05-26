## About 
User interface for the orchestrator. Works for both the original javascript version (https://github.com/LiquidAI-project/wasmiot-orchestrator) and the rust port (https://github.com/LiquidAI-project/orchestrator-rust-port). Requires the orchestrator to be running for this to be functional. 

When should you use this repository?
- You are using the original javascript version of the orchestrator
- You want to keep the orchestrator on a separate device from where the user interface (this) is running

When should you not?
- You are using the rust version of the orchestrator, and want to have the user interface on the same device as that.
- You are using the test enviroment repository.

## Configuration

Change the values in .env file to reflect your setup. Change the `REACT_APP_API_URL` to whereever your orchestrator is running, for example "http://localhost:3000". If you are running this with node alone (check later sections), modify the value of "proxy" in package.json (in frontend folder) to point to orchestrator url, just like in the .env file.

## Run in docker:

Easiest way to run this is in docker. First make sure you have a functioning docker installation (as well as docker compose). Then run one of the starting scripts depending on which orchestrator you are using. If you are using the original javascript version of the orchestrator, run `./start-docker-js.sh`. If you are using the rust version, run `./start-docker-rs.sh`.

## Run without docker

To run without docker, you must have node and optionally cargo installed on your device, or you must compile the project on another device and copy the necessary files to target device.

Here it is important to note that some of below options work with only with the rust version of orchestrator, and some work only with the javascript version.

### Option 1: cargo and node

If you have both, run the `start-rs.sh` script, and that will start the rust version of the server. This options works only with the rust version of the orchestrator.

### Option 2: node
If you have only node, or want to run this only with node, you have two options. 

First option is that you can run this on a react development server. You can do that by running `./start-npm-dev.sh`. This option is compatible with both javascript version and rust version of the orchestrator.

Second option is that you can run this on npm serve server. This can be done by running `sudo ./start-npm-serve.sh`. This option is only compatible with the rust version of the orchestrator.

### Option 3: none of the above
If you want to run this on a device that has neither cargo or node, you must first compile the whole project at least once. Clone the repository to some other device where you have both cargo and node, and the run both `./build-npm.sh` and `build-rust.sh` script once. After that, copy the compiled frontend-server binary (should be in frontend-server/target/release folder) and the built react files to the target device so that the resulting folder structure is as described below (with the root-folder being whatever you decide):

Expected folder structure:
```
root-folder/
├── frontend/
│   └── build/
│       └── ...
├── frontend-server
└── .env   
```