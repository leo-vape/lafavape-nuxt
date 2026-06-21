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

// Carousel: use raw DOM manipulation instead of Vue reactivity for hero slides
// This avoids hydration issues with v-for images
function rotateSlides() {
  const slides = document.querySelectorAll('.hero-bg-slide')
  if (!slides.length) return
  slides.forEach((s, i) => s.classList.toggle('active', i === bgIndex.value))
  bgIndex.value = (bgIndex.value + 1) % slides.length
}

onMounted(() => {
  // Initial active slide
  const slides = document.querySelectorAll('.hero-bg-slide')
  if (slides.length) slides[0].classList.add('active')

  bgTimer = setInterval(rotateSlides, 4000)
  textTimer = setInterval(() => {
    textIndex.value = (textIndex.value + 1) % storyLines.value.length
    textKey.value++
  }, 3000)
  const params = new URLSearchParams(window.location.search)
  if (params.get('checkout') === 'success') checkoutStatus.value = 'success'
  else if (params.get('checkout') === 'cancelled') checkoutStatus.value = 'cancelled'
})
onUnmounted(() => { if (bgTimer) clearInterval(bgTimer); if (textTimer) clearInterval(textTimer) })

function getImageUrl(image: string): string {
  if (!image) return '/uploads/placeholder.png'
  const base = `/uploads/${image.replace(/^.*[\\/]/, '')}`
  return base
}

const { data: hero } = await useFetch('/api/data/hero', { default: () => [] })
const { data: allProducts } = await useFetch('/api/data/products', { default: () => [] })
const { data: blogs } = await useFetch('/api/data/blog', { default: () => [] })

const all = computed(() => (allProducts.value as any[]) || [])
const devices = computed(() => all.value.filter((p: any) => p.type === 'device'))
const pods = computed(() => all.value.filter((p: any) => p.type === 'pod'))
const podGroups = computed(() => {
  const map: Record<string, any[]> = {}
  for (const p of pods.value) {
    const c = p.category || 'Other'
    if (!map[c]) map[c] = []
    map[c].push(p)
  }
  return Object.entries(map).map(([name, items]) => ({ name, items }))
})

// Pre-render cards as static HTML (v-html avoids Vue hydration issues)
function productCardHTML(item: any): string {
  const name = lang.value === 'zh' ? (item.zh || item.name) : item.name
  const img = getImageUrl(item.image)
  const priceHTML = item.price
    ? `<div class="flex items-baseline gap-2 mt-1"><span class="text-sm font-semibold text-white">US $${item.price}</span>${item.comparePrice ? `<span class="text-xs line-through" style="color:#C41E24">$${item.comparePrice}</span>` : ''}</div>`
    : ''
  return `<a href="/product/${item.id}" class="card card-overlay group" ><div class="card-media"><img src="${img}" alt="${name.replace(/"/g, '&quot;')}"></div><div class="card-overlay-text"><h3 class="card-title">${name}</h3>${priceHTML}</div></a>`
}

function blogCardHTML(item: any): string {
  const img = getImageUrl(item.image)
  const isZh = lang.value === 'zh'
  const title = (isZh ? (item.zh_title || item.title) : item.title || '').replace(/"/g, '&quot;')
  const excerpt = (isZh ? (item.zh_excerpt || item.excerpt) : item.excerpt || '').replace(/"/g, '&quot;')
  const date = item.date ? new Date(item.date).toLocaleDateString(isZh ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''
  return `<a href="/blog/${item.id}" class="card group" ><div class="card-media"><img src="${img}" alt="${title}"></div><div class="card-body"><h3 class="card-title">${title}</h3><p class="card-desc">${excerpt}</p><p class="card-meta">${date} &middot; ${item.author || ''}</p><span class="card-cta">${t('card.read')} <span>&rarr;</span></span></div></a>`
}

// Pre-render all hero slides as single static HTML (no v-for, no Vue hydration)
const heroSlidesHTML = computed(() => {
  const items = ((hero.value as any[]) || []).slice(0, 5)
  return items.map(item => {
    const img = getImageUrl(item.image)
    return `<div class="hero-bg-slide"><img src="${img}" alt="${(item.title || '').replace(/"/g, '&quot;')}" style="width:100%;height:100%;object-fit:cover"></div>`
  }).join('')
})

const devicesHTML = computed(() => devices.value.map(productCardHTML).join(''))
const podGroupsHTML = computed(() => podGroups.value.map(g =>
  `<h4 class="text-sm font-semibold text-text-secondary mb-3 mt-6">${g.name}</h4><div class="card-grid mb-6">${g.items.map(productCardHTML).join('')}</div>`
).join(''))
const blogsHTML = computed(() => (blogs.value as any[]).map(blogCardHTML).join(''))

const toastMsg = ref(''); const toastType = ref('success')
function showToast(d: { message: string; type: string }) { toastMsg.value = d.message; toastType.value = d.type }
useHead({ title: 'LAFA — Tang-Song Flavors' })
</script>

<template>
  <div>
    <div v-if="checkoutStatus === 'success'" class="fixed top-36 right-4 bg-green-500/20 backdrop-blur-xl border border-green-500/30 text-green-400 px-5 py-3 rounded-2xl text-sm font-medium" style="z-index:300;animation:fadeUp 0.3s ease-out" @click="checkoutStatus = ''">
      Payment successful! <span class="ml-2 cursor-pointer">&times;</span>
    </div>

    <!-- Hero -->
    <section class="hero-section">
      <div class="hero-bg-carousel" v-html="heroSlidesHTML"></div>
      <div class="absolute inset-0 flex items-center justify-center text-center px-6 sm:px-12" style="z-index:2">
        <p :key="textKey" class="hero-shockwave text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-relaxed tracking-wider max-w-[700px]" style="text-shadow:0 0 8px rgba(255,255,255,0.4),0 0 30px rgba(184,148,31,0.35),0 0 60px rgba(184,148,31,0.2),0 2px 4px rgba(0,0,0,0.8);animation:heroScaleIn 1.8s cubic-bezier(0.1,0.8,0.2,1) both" :style="{ fontFamily: heroFont }" v-html="storyLines[textIndex]"></p>
      </div>
    </section>

    <!-- Products -->
    <section id="products" class="section section-alt">
      <div class="max-w-[1400px] mx-auto">
        <h2 class="sec-label">{{ t('sec.products') }}</h2>
        <p class="sec-sub text-center mb-10">{{ t('sec.productsSub') }}</p>
        <h3 class="text-lg font-semibold text-text-primary mb-4">{{ lang === 'zh' ? '设备' : 'Device' }}</h3>
        <div class="card-grid mb-10" v-html="devicesHTML"></div>
        <h3 class="text-lg font-semibold text-text-primary mb-4">{{ lang === 'zh' ? 'POD 口味' : 'POD Flavors' }}</h3>
        <div v-html="podGroupsHTML"></div>
      </div>
    </section>

    <!-- Blog -->
    <section id="blog" class="section">
      <div class="max-w-[1400px] mx-auto">
        <h2 class="sec-label">{{ t('sec.journal') }}</h2>
        <div class="card-grid" v-html="blogsHTML"></div>
      </div>
    </section>

    <!-- Contact -->
    <section id="contact" class="section border-t border-border" style="min-height:auto;justify-content:flex-start;padding-top:5rem;padding-bottom:5rem;">
      <div class="max-w-[1400px] mx-auto text-center">
        <h2 class="sec-label">{{ t('sec.contact') }}</h2>
        <ContactForm @toast="showToast" />
      </div>
    </section>
    <ToastNotification :message="toastMsg" :type="toastType" />
  </div>
</template>
