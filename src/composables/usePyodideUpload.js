import { onBeforeUnmount } from 'vue'

export function usePyodideUpload({
  fileInput,
  fileInfo,
  progressBar,
  progressFill,
  errorDiv,
  localStatus,
  legacyWarning,
  localCapableMessage,
  fileSizeInfo,
  turnstileContainer,
  submitDisabled,
}) {
  let worker = null
  let status = 'uninitialized'
  let processingResolve = null
  let processingReject = null

  const metaguideEpubUrl = import.meta.env.VITE_METAGUIDE_EPUB_URL
  const pyodideCdnUrl = import.meta.env.VITE_PYODIDE_CDN_URL


  function getSafariVersion() {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    if (!isSafari) return null

    const match = navigator.userAgent.match(/Version\/([\d.]+)/)
    if (!match) return null

    return Number.parseInt(match[1], 10)
  }

  function isSupported() {
    if (typeof Worker === 'undefined' || typeof WebAssembly === 'undefined') {
      return false
    }

    const safariVersion = getSafariVersion()
    if (safariVersion && safariVersion < 16) {
      console.warn(
        `Intellireading: Safari ${safariVersion} has known WebAssembly issues. Local processing requires Safari 16+.`
      )
      return false
    }

    return true
  }

  function updateUI(message, style) {
    if (!localStatus.value) return
    localStatus.value.textContent = message || ''
    localStatus.value.style.display = message ? 'block' : 'none'

    if (style === 1) {
      localStatus.value.style.background = '#d1fae5'
      localStatus.value.style.color = '#065f46'
      localStatus.value.style.border = '1px solid #6ee7b7'
    } else if (style === 0) {
      localStatus.value.style.background = '#fef3c7'
      localStatus.value.style.color = '#92400e'
      localStatus.value.style.border = '1px solid #fcd34d'
    } else {
      localStatus.value.style.background = '#e0e7ff'
      localStatus.value.style.color = '#4338ca'
      localStatus.value.style.border = '1px solid #a5b4fc'
    }
  }

  function showLegacyWarning() {
    if (legacyWarning.value) {
      legacyWarning.value.style.display = 'block'
    }
  }

  function enableLegacyMode() {
    const turnstileWidget = turnstileContainer?.value || document.querySelector('.cf-turnstile')
    if (turnstileWidget) {
      turnstileWidget.style.display = 'flex'
      renderTurnstile(turnstileWidget)
    }
    showLegacyWarning()
    notifyStatusChange()
  }

  function notifyStatusChange() {
    const event = new CustomEvent('IntellireadingStatusChange', { detail: { status } })
    window.document.dispatchEvent(event)
  }

  function onWorkerMessage(event) {
    const msg = event.data

    switch (msg.type) {
      case 'status':
        if (msg.status === 'ready') {
          status = 'ready'
          if (localCapableMessage.value) localCapableMessage.value.style.display = 'block'
          if (fileSizeInfo.value) {
            fileSizeInfo.value.innerHTML =
              'Supported formats: EPUB / KEPUB (non-DRM)<br>By using the service, you agree to our <a href="/terms" style="color: var(--primary-600);">Terms of Service</a>'
          }
          updateUI('Offline processor ready ✓', 1)
          setTimeout(() => {
            if (localStatus.value) localStatus.value.style.display = 'none'
          }, 2000)
          notifyStatusChange()
        } else if (msg.status === 'processing') {
          updateUI(msg.message || 'Processing EPUB locally…')
        } else if (msg.status === 'loading') {
          updateUI(msg.message || 'Loading offline processor…')
        }
        break
      case 'result':
        status = 'ready'
        if (processingResolve) {
          processingResolve(msg)
          processingResolve = null
          processingReject = null
        }
        break
      case 'error':
        status = 'error'
        if (getSafariVersion()) {
          updateUI('Local processing unavailable in this browser. Using server conversion.', 0)
        } else {
          updateUI(`Local processing unavailable: ${msg.message}`, 0)
        }
        enableLegacyMode()
        if (processingReject) {
          processingReject(new Error(msg.message))
          processingResolve = null
          processingReject = null
        }
        break
      default:
        break
    }
  }

  function onWorkerError(error) {
    console.error('Intellireading: Worker error', error)
    status = 'error'
    updateUI('Worker error, falling back to server.', 0)
    enableLegacyMode()
    if (processingReject) {
      processingReject(new Error('Worker error'))
      processingResolve = null
      processingReject = null
    }
  }

  function ensureInitialized() {
    if (!isSupported()) {
      if (status === 'uninitialized') {
        status = 'unsupported'
      }
      return false
    }

    if (status === 'ready' || status === 'loading') return true

    status = 'loading'
    updateUI('Loading offline processor…')

    try {
      worker = new Worker(new URL('../workers/pyodide-worker.js', import.meta.url))
      worker.addEventListener('message', onWorkerMessage)
      worker.addEventListener('error', onWorkerError)

      const cdnUrl = pyodideCdnUrl || 'https://cdn.jsdelivr.net/pyodide/v0.29.4/full/pyodide.js'
      worker.postMessage({ type: 'init', pyodideCdnUrl: cdnUrl })
      return true
    } catch (error) {
      console.warn('Intellireading: Failed to create worker.', error)
      status = 'unsupported'
      enableLegacyMode()
      return false
    }
  }

  function waitForReady() {
    if (status === 'ready') return Promise.resolve()
    if (status === 'unsupported') return Promise.reject(new Error('NOT_SUPPORTED'))

    ensureInitialized()

    if (status === 'unsupported') return Promise.reject(new Error('NOT_SUPPORTED'))

    return new Promise((resolve, reject) => {
      const poll = setInterval(() => {
        if (status === 'ready') {
          clearInterval(poll)
          resolve()
        } else if (status === 'error' || status === 'unsupported') {
          clearInterval(poll)
          reject(new Error('NOT_SUPPORTED'))
        }
      }, 250)

      setTimeout(() => {
        clearInterval(poll)
        reject(new Error('NOT_SUPPORTED'))
      }, 60000)
    })
  }

  function processFile(file) {
    return waitForReady()
      .then(
        () =>
          new Promise((resolve, reject) => {
            processingResolve = resolve
            processingReject = reject

            const reader = new FileReader()
            reader.onload = (event) => {
              worker.postMessage(
                { type: 'process', fileBytes: event.target.result, fileName: file.name },
                [event.target.result],
              )
            }
            reader.onerror = () => {
              processingResolve = null
              processingReject = null
              reject(new Error('Failed to read file'))
            }
            reader.readAsArrayBuffer(file)
          }),
      )
      .then((msg) => ({
        blob: new Blob([msg.fileBytes], { type: 'application/epub+zip' }),
        fileName: msg.fileName,
      }))
  }

  function clearError() {
    if (!errorDiv.value) return
    errorDiv.value.textContent = ''
    errorDiv.value.style.display = 'none'
  }

  function showError(message) {
    if (!errorDiv.value) return
    errorDiv.value.textContent = message
    errorDiv.value.style.display = 'block'
  }

  function showFileInfo(file) {
    if (!fileInfo.value) return
    fileInfo.value.textContent = `Selected: ${file.name} (${formatFileSize(file.size)})`
    fileInfo.value.style.display = 'block'
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
  }

  function updateButtonState() {
    if (!fileInput.value) return
    const hasFile = fileInput.value.files.length > 0
    const isOfflineReady = status === 'ready'
    const isOfflineUnavailable = status === 'error' || status === 'unsupported'
    submitDisabled.value = !(hasFile && (isOfflineReady || isOfflineUnavailable))
  }

  function showCompletionStatus(message, durationMs) {
    if (!localStatus.value) return
    localStatus.value.textContent = message || 'Epub processing complete.'
    localStatus.value.style.display = 'block'
    localStatus.value.style.background = '#d1fae5'
    localStatus.value.style.color = '#065f46'
    localStatus.value.style.border = '1px solid #6ee7b7'
    setTimeout(() => {
      if (localStatus.value) localStatus.value.style.display = 'none'
    }, typeof durationMs === 'number' ? durationMs : 3000)
  }

  function downloadBlob(blob, fileName) {
    const url = window.URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName
    document.body.appendChild(anchor)
    anchor.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(anchor)
  }

  function resetForm() {
    if (fileInput.value) fileInput.value.value = ''
    if (fileInfo.value) fileInfo.value.style.display = 'none'
    if (progressBar.value) progressBar.value.style.display = 'none'
    if (progressFill.value) progressFill.value.style.width = '0%'
    clearError()

    if (window.turnstile) {
      try {
        window.turnstile.reset()
      } catch (error) {
        // ignore reset errors
      }
    }

    updateButtonState()
  }

  function doLegacySubmit(file) {
    if (!metaguideEpubUrl) {
      showError('Server endpoint is not configured. Please try again later.')
      submitDisabled.value = false
      return
    }

    const turnstileWidget = turnstileContainer?.value || document.querySelector('.cf-turnstile')
    if (turnstileWidget) {
      turnstileWidget.style.display = 'flex'
      renderTurnstile(turnstileWidget)
    }

    const turnstileResponse = document.querySelector('[name="cf-turnstile-response"]')
    if (!turnstileResponse || !turnstileResponse.value) {
      showError('Please complete the security verification.')
      submitDisabled.value = false
      return
    }

    submitDisabled.value = true

    if (progressBar.value) progressBar.value.style.display = 'block'
    if (progressFill.value) progressFill.value.style.width = '50%'

    const formData = new FormData()
    formData.append('file', file)
    formData.append('cf-turnstile-response', turnstileResponse.value)

    fetch(metaguideEpubUrl || '', {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        if (response.ok) return response.blob()
        return response.text().then((text) => {
          throw new Error(text || 'Upload failed')
        })
      })
      .then((blob) => {
        downloadBlob(blob, file.name.replace('.epub', '_metaguided.epub'))
        resetForm()
        showCompletionStatus('Your book has been processed and downloaded successfully!', 4000)
      })
      .catch((error) => {
        console.error('Error:', error)
        showError(`There was an error processing your file: ${error.message}`)
        if (progressBar.value) progressBar.value.style.display = 'none'
        if (progressFill.value) progressFill.value.style.width = '0%'
        submitDisabled.value = false
      })
  }

  function handleSubmit(event) {
    event.preventDefault()
    clearError()

    if (!fileInput.value || !fileInput.value.files[0]) {
      showError('Please select a file first.')
      return
    }

    const file = fileInput.value.files[0]
    submitDisabled.value = true

    if (status === 'ready') {
      if (progressBar.value) progressBar.value.style.display = 'block'
      if (progressFill.value) progressFill.value.style.width = '50%'

      processFile(file)
        .then((result) => {
          downloadBlob(result.blob, result.fileName.replace('.epub', '_metaguided.epub'))
          resetForm()

          const turnstileWidget = document.querySelector('.cf-turnstile')
          if (turnstileWidget) turnstileWidget.style.display = 'none'
          if (legacyWarning.value) legacyWarning.value.style.display = 'none'

          showCompletionStatus('Your book has been processed and downloaded successfully!', 4000)
        })
        .catch((error) => {
          console.warn('Intellireading: Local processing failed, using server fallback.', error)
          showLegacyWarning()
          if (progressBar.value) progressBar.value.style.display = 'none'
          if (progressFill.value) progressFill.value.style.width = '0%'
          doLegacySubmit(file)
        })
      return
    }

    showLegacyWarning()
    doLegacySubmit(file)
  }

  function handleFileSelected(event) {
    if (!event.target.files.length) {
      if (fileInfo.value) fileInfo.value.style.display = 'none'
      updateButtonState()
      return
    }

    clearError()
    showFileInfo(event.target.files[0])
    if (localStatus.value) localStatus.value.style.display = 'none'
    updateButtonState()
  }

  function handleDrop(event) {
    const files = event.dataTransfer.files
    if (!files || !files.length || !fileInput.value) return
    clearError()
    fileInput.value.files = files
    showFileInfo(files[0])
    updateButtonState()
    handleDragLeave(event)
  }

  function handleDragEnter(event) {
    const form = event?.currentTarget || document.getElementById('upload-form')
    if (form) form.classList.add('dragover')
  }

  function handleDragLeave(event) {
    const form = event?.currentTarget || document.getElementById('upload-form')
    if (form) form.classList.remove('dragover')
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    const safariVersionMatch = navigator.userAgent.match(/Version\/([\d.]+)/)
    const safariVersion = safariVersionMatch ? Number.parseInt(safariVersionMatch[1], 10) : null

    if (isSafari && safariVersion && safariVersion < 16) return

    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.log('Intellireading: SW registration skipped', error)
    })
  }


  function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('section').forEach((section) => {
        section.classList.add('fade-in-up')
      })
      return
    }

    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-up')
        }
      })
    }, observerOptions)

    document.querySelectorAll('section').forEach((section) => {
      observer.observe(section)
    })
  }

  function initialize() {
    registerServiceWorker()
    initScrollAnimations()

    if (errorDiv.value && errorDiv.value.textContent === '{{error}}') {
      errorDiv.value.textContent = ''
      errorDiv.value.style.display = 'none'
    }

    if (submitDisabled.value !== undefined) {
      submitDisabled.value = true
    }

    if (isSupported()) {
      ensureInitialized()
    } else {
      if (localCapableMessage.value) localCapableMessage.value.style.display = 'none'
      if (fileSizeInfo.value) {
        fileSizeInfo.value.innerHTML =
          'Supported formats: EPUB / KEPUB (non-DRM) • Max size: 10MB<br>By using the service, you agree to our <a href="/terms" style="color: var(--primary-600);">Terms of Service</a>'
      }
      enableLegacyMode()
      status = 'unsupported'
      setTimeout(() => {
        notifyStatusChange()
      }, 100)
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      const widget = turnstileContainer?.value
      if (widget && widget.style.display === 'flex') {
        renderTurnstile(widget)
      }
    })
  }

  function renderTurnstile(container) {
    if (!window.turnstile || !container) return
    if (container.querySelector('iframe')) return

    try {
      window.turnstile.render(container)
    } catch (error) {
      console.warn('Intellireading: Turnstile render failed', error)
    }
  }

  const statusListener = () => updateButtonState()
  document.addEventListener('IntellireadingStatusChange', statusListener)

  onBeforeUnmount(() => {
    document.removeEventListener('IntellireadingStatusChange', statusListener)
    if (worker) {
      worker.terminate()
    }
  })

  return {
    initialize,
    handleFileSelected,
    handleDrop,
    handleDragEnter,
    handleDragLeave,
    handleSubmit,
    updateButtonState,
  }
}
