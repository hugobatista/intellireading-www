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

let pyodide = null
let initialized = false

const ALLOWED_CDN_DOMAINS = ['cdn.jsdelivr.net']

function validateCdnUrl(url) {
  if (!url || typeof url !== 'string') {
    throw new Error('CDN URL must be a non-empty string')
  }

  let parsed
  try {
    parsed = new URL(url)
  } catch (error) {
    throw new Error(`CDN URL is not a valid URL: ${url}`)
  }

  if (parsed.protocol !== 'https:') {
    throw new Error(`CDN URL must use HTTPS protocol. Got: ${parsed.protocol}`)
  }

  if (!parsed.pathname.endsWith('/pyodide.js')) {
    throw new Error(`CDN URL must end with /pyodide.js. Got: ${parsed.pathname}`)
  }

  const hostname = parsed.hostname
  const isAllowed = ALLOWED_CDN_DOMAINS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))

  if (!isAllowed) {
    throw new Error(
      `CDN domain not allowed. Domain: ${hostname}. Allowed domains: ${ALLOWED_CDN_DOMAINS.join(', ')}`,
    )
  }

  return true
}

self.addEventListener('message', async (event) => {
  const msg = event.data

  if (msg.type === 'init') {
    try {
      await initialize(msg.pyodideCdnUrl)
      self.postMessage({ type: 'status', status: 'ready' })
    } catch (error) {
      console.error('Intellireading Worker: Initialization failed', error)
      self.postMessage({ type: 'error', message: error.message || 'Unknown initialization error' })
    }
    return
  }

  if (msg.type === 'process') {
    if (!initialized) {
      self.postMessage({ type: 'error', message: 'Local processor not yet loaded. Please try again.' })
      return
    }

    try {
      self.postMessage({ type: 'status', status: 'processing', message: 'Processing EPUB locally…' })

      const processFn = pyodide.globals.get('process_epub')
      const raw = processFn(pyodide.toPy(new Uint8Array(msg.fileBytes)))
      const uint8 = raw instanceof Uint8Array ? raw : raw.toJs()
      const buffer = uint8.buffer

      processFn.destroy()

      self.postMessage({ type: 'result', fileBytes: buffer, fileName: msg.fileName }, [buffer])
    } catch (error) {
      self.postMessage({ type: 'error', message: `Processing failed: ${error.message}` })
    }
  }
})

async function initialize(cdnUrl) {
  try {
    validateCdnUrl(cdnUrl)
  } catch (error) {
    throw new Error(`CDN URL validation failed: ${error.message}`)
  }

  const indexURL = cdnUrl.replace(/\/pyodide\.js$/, '/')

  self.postMessage({ type: 'status', status: 'loading', message: 'Loading Python WebAssembly runtime…' })

  try {
    importScripts(cdnUrl)
  } catch (error) {
    throw new Error(`Failed to load Pyodide script: ${error.message || error}`)
  }

  self.postMessage({ type: 'status', status: 'loading', message: 'Starting Python…' })

  try {
    pyodide = await loadPyodide({
      indexURL,
      stdout: () => {},
      stderr: () => {},
    })
  } catch (error) {
    throw new Error(`Failed to load Pyodide: ${error.message || error}`)
  }

  self.postMessage({ type: 'status', status: 'loading', message: 'Setting up package manager…' })

  try {
    await pyodide.loadPackage(['micropip', 'regex'])
  } catch (error) {
    throw new Error(`Failed to load packages: ${error.message || error}`)
  }

  self.postMessage({ type: 'status', status: 'loading', message: 'Installing intellireading-cli…' })

  try {
    const micropip = pyodide.pyimport('micropip')
    await micropip.install('intellireading-cli')
  } catch (error) {
    throw new Error(`Failed to install intellireading-cli: ${error.message || error}`)
  }

  try {
    pyodide.runPython(`
from io import BytesIO
from intellireading.client import metaguide_epub_stream

def process_epub(input_bytes):
    """Metaguide an EPUB given raw bytes, return output bytes."""
    input_stream = BytesIO(input_bytes)
    output_stream = metaguide_epub_stream(input_stream)
    return output_stream.getvalue()
`)
  } catch (error) {
    throw new Error(`Failed to register processing functions: ${error.message || error}`)
  }

  initialized = true
}
