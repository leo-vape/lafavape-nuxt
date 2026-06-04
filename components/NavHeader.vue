<script setup lang="ts">
const { t, lang, toggleLang } = useI18n()
const isMenuOpen = ref(false)

const route = useRoute()
const moreOpen = ref(false)
function isActive(to: string) {
  if (to === '/#products' && route.path === '/') return true
  if (to.startsWith('/#')) return route.hash === to.slice(2)
  return route.path.startsWith(to)
}
const mainLinks = [
  { to: '/#products', label: 'nav.products' },
  { to: '/blog', label: 'nav.journal' },
]
const moreLinks = [
  { to: '/refer', label: 'nav.refer' },
  { to: '/verify', label: 'nav.verify' },
  { to: '/faq', label: 'nav.support' },
]
const allLinks = [...mainLinks, ...moreLinks]
</script>

<template>
  <div class="relx-warning-bar">
    <p class="relx-warning-text">WARNING: This product contains nicotine. Nicotine is an addictive chemical.</p>
  </div>

  <header class="relx-header">
    <div class="relx-header-inner">
      <NuxtLink to="/" class="relx-logo"></NuxtLink>
      <nav class="relx-nav-links">
        <NuxtLink v-for="link in mainLinks" :key="link.to" :to="link.to" class="relx-nav-link" :class="{ active: isActive(link.to) }">
          {{ t(link.label) }}
        </NuxtLink>
        <div class="relx-dropdown" @mouseenter="moreOpen = true" @mouseleave="moreOpen = false">
          <span class="relx-nav-link relx-more-trigger">{{ t('nav.more') }}</span>
          <div v-if="moreOpen" class="relx-dropdown-menu">
            <NuxtLink v-for="link in moreLinks" :key="link.to" :to="link.to" class="relx-dropdown-link">
              {{ t(link.label) }}
            </NuxtLink>
          </div>
        </div>
      </nav>
      <div class="relx-header-actions">
        <button class="relx-lang-btn" @click="toggleLang">
          {{ lang === 'zh' ? '中文' : 'EN' }}
        </button>
        <button class="relx-hamburger" @click="isMenuOpen = !isMenuOpen" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="isMenuOpen" class="relx-mobile-menu" @click="isMenuOpen = false">
        <div class="relx-mobile-menu-content" @click.stop>
          <NuxtLink v-for="link in allLinks" :key="link.to" :to="link.to"
            class="relx-mobile-link" @click="isMenuOpen = false">
            {{ t(link.label) }}
          </NuxtLink>
        </div>
      </div>
    </Teleport>
  </header>
</template>
