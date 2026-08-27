<script setup lang="ts">
const { t, lang } = useI18n()
useHead({ title: 'FAQ — LAFA' })

const faqs = [
  {
    q: { zh: '我是店主 / 小批发商，怎么开始进货？', en: 'I run a shop / small wholesale — how do I start?' },
    a: { zh: '在批发页面填写询价表单，或直接 WhatsApp 联系我们，我们会在 24 小时内回复报价。', en: 'Submit the inquiry form on the Wholesale page, or message us on WhatsApp — we reply with a quote within 24 hours.' },
  },
  {
    q: { zh: '起订量（MOQ）多少？能先拿样品吗？', en: 'What is the MOQ? Can I order samples first?' },
    a: { zh: '我们支持低起订量试单，也支持样品单，先试后批，降低首批压力。', en: 'We support low-MOQ trial orders and sample orders — try before bulk, low first-order pressure.' },
  },
  {
    q: { zh: '能混批吗？一个订单多种口味？', en: 'Can I mix flavors in one order?' },
    a: { zh: '可以。支持混批拼柜，一个订单多种口味，帮你降低库存压力。', en: 'Yes. We support mixed-SKU orders — multiple flavors in one order to cut your inventory risk.' },
  },
  {
    q: { zh: '美国发货要多久？', en: 'How fast is US delivery?' },
    a: { zh: '美国本土仓现货，2-4 天到货，方便快速补货；中东迪拜仓覆盖全球发货。', en: 'US domestic stock ships in 2-4 days for fast restocking, plus a Dubai hub for worldwide shipping.' },
  },
  {
    q: { zh: '怎么付款？', en: 'How do I pay?' },
    a: { zh: '我们支持美国与中东的收款通道，付款无障碍，具体方式下单时私聊确认。', en: 'We support US and Middle East payment channels — details confirmed one-on-one when you order.' },
  },
  {
    q: { zh: '提供哪些合规文件？', en: 'What compliance documents do you provide?' },
    a: { zh: '每批货随附 MSDS（材料安全数据表）、UN38.3（电池运输测试报告）和 COA（成分分析证书）。', en: 'Every shipment includes MSDS, UN38.3 battery transport reports, and COA certificates of analysis.' },
  },
  {
    q: { zh: '进口合规与清关由谁负责？', en: 'Who handles import compliance and customs?' },
    a: { zh: '进口合规与清关由当地进口商负责。我们提供全套合规文件以协助清关。', en: 'Import compliance and customs clearance are the responsibility of the local importer. We provide the documentation to assist.' },
  },
  {
    q: { zh: '如何验证产品真伪？', en: 'How do I verify product authenticity?' },
    a: { zh: '每件 LAFA 产品都有唯一防伪码。访问 /verify 页面输入防伪码即可查询。', en: 'Every LAFA product has a unique anti-counterfeit code. Visit /verify and enter your code.' },
  },
]

const openFaq = ref<number | null>(null)
function toggleFaq(i: number) { openFaq.value = openFaq.value === i ? null : i }

// FAQPage schema for Google rich results (People Also Ask) — English canonical content
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f: any) => ({
    '@type': 'Question',
    name: f.q.en,
    acceptedAnswer: { '@type': 'Answer', text: f.a.en },
  })),
}

useHead({
  title: 'FAQ — LAFA',
  meta: [
    { name: 'description', content: 'Answers for vape shop owners and small wholesalers: MOQ, samples, mixed-SKU orders, US delivery, payment, documents, and import responsibility.' },
  ],
  script: [{ type: 'application/ld+json', innerHTML: JSON.stringify(faqSchema) }],
})
</script>

<template>
  <section class="section section-alt pt-20">
    <div class="max-w-[640px] mx-auto">
      <h1 class="sec-label">{{ lang === 'zh' ? '常见问题' : 'FAQ' }}</h1>

      <div class="space-y-3">
        <div v-for="(faq, i) in faqs" :key="i"
          class="bg-[#0a0a0a] rounded-2xl border border-border overflow-hidden transition-all"
          :class="openFaq === i ? 'border-gold/30' : ''">
          <button class="w-full flex items-center justify-between p-5 text-left"
            @click="toggleFaq(i)">
            <span class="text-[0.9375rem] font-medium text-text-primary pr-4">{{ lang === 'zh' ? faq.q.zh : faq.q.en }}</span>
            <span class="text-text-tertiary text-lg flex-shrink-0 transition-transform duration-200"
              :style="openFaq === i ? 'transform: rotate(45deg)' : ''">+</span>
          </button>
          <div v-if="openFaq === i" class="px-5 pb-5 text-[0.875rem] text-text-secondary leading-relaxed"
            style="animation: fadeUp 0.2s ease-out;">
            {{ lang === 'zh' ? faq.a.zh : faq.a.en }}
          </div>
        </div>
      </div>

      <div class="text-center mt-12">
        <NuxtLink to="/#contact" class="btn btn-outline">{{ lang === 'zh' ? '联系我们' : 'Contact Us' }}</NuxtLink>
      </div>
    </div>
  </section>
</template>
