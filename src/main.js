import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import HomeView from './views/HomeView.vue'
import TermsView from './views/TermsView.vue'
import './assets/shared.css'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/terms', name: 'terms', component: TermsView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0 }
  },
})

createApp(App).use(router).mount('#app')
