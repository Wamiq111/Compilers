import { VirtualFileSystem } from './editor/file-system.js';
import { SidebarUI } from './ui/sidebar.js';
import { EditorManager } from './editor/editor-manager.js';
import { PreviewManager } from './preview/preview-manager.js';
import { ConsoleUI } from './ui/console.js';
import { downloadSources } from './features/download.js';
import { copyToClipboard } from './features/clipboard.js';

console.log('Compiler IDE initialized.');

document.addEventListener('DOMContentLoaded', async () => {

    const vfs = new VirtualFileSystem();
    const sidebarUI = new SidebarUI(vfs);
    const consoleUI = new ConsoleUI('console-output');

    const previewManager = new PreviewManager('preview-container', (msg) => {
        consoleUI.log(msg);
    });

    const editorManager = new EditorManager('monaco-container', vfs);
    await editorManager.init();

    const runBtn = document.getElementById('btn-run');
    const stopBtn = document.getElementById('btn-stop');
    const clearConsoleBtn = document.getElementById('btn-clear-console');

    function runCode() {
        const sources = editorManager.getSources();
        consoleUI.clear();
        previewManager.buildPreview(sources.html, sources.css, sources.javascript);
        stopBtn.disabled = false;
    }

    runBtn.addEventListener('click', runCode);

    stopBtn.addEventListener('click', () => {
        previewManager.stop();
        stopBtn.disabled = true;
    });

    clearConsoleBtn.addEventListener('click', () => {
        consoleUI.clear();
    });

    const themeSwitch = document.getElementById('theme-switch');
    themeSwitch.addEventListener('change', (e) => {
        const isDark = e.target.checked;
        if (isDark) {
            document.body.classList.remove('theme-light');
            document.body.classList.add('theme-dark');
        } else {
            document.body.classList.remove('theme-dark');
            document.body.classList.add('theme-light');
        }
        editorManager.setTheme(isDark);
    });

    document.getElementById('btn-format').addEventListener('click', () => {
        editorManager.format();
    });

    document.getElementById('btn-clear').addEventListener('click', () => {
        if (confirm("Are you sure you want to clear the active editor?")) {
            editorManager.clear();
        }
    });

    document.getElementById('btn-copy').addEventListener('click', async (e) => {
        const src = editorManager.editor ? editorManager.editor.getValue() : '';
        const success = await copyToClipboard(src);
        if (success) {
            const btn = e.target;
            const original = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(() => { btn.textContent = original; }, 2000);
        }
    });

    document.getElementById('btn-download').addEventListener('click', () => {
        const sources = editorManager.getSources();
        downloadSources(sources);
    });

    document.getElementById('btn-refresh-preview').addEventListener('click', runCode);

    let debounceTimer;
    window.addEventListener('keyup', () => {
        const liveToggle = document.getElementById('live-preview-toggle');
        if (liveToggle && liveToggle.checked) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                runCode();
            }, 1000);
        }
    });

    initResizers();

    // Trigger initial renders
    vfs.notify();
    editorManager.openFile('index.html');
    runCode();

    window.appState = { vfs, editorManager, previewManager, consoleUI, sidebarUI };
});

function initResizers() {
    const resizerMain = document.getElementById('resizer-main');
    const editorPane = document.getElementById('editor-pane');
    let isResizingH = false;

    if (resizerMain) {
        resizerMain.addEventListener('mousedown', () => {
            isResizingH = true;
            document.body.style.cursor = 'col-resize';
        });
    }

    const resizerSidebar = document.getElementById('resizer-sidebar');
    const sidebarPane = document.getElementById('sidebar-pane');
    let isResizingSidebar = false;

    if (resizerSidebar) {
        resizerSidebar.addEventListener('mousedown', () => {
            isResizingSidebar = true;
            document.body.style.cursor = 'col-resize';
        });
    }

    const resizerConsole = document.getElementById('resizer-console');
    const previewContainer = document.getElementById('preview-container');
    let isResizingV = false;

    if (resizerConsole) {
        resizerConsole.addEventListener('mousedown', () => {
            isResizingV = true;
            document.body.style.cursor = 'row-resize';
        });
    }

    document.addEventListener('mousemove', (e) => {
        if (!isResizingH && !isResizingV && !isResizingSidebar) return;

        if (isResizingH && editorPane) {
            const widthPct = (e.clientX / window.innerWidth) * 100;
            if (widthPct > 10 && widthPct < 85) {
                editorPane.style.flex = `0 0 ${widthPct}%`;
            }
        }

        if (isResizingSidebar && sidebarPane) {
            if (e.clientX > 50 && e.clientX < 500) {
                sidebarPane.style.flex = `0 0 ${e.clientX}px`;
            }
        }

        if (isResizingV && previewContainer) {
            const container = document.getElementById('right-pane').getBoundingClientRect();
            const yPos = e.clientY - container.top;
            const heightPct = (yPos / container.height) * 100;
            if (heightPct > 10 && heightPct < 90) {
                previewContainer.style.flex = `0 0 ${heightPct}%`;
            }
        }
    });

    document.addEventListener('mouseup', () => {
        if (isResizingH || isResizingV || isResizingSidebar) {
            isResizingH = false;
            isResizingV = false;
            isResizingSidebar = false;
            document.body.style.cursor = 'default';
            window.dispatchEvent(new Event('resize'));
        }
    });
}
