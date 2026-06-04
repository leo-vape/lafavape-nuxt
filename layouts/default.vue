<script setup lang="ts">
const { lang } = useI18n()
const isAgeVerified = ref(true)
const showAgeGate = ref(false)
const ageVerificationMessage = ref('')
const rememberAge = ref(true)

// Age gate: check on all pages, 30-day cookie
onMounted(() => {
  const v = localStorage.getItem('ageVerified')
  const expiry = localStorage.getItem('ageVerifiedExpiry')
  if (v === 'true' && expiry && Date.now() < parseInt(expiry)) {
    showAgeGate.value = false; isAgeVerified.value = true
  } else {
    localStorage.removeItem('ageVerified')
    localStorage.removeItem('ageVerifiedExpiry')
    showAgeGate.value = true; isAgeVerified.value = false
  }
})

function confirmAge() {
  if (rememberAge.value) {
    localStorage.setItem('ageVerified', 'true')
    localStorage.setItem('ageVerifiedExpiry', String(Date.now() + 30 * 24 * 60 * 60 * 1000))
  }
  showAgeGate.value = false
  isAgeVerified.value = true
}

function denyAge() {
  showAgeGate.value = false
  isAgeVerified.value = false
  ageVerificationMessage.value = lang.value === 'zh'
    ? '抱歉，您必须年满21岁才能访问本网站。'
    : 'Sorry, you must be 21 or older.'
  // Redirect away after short delay
  setTimeout(() => { window.location.href = 'https://www.google.com' }, 3000)
}
</script>

<template>
  <div>
    <!-- Age Gate — RELX 风格 -->
    <ClientOnly>
      <div v-if="showAgeGate" class="fixed inset-0 z-[100] flex items-end md:items-center justify-center"
        style="background: rgba(0,0,0,0.85);">
        <div class="w-full max-w-[440px] mx-4 mb-0 md:mb-0 bg-[#0a0a0a] rounded-t-2xl md:rounded-2xl px-6 py-8 md:p-10 text-center border border-border md:border-border"
          style="animation: gateSlideUp 0.4s ease-out;">
          <!-- Warning -->
          <p class="text-[0.8125rem] font-medium text-text-secondary leading-relaxed mb-6">
            ⚠️ {{ lang === 'zh'
              ? '本产品含有尼古丁。尼古丁是一种成瘾性化学物质。'
              : 'WARNING: This product contains nicotine. Nicotine is an addictive chemical.' }}
          </p>
          <p class="text-[0.9375rem] text-text-secondary mb-8">
            {{ lang === 'zh' ? '请确认您已年满21岁' : 'Please verify your age' }}
          </p>

          <!-- Remember checkbox -->
          <label class="flex items-center justify-center gap-2 mb-4 cursor-pointer">
            <input type="checkbox" v-model="rememberAge" class="w-4 h-4 accent-gold">
            <span class="text-xs text-text-tertiary">{{ lang === 'zh' ? '30天内不再提示' : 'Remember for 30 days' }}</span>
          </label>

          <!-- Buttons — RELX style -->
          <button class="w-full py-3.5 rounded-full text-[0.9375rem] font-semibold bg-white text-black mb-3 transition-opacity hover:opacity-90"
            @click="confirmAge">
            {{ lang === 'zh' ? '我年满21岁' : 'I AM 21+' }}
          </button>
          <a href="https://www.google.com"
            class="block w-full py-3 rounded-full text-[0.8125rem] font-medium text-text-secondary border border-border transition-colors hover:text-text-primary hover:border-border-active"
            @click.prevent="denyAge">
            {{ lang === 'zh' ? '未满21岁，离开' : 'I AM NOT YET 21' }}
          </a>

          <p class="text-[0.6875rem] text-text-tertiary mt-6">
            {{ lang === 'zh' ? '请理性使用，未成年人禁止使用。' : 'Please vape responsibly. Not for sale to minors.' }}
          </p>
        </div>
      </div>
    </ClientOnly>

    <!-- Denied state -->
    <ClientOnly>
      <div v-if="!isAgeVerified && !showAgeGate" class="fixed inset-0 z-[100] flex items-center justify-center p-5"
        style="background: rgba(0,0,0,0.94);">
        <div class="bg-[#0a0a0a] rounded-2xl p-8 max-w-[400px] w-full text-center border border-border">
          <h2 class="text-lg font-semibold text-text-primary mb-2">{{ lang === 'zh' ? '访问受限' : 'Access Denied' }}</h2>
          <p class="text-[0.8125rem] text-text-secondary">{{ ageVerificationMessage }}</p>
        </div>
      </div>
    </ClientOnly>

    <template v-if="isAgeVerified">
      <NavHeader />
      <main class="main-content"><slot /></main>
      <SiteFooter />
      <ClientOnly>
        <ChatWidget />
        <SocialProof />
      </ClientOnly>
    </template>
  </div>
</template>
