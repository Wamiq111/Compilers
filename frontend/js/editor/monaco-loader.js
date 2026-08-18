export function loadMonaco() {
    return new Promise((resolve, reject) => {
        if (window.monaco) {
            resolve(window.monaco);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/loader.min.js';
        script.onload = () => {
            window.require.config({
                paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' }
            });
            window.require(['vs/editor/editor.main'], () => {
                resolve(window.monaco);
            });
        };
        script.onerror = () => reject(new Error("Failed to load Monaco Editor loader."));
        document.head.appendChild(script);
    });
}
