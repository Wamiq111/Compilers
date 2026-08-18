import { consoleBridgeScript } from './console-bridge.js';

export class PreviewManager {
    constructor(containerId, onConsoleMessage) {
        this.container = document.getElementById(containerId);
        this.onConsoleMessage = onConsoleMessage;
        this.iframe = null;

        this.setupMessageListener();
    }

    setupMessageListener() {
        window.addEventListener('message', (event) => {
            // Security: check simple source discriminator
            if (event.data && event.data.source === 'compiler-playground') {
                if (this.onConsoleMessage) {
                    this.onConsoleMessage(event.data);
                }
            }
        });
    }

    buildPreview(html, css, js) {
        this.container.innerHTML = '';

        this.iframe = document.createElement('iframe');
        this.iframe.className = 'preview-iframe';
        // Aggressive sandbox: no allow-same-origin, so it's a null origin
        this.iframe.setAttribute('sandbox', 'allow-scripts allow-modals');
        this.container.appendChild(this.iframe);

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>${css}</style>
    <script>${consoleBridgeScript}</script>
</head>
<body>
    ${html}
    <script type="module">${js}</script>
</body>
</html>`;

        this.iframe.srcdoc = htmlContent;
    }

    stop() {
        this.container.innerHTML = '';
    }
}
