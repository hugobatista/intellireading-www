<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h3>Intellireading</h3>
          <p>Speed reading technology for dyslexia, ADHD, and visual reading guides. Transform your ebooks with Metaguiding.</p>
        </div>

        <div class="footer-section">
          <h3>Product</h3>
          <RouterLink to="/#features" class="footer-link">Features</RouterLink>
          <RouterLink to="/#how-it-works" class="footer-link">How It Works</RouterLink>
          <RouterLink to="/#faq" class="footer-link">FAQ</RouterLink>
          <a
            href="https://go.hugobatista.com/gh/intellireading-calibre-plugins"
            class="footer-link"
          >
            Calibre Plugins
          </a>
        </div>

        <div class="footer-section">
          <h3>Support</h3>
          <RouterLink to="/terms" class="footer-link">Terms of Service</RouterLink>
          <div class="footer-contact">
            <svg class="footer-icon" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"
              ></path>
              <path
                d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"
              ></path>
            </svg>
            intellireading at hugobatista.com
          </div>
        </div>

        <div class="footer-section">
          <h3>Connect</h3>
          <a href="https://go.hugobatista.com/x" class="footer-link footer-link-icon">
            <svg class="footer-icon" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
              ></path>
            </svg>
            X (Twitter)
          </a>
          <a href="https://go.hugobatista.com/gh" class="footer-link footer-link-icon">
            <svg class="footer-icon" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
              ></path>
            </svg>
            GitHub
          </a>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2025 Hugo Batista. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>
