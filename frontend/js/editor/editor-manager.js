import { loadMonaco } from './monaco-loader.js';
import { defaultSettings } from './editor-settings.js';

export class EditorManager {
    constructor(containerId, vfs) {
        this.container = document.getElementById(containerId);
        this.vfs = vfs;
        this.monaco = null;
        this.editor = null;
        this.models = {};
        this.currentLang = 'html';
        this.currentFilePath = null;
    }

    async init() {
        try {
            this.monaco = await loadMonaco();
            const isDark = document.body.classList.contains('theme-dark');

            this.editor = this.monaco.editor.create(this.container, {
                ...defaultSettings,
                theme: isDark ? 'vs-dark' : 'vs'
            });

            this.vfs.onChange((root, activeFile) => {
                if (activeFile && activeFile !== this.currentFilePath) {
                    this.openFile(activeFile);
                }
            });

            this.editor.onDidChangeModelContent(() => {
                if (this.currentFilePath) {
                    this.vfs.setFileContent(this.currentFilePath, this.editor.getValue());
                }
            });

            const loader = this.container.querySelector('.editor-loader');
            if (loader) loader.style.display = 'none';

            const resizeObserver = new ResizeObserver(() => {
                if (this.editor) this.editor.layout();
            });
            resizeObserver.observe(this.container);

            window.addEventListener('resize', () => {
                if (this.editor) this.editor.layout();
            });

        } catch (e) {
            console.error(e);
        }
    }

    openFile(path) {
        if (!this.monaco || !this.editor) return;
        this.currentFilePath = path;
        let content = this.vfs.getFileContent(path);
        if (content === null) return;

        let lang = 'plaintext';
        if (path.endsWith('.html')) lang = 'html';
        else if (path.endsWith('.css')) lang = 'css';
        else if (path.endsWith('.js')) lang = 'javascript';

        if (!this.models[path]) {
            this.models[path] = this.monaco.editor.createModel(content, lang);
        } else {
            if (this.models[path].getValue() !== content) {
                this.models[path].setValue(content);
            }
        }

        this.currentLang = lang;
        this.editor.setModel(this.models[path]);
    }

    getSources() {
        return {
            html: this.vfs.getFileContent('index.html') || '',
            css: this.vfs.getAllFilesExt('.css'),
            javascript: this.vfs.getAllFilesExt('.js')
        };
    }

    setTheme(isDark) {
        if (!this.monaco) return;
        this.monaco.editor.setTheme(isDark ? 'vs-dark' : 'vs');
    }

    format() {
        if (this.editor) {
            this.editor.getAction('editor.action.formatDocument').run();
        }
    }

    clear() {
        if (this.currentFilePath && this.models[this.currentFilePath]) {
            this.models[this.currentFilePath].setValue('');
        }
    }
}
