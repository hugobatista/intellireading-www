/* Intellireading Local Processing Client
 *
 * Main-thread controller for the Pyodide worker.
 * Manages worker lifecycle, updates the upload-form UI with status messages,
 * and falls back to the legacy server endpoint when local processing is
 * unavailable or fails.
 *
 * Exposes window.IntellireadingLocal for the inline submit handler to use.
 */
(function () {
    'use strict';

    var WORKER_URL = './js/pyodide-worker.js';

    /**
     * Allowlist of trusted CDN domains for Pyodide.
     * Mirrors the worker-side validation for defense in depth.
     */
    var ALLOWED_CDN_DOMAINS = [
        'cdn.jsdelivr.net',
        // Add other trusted CDN domains here as needed
    ];

    /**
     * Validates that a CDN URL is from a trusted source.
     * This mirrors the worker validation to catch issues early on the main thread.
     *
     * @param {string} url - The CDN URL to validate
     * @returns {boolean} - True if valid
     */
    function validateCdnUrl(url) {
        if (!url || typeof url !== 'string') {
            console.error('Intellireading: CDN URL must be a non-empty string');
            return false;
        }

        var parsed;
        try {
            parsed = new URL(url);
        } catch (e) {
            console.error('Intellireading: CDN URL is not valid:', url);
            return false;
        }

        // Must be HTTPS
        if (parsed.protocol !== 'https:') {
            console.error('Intellireading: CDN URL must use HTTPS. Got:', parsed.protocol);
            return false;
        }

        // Must end with /pyodide.js
        if (!parsed.pathname.endsWith('/pyodide.js')) {
            console.error('Intellireading: CDN URL must end with /pyodide.js. Got:', parsed.pathname);
            return false;
        }

        // Must be from allowed domain
        var hostname = parsed.hostname;
        var isAllowed = ALLOWED_CDN_DOMAINS.some(function (domain) {
            return hostname === domain || hostname.endsWith('.' + domain);
        });

        if (!isAllowed) {
            console.error('Intellireading: CDN domain not allowed:', hostname, '. Allowed:', ALLOWED_CDN_DOMAINS.join(', '));
            return false;
        }

        return true;
    }

    // ---- State ------------------------------------------------------------
    var worker = null;
    var status = 'uninitialized';  // 'uninitialized' | 'loading' | 'ready' | 'error' | 'unsupported'
    var processingResolve = null;
    var processingReject = null;

    // ---- UI elements (set after DOMContentLoaded) -------------------------
    var $status  = null;   // #local-status
    var $warning = null;   // #legacy-warning
    var $submitBtn = null; // submit button, disabled during local processing
    var $capableMsg = null; // #local-capable-message
    var $fileSizeInfo = null; // #file-size-info

    // ---- Helper: browser support -----------------------------------------
    function getSafariVersion() {
        var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        if (!isSafari) return null;

        var safariVersionMatch = navigator.userAgent.match(/Version\/([\d.]+)/);
        if (!safariVersionMatch) return null;

        return parseInt(safariVersionMatch[1], 10);
    }

    function isSupported() {
        // Check for WebAssembly and Worker support
        if (typeof Worker === 'undefined' || typeof WebAssembly === 'undefined') {
            return false;
        }

        // Safari 15 and earlier have known WebAssembly issues; require Safari 16+
        var safariVersion = getSafariVersion();
        if (safariVersion && safariVersion < 16) {
            console.warn('Intellireading: Safari ' + safariVersion + ' has known WebAssembly compatibility issues. Local processing requires Safari 16+.');
            return false;
        }

        return true;
    }

    // ---- Helper: update status UI ----------------------------------------
    function updateUI(message, style) {
        if (!$status) return;
        $status.textContent = message || '';
        $status.style.display = message ? 'block' : 'none';

        // style: 1 = success, 0 = warning/error, anything else = info (loading)
        if (style === 1) {
            $status.style.background = '#d1fae5';
            $status.style.color      = '#065f46';
            $status.style.border     = '1px solid #6ee7b7';
        } else if (style === 0) {
            $status.style.background = '#fef3c7';
            $status.style.color      = '#92400e';
            $status.style.border     = '1px solid #fcd34d';
        } else {
            $status.style.background = '#e0e7ff';
            $status.style.color      = '#4338ca';
            $status.style.border     = '1px solid #a5b4fc';
        }
    }

    function showLegacyWarning() {
        if ($warning) $warning.style.display = 'block';
    }

    function hideLocalUI() {
        if ($status)  $status.style.display  = 'none';
        if ($warning) $warning.style.display = 'none';
    }

    // ---- Helper: legacy Turnstile (match pre-offline behavior) ------------
    function enableLegacyMode() {
        var turnstileWidget = document.querySelector('.cf-turnstile');
        if (turnstileWidget) {
            turnstileWidget.style.display = 'flex';
        }
        showLegacyWarning();
        notifyStatusChange();
    }

    // ---- Worker message / error handlers ---------------------------------
    function onWorkerMessage(e) {
        var msg = e.data;

        switch (msg.type) {
            case 'status':
                if (msg.status === 'ready') {
                    status = 'ready';
                    // Show local capability message and hide file size limit info
                    if ($capableMsg) $capableMsg.style.display = 'block';
                    if ($fileSizeInfo) {
                        // Hide the "Max size: 10MB" message for local processing
                        $fileSizeInfo.innerHTML = 'Supported formats: EPUB / KEPUB (non-DRM)<br>By using the service, you agree to our <a href="/terms.html" style="color: var(--primary-600);">Terms of Service</a>';
                    }
                    updateUI('Offline processor ready ✓', 1);
                    setTimeout(function () {
                        if ($status) $status.style.display = 'none';
                    }, 2000);
                    // Notify status change so button can be enabled
                    notifyStatusChange();
                } else if (msg.status === 'processing') {
                    updateUI(msg.message || 'Processing EPUB locally…');
                } else if (msg.status === 'loading') {
                    updateUI(msg.message || 'Loading offline processor…');
                }
                break;

            case 'result':
                status = 'ready'; // worker stays ready for the next job
                if (processingResolve) {
                    processingResolve(msg);
                    processingResolve = null;
                    processingReject = null;
                }
                break;

            case 'error':
                status = 'error';
                if (getSafariVersion()) {
                    updateUI('Local processing unavailable in this browser. Using server conversion.', 0);
                } else {
                    updateUI('Local processing unavailable: ' + msg.message, 0);
                }
                enableLegacyMode();
                if (processingReject) {
                    processingReject(new Error(msg.message));
                    processingResolve = null;
                    processingReject = null;
                }
                break;
        }
    }

    function onWorkerError(err) {
        console.error('Intellireading: Worker error', err);
        status = 'error';
        updateUI('Worker error, falling back to server.', 0);
        enableLegacyMode();
        if (processingReject) {
            processingReject(new Error('Worker error'));
            processingResolve = null;
            processingReject = null;
        }
    }

    // ---- Initialisation --------------------------------------------------
    function ensureInitialized() {
        if (!isSupported()) {
            if (status === 'uninitialized') {
                status = 'unsupported';
            }
            return false;
        }

        // Already ready or loading – nothing to do
        if (status === 'ready' || status === 'loading') return true;

        // (re)start
        status = 'loading';
        updateUI('Loading offline processor…');

        try {
            worker = new Worker(WORKER_URL);
            worker.addEventListener('message', onWorkerMessage);
            worker.addEventListener('error', onWorkerError);

            // Get CDN URL from config or use default
            var cdnUrl = typeof pyodideCdnUrl !== 'undefined'
                ? pyodideCdnUrl
                : 'https://cdn.jsdelivr.net/pyodide/v0.29.4/full/pyodide.js';

            // Validate CDN URL before sending to worker (defense in depth)
            if (!validateCdnUrl(cdnUrl)) {
                throw new Error('CDN URL validation failed. Check console for details.');
            }

            worker.postMessage({ type: 'init', pyodideCdnUrl: cdnUrl });
            return true;
        } catch (e) {
            console.warn('Intellireading: Failed to create worker.', e);
            status = 'unsupported';
            enableLegacyMode();
            return false;
        }
    }

    // ---- Wait for worker to reach 'ready' --------------------------------
    function waitForReady() {
        if (status === 'ready') return Promise.resolve();
        if (status === 'unsupported') return Promise.reject(new Error('NOT_SUPPORTED'));

        ensureInitialized();

        if (status === 'unsupported') return Promise.reject(new Error('NOT_SUPPORTED'));

        return new Promise(function (resolve, reject) {
            var poll = setInterval(function () {
                if (status === 'ready') {
                    clearInterval(poll);
                    resolve();
                } else if (status === 'error' || status === 'unsupported') {
                    clearInterval(poll);
                    reject(new Error('NOT_SUPPORTED'));
                }
            }, 250);
            // Safety timeout – after 60 s give up
            setTimeout(function () {
                clearInterval(poll);
                reject(new Error('NOT_SUPPORTED'));
            }, 60000);
        });
    }

    // ---- Public: process a File, return Promise<{blob, fileName}> ---------
    function processFile(file) {
        return waitForReady().then(function () {
            return new Promise(function (resolve, reject) {
                processingResolve = resolve;
                processingReject  = reject;

                var reader = new FileReader();
                reader.onload = function (ev) {
                    // Transfer the ArrayBuffer to the worker for zero-copy
                    worker.postMessage(
                        { type: 'process', fileBytes: ev.target.result, fileName: file.name },
                        [ev.target.result]
                    );
                };
                reader.onerror = function () {
                    processingResolve = null;
                    processingReject  = null;
                    reject(new Error('Failed to read file'));
                };
                reader.readAsArrayBuffer(file);
            });
        }).then(function (msg) {
            return {
                blob: new Blob([msg.fileBytes], { type: 'application/epub+zip' }),
                fileName: msg.fileName
            };
        });
    }

    function getStatus() { return status; }

    // ---- Lazy initialisation on first user interaction -------------------
    function onFirstInteraction() {
        if (status === 'uninitialized' && isSupported()) {
            ensureInitialized();
        }
    }

    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setUpUI);
        } else {
            setUpUI();
        }
    }

    function setUpUI() {
        $status    = document.getElementById('local-status');
        $warning   = document.getElementById('legacy-warning');
        $submitBtn = document.querySelector('#upload-form .btn-primary');
        $capableMsg = document.getElementById('local-capable-message');
        $fileSizeInfo = document.getElementById('file-size-info');

        var fileInput = document.getElementById('file-input');
        if (fileInput) {
            fileInput.addEventListener('change', onFirstInteraction);
        }

        var form = document.getElementById('upload-form');
        if (form) {
            form.addEventListener('dragenter', onFirstInteraction);
        }

        // Eagerly initialize Pyodide on page load (not lazy)
        if (isSupported()) {
            ensureInitialized();
        } else {
            // Local processing not supported - show file size limit for legacy path
            if ($capableMsg) $capableMsg.style.display = 'none';
            if ($fileSizeInfo) {
                $fileSizeInfo.innerHTML = 'Supported formats: EPUB / KEPUB (non-DRM) • Max size: 10MB<br>By using the service, you agree to our <a href="/terms.html" style="color: var(--primary-600);">Terms of Service</a>';
            }
            // Show deprecation warning immediately for legacy path
            enableLegacyMode();
            // Set status to unsupported and notify so button can be enabled
            status = 'unsupported';
            // Delay notification to ensure DOM listener is ready
            setTimeout(function() {
                notifyStatusChange();
            }, 100);
        }
    }

    // ---- Helper: notify when status changes for button state update --------
    function notifyStatusChange() {
        // Trigger custom event that index.html can listen to
        if (typeof window !== 'undefined' && window.document) {
            var event = new CustomEvent('IntellireadingStatusChange', { detail: { status: status } });
            window.document.dispatchEvent(event);
        }
    }

     // ---- Export ----------------------------------------------------------
    window.IntellireadingLocal = {
        getStatus:      getStatus,
        processFile:    processFile,
        ensureInitialized: ensureInitialized,
        showLegacyWarning: showLegacyWarning,
        hideLocalUI:    hideLocalUI,
        enableLegacyMode: enableLegacyMode
    };

})();
