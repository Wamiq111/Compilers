import { Icons, getFileIcon } from './icons.js';

export class SidebarUI {
    constructor(vfs) {
        this.vfs = vfs;
        this.treeContainer = document.getElementById('file-tree');
        this.searchResults = document.getElementById('search-results');
        this.searchInput = document.getElementById('file-search-input');

        this.openFolders = new Set(['project']);
        this.pendingCreate = null;

        // Context menu
        this._ctxMenu = null;
        this._ctxPath = null;
        this._ctxType = null;

        this.initActivityBar();
        this.initFileActions();
        this.initContextMenuDismiss();

        this.vfs.onChange((root, activeFile) => {
            this.renderTree(root, activeFile);
        });

        this.searchInput.addEventListener('input', (e) => {
            this.renderSearch(e.target.value);
        });
    }

    initActivityBar() {
        const expl = document.getElementById('act-explorer');
        const srch = document.getElementById('act-search');
        if (!expl || !srch) return;

        expl.addEventListener('click', () => {
            this.switchView('explorer');
            document.querySelectorAll('.activity-action').forEach(b => b.classList.remove('active'));
            expl.classList.add('active');
            // Force re-render the tree when switching to Explorer
            this.renderTree(this.vfs.root, this.vfs.activeFile);
        });
        srch.addEventListener('click', () => {
            this.switchView('search');
            document.querySelectorAll('.activity-action').forEach(b => b.classList.remove('active'));
            srch.classList.add('active');
        });
    }

    switchView(view) {
        document.getElementById('view-explorer').classList.add('hidden');
        document.getElementById('view-search').classList.add('hidden');
        document.getElementById('view-' + view).classList.remove('hidden');
    }

    initFileActions() {
        document.getElementById('btn-new-file').innerHTML = Icons.newFile;
        document.getElementById('btn-new-folder').innerHTML = Icons.newFolder;

        document.getElementById('btn-new-file').addEventListener('click', () => {
            this.startInlineCreate('file', null);
        });
        document.getElementById('btn-new-folder').addEventListener('click', () => {
            this.startInlineCreate('folder', null);
        });
    }

