// Intellireading Shared JavaScript

// Header component for modern pages (index.html, terms.html)
function createModernHeader() {
    return `
        <header class="header">
            <nav class="nav container">
                <a href="./index.html" class="logo-link">
                    <img src="./img/intellireading.png" alt="Intellireading" class="logo">
                </a>
                <ul class="nav-links">
                    <li><a href="./index.html#features" class="nav-link">Features</a></li>
                    <li><a href="./index.html#demo" class="nav-link">Demo</a></li>
                    <li><a href="./index.html#how-it-works" class="nav-link">How It Works</a></li>
                    <li><a href="./terms.html" class="nav-link">Terms</a></li>
                </ul>
                <div class="nav-controls">
                    <a href="./index.html#upload" class="nav-cta">Try Free</a>
                    <button class="theme-toggle" id="theme-toggle" aria-label="Toggle dark mode">
                        <svg class="sun-icon" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path>
                        </svg>
                        <svg class="moon-icon" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
                        </svg>
                    </button>
                    <div class="mobile-menu-toggle">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </nav>
        </header>
    `;
}


// Footer component for modern pages
function createModernFooter() {
    return `
        <footer class="footer">
            <div class="container">
                <div class="footer-content">
                    <div class="footer-section">
                        <h3>Intellireading</h3>
                        <p>Accelerating reading experiences with advanced reading enhancement technology.</p>
                    </div>
                    
                    <div class="footer-section">
                        <h3>Product</h3>
                        <a href="./index.html#features" class="footer-link">Features</a>
                        <a href="./index.html#how-it-works" class="footer-link">How It Works</a>
                        <a href="https://go.hugobatista.com/gh/intellireading-calibre-plugins" class="footer-link">Calibre Plugins</a>
                    </div>
                    
                    <div class="footer-section">
                        <h3>Support</h3>
                        <a href="./terms.html" class="footer-link">Terms of Service</a>
                        <div class="footer-contact">
                            <svg class="footer-icon" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                            </svg>
                            intellireading at hugobatista.com
                        </div>
                    </div>
                    
                    <div class="footer-section">
                        <h3>Connect</h3>
                        <a href="https://go.hugobatista.com/x" class="footer-link footer-link-icon">
                            <svg class="footer-icon" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                            </svg>
                            X (Twitter)
                        </a>
                        <a href="https://go.hugobatista.com/gh" class="footer-link footer-link-icon">
                            <svg class="footer-icon" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
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
    `;
}


// Detect page type and load appropriate components
function loadComponents() {
    const currentPage = window.location.pathname.split('/').pop();
    
    // Load header
    const headerElement = document.getElementById('header-placeholder');
    if (headerElement) {
        headerElement.innerHTML = createModernHeader();
    }
    
    // Load footer
    const footerElement = document.getElementById('footer-placeholder');
    if (footerElement) {
        footerElement.innerHTML = createModernFooter();
    }
    
}

// Theme toggle functionality
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    
    if (!themeToggle) return;
    
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (systemDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    // Theme toggle click handler
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });
}

// Mobile menu functionality
function initMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (!mobileMenuToggle || !navLinks) return;
    
    mobileMenuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
    });
}

// Initialize shared functionality
document.addEventListener('DOMContentLoaded', () => {
    loadComponents();
    // Small delay to ensure components are loaded before initializing
    setTimeout(() => {
        initThemeToggle();
        initMobileMenu();
    }, 50);
});

// Export for modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initThemeToggle };
}
