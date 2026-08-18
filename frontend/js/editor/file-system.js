export class VirtualFileSystem {
    constructor() {
        this.listeners = [];
        this.reset('web');
    }

    reset(mode) {
        this.root = {
            name: 'project',
            type: 'folder',
            children: {}
        };

        if (mode === 'web') {
            this.addFile('index.html', '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <title>My Page</title>\n</head>\n<body>\n    <h1>Hello World</h1>\n</body>\n</html>');
            this.addFile('style.css', 'body {\n    font-family: sans-serif;\n    padding: 2rem;\n}\nh1 {\n    color: #007acc;\n}');
            this.addFile('script.js', 'console.log("Hello from JavaScript!");\nconsole.warn("This is a warning.");\nconsole.error("This is an error.");');
            this.activeFile = 'index.html';
        } else if (mode === 'python') {
            this.addFile('main.py', 'print("Hello from Python!")');
            this.activeFile = 'main.py';
        }

        if (this.listeners && this.listeners.length > 0) {
            this.notify();
        }
    }

    onChange(listener) {
        this.listeners.push(listener);
    }

    notify() {
        this.listeners.forEach(fn => fn(this.root, this.activeFile));
    }

    addFile(path, content = '') {
        const parts = path.split('/');
        let current = this.root;

        for (let i = 0; i < parts.length - 1; i++) {
            if (!current.children[parts[i]]) {
                current.children[parts[i]] = { name: parts[i], type: 'folder', children: {} };
            }
            current = current.children[parts[i]];
        }

        const fileName = parts[parts.length - 1];
        current.children[fileName] = { name: fileName, type: 'file', content: content };
        this.notify();
    }

    addFolder(path) {
        const parts = path.split('/');
        let current = this.root;
        for (let i = 0; i < parts.length; i++) {
            if (!current.children[parts[i]]) {
                current.children[parts[i]] = { name: parts[i], type: 'folder', children: {} };
            }
            current = current.children[parts[i]];
        }
        this.notify();
    }

    getFileContent(path) {
        let node = this.getNode(path);
        return node && node.type === 'file' ? node.content : null;
    }

    setFileContent(path, content) {
        let node = this.getNode(path);
        if (node && node.type === 'file') {
            node.content = content;
        }
    }

    deleteNode(path) {
        const parts = path.split('/');
        const name = parts.pop();
        const parentNode = parts.length ? this.getNode(parts.join('/')) : this.root;
        if (parentNode && parentNode.children && parentNode.children[name]) {
            delete parentNode.children[name];
            if (this.activeFile === path || this.activeFile?.startsWith(path + '/')) {
                // Switch to first available file
                this.activeFile = this._firstFile(this.root, '');
            }
            this.notify();
        }
    }

    renameNode(oldPath, newName) {
        const parts = oldPath.split('/');
        const oldName = parts.pop();
        const parentPath = parts.join('/');
        const parentNode = parts.length ? this.getNode(parentPath) : this.root;
        if (!parentNode || !parentNode.children || !parentNode.children[oldName]) return;
        const newPath = (parentPath ? parentPath + '/' : '') + newName;
        parentNode.children[newName] = parentNode.children[oldName];
        parentNode.children[newName].name = newName;
        delete parentNode.children[oldName];
        if (this.activeFile === oldPath) this.activeFile = newPath;
        this.notify();
    }

    _firstFile(node, path) {
        if (node.type === 'file') return path;
        for (let key in node.children) {
            const childPath = path ? path + '/' + key : key;
            const result = this._firstFile(node.children[key], childPath);
            if (result) return result;
        }
        return null;
    }

    getNode(path) {
        if (!path) return null;
        const parts = path.split('/');
        let current = this.root;
        for (let part of parts) {
            if (!current.children || !current.children[part]) return null;
            current = current.children[part];
        }
        return current;
    }

    setActiveFile(path) {
        this.activeFile = path;
        this.notify();
    }

    searchFiles(query) {
        if (!query) return [];
        const results = [];
        const lowerQuery = query.toLowerCase();

        function traverse(node, currentPath) {
            if (node.type === 'file') {
                if (node.name.toLowerCase().includes(lowerQuery) || node.content.toLowerCase().includes(lowerQuery)) {
                    results.push(currentPath);
                }
            } else if (node.children) {
                for (let key in node.children) {
                    traverse(node.children[key], currentPath ? currentPath + '/' + key : key);
                }
            }
        }

        traverse(this.root, '');
        return results;
    }

    getAllFilesExt(ext) {
        const files = [];
        function traverse(node, path) {
            if (node.type === 'file' && node.name.endsWith(ext)) {
                files.push(node.content);
            } else if (node.children) {
                for (let key in node.children) {
                    traverse(node.children[key], path ? path + '/' + key : key);
                }
            }
        }
        traverse(this.root, '');
        return files.join('\n');
    }
}
