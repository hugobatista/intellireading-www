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
 */
async function initialize(cdnUrl) {
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
