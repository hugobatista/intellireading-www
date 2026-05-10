<template>
  <div>
    <section class="hero">
      <div class="container">
        <div class="hero-content fade-in-up">
          <h1>Read Faster with Visual Guides</h1>
          <p class="hero-subtitle">
            Transform your ebooks with Metaguiding — a free tool that bolds the first half of each word to reduce eye movement and improve reading focus.
          </p>

          <div class="hero-stats">
            <div class="stat">
              <span class="stat-number">30%</span>
              <span class="stat-label">Faster Reading</span>
            </div>
            <div class="stat">
              <span class="stat-number">Free</span>
              <span class="stat-label">No limits</span>
            </div>
            <div class="stat">
              <span class="stat-number">Private</span>
              <span class="stat-label">Local processing</span>
            </div>
          </div>

          <div class="hero-cta-group">
            <a href="#upload" class="cta-hero-button">Upload Your EPUB</a>
            <p class="hero-cta-text">Or scroll to see how it works</p>
          </div>
        </div>
      </div>
    </section>

    <section id="upload" class="upload-section">
      <div class="upload-container">
        <h2 class="upload-title">Transform Your Ebook</h2>
        <p class="upload-subtitle">
          Upload an EPUB file and get a version with visual reading guides
        </p>

        <form
          id="upload-form"
          action=""
          method="POST"
          class="upload-form"
          enctype="multipart/form-data"
          @submit="handleSubmit"
          @dragenter.prevent="handleDragEnter"
          @dragover.prevent="handleDragEnter"
          @dragleave.prevent="handleDragLeave"
          @drop.prevent="handleDrop"
        >
          <div class="upload-icon">📚</div>
          <p class="upload-text-hint">Drag &amp; drop your epub file here or</p>
          <label for="file-input" class="upload-label">Choose File</label>
          <input
            id="file-input"
            ref="fileInput"
            type="file"
            name="file"
            class="file-input"
            accept=".epub,.kepub"
            required
            @change="handleFileChange"
          />

          <div id="file-info" ref="fileInfo" class="file-info"></div>
          <div id="local-status" ref="localStatus" class="status-panel"></div>
          <div id="progress-bar" ref="progressBar" class="progress-bar">
            <div id="progress-fill" ref="progressFill" class="progress-fill"></div>
          </div>

          <div
            id="local-capable-message"
            ref="localCapableMessage"
            class="local-capable-message"
          >
            ✓ Your file will be processed in your browser — nothing is uploaded to our servers.
          </div>

          <p id="file-size-info" ref="fileSizeInfo" class="file-size-info">
            EPUB / KEPUB files only (non-DRM) • Max 10MB<br />
            By using this service, you agree to our <RouterLink to="/terms" class="terms-link">Terms of Service</RouterLink>
          </p>

          <div
            class="cf-turnstile turnstile-container"
            ref="turnstileContainer"
            data-sitekey="0x4AAAAAAAEJQqP9fb7z_uOf"
          ></div>

          <div id="legacy-warning" ref="legacyWarning" class="legacy-warning">
            ⚠️ Your browser does not support local processing. We will fall back to server-based conversion, which
            is a legacy feature that will be deprecated during <strong>2026</strong>. For the best experience and
            offline support, please update to a modern browser that supports WebAssembly.
          </div>

          <button type="submit" class="btn-primary upload-submit" :disabled="submitDisabled">
            Process My Book
          </button>
          <div id="error" ref="errorDiv"></div>
        </form>
      </div>
    </section>

    <section id="demo" class="demo-section">
      <div class="container">
        <h2 class="section-title">See the Difference</h2>
        <p class="section-subtitle">
          Bolded word halves act as visual anchors, reducing the need to reread words
        </p>

        <div class="demo-container">
          <div>
            <div class="demo-text">
              <h4>Normal Text</h4>
              <div class="demo-normal">
                The art of speed reading has fascinated researchers for decades.
                Traditional reading methods often result in regression, where readers
                unconsciously move their eyes backward to reread words.
              </div>
            </div>

            <div class="demo-text">
              <h4>With Visual Guides</h4>
              <div class="demo-metaguided">
                <span class="metaguided-word"><span class="word-bold">Th</span>e</span>
                <span class="metaguided-word"><span class="word-bold">ar</span>t</span>
                <span class="metaguided-word"><span class="word-bold">o</span>f</span>
                <span class="metaguided-word"><span class="word-bold">spe</span>ed</span>
                <span class="metaguided-word"><span class="word-bold">read</span>ing</span>
                <span class="metaguided-word"><span class="word-bold">ha</span>s</span>
                <span class="metaguided-word"><span class="word-bold">fasc</span>inated</span>
                <span class="metaguided-word"><span class="word-bold">resea</span>rchers</span>
                <span class="metaguided-word"><span class="word-bold">fo</span>r</span>
                <span class="metaguided-word"><span class="word-bold">dec</span>ades</span>.
                <span class="metaguided-word"><span class="word-bold">Trad</span>itional</span>
                <span class="metaguided-word"><span class="word-bold">read</span>ing</span>
                <span class="metaguided-word"><span class="word-bold">meth</span>ods</span>
                <span class="metaguided-word"><span class="word-bold">oft</span>en</span>
                <span class="metaguided-word"><span class="word-bold">res</span>ult</span>
                <span class="metaguided-word"><span class="word-bold">i</span>n</span>
                <span class="metaguided-word"><span class="word-bold">regr</span>ession</span>,
                <span class="metaguided-word"><span class="word-bold">whe</span>re</span>
                <span class="metaguided-word"><span class="word-bold">read</span>ers</span>
                <span class="metaguided-word"><span class="word-bold">uncons</span>ciously</span>
                <span class="metaguided-word"><span class="word-bold">mo</span>ve</span>
                <span class="metaguided-word"><span class="word-bold">the</span>ir</span>
                <span class="metaguided-word"><span class="word-bold">ey</span>es</span>
                <span class="metaguided-word"><span class="word-bold">back</span>ward</span>
                <span class="metaguided-word"><span class="word-bold">to</span></span>
                <span class="metaguided-word"><span class="word-bold">re</span>read</span>
                <span class="metaguided-word"><span class="word-bold">wor</span>ds</span>.
              </div>
            </div>
          </div>

          <div class="demo-image">
            <img src="/img/ereader1.jpeg" alt="E-reader displaying metaguided text" loading="lazy" />
          </div>
        </div>
      </div>
    </section>

    <section id="how-it-works" class="how-it-works">
      <div class="container">
        <h2 class="section-title">How It Works</h2>

        <div class="steps">
          <div class="step">
            <div class="step-number">1</div>
            <h3 class="step-title">Upload</h3>
            <p class="step-description">
              Select any non-DRM EPUB file from your device.
            </p>
          </div>

          <div class="step">
            <div class="step-number">2</div>
            <h3 class="step-title">Process</h3>
            <p class="step-description">
              We apply visual guides by bolding the first portion of each word.
            </p>
          </div>

          <div class="step">
            <div class="step-number">3</div>
            <h3 class="step-title">Download</h3>
            <p class="step-description">
              Get your enhanced EPUB. Works on Kindle, Kobo, and any e-reader.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section id="features" class="features">
      <div class="container">
        <h2 class="section-title">Why Use Intellireading?</h2>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🎯</div>
            <h3 class="feature-title">Better Focus</h3>
            <p class="feature-description">
              Visual anchors help maintain attention, especially helpful for readers with ADHD or dyslexia.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h3 class="feature-title">Read Faster</h3>
            <p class="feature-description">
              By reducing eye regression and guiding your gaze, many readers see noticeable speed improvements.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🔒</div>
            <h3 class="feature-title">Private by Default</h3>
            <p class="feature-description">
              Files are processed locally in your browser when possible. Your books never touch our servers.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3 class="feature-title">Universal Support</h3>
            <p class="feature-description">
              Works on any device that reads EPUB: Kindle, Kobo, Apple Books, and more.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🆓</div>
            <h3 class="feature-title">Completely Free</h3>
            <p class="feature-description">
              No subscriptions, no limits, no catch. Transform as many books as you want.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🔌</div>
            <h3 class="feature-title">Calibre Integration</h3>
            <p class="feature-description">
              Optional plugins for automatic processing when managing your library or sending to Kobo devices.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section id="faq" class="faq-section">
      <div class="container">
        <h2 class="section-title">FAQ</h2>

        <div class="faq-list">
          <div class="faq-item">
            <h3 class="faq-question">How does this help with dyslexia or ADHD?</h3>
            <p class="faq-answer">
              The bolded word halves act as visual anchors that guide your eyes across the line, reducing the tendency to skip words or lose your place. Many readers with dyslexia or ADHD find this makes reading less tiring and easier to sustain.
            </p>
          </div>

          <div class="faq-item">
            <h3 class="faq-question">Will this work on my e-reader?</h3>
            <p class="faq-answer">
              Yes. The processed EPUB uses standard formatting that works on Kindle (via Send to Kindle or Calibre), Kobo, Apple Books, Google Play Books, and any other EPUB-compatible device or app.
            </p>
          </div>

          <div class="faq-item">
            <h3 class="faq-question">Is there a limit on file size?</h3>
            <p class="faq-answer">
              The web tool accepts files up to 10MB. For larger books, use our <a href="https://go.hugobatista.com/gh/intellireading-calibre-plugins" target="_blank" rel="noopener noreferrer">Calibre plugins</a> which have no size limit.
            </p>
          </div>

          <div class="faq-item">
            <h3 class="faq-question">What about DRM-protected books?</h3>
            <p class="faq-answer">
              We only process non-DRM EPUB files. You'll need to remove DRM from purchased books using tools like Calibre's DeDRM plugin before uploading.
            </p>
          </div>

          <div class="faq-item">
            <h3 class="faq-question">Is this like Bionic Reading?</h3>
            <p class="faq-answer">
              Similar concept — both use typographic highlighting to guide reading. Our approach uses a simple algorithm that bolds approximately the first half of each word, which research suggests can help reduce regression and improve reading flow.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="calibre-plugins">
      <div class="container">
        <h2 class="section-title">Calibre Plugins</h2>
        <p class="section-subtitle">
          Prefer to process books directly in your library? Use our free Calibre plugins.
        </p>

        <div class="plugin-card-grid">
          <div class="plugin-card primary">
            <div>
              <div class="plugin-card-icon">📚</div>
              <h3 class="plugin-card-title primary">Epub Metaguider</h3>
              <p class="plugin-card-description">
                Add buttons to Calibre's toolbar and context menu to generate metaguided versions from your library.
              </p>
            </div>
            <div class="plugin-card-footer">
              <a
                href="https://go.hugobatista.com/gh/intellireading-calibre-plugins"
                target="_blank"
                rel="noopener noreferrer"
                class="plugin-cta"
              >
                Download from GitHub
              </a>
            </div>
          </div>

          <div class="plugin-card secondary">
            <div>
              <div class="plugin-card-icon">⚡</div>
              <h3 class="plugin-card-title secondary">KoboTouch Driver</h3>
              <p class="plugin-card-description">
                Automatically metaguide books when sending them to your Kobo device. No extra steps needed.
              </p>
            </div>
            <div class="plugin-card-footer">
              <a
                href="https://go.hugobatista.com/gh/intellireading-calibre-plugins"
                target="_blank"
                rel="noopener noreferrer"
                class="plugin-cta"
              >
                Download from GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="cta-section">
      <div class="container">
        <h2 class="cta-title">Start Reading Faster Today</h2>
        <p class="cta-subtitle">
          Free, private, and unlimited. Transform your first book in seconds.
        </p>
        <div class="cta-stack">
          <a href="#upload" class="cta-button">Upload Your EPUB</a>
          <p class="cta-muted">
            Or install our
            <a
              href="https://go.hugobatista.com/gh/intellireading-calibre-plugins"
              target="_blank"
              rel="noopener noreferrer"
              class="cta-link"
            >
              Calibre plugins
            </a>
            for seamless integration
          </p>
          <div class="cta-donate">
            <p class="cta-donate-text">
              ❤️ Love Intellireading? Help us keep it free for everyone
            </p>
            <a
              href="https://go.hugobatista.com/donate-intellireading"
              target="_blank"
              rel="noopener noreferrer"
              class="cta-donate-button"
            >
              <span class="cta-donate-icon">💝</span>
              Support Our Mission
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { usePyodideUpload } from '../composables/usePyodideUpload'
import '../assets/home.css'

const fileInput = ref(null)
const fileInfo = ref(null)
const progressBar = ref(null)
const progressFill = ref(null)
const errorDiv = ref(null)
const localStatus = ref(null)
const legacyWarning = ref(null)
const localCapableMessage = ref(null)
const fileSizeInfo = ref(null)
const turnstileContainer = ref(null)
const submitDisabled = ref(true)

const {
  initialize,
  handleFileSelected,
  handleSubmit,
  handleDrop,
  handleDragEnter,
  handleDragLeave,
  updateButtonState,
} = usePyodideUpload({
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
})

function handleFileChange(event) {
  handleFileSelected(event)
}

onMounted(async () => {
  await nextTick()
  initialize()
  updateButtonState()
})
</script>
