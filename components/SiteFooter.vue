<script setup lang="ts">
const { t, lang } = useI18n()
</script>

<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <span class="footer-copy">&copy; {{ new Date().getFullYear() }} LAFA</span>
      <div class="footer-links">
        <NuxtLink to="/verify" class="footer-link">{{ t('nav.verify') }}</NuxtLink>
        <NuxtLink to="/faq" class="footer-link">{{ t('nav.support') }}</NuxtLink>
        <span class="footer-link">{{ lang === 'zh' ? '仅限21岁以上' : '21+ Only' }}</span>
      </div>
    </div>
  </footer>
</template>
