/* Pyodide Web Worker
 * Loads Pyodide + intellireading-cli to process EPUB files locally in the browser.
 *
 * Message protocol (main → worker):
 *   { type: 'init', pyodideCdnUrl: string }
 *   { type: 'process', fileBytes: ArrayBuffer, fileName: string }
 *
 * Message protocol (worker → main):
 *   { type: 'status', status: 'loading'|'ready'|'processing', message?: string }
 *   { type: 'result', fileBytes: ArrayBuffer, fileName: string }
 *   { type: 'error', message: string }
 */

let pyodide = null;
let initialized = false;

/**
 * Allowlist of trusted CDN domains for Pyodide.
 * Only HTTPS URLs from these domains with /pyodide.js path are permitted.
 */
const ALLOWED_CDN_DOMAINS = [
    'cdn.jsdelivr.net',
    // Add other trusted CDN domains here as needed
];

/**
 * Validates that a CDN URL is trusted before loading.
 * Prevents phishing attacks by ensuring only approved CDNs are used.
 *
 * @param {string} url - The CDN URL to validate
 * @returns {boolean} - True if URL is allowed, false otherwise
 * @throws {Error} - Descriptive error message if validation fails
 */
function validateCdnUrl(url) {
    if (!url || typeof url !== 'string') {
        throw new Error('CDN URL must be a non-empty string');
    }

    let parsed;
    try {
        parsed = new URL(url);
    } catch (e) {
        throw new Error('CDN URL is not a valid URL: ' + url);
    }

    // Requirement 1: HTTPS only (no HTTP, no file://, no data:, etc.)
    if (parsed.protocol !== 'https:') {
        throw new Error('CDN URL must use HTTPS protocol. Got: ' + parsed.protocol);
    }

    // Requirement 2: Must end with /pyodide.js (prevent loading arbitrary files)
    if (!parsed.pathname.endsWith('/pyodide.js')) {
        throw new Error('CDN URL must end with /pyodide.js. Got: ' + parsed.pathname);
    }

    // Requirement 3: Domain must be in allowlist (prevent subdomain takeover attacks)
    const hostname = parsed.hostname;
    const isAllowed = ALLOWED_CDN_DOMAINS.some(domain => {
        // Exact match or subdomain match (e.g., cdn.jsdelivr.net OR cdn1.jsdelivr.net)
        return hostname === domain || hostname.endsWith('.' + domain);
    });

    if (!isAllowed) {
        throw new Error(
            'CDN domain not allowed. Domain: ' + hostname +
            '. Allowed domains: ' + ALLOWED_CDN_DOMAINS.join(', ')
        );
    }

    return true;
}

self.addEventListener('message', async (event) => {
    const msg = event.data;

    if (msg.type === 'init') {
        try {
            await initialize(msg.pyodideCdnUrl);
            self.postMessage({ type: 'status', status: 'ready' });
        } catch (err) {
            console.error('Intellireading Worker: Initialization failed', err);
            self.postMessage({ type: 'error', message: err.message || 'Unknown initialization error' });
        }
        return;
    }

    if (msg.type === 'process') {
        if (!initialized) {
            self.postMessage({ type: 'error', message: 'Local processor not yet loaded. Please try again.' });
            return;
        }

        try {
            self.postMessage({ type: 'status', status: 'processing', message: 'Processing EPUB locally…' });

            // Call the Python function registered during init.
            // Use pyodide.toPy() to explicitly convert the Uint8Array to Python
            // bytes before passing it — auto-conversion via PyProxy call args
            // is unreliable across Pyodide versions.
            const processFn = pyodide.globals.get('process_epub');
            const raw = processFn(pyodide.toPy(new Uint8Array(msg.fileBytes)));
            const uint8 = (raw instanceof Uint8Array) ? raw : raw.toJs();
            const buffer = uint8.buffer;

            // Clean up the PyProxy
            processFn.destroy();

            self.postMessage(
                { type: 'result', fileBytes: buffer, fileName: msg.fileName },
                [buffer]  // transfer ownership for zero-copy
            );
        } catch (err) {
            self.postMessage({ type: 'error', message: 'Processing failed: ' + err.message });
        }
    }
});

/**
 * Initialise Pyodide and install intellireading-cli.
 * Sends progress status messages back to the main thread.
 *
 * @param {string} cdnUrl - The CDN URL for Pyodide. Must pass validation.
 * @throws {Error} - If CDN URL is invalid or Pyodide fails to load
 */
async function initialize(cdnUrl) {
    // Validate CDN URL before attempting to load
    try {
        validateCdnUrl(cdnUrl);
    } catch (err) {
        throw new Error('CDN URL validation failed: ' + err.message);
    }

    const indexURL = cdnUrl.replace(/\/pyodide\.js$/, '/');

    self.postMessage({ type: 'status', status: 'loading', message: 'Loading Python WebAssembly runtime…' });

    try {
        importScripts(cdnUrl);
    } catch (err) {
        throw new Error('Failed to load Pyodide script: ' + (err.message || err));
    }

    self.postMessage({ type: 'status', status: 'loading', message: 'Starting Python…' });

    try {
        pyodide = await loadPyodide({
            indexURL: indexURL,
            stdout: () => {},
            stderr: () => {}
        });
    } catch (err) {
        throw new Error('Failed to load Pyodide: ' + (err.message || err));
    }

    self.postMessage({ type: 'status', status: 'loading', message: 'Setting up package manager…' });

    try {
        await pyodide.loadPackage(["micropip", "regex"]);
    } catch (err) {
        throw new Error('Failed to load packages: ' + (err.message || err));
    }

    self.postMessage({ type: 'status', status: 'loading', message: 'Installing intellireading-cli…' });

    try {
        const micropip = pyodide.pyimport('micropip');
        // Install the library from PyPI (micropip caches wheels in IndexedDB)
        await micropip.install('intellireading-cli');
    } catch (err) {
        throw new Error('Failed to install intellireading-cli: ' + (err.message || err));
    }

    // Register the processing functions so JS can call them directly
    try {
        pyodide.runPython(`
from io import BytesIO
from intellireading.client import metaguide_epub_stream

def process_epub(input_bytes):
    """Metaguide an EPUB given raw bytes, return output bytes."""
    input_stream = BytesIO(input_bytes)
    output_stream = metaguide_epub_stream(input_stream)
    return output_stream.getvalue()
`);
    } catch (err) {
        throw new Error('Failed to register processing functions: ' + (err.message || err));
    }

    initialized = true;
}
