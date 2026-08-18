# Online HTML, CSS, and JS Compiler

A production-grade online HTML, CSS and JavaScript compiler/playground built with pure HTML, CSS, and Vanilla JavaScript using the Monaco Editor.

## Features
- **Monaco Editor Integration:** Full syntax highlighting, intellisense, code formatting, and folding.
- **Three Languages:** Write HTML, CSS, and JavaScript with tabs.
- **Live Preview Sandbox:** The compiler runs purely client-side inside a strictly sandboxed `iframe` null-origin environment.
- **Developer Console:** Intercepts `console.log`, `info`, `warn`, `error` and uncaught exceptions with formatting.
- **Productivity Tools:** Code formatting, clipboard copy, source download.
- **100% Stateless & Browser Only:** No backend or database required.
- **Responsive & Themable:** Resizable flexpanes, light/dark modes, and mobile-friendly layouts.

## Architecture
- **Frontend shell:** `index.html`, vanilla layout variables.
- **Editor Manager:** Lazily loads Monaco AMD scripts from CDN and manages three active document models locally.
- **Preview Manager:** Collects sources, assembles a unified HTML string injecting the CSS and JavaScript (along with a postMessage console bridge), and injects it into a sandboxed `iframe` via `srcdoc`.

## Security Model
1. **Isolated Sandbox:** The iframe does **not** have the `allow-same-origin` token. This enforces an opaque null origin, entirely isolating it from the main application's localStorage, cookies, and DOM context.
2. **postMessage Bridge:** Interlayer communication (like capturing console errors) happens solely via `postMessage`.
3. **Strict Evaluation:** User JavaScript is evaluated only inside the isolated execution context, preventing it from compromising the parent window.

## Deployment Strategy
This project is statically deployable. You can host it on:
- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages
- Standard VPS endpoints using NGINX/Apache

### Recommended Security Headers for hosting (e.g. NGINX)
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; frame-src 'self' data: blob:;" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

## Running Locally
Just open `index.html` in an HTTP Server environment or run `npx serve .` inside the `frontend` directory. Note: Using an HTTP server is recommended instead of directly opening the file `file://` to ensure Monaco Web Workers and `import` rules function consistently.

## Future Plans (C++)
The architecture separates Language Editor Text Models and `PreviewManager`. Future plans incorporating C++ will intercept the Run command, transmit the C++ text model to a backend Sandbox Docker Worker, compile it, and return stdin/stdout outputs back via websockets to the `ConsoleUI`.
