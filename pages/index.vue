<script setup lang="ts">
const { t, lang } = useI18n()
const checkoutStatus = ref('')
const heroBgIndex = ref(0)
let heroBgTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  heroBgTimer = setInterval(() => { heroBgIndex.value = (heroBgIndex.value + 1) % ((hero as any[]).length || 2) }, 5000)
  const params = new URLSearchParams(window.location.search)
  if (params.get('checkout') === 'success') checkoutStatus.value = 'success'
  else if (params.get('checkout') === 'cancelled') checkoutStatus.value = 'cancelled'
})
onUnmounted(() => { if (heroBgTimer) clearInterval(heroBgTimer) })
function getImageUrl(image: string, size?: string): string {
  if (!image) return '/uploads/placeholder.png'
  const base = `/uploads/${image.replace(/^.*[\\/]/, '')}`
  if (size === 'small') return base.replace(/\.webp$/i, '_small.webp')
  return base
}
const { data: hero } = await useFetch('/api/data/hero', { default: () => [] })
const { data: products } = await useFetch('/api/data/products', { default: () => [] })
const { data: blogs } = await useFetch('/api/data/blog', { default: () => [] })
const toastMsg = ref(''); const toastType = ref('success')
function showToast(d: { message: string; type: string }) { toastMsg.value = d.message; toastType.value = d.type }
useHead({ title: 'LAFA — Tang-Song Flavors' })
</script>

<template>
  <div>
    <div v-if="checkoutStatus === 'success'" class="fixed top-36 right-4 z-[300] bg-green-500/20 backdrop-blur-xl border border-green-500/30 text-green-400 px-5 py-3 rounded-2xl text-sm font-medium" style="animation: fadeUp 0.3s ease-out;" @click="checkoutStatus = ''">
      Payment successful! <span class="ml-2 cursor-pointer">&times;</span>
    </div>

    <!-- Hero — 产品图轮播 -->
    <section class="hero-section">
      <div class="hero-bg-carousel">
        <div v-for="(item, i) in ((hero as any[]) || []).slice(0, 5)" :key="item.id" class="hero-bg-slide" :class="{ active: heroBgIndex === i }">
          <picture>
            <source :srcset="getImageUrl(item.image, 'small')" media="(max-width: 768px)" type="image/webp">
            <img :src="getImageUrl(item.image)" :alt="item.title" @error="(e: any) => e.target.src = '/uploads/placeholder.png'">
          </picture>
        </div>
      </div>
      <div v-if="(hero as any[]).length > 1" class="hero-dots">
        <button v-for="(_, i) in (hero as any[])" :key="i"
          class="hero-dot" :class="{ active: heroBgIndex === i }"
          @click.stop="heroBgIndex = i"></button>
      </div>
    </section>

    <!-- 品牌故事 -->
    <section id="story" class="section border-t border-border">
      <div class="max-w-[780px] mx-auto text-center">
        <p class="story-line">
          <template v-if="lang === 'zh'">游子无疆，一生要强，不低眉，不退让，扛下孤独，吞尽风浪</template>
          <template v-else>Wander far, stand firm; never bow or yield, bear solitude, weather every storm</template>
        </p>
        <p class="story-line">
          <template v-if="lang === 'zh'">雾化万千，故土深情，精神归处，独缺一份<span class="text-gold">专属偏爱</span></template>
          <template v-else>Amid mist and longing for home, one's heart lacks <span class="text-gold">true devotion</span></template>
        </p>
        <p class="story-declare">
          <template v-if="lang === 'zh'">LAFA，<span class="text-gold">为此而生</span></template>
          <template v-else>LAFA was made to <span class="text-gold">fill that void</span></template>
        </p>
        <div class="story-divider"></div>
        <p class="story-line">
          <template v-if="lang === 'zh'">以故土匠心，永不妥协，雕琢每一口<span class="text-gold">温润</span></template>
          <template v-else>Crafted with homeland grit and uncompromising standards, every sip is <span class="text-gold">smooth</span></template>
        </p>
        <p class="story-line">
          <template v-if="lang === 'zh'">昼夜奔波的疲惫，灯火阑珊的落寞，一口熟悉的风味，消解劳顿；一缕故土气息，抚慰万里乡愁</template>
          <template v-else>Tired from endless journeys, lost in lonely nights: a familiar taste eases fatigue; a whiff of home heals homesickness</template>
        </p>
        <p class="story-declare">
          <template v-if="lang === 'zh'">LAFA，不止是品质的执念，更是<span class="text-gold">灵魂的共鸣</span></template>
          <template v-else>LAFA stands for fine craftsmanship and <span class="text-gold">spiritual kinship</span></template>
        </p>
        <div class="story-divider"></div>
        <p class="story-tagline">
          <template v-if="lang === 'zh'">让每一位奔赴山海的勇敢华人，终有一口......<span class="text-gold">故土的质感，不灭的偏爱</span></template>
          <template v-else>For every overseas Chinese chasing dreams across the globe, it brings <span class="text-gold">authentic hometown flavor and lifelong fondness</span></template>
        </p>
        <p class="story-close">
          <template v-if="lang === 'zh'">LAFA，<span class="text-gold">懂你的坚守</span>，<span class="text-gold">敬你的要强</span>，<span class="text-gold">予你的滚烫</span></template>
          <template v-else>LAFA <span class="text-gold">sees your perseverance</span>, <span class="text-gold">respects your grit</span>, and <span class="text-gold">warms your soul</span></template>
        </p>
      </div>
    </section>

    <!-- Products -->
    <section id="products" class="section section-alt">
      <div class="max-w-[1200px] mx-auto">
        <h2 class="sec-label">{{ t('sec.products') }}</h2>
        <div class="card-grid">
          <ProductCard v-for="item in products" :key="item.id" :item="item" />
        </div>
      </div>
    </section>

    <!-- Blog -->
    <!-- Blog -->
    <section id="blog" class="section">
      <div class="max-w-[1200px] mx-auto">
        <h2 class="sec-label">{{ t('sec.journal') }}</h2>
        <div class="card-grid">
          <BlogCard v-for="item in (blogs as any[])" :key="item.id" :item="item" />
        </div>
      </div>
    </section>

    <!-- Contact -->
    <section id="contact" class="section border-t border-border">
      <div class="max-w-[1200px] mx-auto text-center">
        <h2 class="sec-label">{{ t('sec.contact') }}</h2>
        <ContactForm @toast="showToast" />
      </div>
    </section>
    <ToastNotification :message="toastMsg" :type="toastType" />
  </div>
</template>
