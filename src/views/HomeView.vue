<template>
  <div>
    <section class="hero">
      <div class="container">
        <div class="hero-content fade-in-up">
          <h1>Read 30% Faster with AI Metaguiding</h1>
          <p class="hero-subtitle">
            Transform your ebooks with our AI Metaguiding algorithms. Never skim again.
            Free epub processing service.
          </p>

          <div class="hero-stats">
            <div class="stat">
              <span class="stat-number">30%</span>
              <span class="stat-label">Faster Reading</span>
            </div>
            <div class="stat">
              <span class="stat-number">FREE</span>
              <span class="stat-label">Service</span>
            </div>
            <div class="stat">
              <span class="stat-number">1000+</span>
              <span class="stat-label">Books Processed</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="upload" class="upload-section">
      <div class="upload-container">
        <h2 class="upload-title">Transform Your Ebook in Seconds</h2>
        <p class="upload-subtitle">
          Upload your epub file and get a metaguided version that helps you read faster and focus better
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
            ✓ Local processing capability detected. Your EPUB will be processed locally in your browser - no data
            will be sent to our servers.
          </div>

          <p id="file-size-info" ref="fileSizeInfo" class="file-size-info">
            Supported formats: EPUB / KEPUB (non-DRM) • Max size: 10MB<br />
            By using the service, you agree to our <RouterLink to="/terms" class="terms-link">Terms of Service</RouterLink>
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

    <section id="features" class="features">
      <div class="container">
        <h2 class="section-title">Why Intellireading?</h2>
        <p class="section-subtitle">
          Our advanced AI Metaguiding algorithms transform your reading experience with proven techniques
        </p>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🎯</div>
            <h3 class="feature-title">Enhanced Focus</h3>
            <p class="feature-description">
              Advanced metaguiding creates visual anchors that guide your eyes and help your brain stay focused
              throughout your reading session.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h3 class="feature-title">30% Faster Reading</h3>
            <p class="feature-description">
              Scientifically proven metaguiding techniques help you read significantly faster while maintaining
              comprehension.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🚫</div>
            <h3 class="feature-title">No More Skimming</h3>
            <p class="feature-description">
              Eliminates the tendency to skim by providing visual guides that keep you engaged with every word.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3 class="feature-title">Works Everywhere</h3>
            <p class="feature-description">
              Compatible with all major e-readers including Kindle, Kobo, and any device that supports epub
              format. Plus, seamless Calibre integration with our dedicated plugins.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🔒</div>
            <h3 class="feature-title">Privacy First</h3>
            <p class="feature-description">
              We don't store your books or personal data. Your files are processed and immediately deleted from
              our servers.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🆓</div>
            <h3 class="feature-title">Completely Free</h3>
            <p class="feature-description">
              No subscriptions, no hidden fees. Transform unlimited epub files at no cost to accelerate your
              reading journey.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section id="demo" class="demo-section">
      <div class="container">
        <h2 class="section-title">See Metaguiding in Action</h2>
        <p class="section-subtitle">
          Experience the difference between normal text and enhanced text that uses visual guides to improve
          focus and reading speed
        </p>

        <div class="demo-container">
          <div>
            <div class="demo-text">
              <h4>Normal Text</h4>
              <div class="demo-normal">
                The art of speed reading has fascinated researchers and educators for decades. Traditional
                reading methods often result in regression, where readers unconsciously move their eyes backward
                to reread words they've already processed. This habit significantly slows down reading speed and
                can cause fatigue.
              </div>
            </div>

            <div class="demo-text">
              <h4>Enhanced Text with Visual Guides</h4>
              <div class="demo-metaguided">
                <div class="guide-marker"></div>
                <span class="metaguided-word"><span class="word-bold">Th</span>e</span>
                <span class="metaguided-word"><span class="word-bold">ar</span>t</span>
                <span class="metaguided-word"><span class="word-bold">o</span>f</span>
                <span class="metaguided-word"><span class="word-bold">spe</span>ed</span>
                <span class="metaguided-word"><span class="word-bold">read</span>ing</span>
                <span class="metaguided-word"><span class="word-bold">ha</span>s</span>
                <span class="metaguided-word"><span class="word-bold">fasc</span>inated</span>
                <span class="metaguided-word"><span class="word-bold">resea</span>rchers</span>
                <span class="metaguided-word"><span class="word-bold">an</span>d</span>
                <span class="metaguided-word"><span class="word-bold">educ</span>ators</span>
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
                <span class="metaguided-word"><span class="word-bold">wor</span>ds</span>
                <span class="metaguided-word"><span class="word-bold">they'</span>ve</span>
                <span class="metaguided-word"><span class="word-bold">al</span>ready</span>
                <span class="metaguided-word"><span class="word-bold">proc</span>essed</span>.
                <span class="metaguided-word"><span class="word-bold">Thi</span>s</span>
                <span class="metaguided-word"><span class="word-bold">ha</span>bit</span>
                <span class="metaguided-word"><span class="word-bold">sig</span>nificantly</span>
                <span class="metaguided-word"><span class="word-bold">slo</span>ws</span>
                <span class="metaguided-word"><span class="word-bold">dow</span>n</span>
                <span class="metaguided-word"><span class="word-bold">read</span>ing</span>
                <span class="metaguided-word"><span class="word-bold">spe</span>ed</span>
                <span class="metaguided-word"><span class="word-bold">an</span>d</span>
                <span class="metaguided-word"><span class="word-bold">ca</span>n</span>
                <span class="metaguided-word"><span class="word-bold">ca</span>use</span>
                <span class="metaguided-word"><span class="word-bold">fat</span>igue</span>.
              </div>
          <p class="demo-caption">
            ↑ The bolded first half of each word creates visual anchors that guide your reading flow
          </p>
            </div>
          </div>

          <div class="demo-image">
            <img src="/img/ereader1.jpeg" alt="E-reader showing metaguided text in action" loading="lazy" />
            <div class="demo-overlay">
              <div>See it in action on your e-reader</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="how-it-works" class="how-it-works">
      <div class="container">
        <h2 class="section-title">How It Works</h2>
        <p class="section-subtitle">
          Get started in three simple steps and transform your reading experience immediately
        </p>

        <div class="steps">
          <div class="step">
            <div class="step-number">1</div>
            <h3 class="step-title">Upload Your Epub</h3>
            <p class="step-description">
              Choose any non-DRM epub file from your collection. We support all standard epub formats and books
              up to 10MB.
            </p>
          </div>

          <div class="step">
            <div class="step-number">2</div>
            <h3 class="step-title">AI Processing</h3>
            <p class="step-description">
              Our system analyzes your book and applies metaguiding by applying visual anchors to enhance
              reading focus and speed.
            </p>
          </div>

          <div class="step">
            <div class="step-number">3</div>
            <h3 class="step-title">Download &amp; Read</h3>
            <p class="step-description">
              Download your enhanced ebook and transfer it to any e-reader. Start reading 30% faster with better
              comprehension.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="calibre-plugins">
      <div class="container">
        <h2 class="section-title">Seamless Integration with Calibre &amp; Kobo</h2>
        <p class="section-subtitle">
          Skip the manual upload process! Use our Calibre plugins to automatically metaguide your ebooks when
          adding them to your library or transferring to your Kobo device.
        </p>

        <div class="plugin-card-grid">
          <div class="plugin-card primary">
            <div>
              <div class="plugin-card-icon">📚</div>
              <h3 class="plugin-card-title primary">Epub Metaguider</h3>
              <p class="plugin-card-description">
                <strong>Interface Action Plugin</strong><br />
                Adds convenient buttons to your Calibre toolbar and context menu, allowing you to generate
                metaguided versions directly from your library interface.
              </p>
            </div>
            <div class="plugin-card-footer">
              <div class="plugin-highlight">
                <p class="plugin-highlight-text">
                  <span class="plugin-highlight-label">Perfect for:</span> Managing your entire ebook collection with
                  metaguiding
                </p>
              </div>
              <a
                href="https://go.hugobatista.com/gh/intellireading-calibre-plugins"
                target="_blank"
                rel="noopener noreferrer"
                class="plugin-cta"
              >
                Get Plugin from GitHub
              </a>
            </div>
          </div>

          <div class="plugin-card secondary">
            <div>
              <div class="plugin-card-icon">⚡</div>
              <h3 class="plugin-card-title secondary">KoboTouch Driver</h3>
              <p class="plugin-card-description">
                <strong>Device Interface Plugin</strong><br />
                Automatically generates metaguided versions when you send books to your Kobo device. No extra
                steps needed!
              </p>
            </div>
            <div class="plugin-card-footer">
              <div class="plugin-highlight secondary">
                <p class="plugin-highlight-text">
                  <span class="plugin-highlight-label">Perfect for:</span> Kobo device owners who want automatic
                  metaguiding
                </p>
              </div>
              <a
                href="https://go.hugobatista.com/gh/intellireading-calibre-plugins"
                target="_blank"
                rel="noopener noreferrer"
                class="plugin-cta"
              >
                Get Plugin from GitHub
              </a>
            </div>
          </div>
        </div>

        <div class="plugin-installation">
          <h4 class="plugin-installation-title">📦 Easy Installation</h4>
          <p class="plugin-installation-text">
            Both plugins are available in the <strong>Calibre Plugin Store</strong> for easy installation, or you
            can download them manually from our GitHub repository. Compatible with Calibre 8.4.0 and above.
          </p>
          <div class="plugin-pill-group">
            <span class="plugin-pill">🔌 Calibre Plugin Store</span>
            <span class="plugin-pill">📥 Manual Installation</span>
            <span class="plugin-pill">✅ Calibre 8.4.0+</span>
          </div>
        </div>
      </div>
    </section>

    <section class="social-proof">
      <div class="container">
        <h2 class="section-title">What Readers Are Saying</h2>

        <div class="testimonials">
          <div class="testimonial">
            <p class="testimonial-text">
              "I was skeptical at first, but Intellireading genuinely helped me read faster. I finished my last
              novel 2 days earlier than usual!"
            </p>
            <p class="testimonial-author">— Sarah K., Avid Reader</p>
          </div>

          <div class="testimonial">
            <p class="testimonial-text">
              "As a student, this tool has been a game-changer. I can get through my textbooks much faster while
              actually retaining more information."
            </p>
            <p class="testimonial-author">— Marcus T., University Student</p>
          </div>

          <div class="testimonial">
            <p class="testimonial-text">
              "The metaguiding really works! I used to skip lines and lose focus, but now I stay engaged
              throughout my reading sessions."
            </p>
            <p class="testimonial-author">— Elena R., Book Blogger</p>
          </div>

          <div class="testimonial">
            <p class="testimonial-text">
              "The Kobo plugin is absolutely brilliant! Every book I send to my device gets automatically
              metaguided. No more manual uploads - it just works seamlessly."
            </p>
            <p class="testimonial-author">— David M., Kobo User</p>
          </div>

          <div class="testimonial">
            <p class="testimonial-text">
              "As someone with ADHD, the visual guides help me maintain focus like nothing else I've tried. This
              technology is genuinely life-changing."
            </p>
            <p class="testimonial-author">— Michael P., Software Developer</p>
          </div>

          <div class="testimonial">
            <p class="testimonial-text">
              "My Kobo automatically gets metaguided books now thanks to the plugin. Reading on vacation has
              never been more enjoyable and efficient!"
            </p>
            <p class="testimonial-author">— Rachel S., Travel Writer</p>
          </div>
        </div>
      </div>
    </section>

    <section class="cta-section">
      <div class="container">
        <h2 class="cta-title">Ready to Read Faster?</h2>
        <p class="cta-subtitle">
          Join thousands of readers who've accelerated their reading speed with Intellireading
        </p>
        <div class="cta-stack">
          <a href="#upload" class="cta-button">Transform Your First Book Free</a>
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
