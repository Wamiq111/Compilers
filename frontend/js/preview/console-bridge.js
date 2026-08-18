export const consoleBridgeScript = `
(function() {
    const originalConsole = {
        log: console.log,
        info: console.info,
        warn: console.warn,
        error: console.error,
        debug: console.debug
    };

    function sendToParent(type, args) {
        try {
            const formattedArgs = Array.from(args).map(arg => {
                if (typeof arg === 'undefined') return 'undefined';
                if (arg === null) return 'null';
                if (arg instanceof Error) return arg.toString();
                if (typeof arg === 'object') {
                    try {
                        return JSON.stringify(arg, (key, value) => {
                            if (typeof value === 'function') return '[Function]';
                            if (value instanceof HTMLElement) return \`<\${value.tagName.toLowerCase()}>\`;
                            return value;
                        }, 2);
                    } catch (e) {
                        return '[Object]';
                    }
                }
                return String(arg);
            });

            window.parent.postMessage({
                source: 'compiler-playground',
                type: 'console',
                level: type,
                payload: formattedArgs.join(' ')
            }, '*');
        } catch (e) {
            originalConsole.error('Failed to parse console output:', e);
        }
    }

    ['log', 'info', 'warn', 'error', 'debug'].forEach(method => {
        console[method] = function(...args) {
            originalConsole[method].apply(console, args);
            sendToParent(method, args);
        };
    });

    window.onerror = function(message, source, lineno, colno, error) {
        window.parent.postMessage({
            source: 'compiler-playground',
            type: 'error',
            level: 'error',
            payload: \`\${message} (line \${lineno}:\${colno})\`
        }, '*');
        return false;
    };
    
    window.onunhandledrejection = function(event) {
        window.parent.postMessage({
            source: 'compiler-playground',
            type: 'error',
            level: 'error',
            payload: \`Unhandled Promise Rejection: \${event.reason}\`
        }, '*');
    };
})();
`;
