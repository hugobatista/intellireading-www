<template>
  <div>
    <HeaderNav />
    <main>
      <router-view />
    </main>
    <FooterSection />
  </div>
</template>

<script setup>
import HeaderNav from './components/HeaderNav.vue'
import FooterSection from './components/FooterSection.vue'
</script>
