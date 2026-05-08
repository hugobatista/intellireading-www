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

    // ---- State ------------------------------------------------------------
    var worker = null;
    var status = 'uninitialized';  // 'uninitialized' | 'loading' | 'ready' | 'error' | 'unsupported'
    var processingResolve = null;
    var processingReject = null;
    var turnstileWidgetId = null;

    // ---- UI elements (set after DOMContentLoaded) -------------------------
    var $status  = null;   // #local-status
    var $warning = null;   // #legacy-warning
    var $submitBtn = null; // submit button, disabled during local processing
    var $capableMsg = null; // #local-capable-message
    var $fileSizeInfo = null; // #file-size-info

    // ---- Helper: browser support -----------------------------------------
    function isSupported() {
        // Check for WebAssembly and Worker support
        if (typeof Worker === 'undefined' || typeof WebAssembly === 'undefined') {
            return false;
        }

        // Safari 15 and earlier have known WebAssembly issues; require Safari 16+
        var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        if (isSafari) {
            var safariVersionMatch = navigator.userAgent.match(/Version\/([\d.]+)/);
            if (safariVersionMatch) {
                var safariVersion = parseInt(safariVersionMatch[1]);
                if (safariVersion < 16) {
                    console.warn('Intellireading: Safari ' + safariVersion + ' has known WebAssembly compatibility issues. Local processing requires Safari 16+.');
                    return false;
                }
            }
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

    // ---- Helper: load and show Turnstile for legacy path -------------------
    function loadAndShowTurnstile() {
        var turnstileWidget = document.getElementById('turnstile-widget');
        if (!turnstileWidget) return;
        turnstileWidget.style.display = 'flex';

        function renderTurnstile() {
            if (!window.turnstile || turnstileWidgetId !== null) return;
            turnstileWidgetId = window.turnstile.render('#turnstile-widget', {
                sitekey: '0x4AAAAAAAEJQqP9fb7z_uOf'
            });
        }

        // Check if Turnstile is already loaded
        if (window.turnstile) {
            // Already loaded, render once if needed
            renderTurnstile();
         } else {
             // Load Turnstile script dynamically
             var existing = document.getElementById('turnstile-script');
             if (existing) return;
             var script = document.createElement('script');
             script.id = 'turnstile-script';
             script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
             script.async = true;
             script.onload = function() {
                 console.log('Intellireading: Turnstile script loaded');
                 renderTurnstile();
             };
             script.onerror = function() {
                 console.warn('Intellireading: Failed to load Turnstile script');
             };
             document.head.appendChild(script);
         }
    }

    function getTurnstileResponse() {
        if (window.turnstile && turnstileWidgetId !== null) {
            return window.turnstile.getResponse(turnstileWidgetId);
        }
        var field = document.querySelector('[name="cf-turnstile-response"]');
        return field ? field.value : '';
    }

    function resetTurnstile() {
        if (window.turnstile && turnstileWidgetId !== null) {
            window.turnstile.reset(turnstileWidgetId);
            return true;
        }
        return false;
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
                updateUI('Local processing unavailable: ' + msg.message, 0);
                showLegacyWarning();
                // Notify status change so button can be enabled for legacy
                notifyStatusChange();
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
        showLegacyWarning();
        // Notify status change so button can be enabled for legacy
        notifyStatusChange();
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

            // Pass the CDN URL so the worker knows where to load Pyodide from
            var cdnUrl = typeof pyodideCdnUrl !== 'undefined'
                ? pyodideCdnUrl
                : 'https://cdn.jsdelivr.net/pyodide/v0.29.4/full/pyodide.js';

            worker.postMessage({ type: 'init', pyodideCdnUrl: cdnUrl });
            return true;
        } catch (e) {
            console.warn('Intellireading: Failed to create worker.', e);
            status = 'unsupported';
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
            showLegacyWarning();
            // Load Turnstile immediately for legacy path
            loadAndShowTurnstile();
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
         getTurnstileResponse: getTurnstileResponse,
         resetTurnstile: resetTurnstile
     };

})();
