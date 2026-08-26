<script setup lang="ts">
const { t, lang } = useI18n()
useHead({ title: 'FAQ — LAFA' })

const faqs = [
  {
    q: { zh: '如何开始批发合作？', en: 'How do I start a wholesale partnership?' },
    a: { zh: '在批发页面填写询价表单，或直接通过 WhatsApp 联系我们，我们会在 24 小时内回复报价。', en: 'Submit the inquiry form on the Wholesale page, or message us on WhatsApp — we reply with a quote within 24 hours.' },
  },
  {
    q: { zh: '起订量（MOQ）和价格？', en: 'What is your MOQ and pricing?' },
    a: { zh: '我们支持低起订量试单。价格因产品与采购量而异，请联系我们获取阶梯报价。', en: 'We support low-MOQ trial orders. Pricing varies by product and volume — contact us for tiered quotes.' },
  },
  {
    q: { zh: '可以从美国境内发货吗？', en: 'Do you ship from within the US?' },
    a: { zh: '可以。我们在美国有本土仓，2-4 天到货；同时在中东迪拜设有全球仓，覆盖全球发货。', en: 'Yes. We hold US domestic stock with 2-4 day delivery, plus a Dubai hub for worldwide shipping.' },
  },
  {
    q: { zh: '提供哪些合规文件？', en: 'What compliance documents do you provide?' },
    a: { zh: '每批货随附 MSDS（材料安全数据表）、UN38.3（电池运输测试报告）和 COA（成分分析证书）。', en: 'Every shipment includes MSDS, UN38.3 battery transport reports, and COA certificates of analysis.' },
  },
  {
    q: { zh: '如何验证产品真伪？', en: 'How do I verify product authenticity?' },
    a: { zh: '每件 LAFA 产品都有唯一防伪码。访问 /verify 页面输入防伪码即可查询。', en: 'Every LAFA product has a unique anti-counterfeit code. Visit /verify and enter your code.' },
  },
  {
    q: { zh: '进口合规与清关由谁负责？', en: 'Who handles import compliance and customs?' },
    a: { zh: '进口合规与清关由当地进口商负责。我们提供全套合规文件以协助清关。', en: 'Import compliance and customs clearance are the responsibility of the local importer. We provide the documentation to assist.' },
  },
  {
    q: { zh: 'LAFA 产品的尼古丁含量？', en: 'What nicotine strengths are available?' },
    a: { zh: '我们提供 2%、3% 和 5% 尼古丁浓度的产品。', en: 'We offer 2%, 3%, and 5% nicotine strengths.' },
  },
]

const openFaq = ref<number | null>(null)
function toggleFaq(i: number) { openFaq.value = openFaq.value === i ? null : i }
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