    initContextMenuDismiss() {
        document.addEventListener('click', () => this.closeContextMenu());
        document.addEventListener('contextmenu', () => this.closeContextMenu());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeContextMenu();
        });
    }

    showContextMenu(x, y, path, nodeType) {
        this.closeContextMenu();

        this._ctxPath = path;
        this._ctxType = nodeType;

        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.left = `${Math.min(x, window.innerWidth - 180)}px`;
        menu.style.top = `${Math.min(y, window.innerHeight - 100)}px`;

        const renameItem = document.createElement('div');
        renameItem.className = 'context-menu-item';
        renameItem.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Rename`;
        renameItem.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeContextMenu();
            this.startInlineRename(path);
        });

        const separator = document.createElement('div');
        separator.className = 'context-menu-separator';

        const deleteItem = document.createElement('div');
        deleteItem.className = 'context-menu-item danger';
        deleteItem.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg> Delete`;
        deleteItem.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeContextMenu();
            const name = path.split('/').pop();
            if (confirm(`Delete "${name}"? This cannot be undone.`)) {
                this.vfs.deleteNode(path);
            }
        });

        menu.appendChild(renameItem);
        menu.appendChild(separator);
        menu.appendChild(deleteItem);

        document.body.appendChild(menu);
        this._ctxMenu = menu;
    }

    closeContextMenu() {
        if (this._ctxMenu) {
            this._ctxMenu.remove();
            this._ctxMenu = null;
        }
    }

    startInlineRename(path) {
        // We'll re-render the tree with a rename input at the target node
        this._renamingPath = path;
        this.renderTree(this.vfs.root, this.vfs.activeFile);
    }

    startInlineCreate(type, parentPath) {
        this.pendingCreate = { type, parentPath };
        this.renderTree(this.vfs.root, this.vfs.activeFile);
    }

    renderTree(root, activeFile) {
        this.treeContainer.innerHTML = '';

        if (this.pendingCreate && !this.pendingCreate.parentPath) {
            this.treeContainer.appendChild(this.createInlineInput(this.pendingCreate.type, ''));
        }

        this.buildTreeDOM(root, this.treeContainer, activeFile, '', 0);
    }

    buildTreeDOM(node, container, activeFile, path, depth) {
        if (node.name === 'project') {
            for (let key in node.children) {
                this.buildTreeDOM(node.children[key], container, activeFile, key, 0);
            }
            return;
        }

        // Check if this node is being renamed
        if (this._renamingPath === path) {
            const input = this.createRenameInput(path, node.name, node.type, depth);
            container.appendChild(input);
            if (node.type === 'folder' && this.openFolders.has(path)) {
                for (let key in node.children) {
                    const childPath = path ? path + '/' + key : key;
                    this.buildTreeDOM(node.children[key], container, activeFile, childPath, depth + 1);
                }
            }
            return;
        }

        const el = document.createElement('div');
        el.className = 'tree-item' + (path === activeFile ? ' active' : '');
        el.style.paddingLeft = `${8 + depth * 14}px`;

        // Prevent default browser context menu on these items
        el.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.showContextMenu(e.clientX, e.clientY, path, node.type);
        });

        if (node.type === 'folder') {
            const isOpen = this.openFolders.has(path);

            const chevron = document.createElement('span');
            chevron.className = 'tree-chevron';
            chevron.innerHTML = isOpen ? Icons.chevronDown : Icons.chevronRight;

            const icon = document.createElement('span');
            icon.className = 'tree-icon folder-icon';
            icon.innerHTML = isOpen ? Icons.folderOpen : Icons.folderClosed;
            icon.style.color = '#dcb67a';

            const title = document.createElement('span');
            title.className = 'tree-label';
            title.textContent = node.name;

            el.appendChild(chevron);
            el.appendChild(icon);
            el.appendChild(title);
            container.appendChild(el);

            el.addEventListener('click', () => {
                if (isOpen) this.openFolders.delete(path);
                else this.openFolders.add(path);
                this.renderTree(this.vfs.root, this.vfs.activeFile);
            });

            if (isOpen) {
                for (let key in node.children) {
                    const childPath = path ? path + '/' + key : key;
                    this.buildTreeDOM(node.children[key], container, activeFile, childPath, depth + 1);
                }

                if (this.pendingCreate && this.pendingCreate.parentPath === path) {
                    const inputEl = this.createInlineInput(this.pendingCreate.type, path);
                    inputEl.style.paddingLeft = `${8 + (depth + 1) * 14}px`;
                    container.appendChild(inputEl);
                }
            }
        } else {
            const spacer = document.createElement('span');
            spacer.style.width = '12px';
            spacer.style.display = 'inline-block';

            const icon = document.createElement('span');
            icon.className = 'tree-icon file-icon';
            icon.innerHTML = getFileIcon(node.name);

            const title = document.createElement('span');
            title.className = 'tree-label';
            title.textContent = node.name;

            el.appendChild(spacer);
            el.appendChild(icon);
            el.appendChild(title);
            container.appendChild(el);

            el.addEventListener('click', () => {
                this.vfs.setActiveFile(path);
            });
        }
    }

    createRenameInput(path, currentName, nodeType, depth) {
        const wrapper = document.createElement('div');
        wrapper.className = 'tree-item tree-inline-create';
        wrapper.style.paddingLeft = `${8 + depth * 14}px`;

        const icon = document.createElement('span');
        icon.className = 'tree-icon';
        icon.innerHTML = nodeType === 'folder' ? Icons.folderClosed : getFileIcon(currentName);
        if (nodeType === 'folder') icon.style.color = '#dcb67a';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'tree-inline-input';
        input.value = currentName;
        input.setAttribute('aria-label', 'Rename');

        wrapper.appendChild(icon);
        wrapper.appendChild(input);

        const commit = () => {
            const newName = input.value.trim();
            if (newName && newName !== currentName) {
                this.vfs.renameNode(path, newName);
            }
            this._renamingPath = null;
            this.renderTree(this.vfs.root, this.vfs.activeFile);
        };

        const cancel = () => {
            this._renamingPath = null;
            this.renderTree(this.vfs.root, this.vfs.activeFile);
        };

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') cancel();
        });

        input.addEventListener('blur', () => setTimeout(() => cancel(), 100));

        requestAnimationFrame(() => {
            input.focus();
            // Select the name without extension for convenience
            const dotIndex = currentName.lastIndexOf('.');
            input.setSelectionRange(0, dotIndex > 0 ? dotIndex : currentName.length);
        });

        return wrapper;
    }

    createInlineInput(type, parentPath) {
        const wrapper = document.createElement('div');
        wrapper.className = 'tree-item tree-inline-create';

        const icon = document.createElement('span');
        icon.className = 'tree-icon';
        icon.innerHTML = type === 'file' ? Icons.file : Icons.folderClosed;
        if (type === 'folder') icon.style.color = '#dcb67a';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'tree-inline-input';
        input.placeholder = type === 'file' ? 'filename.ext' : 'folder name';
        input.setAttribute('aria-label', type === 'file' ? 'New file name' : 'New folder name');

        wrapper.appendChild(icon);
        wrapper.appendChild(input);

        const commit = () => {
            const name = input.value.trim();
            if (name) {
                const fullPath = parentPath ? `${parentPath}/${name}` : name;
                if (type === 'file') {
                    this.vfs.addFile(fullPath, '');
                } else {
                    this.vfs.addFolder(fullPath);
                }
            }
            this.pendingCreate = null;
            this.renderTree(this.vfs.root, this.vfs.activeFile);
        };

        const cancel = () => {
            this.pendingCreate = null;
            this.renderTree(this.vfs.root, this.vfs.activeFile);
        };

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') cancel();
        });

        input.addEventListener('blur', () => setTimeout(() => cancel(), 100));
        requestAnimationFrame(() => input.focus());

        return wrapper;
    }

    renderSearch(query) {
        this.searchResults.innerHTML = '';
        if (!query) return;
        const results = this.vfs.searchFiles(query);
        results.forEach(res => {
            const el = document.createElement('div');
            el.className = 'tree-item';
            const icon = document.createElement('span');
            icon.className = 'tree-icon file-icon';
            icon.innerHTML = getFileIcon(res.split('/').pop());
            const label = document.createElement('span');
            label.className = 'tree-label';
            label.textContent = res;
            el.appendChild(icon);
            el.appendChild(label);
            el.addEventListener('click', () => {
                this.vfs.setActiveFile(res);
                this.switchView('explorer');
                document.getElementById('act-explorer').classList.add('active');
                document.getElementById('act-search').classList.remove('active');
            });
            this.searchResults.appendChild(el);
        });
        if (!results.length) {
            const empty = document.createElement('div');
            empty.className = 'tree-empty';
            empty.textContent = 'No results found.';
            this.searchResults.appendChild(empty);
        }
    }
}
