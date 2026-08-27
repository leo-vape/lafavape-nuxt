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

// B2B FAQ — also feeds FAQPage JSON-LD for Google rich results (People Also Ask)
const faqs = [
  {
    q: 'What is your minimum order quantity (MOQ)?',
    zh_q: '你们的起订量（MOQ）是多少？',
    a: 'We keep MOQ low so small shops can test before scaling. Sample and trial orders are supported, and you can mix SKUs in a single order.',
    zh_a: '我们保持低起订量，让小店可以先试再批量。支持样品单和试单，单个订单可混批多种 SKU。',
  },
  {
    q: 'Where does my order ship from?',
    zh_q: '订单从哪里发货？',
    a: 'From our US regional warehouse (2-4 day restock for many SKUs), from our Middle East hub, or direct from China depending on your market and quantity.',
    zh_a: '根据市场和数量，可从美国本土仓（多数 SKU 2-4 天补货）、中东仓或中国直发。',
  },
  {
    q: 'Which documents come with each shipment?',
    zh_q: '每批货带什么文件？',
    a: 'MSDS, UN38.3 battery transport report, and COA where available. Import compliance and customs clearance remain the responsibility of the local importer.',
    zh_a: 'MSDS、UN38.3 电池运输报告、以及可用的 COA。进口合规与清关责任归当地进口商。',
  },
  {
    q: 'Can I mix flavors, devices, or even brands in one order?',
    zh_q: '一个订单可以混口味、混设备甚至混品牌吗？',
    a: 'Yes. You can mix LAFA SKUs freely, and we also source popular third-party brands. OEM white-label is available if you want your own line.',
    zh_a: '可以。可自由混配 LAFA 各 SKU，也可代采热门第三方品牌；想要自有品牌还可 OEM 白标。',
  },
  {
    q: 'What payment terms do you offer?',
    zh_q: '支持什么付款方式？',
    a: 'Standard B2B terms are T/T bank transfer with a deposit before dispatch, on EXW or FOB Shenzhen Incoterms. We also handle US and Middle East payment channels.',
    zh_a: '标准 B2B 条款为 T/T 电汇、发货前付定金，EXW 或 FOB 深圳。支持美国和中东收款渠道。',
  },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f: any) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

useHead({
  title: computed(() => lang.value === 'zh' ? '一次性电子烟批发供应商 — LAFA' : 'Disposable Vape Wholesale Supplier — LAFA | Bulk Vapes for Shops'),
  meta: [
    { name: 'description', content: computed(() => lang.value === 'zh'
      ? '电子烟 B2B 批发：低起订量、美国仓现货、可混批、可 OEM 白标。随货提供 MSDS / UN38.3 / COA。进口清关由当地进口商负责。'
      : 'B2B vape wholesale with low MOQ, US-warehouse stock, mixed-SKU orders, and OEM white-label. MSDS / UN38.3 / COA included with shipments. Import compliance is the buyer’s responsibility.') },
    { name: 'keywords', content: 'disposable vape wholesale, vape distributor, bulk vapes, low MOQ vape, OEM disposable vape, vape wholesale US warehouse, mixed SKU vape' },
    { property: 'og:title', content: 'Disposable Vape Wholesale Supplier — LAFA' },
    { property: 'og:description', content: 'Bulk vapes for shops: low MOQ, US warehouse stock, mixed SKU, OEM white-label.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://lafavape.com/wholesale' },
    { property: 'og:image', content: 'https://lafavape.com/uploads/hero1.webp' },
  ],
  script: [{ type: 'application/ld+json', innerHTML: JSON.stringify(faqSchema) }],
})
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

      <!-- Brand flexibility -->
      <div class="bg-[#0a0a0a] rounded-2xl p-6 md:p-8 border border-border mb-10">
        <p class="text-[0.9375rem] font-semibold text-text-primary mb-2 text-center">🔀 {{ t('wholesale.brandTitle') }}</p>
        <p class="text-[0.8125rem] text-text-secondary text-center mb-6">{{ t('wholesale.brandDesc') }}</p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="rounded-xl border border-border p-4 text-center">
            <p class="text-[0.875rem] font-semibold text-text-primary">{{ t('wholesale.brandOwn') }}</p>
            <p class="text-[0.75rem] text-text-secondary mt-1">{{ t('wholesale.brandOwnDesc') }}</p>
          </div>
          <div class="rounded-xl border border-border p-4 text-center">
            <p class="text-[0.875rem] font-semibold text-text-primary">{{ t('wholesale.brandOther') }}</p>
            <p class="text-[0.75rem] text-text-secondary mt-1">{{ t('wholesale.brandOtherDesc') }}</p>
          </div>
          <div class="rounded-xl border border-border p-4 text-center">
            <p class="text-[0.875rem] font-semibold text-text-primary">{{ t('wholesale.brandOem') }}</p>
            <p class="text-[0.75rem] text-text-secondary mt-1">{{ t('wholesale.brandOemDesc') }}</p>
          </div>
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

      <!-- FAQ (B2B) — feeds FAQPage schema -->
      <div class="mt-14 max-w-[680px] mx-auto">
        <h2 class="text-center mb-6 text-[1.15rem] font-semibold">{{ lang === 'zh' ? '批发常见问题' : 'Frequently Asked Questions' }}</h2>
        <div v-for="(f, i) in faqs" :key="i" class="mb-4 p-5 rounded-2xl border border-border bg-[#0a0a0a]">
          <p class="text-[0.9375rem] font-semibold text-text-primary mb-2">{{ lang === 'zh' ? f.zh_q : f.q }}</p>
          <p class="text-[0.8125rem] text-text-secondary leading-relaxed">{{ lang === 'zh' ? f.zh_a : f.a }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
