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
    '<span class="text-gold">美国本土现货</span>，2-4 天到货，快速补货',
    '<span class="text-gold">低起订量 + 样品单</span>，先试后批，降低首批压力',
    '<span class="text-gold">支持混批拼柜</span>，一个订单多种口味，减少库存',
    '<span class="text-gold">收款 + 物流全搞定</span>，美国 + 中东付款无障碍',
    '<span class="text-gold">LAFA + 更多品牌</span>，自有 · 代采 · OEM 白标都行',
  ] : [
    '<span class="text-gold">US domestic stock</span> &mdash; 2-4 day delivery for fast restocking',
    '<span class="text-gold">Low MOQ + samples</span> &mdash; try before bulk, low first-order pressure',
    '<span class="text-gold">Mixed-SKU orders</span> &mdash; many flavors in one order, less inventory risk',
    '<span class="text-gold">Logistics &amp; payments handled</span> &mdash; US &amp; Middle East, no friction',
    '<span class="text-gold">LAFA + more brands</span> &mdash; own, sourced, or OEM white-label',
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

    <!-- Wholesale CTA -->
    <section class="section" style="padding-top:3rem;padding-bottom:3rem;">
      <div class="max-w-[1400px] mx-auto text-center">
        <p class="text-xs uppercase tracking-[0.2em] text-gold mb-3">{{ lang === 'zh' ? 'B2B 批发' : 'B2B WHOLESALE' }}</p>
        <h2 class="sec-label mb-4">{{ lang === 'zh' ? '美国本土仓 · 低起订量 · 可混批 · 收款搞定' : 'US Stock · Low MOQ · Mixed SKU · Payments Handled' }}</h2>
        <p class="sec-sub text-center mb-8">{{ lang === 'zh' ? '面向美国与中东的电子烟店与小批发商。品牌不设限：LAFA 自有 + 其他品牌 + OEM 白标。低起订量，先试后批。' : 'For US & Middle East vape shops and small wholesalers. Not locked to one brand — LAFA own, other brands, or OEM white-label. Low MOQ, try before bulk.' }}</p>
        <NuxtLink to="/wholesale" class="buy-btn-wa max-w-[420px] mx-auto">
          {{ lang === 'zh' ? '📦 店主进货 / 批发合作 →' : '📦 For Shops & Wholesalers →' }}
        </NuxtLink>
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
        <p class="text-sm text-text-tertiary text-center mt-6">{{ lang === 'zh' ? '以上为 LAFA 自有品牌部分产品。其他品牌代采 / OEM 白标定制，请 WhatsApp 直接咨询。' : 'Shown: LAFA own-brand products. For other brands or OEM white-label, ask us on WhatsApp.' }}</p>
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
