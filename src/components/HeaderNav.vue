<template>
  <header class="header">
    <nav class="nav container">
      <RouterLink to="/" class="logo-link">
        <img src="/img/intellireading.png" alt="Intellireading - Speed Reading & Reading Enhancement for Dyslexia & ADHD" class="logo" />
      </RouterLink>
      <ul class="nav-links" :class="{ active: mobileMenuOpen }">
        <li>
          <RouterLink to="/#features" class="nav-link">Features</RouterLink>
        </li>
        <li>
          <RouterLink to="/#demo" class="nav-link">Demo</RouterLink>
        </li>
        <li>
          <RouterLink to="/#how-it-works" class="nav-link">How It Works</RouterLink>
        </li>
        <li>
          <RouterLink to="/#faq" class="nav-link">FAQ</RouterLink>
        </li>
        <li>
          <RouterLink to="/terms" class="nav-link">Terms</RouterLink>
        </li>
      </ul>
      <div class="nav-controls">
        <RouterLink to="/#upload" class="nav-cta">Use it Free</RouterLink>
        <button class="theme-toggle" type="button" aria-label="Toggle dark mode" @click="toggleTheme">
          <svg class="sun-icon" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clip-rule="evenodd"
            ></path>
          </svg>
          <svg class="moon-icon" fill="currentColor" viewBox="0 0 20 20">
            <path
              d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"
            ></path>
          </svg>
        </button>
        <button class="mobile-menu-toggle" type="button" @click="toggleMobileMenu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

const mobileMenuOpen = ref(false)

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme')
  setTheme(currentTheme === 'dark' ? 'light' : 'dark')
}

function applyInitialTheme() {
  const savedTheme = localStorage.getItem('theme')
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme)
  } else if (systemDark) {
    document.documentElement.setAttribute('data-theme', 'dark')
  }
}

let mediaListener = null

onMounted(() => {
  applyInitialTheme()
  const matcher = window.matchMedia('(prefers-color-scheme: dark)')
  mediaListener = (event) => {
    if (!localStorage.getItem('theme')) {
      document.documentElement.setAttribute('data-theme', event.matches ? 'dark' : 'light')
    }
  }
  matcher.addEventListener('change', mediaListener)
})

onBeforeUnmount(() => {
  const matcher = window.matchMedia('(prefers-color-scheme: dark)')
  if (mediaListener) {
    matcher.removeEventListener('change', mediaListener)
  }
})
</script>
