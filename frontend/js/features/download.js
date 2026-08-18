export function downloadSources(sources) {
    // Generate individual file downloads
    if (sources.html) downloadFile(sources.html, 'index.html', 'text/html');
    if (sources.css) downloadFile(sources.css, 'style.css', 'text/css');
    if (sources.javascript) downloadFile(sources.javascript, 'script.js', 'text/javascript');
}

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 100);
}
