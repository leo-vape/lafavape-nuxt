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
  { to: '/wholesale', label: 'nav.wholesale' },
  { to: '/blog', label: 'nav.journal' },
]
const moreLinks = [
  { to: '/verify', label: 'nav.verify' },
  { to: '/faq', label: 'nav.support' },
]
const allLinks = [...mainLinks, ...moreLinks]
</script>

<template>
  <div class="lafa-warning-bar">
    <p class="lafa-warning-text">WARNING: This product contains nicotine. Nicotine is an addictive chemical.</p>
  </div>

  <header class="lafa-header">
    <div class="lafa-header-inner">
      <NuxtLink to="/" class="lafa-logo"></NuxtLink>
      <nav class="lafa-nav-links">
        <NuxtLink v-for="link in mainLinks" :key="link.to" :to="link.to" class="lafa-nav-link" :class="{ active: isActive(link.to) }">
          {{ t(link.label) }}
        </NuxtLink>
        <div class="lafa-dropdown" @mouseenter="moreOpen = true" @mouseleave="moreOpen = false">
          <span class="lafa-nav-link lafa-more-trigger">{{ t('nav.more') }}</span>
          <div v-if="moreOpen" class="lafa-dropdown-menu">
            <NuxtLink v-for="link in moreLinks" :key="link.to" :to="link.to" class="lafa-dropdown-link">
              {{ t(link.label) }}
            </NuxtLink>
          </div>
        </div>
      </nav>
      <div class="lafa-header-actions">
        <button class="lafa-lang-btn" @click="toggleLang">
          {{ lang === 'zh' ? '中文' : 'EN' }}
        </button>
        <button class="lafa-hamburger" @click="isMenuOpen = !isMenuOpen" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="isMenuOpen" class="lafa-mobile-menu" @click="isMenuOpen = false">
        <div class="lafa-mobile-menu-content" @click.stop>
          <NuxtLink v-for="link in allLinks" :key="link.to" :to="link.to"
            class="lafa-mobile-link" @click="isMenuOpen = false">
            {{ t(link.label) }}
          </NuxtLink>
        </div>
      </div>
    </Teleport>
  </header>
</template>
