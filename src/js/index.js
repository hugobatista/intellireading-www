// Index page interactions
(function () {
    'use strict';

    function registerServiceWorker() {
        if (!('serviceWorker' in navigator)) return;

        var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        var safariVersionMatch = navigator.userAgent.match(/Version\/([\d.]+)/);
        var safariVersion = safariVersionMatch ? parseInt(safariVersionMatch[1], 10) : null;

        // Skip SW on Safari <16 to avoid Turnstile verification stalls
        if (isSafari && safariVersion && safariVersion < 16) return;

        navigator.serviceWorker.register('./sw.js').catch(function (err) {
            console.log('Intellireading: SW registration skipped', err);
        });
    }

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener('click', function (e) {
                var href = anchor.getAttribute('href');
                if (!href || href === '#') return;

                var target = document.querySelector(href);
                if (!target) return;

                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            });
        });
    }

    function initUploadForm() {
        var uploadForm = document.getElementById('upload-form');
        if (!uploadForm) return;

        var fileInput = document.getElementById('file-input');
        var fileInfo = document.getElementById('file-info');
        var progressBar = document.getElementById('progress-bar');
        var progressFill = document.getElementById('progress-fill');
        var errorDiv = document.getElementById('error');
        var submitBtn = uploadForm.querySelector('.btn-primary');

        if (typeof metaguideEpubUrl !== 'undefined') {
            uploadForm.action = metaguideEpubUrl;
        }

        if (submitBtn) submitBtn.disabled = true;

        if (errorDiv && errorDiv.textContent === '{{error}}') {
            errorDiv.textContent = '';
            errorDiv.style.display = 'none';
        }

        function clearError() {
            if (!errorDiv) return;
            errorDiv.textContent = '';
            errorDiv.style.display = 'none';
        }

        function showError(message) {
            if (!errorDiv) return;
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }

        function showFileInfo(file) {
            if (!fileInfo) return;
            fileInfo.textContent = 'Selected: ' + file.name + ' (' + formatFileSize(file.size) + ')';
            fileInfo.style.display = 'block';
        }

        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            var k = 1024;
            var sizes = ['Bytes', 'KB', 'MB', 'GB'];
            var i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        function updateButtonState() {
            if (!fileInput || !submitBtn) return;
            var hasFile = fileInput.files.length > 0;
            var local = window.IntellireadingLocal;
            var status = local && typeof local.getStatus === 'function' ? local.getStatus() : null;
            var isOfflineReady = status === 'ready';
            var isOfflineUnavailable = status === 'error' || status === 'unsupported';

            submitBtn.disabled = !(hasFile && (isOfflineReady || isOfflineUnavailable));
        }

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        function highlight() {
            uploadForm.classList.add('dragover');
        }

        function unhighlight() {
            uploadForm.classList.remove('dragover');
        }

        function handleDrop(e) {
            var files = e.dataTransfer.files;
            if (!files || !files.length || !fileInput) return;

            clearError();
            fileInput.files = files;
            showFileInfo(files[0]);
            updateButtonState();
        }

        function downloadBlob(blob, fileName) {
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }

        function resetForm() {
            uploadForm.reset();
            if (fileInfo) fileInfo.style.display = 'none';
            if (progressBar) progressBar.style.display = 'none';
            if (progressFill) progressFill.style.width = '0%';
            clearError();

            if (window.turnstile) {
                try {
                    window.turnstile.reset();
                } catch (e) {
                    // Ignore reset errors; Turnstile will render fresh on next load
                }
            }

            updateButtonState();
        }

        function doLegacySubmit(file) {
            var turnstileWidget = document.querySelector('.cf-turnstile');
            if (turnstileWidget) {
                turnstileWidget.style.display = 'flex';
            }

            var turnstileResponse = document.querySelector('[name="cf-turnstile-response"]');
            if (!turnstileResponse || !turnstileResponse.value) {
                showError('Please complete the security verification.');
                if (submitBtn) submitBtn.disabled = false;
                return;
            }

            if (submitBtn) submitBtn.disabled = true;

            if (progressBar) progressBar.style.display = 'block';
            if (progressFill) progressFill.style.width = '50%';

            var formData = new FormData();
            formData.append('file', file);
            formData.append('cf-turnstile-response', turnstileResponse.value);

            fetch(uploadForm.action, {
                method: 'POST',
                body: formData
            }).then(function (response) {
                if (response.ok) {
                    return response.blob();
                }
                return response.text().then(function (text) {
                    throw new Error(text || 'Upload failed');
                });
            }).then(function (blob) {
                downloadBlob(blob, file.name.replace('.epub', '_metaguided.epub'));
                resetForm();
                showCompletionStatus('Your book has been processed and downloaded successfully!', 4000);
            }).catch(function (error) {
                console.error('Error:', error);
                showError('There was an error processing your file: ' + error.message);
                if (progressBar) progressBar.style.display = 'none';
                if (progressFill) progressFill.style.width = '0%';
                if (submitBtn) submitBtn.disabled = false;
            });
        }

        function showCompletionStatus(message, durationMs) {
            var statusEl = document.getElementById('local-status');
            if (!statusEl) return;

            statusEl.textContent = message || 'Epub processing complete.';
            statusEl.style.display = 'block';
            statusEl.style.background = '#d1fae5';
            statusEl.style.color = '#065f46';
            statusEl.style.border = '1px solid #6ee7b7';
            setTimeout(function () {
                statusEl.style.display = 'none';
            }, typeof durationMs === 'number' ? durationMs : 3000);
        }

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(function (eventName) {
            uploadForm.addEventListener(eventName, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(function (eventName) {
            uploadForm.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(function (eventName) {
            uploadForm.addEventListener(eventName, unhighlight, false);
        });

        uploadForm.addEventListener('drop', handleDrop, false);

        if (fileInput) {
            fileInput.addEventListener('change', function (e) {
                if (e.target.files.length > 0) {
                    clearError();
                    showFileInfo(e.target.files[0]);
                    var statusEl = document.getElementById('local-status');
                    if (statusEl) statusEl.style.display = 'none';
                } else if (fileInfo) {
                    fileInfo.style.display = 'none';
                }
                updateButtonState();
            });
        }

        document.addEventListener('IntellireadingStatusChange', function () {
            updateButtonState();
        });

        uploadForm.addEventListener('submit', function (e) {
            e.preventDefault();
            clearError();

            if (!fileInput || !fileInput.files[0]) {
                showError('Please select a file first.');
                return;
            }

            var file = fileInput.files[0];

            if (submitBtn) submitBtn.disabled = true;

            var local = window.IntellireadingLocal;
            if (local && local.getStatus && local.getStatus() === 'ready') {
                if (progressBar) progressBar.style.display = 'block';
                if (progressFill) progressFill.style.width = '50%';

                local.processFile(file).then(function (result) {
                    downloadBlob(result.blob, result.fileName.replace('.epub', '_metaguided.epub'));
                    resetForm();

                    var turnstileWidget = document.querySelector('.cf-turnstile');
                    var warnEl = document.getElementById('legacy-warning');
                    if (turnstileWidget) turnstileWidget.style.display = 'none';
                    if (warnEl) warnEl.style.display = 'none';

                    showCompletionStatus('Your book has been processed and downloaded successfully!', 4000);
                }).catch(function (err) {
                    console.warn('Intellireading: Local processing failed, using server fallback.', err);
                    if (local && local.showLegacyWarning) local.showLegacyWarning();
                    if (progressBar) progressBar.style.display = 'none';
                    if (progressFill) progressFill.style.width = '0%';
                    doLegacySubmit(file);
                });
                return;
            }

            if (local && local.showLegacyWarning) local.showLegacyWarning();
            doLegacySubmit(file);
        });

        updateButtonState();
    }

    function initScrollAnimations() {
        if (!('IntersectionObserver' in window)) {
            document.querySelectorAll('section').forEach(function (section) {
                section.classList.add('fade-in-up');
            });
            return;
        }

        var observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                }
            });
        }, observerOptions);

        document.querySelectorAll('section').forEach(function (section) {
            observer.observe(section);
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        registerServiceWorker();
        initSmoothScroll();
        initUploadForm();
        initScrollAnimations();
    });
})();
