<script setup lang="ts">
const { t, lang } = useI18n()
</script>

<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <span class="footer-copy">&copy; {{ new Date().getFullYear() }} LAFA</span>
      <div class="footer-links">
        <NuxtLink to="/wholesale" class="footer-link">{{ t('nav.wholesale') }}</NuxtLink>
        <NuxtLink to="/verify" class="footer-link">{{ t('nav.verify') }}</NuxtLink>
        <NuxtLink to="/faq" class="footer-link">{{ t('nav.support') }}</NuxtLink>
        <NuxtLink to="/terms" class="footer-link">{{ t('footer.terms') }}</NuxtLink>
        <NuxtLink to="/privacy" class="footer-link">{{ t('footer.privacy') }}</NuxtLink>
        <NuxtLink to="/compliance" class="footer-link">{{ t('footer.compliance') }}</NuxtLink>
        <span class="footer-link">{{ lang === 'zh' ? '仅限21岁以上' : '21+ Only' }}</span>
      </div>
    </div>
    <p style="text-align:center;font-size:0.6875rem;color:#71717a;padding:0 1rem 1.5rem;margin:0 auto;max-width:720px;line-height:1.6;">{{ t('footer.disclaimer') }}</p>
  </footer>
</template>
