<script setup lang="ts">
const { t, lang } = useI18n()
useHead({ title: 'FAQ — LAFA' })

const faqs = [
  {
    q: { zh: '如何下单购买？', en: 'How do I place an order?' },
    a: { zh: '浏览产品页面，选择您喜欢的口味后点击「Buy Now」按钮，系统将引导您通过 Stripe 安全支付。', en: 'Browse our products, choose your flavor, and click "Buy Now". You\'ll be guided through secure Stripe payment.' },
  },
  {
    q: { zh: '支持哪些支付方式？', en: 'What payment methods are accepted?' },
    a: { zh: '我们通过 Stripe 支持 Visa、Mastercard、American Express 等主流信用卡和借记卡。', en: 'We accept Visa, Mastercard, American Express, and most major credit/debit cards via Stripe.' },
  },
  {
    q: { zh: '如何验证产品真伪？', en: 'How do I verify product authenticity?' },
    a: { zh: '每件 LAFA 产品都有唯一防伪码。访问 /verify 页面输入防伪码即可查询。', en: 'Every LAFA product has a unique anti-counterfeit code. Visit /verify and enter your code.' },
  },
  {
    q: { zh: '配送范围和时间？', en: 'Shipping zones and times?' },
    a: { zh: '我们配送美国、加拿大、英国、欧盟及亚洲主要国家。标准配送 5-10 个工作日，加急 2-4 个工作日。', en: 'We ship to US, Canada, UK, EU, and major Asian countries. Standard shipping: 5-10 business days. Express: 2-4 days.' },
  },
  {
    q: { zh: '退换货政策？', en: 'What is your return policy?' },
    a: { zh: '未开封产品可在收货后 14 天内申请退换。请联系客服邮箱 hello@lafavape.com。', en: 'Unopened products can be returned within 14 days of delivery. Contact hello@lafavape.com.' },
  },
  {
    q: { zh: 'LAFA 产品的尼古丁含量？', en: 'What nicotine strengths are available?' },
    a: { zh: '我们提供 2%、3% 和 5% 尼古丁浓度的产品，您可在产品页面选择适合的浓度。', en: 'We offer 2%, 3%, and 5% nicotine strengths. Choose your preference on the product page.' },
  },
  {
    q: { zh: '推荐好友有什么奖励？', en: 'What rewards for referring friends?' },
    a: { zh: '通过您的专属推荐链接分享给朋友，朋友访问后您即可解锁阶梯奖励，包括欢迎礼、银质奖励、金质奖励和 VIP 礼盒。', en: 'Share your unique referral link. Earn tiered rewards: Welcome Gift, Silver, Gold, and VIP Gift Box as your referrals grow.' },
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
