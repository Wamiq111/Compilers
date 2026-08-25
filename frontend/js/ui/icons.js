// VS Code-style SVG icons as inline strings
export const Icons = {
    file: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M9 1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5L9 1zm0 1.5L12.5 6H9V2.5zM4 2h4.5v4.5h4V14H4V2z"/>
    </svg>`,

    fileHtml: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="#e34c26">
        <path d="M9 1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5L9 1zm0 1.5L12.5 6H9V2.5zM4 2h4.5v4.5h4V14H4V2z"/>
        <text x="3" y="14" font-size="5" fill="#e34c26" font-family="monospace" font-weight="bold">HT</text>
    </svg>`,

    fileCss: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="#264de4">
        <path d="M9 1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5L9 1zm0 1.5L12.5 6H9V2.5zM4 2h4.5v4.5h4V14H4V2z"/>
    </svg>`,

    fileJs: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="#f7df1e">
        <path d="M9 1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5L9 1zm0 1.5L12.5 6H9V2.5zM4 2h4.5v4.5h4V14H4V2z"/>
    </svg>`,

    folderClosed: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M1.5 3A1.5 1.5 0 0 1 3 1.5h3.879a1.5 1.5 0 0 1 1.06.44l1.122 1.12H13a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 13 13H3a1.5 1.5 0 0 1-1.5-1.5V3zm1.5 0v9a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.5-.5H9a.5.5 0 0 1-.354-.146L7.525 3.232A.5.5 0 0 0 7.171 3H3a.5.5 0 0 0-.5.5z"/>
    </svg>`,

    folderOpen: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M1.5 3A1.5 1.5 0 0 1 3 1.5h3.879a1.5 1.5 0 0 1 1.06.44l1.122 1.12H13a1.5 1.5 0 0 1 1.5 1.5v.5H1.5V3zM1 7v5.5A1.5 1.5 0 0 0 2.5 14h11a1.5 1.5 0 0 0 1.5-1.5V7H1z"/>
    </svg>`,

    chevronRight: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
        <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
    </svg>`,

    chevronDown: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
        <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
    </svg>`,

    newFile: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="12" y1="18" x2="12" y2="12"/>
        <line x1="9" y1="15" x2="15" y2="15"/>
    </svg>`,

    newFolder: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        <line x1="12" y1="11" x2="12" y2="17"/>
        <line x1="9" y1="14" x2="15" y2="14"/>
    </svg>`
};

export function getFileIcon(name) {
    if (name.endsWith('.html')) return Icons.fileHtml;
    if (name.endsWith('.css')) return Icons.fileCss;
    if (name.endsWith('.js')) return Icons.fileJs;
    if (name.endsWith('.py')) return Icons.file; // Fallback to standard file icon, but we can customize later if we add a python SVG
    return Icons.file;
}
