import gradio as gr
import requests

custom_css = """
#map-container {
    position: relative;
    width: 500px;
    height: 500px;
    border: 1px solid #000;
}
#map {
    width: 100%;
    height: 100%;
    display: block;
}
.iconi {
    position: absolute;
    width: 32px;
    height: 32px;
    background-color: red;
    border-radius: 50%;
    cursor: move;
}
"""

custom_html = """
<div id="map-container">
    <img id="map" src="https://drive.google.com/uc?id=1VHmdl8Pn_a3_U7g0mFQw4120LdehNjMs" alt="Map">
    <!-- Icons will be added here dynamically -->
</div>
"""

custom_js = """
function wrap() {
    let mapContainer = document.getElementById('map-container');
    let map = document.getElementById('map');
    let testbutton1 = document.getElementById("testbutton1");

    function makeDraggable(element) {
        let offsetX, offsetY;
        element.onmousedown = function(e) {
            e.preventDefault();
            offsetX = e.clientX - element.offsetLeft;
            offsetY = e.clientY - element.offsetTop;
            document.onmousemove = function(e) {
                let x = e.clientX - offsetX;
                let y = e.clientY - offsetY;

                // Restrict within the map
                if (x >= 0 && x <= mapContainer.offsetWidth - element.offsetWidth) {
                    element.style.left = x + 'px';
                }
                if (y >= 0 && y <= mapContainer.offsetHeight - element.offsetHeight) {
                    element.style.top = y + 'px';
                }
            };
            document.onmouseup = function() {
                document.onmousemove = null;
                document.onmouseup = null;
            };
        };
    }

    function addIcon() {
        let icon = document.createElement('div');
        icon.className = 'iconi';
        icon.style.left = '100px';
        icon.style.top = '100px';
        mapContainer.appendChild(icon);
        makeDraggable(icon);
    }

    function disableButton() {
        if (testbutton1.disabled) {
            testbutton1.disabled = false;
        } else {
            testbutton1.disabled = true;
        }
    }

    // Expose the function to Python/Gradio
    window.addIcon = addIcon;
    window.disableButton = disableButton;
}
"""

def get_modules():
    # TODO: Address should be specified by user in the settings (the base part of the address anyway)
    url = "http://wasmiot-orchestrator:3000/file/module"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        return f"Error: {str(e)}"
    

def get_manifests():
    # TODO: Address should be specified by user in the settings (the base part of the address anyway)
    url = "http://wasmiot-orchestrator:3000/file/manifest"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        return f"Error: {str(e)}"
    

def upload_map_image(file):
    # TODO: copy the file to a more permanent place, not gradio temp directory etc?
    file_path = file.name
    print(f"Image gile path: {file_path}")
    return file_path


def upload_module(file):
    # TODO: upload the module to orchestrator (also is it necessary to delete it from gradio temp folder)
    file_path = file.name
    print(f"Module file path: {file_path}")
    return [gr.File(file_path, visible=True), gr.Button(visible=True), gr.Button(visible=False)]


def save_settings():
    return gr.Accordion(open=False)


with gr.Blocks() as dashboard:
    with gr.Row():
        # Orchestrator connection and settings
        with gr.Accordion("Orchestrator settings:", open=False) as settings_accordion:
            with gr.Row():
                orchestrator_address = gr.Textbox(label="Orchestrator address:")
            with gr.Row():
                uploaded_img = gr.Image(
                    height=400,
                    type="filepath",
                    sources=["upload"],
                    label="Upload image to be used as a map (optional)",
                )
                uploaded_img.input(upload_map_image, inputs=[uploaded_img], outputs=[uploaded_img])
            with gr.Row():
                save_settings_button = gr.Button("Save settings")
                save_settings_button.click(save_settings, inputs=[], outputs=settings_accordion)
    with gr.Row():
        # Buttons for general management
        with gr.Column(scale=1, min_width=100):
            with gr.Group():
                gr.Markdown("#### Deployment and execution")
                gr.Dropdown(choices=["manifestA", "manifestB"], label="Select manifest to deploy")
                gr.Button("Deploy")
                gr.Markdown("Deployment result: None")
                gr.Button("Execute")
                gr.Markdown("Execution result: None")
            gr.Markdown("---")
            with gr.Group():
                gr.Markdown("#### Management:")
                remove_devices_button = gr.Button("Remove all devices")
                remove_manifests_button = gr.Button("Remove all manifests")
                remove_modules_button = gr.Button("Remove all modules")
                reset_discovery_button = gr.Button("Reset device discovery")
        # Map of the physical locations for the orchestrator and supervisors
        with gr.Column(scale=5, min_width=300):
            gr.HTML(custom_html)  


