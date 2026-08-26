<script setup lang="ts">
const { t, lang } = useI18n()

const settings = ref<any>({})
onMounted(async () => {
  try {
    const r = await fetch('/api/data/settings')
    settings.value = await r.json()
  } catch {}
})

const waLink = computed(() => {
  const num = String(settings.value.whatsapp || '').replace(/[^\d]/g, '')
  if (!num) return ''
  return `https://wa.me/${num}?text=${encodeURIComponent('Hi, I want to discuss wholesale partnership')}`
})

const form = reactive({
  company: '',
  country: '',
  contact: '',
  interest: '',
  quantity: '',
})
const submitting = ref(false)
const submitted = ref(false)

async function submitInquiry() {
  if (!form.company || !form.contact) return
  submitting.value = true
  try {
    await fetch('/api/wholesale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    submitted.value = true
  } catch {} finally {
    submitting.value = false
  }
}

const perks = computed(() => [
  { title: t('wholesale.usTitle'), desc: t('wholesale.usDesc'), icon: '🇺🇸' },
  { title: t('wholesale.moqTitle'), desc: t('wholesale.moqDesc'), icon: '📦' },
  { title: t('wholesale.mixedTitle'), desc: t('wholesale.mixedDesc'), icon: '🧬' },
  { title: t('wholesale.meTitle'), desc: t('wholesale.meDesc'), icon: '🌍' },
  { title: t('wholesale.payTitle'), desc: t('wholesale.payDesc'), icon: '💳' },
  { title: t('wholesale.complianceTitle'), desc: t('wholesale.complianceDesc'), icon: '📄' },
])

useHead({ title: lang.value === 'zh' ? '批发合作 — LAFA' : 'Wholesale — LAFA' })
</script>

<template>
  <section class="section section-alt pt-20">
    <div class="max-w-[900px] mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <span class="section-eyebrow">{{ t('wholesale.eyebrow') }}</span>
        <h1 class="section-heading text-4xl md:text-5xl mb-4">{{ t('wholesale.title') }}</h1>
        <p class="section-subheading mx-auto">{{ t('wholesale.subtitle') }}</p>
      </div>

      <!-- Value props -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div v-for="p in perks" :key="p.title" class="bg-[#0a0a0a] rounded-2xl p-6 border border-border text-center">
          <div class="text-3xl mb-3">{{ p.icon }}</div>
          <p class="text-[0.9375rem] font-semibold text-text-primary mb-2">{{ p.title }}</p>
          <p class="text-[0.8125rem] text-text-secondary leading-relaxed">{{ p.desc }}</p>
        </div>
      </div>

      <!-- Compliance documents -->
      <div class="bg-[#0a0a0a] rounded-2xl p-6 md:p-8 border border-border mb-10">
        <p class="text-[0.9375rem] font-semibold text-text-primary mb-2 text-center">📄 {{ t('wholesale.complianceTitle') }}</p>
        <p class="text-[0.8125rem] text-text-secondary text-center mb-6">{{ t('wholesale.complianceDesc') }}</p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="rounded-xl border border-border p-4 text-center">
            <p class="text-[0.875rem] font-semibold text-text-primary">{{ t('wholesale.complianceMsds') }}</p>
          </div>
          <div class="rounded-xl border border-border p-4 text-center">
            <p class="text-[0.875rem] font-semibold text-text-primary">{{ t('wholesale.complianceUn38') }}</p>
          </div>
          <div class="rounded-xl border border-border p-4 text-center">
            <p class="text-[0.875rem] font-semibold text-text-primary">{{ t('wholesale.complianceCoa') }}</p>
          </div>
        </div>
        <p class="text-[0.75rem] text-text-tertiary text-center mt-6">{{ t('wholesale.complianceNote') }}</p>
      </div>

      <!-- WhatsApp CTA -->
      <div class="text-center mb-12">
        <a v-if="waLink" :href="waLink" target="_blank" rel="noopener" class="buy-btn-wa max-w-[420px] mx-auto">
          💬 {{ t('wholesale.whatsappCta') }}
        </a>
        <p class="text-[0.8125rem] text-text-tertiary mt-3">{{ t('wholesale.samples') }}</p>
      </div>

      <!-- Lead form -->
      <div class="bg-[#0a0a0a] rounded-2xl p-6 md:p-8 border border-border max-w-[560px] mx-auto">
        <p class="text-[0.9375rem] font-semibold text-text-primary mb-6 text-center">{{ t('wholesale.formTitle') }}</p>

        <div v-if="submitted" class="text-center py-8">
          <div class="text-4xl mb-4">✅</div>
          <p class="text-[1rem] font-semibold text-text-primary mb-2">{{ t('wholesale.submitted') }}</p>
        </div>

        <form v-else @submit.prevent="submitInquiry" class="space-y-4">
          <div>
            <label class="form-label">{{ t('wholesale.company') }}</label>
            <input v-model="form.company" type="text" required class="form-input" :placeholder="lang === 'zh' ? '例如：Vape Shop Dubai' : 'e.g. Vape Shop Dubai'" autocomplete="off">
          </div>
          <div>
            <label class="form-label">{{ t('wholesale.country') }}</label>
            <input v-model="form.country" type="text" class="form-input" :placeholder="lang === 'zh' ? '例如：美国 / 阿联酋' : 'e.g. USA / UAE'" autocomplete="off">
          </div>
          <div>
            <label class="form-label">{{ t('wholesale.contact') }}</label>
            <input v-model="form.contact" type="text" required class="form-input" :placeholder="lang === 'zh' ? '你的 WhatsApp / 邮箱 / 微信' : 'Your WhatsApp / Email / WeChat'" autocomplete="off">
          </div>
          <div>
            <label class="form-label">{{ t('wholesale.interest') }}</label>
            <input v-model="form.interest" type="text" class="form-input" :placeholder="lang === 'zh' ? '设备 / 烟弹 / 口味' : 'Device / Pods / Flavors'" autocomplete="off">
          </div>
          <div>
            <label class="form-label">{{ t('wholesale.quantity') }}</label>
            <input v-model="form.quantity" type="text" class="form-input" :placeholder="lang === 'zh' ? '例如：首批 500 盒' : 'e.g. First order 500 units'" autocomplete="off">
          </div>
          <button type="submit" class="btn btn-filled w-full" :disabled="submitting">
            {{ submitting ? '...' : t('wholesale.submit') }}
          </button>
        </form>
      </div>
    </div>
  </section>
</template>
