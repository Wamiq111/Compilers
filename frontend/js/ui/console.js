export class ConsoleUI {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    log(data) {
        if (data.type === 'clear') {
            this.clear();
            return;
        }

        const el = document.createElement('div');
        el.className = `log-entry log-${data.level || 'error'}`;

        const timestamp = new Date().toLocaleTimeString();

        // Using textContent to prevent parent DOM XSS injection from untrusted formatting
        const timeSpan = document.createElement('span');
        timeSpan.className = 'log-time';
        timeSpan.textContent = `[${timestamp}] `;

        const typeSpan = document.createElement('span');
        typeSpan.className = 'log-type';
        typeSpan.textContent = `[${(data.level || data.type).toUpperCase()}] `;

        const payloadSpan = document.createElement('span');
        payloadSpan.className = 'log-payload';
        payloadSpan.textContent = data.payload;

        el.appendChild(timeSpan);
        el.appendChild(typeSpan);
        el.appendChild(payloadSpan);

        this.container.appendChild(el);
        this.container.scrollTop = this.container.scrollHeight;
    }

    clear() {
        this.container.innerHTML = '';
    }
}