with gr.Blocks() as modules:
    with gr.Row():
        with gr.Column():
            gr.Markdown("#### Existing modules:")
            with gr.Group():
                modules_json = get_modules()
                for module in modules_json:
                    module_name = module["name"]
                    with gr.Accordion(module_name, open=False):
                        gr.Markdown("Details ...")
                        gr.Button(f"Delete {module_name}", size="sm")
        with gr.Column():
            gr.Markdown("#### Add new module:")
            module_name = gr.Textbox(label="Name of the new module:")
            file_output = gr.File(visible=False)
            upload_button = gr.UploadButton("Click to upload a module", file_types=["file"], file_count="single", variant="secondary")
            save_button = gr.Button("Save", visible=False)
            upload_button.upload(upload_module, upload_button, [file_output, save_button, upload_button])


with gr.Blocks() as manifests:
    with gr.Row():
        with gr.Column():
            gr.Markdown("#### Existing manifests:")
            with gr.Group():
                manifests_json = get_manifests()
                for manifest in manifests_json:
                    manifest_name = manifest["name"]
                    with gr.Accordion(manifest_name, open=False):
                        gr.Markdown("Details ...")
                        gr.Button(f"Delete {manifest_name}", size="sm")
                        gr.Button(f"Save changes to {manifest_name}", size="sm")
        with gr.Column():
            gr.Markdown("#### Create new manifest:")
            manifest_name = gr.Textbox(label="Name of the new manifest:")
            with gr.Row():
                with gr.Column(scale=1, min_width=100):
                    gr.Dropdown(choices=["deviceA", "deviceB"], label="1. Choose device")
                with gr.Column(scale=1, min_width=100):
                    gr.Dropdown(choices=["moduleA", "moduleB"], label="2. Choose module")
                with gr.Column(scale=1, min_width=100):
                    gr.Dropdown(choices=["functionA", "functionB"], label="3. Choose function")
            gr.Button("Add procedure to call-sequence")
            gr.Markdown("Current call-sequence:")
            with gr.Group():
                with gr.Row():
                    with gr.Column(scale=15, min_width=200):
                        gr.Markdown("Use deviceA for moduleA:functionB")
                    with gr.Column(scale=1, min_width=25):
                        gr.Button("⬆️", variant="huggingface")
                    with gr.Column(scale=1, min_width=25):
                        gr.Button("⬇️", variant="huggingface")
                    with gr.Column(scale=1, min_width=25):
                        gr.Button("❌", variant="huggingface")
                with gr.Row():
                    with gr.Column(scale=15, min_width=200):
                        gr.Markdown("Use any device for moduleA:functionA")
                    with gr.Column(scale=1, min_width=25):
                        gr.Button("⬆️", variant="huggingface")
                    with gr.Column(scale=1, min_width=25):
                        gr.Button("⬇️", variant="huggingface")
                    with gr.Column(scale=1, min_width=25):
                        gr.Button("❌", variant="huggingface")
            save_manifest_button = gr.Button("Save")



# Actual theme: shivi/calm_seafoam OR zarkel/IBM_Carbon_Theme OR theme=gr.themes.Monochrome()
app = gr.TabbedInterface([dashboard, modules, manifests], ["Dashboard", "Modules", "Manifests"], css=custom_css, js=custom_js, theme="zarkel/IBM_Carbon_Theme")
app.launch()
