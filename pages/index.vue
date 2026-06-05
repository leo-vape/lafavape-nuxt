<script setup lang="ts">
const { t, lang } = useI18n()
const checkoutStatus = ref('')
const bgIndex = ref(0)
const textIndex = ref(0)
const textKey = ref(0)
let bgTimer: ReturnType<typeof setInterval> | null = null
let textTimer: ReturnType<typeof setInterval> | null = null

const storyLines = computed(() => {
  const zh = lang.value === 'zh'
  return zh ? [
    '<span class="text-gold">游子无疆</span>，一生要强，不低眉，不退让，扛下孤独，吞尽风浪',
    '<span class="text-gold">雾化万千</span>，故土深情，精神归处，独缺一份<span class="text-gold">专属偏爱</span>',
    '<span class="text-gold">LAFA</span>，为此而生',
    '以故土匠心，永不妥协，雕琢每一口<span class="text-gold">温润</span>',
    '昼夜奔波的疲惫，灯火阑珊的落寞，<span class="text-gold">一口熟悉的风味</span>，消解劳顿；<span class="text-gold">一缕故土气息</span>，抚慰万里乡愁',
    '<span class="text-gold">LAFA</span>，<span class="text-gold">不止是品质的执念</span>，更是灵魂的共鸣',
    '<span class="text-gold">LAFA</span>，让每一位奔赴山海的勇敢华人，终有一口......<span class="text-gold">故土的质感，不灭的偏爱</span>',
    '<span class="text-gold">LAFA</span>，<span class="text-gold">懂你的坚守</span>，<span class="text-gold">敬你的要强</span>，<span class="text-gold">予你的滚烫</span>',
  ] : [
    '<span class="text-gold">Wander far</span>, stand firm; never bow or yield, bear solitude, weather every storm',
    'Amid mist and longing for home, one&rsquo;s heart craves <span class="text-gold">exclusive devotion</span>&mdash;',
    '<span class="text-gold">LAFA</span> was made to fill that void',
    'Crafted with homeland grit and uncompromising standards, every sip is <span class="text-gold">smooth</span>',
    'Tired from endless journeys, lost in lonely nights: <span class="text-gold">A familiar taste</span> eases fatigue; <span class="text-gold">a whiff of home</span> heals homesickness',
    '<span class="text-gold">LAFA</span> stands for <span class="text-gold">fine craftsmanship</span> and spiritual kinship',
    'For every overseas Chinese chasing dreams across the globe, it brings <span class="text-gold">authentic hometown flavor and lifelong fondness</span>',
    '<span class="text-gold">LAFA</span> <span class="text-gold">sees your perseverance</span>, <span class="text-gold">respects your grit</span>, and <span class="text-gold">warms your soul</span>',
  ]
})

const heroFont = computed(() => lang.value === 'zh' ? "'Long Cang', 'PingFang SC', cursive" : "'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif")

onMounted(() => {
  const heroCount = ((hero.value as any[]) || []).length || 1
  bgTimer = setInterval(() => { bgIndex.value = (bgIndex.value + 1) % heroCount }, 4000)

  textTimer = setInterval(() => {
    textIndex.value = (textIndex.value + 1) % storyLines.value.length
    textKey.value++ // trigger re-mount for animation
  }, 2600)

  const params = new URLSearchParams(window.location.search)
  if (params.get('checkout') === 'success') checkoutStatus.value = 'success'
  else if (params.get('checkout') === 'cancelled') checkoutStatus.value = 'cancelled'
})
onUnmounted(() => { if (bgTimer) clearInterval(bgTimer); if (textTimer) clearInterval(textTimer) })
function getImageUrl(image: string, size?: string): string {
  if (!image) return '/uploads/placeholder.png'
  const base = `/uploads/${image.replace(/^.*[\\/]/, '')}`
  if (size === 'small') return base.replace(/\.webp$/i, '_small.webp')
  return base
}
const { data: hero } = await useFetch('/api/data/hero', { default: () => [] })
const { data: products } = await useAsyncData('products-home', () => $fetch('/api/data/products'), { default: () => [] })
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

    <!-- Hero — 轮播图背景 + 故事文字上层 -->
    <section class="hero-section">
      <!-- Background: image carousel -->
      <div class="hero-bg-carousel">
        <div v-for="(item, i) in ((hero as any[]) || []).slice(0, 5)" :key="item.id" class="hero-bg-slide" :class="{ active: bgIndex === i }">
          <picture>
            <source :srcset="getImageUrl(item.image, 'small')" media="(max-width: 768px)" type="image/webp">
            <img :src="getImageUrl(item.image)" :alt="item.title" @error="(e: any) => e.target.src = '/uploads/placeholder.png'">
          </picture>
        </div>
      </div>

      <!-- Overlay -->
      <div class="absolute inset-0 z-[1]"></div>

      <!-- Story text on top -->
      <div class="absolute inset-0 z-[2] flex items-center justify-center text-center px-6 sm:px-12">
        <p :key="textKey"
          class="hero-shockwave text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-relaxed tracking-wider max-w-[700px]" style="text-shadow: 0 0 8px rgba(255,255,255,0.4), 0 0 30px rgba(184,148,31,0.35), 0 0 60px rgba(184,148,31,0.2), 0 2px 4px rgba(0,0,0,0.8);"
          :style="{ animation: 'heroScaleIn 2.6s cubic-bezier(0.1,0.8,0.2,1) both', fontFamily: heroFont }"
          v-html="storyLines[textIndex]">
        </p>
      </div>

      <!-- Dots -->
      <div v-if="(hero as any[]).length > 1" class="hero-dots">
        <button v-for="(_, i) in (hero as any[])" :key="i"
          class="hero-dot" :class="{ active: bgIndex === i }"
          @click.stop="bgIndex = i"></button>
      </div>
    </section>

    <!-- Products -->
    <section id="products" class="section section-alt">
      <div class="max-w-[1400px] mx-auto">
        <h2 class="sec-label">{{ t('sec.products') }}</h2>
        <div class="card-grid">
          <ProductCard v-for="item in products" :key="item.id" :item="item" />
        </div>
      </div>
    </section>

    <!-- Blog -->
    <!-- Blog -->
    <section id="blog" class="section">
      <div class="max-w-[1400px] mx-auto">
        <h2 class="sec-label">{{ t('sec.journal') }}</h2>
        <div class="card-grid">
          <BlogCard v-for="item in (blogs as any[])" :key="item.id" :item="item" />
        </div>
      </div>
    </section>

    <!-- Contact -->
    <section id="contact" class="section border-t border-border" style="min-height: auto; justify-content: flex-start; padding-top: 5rem; padding-bottom: 5rem;">
      <div class="max-w-[1400px] mx-auto text-center">
        <h2 class="sec-label">{{ t('sec.contact') }}</h2>
        <ContactForm @toast="showToast" />
      </div>
    </section>
    <ToastNotification :message="toastMsg" :type="toastType" />
  </div>
</template>
