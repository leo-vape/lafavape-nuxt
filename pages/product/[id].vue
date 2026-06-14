<script setup lang="ts">
const { t, lang } = useI18n()
const route = useRoute()
const { data: products } = await useFetch('/api/data/products', { default: () => [] })
const product = computed(() => (products.value as any[])?.find((p: any) => String(p.id) === String(route.params.id)) || {})

const seriesList = computed(() => product.value.series || [])
const activeSeriesIdx = ref(0)
const activeFlavorIdx = ref(0)

const curSeries = computed(() => seriesList.value[activeSeriesIdx.value] || {})
const curFlavor = computed(() => curSeries.value.flavors?.[activeFlavorIdx.value] || {})

function selectSeries(i: number) { activeSeriesIdx.value = i; activeFlavorIdx.value = 0 }
function selectFlavor(i: number) { activeFlavorIdx.value = i }

const dName = computed(() => curFlavor.value.name || product.value.name)
const dDesc = computed(() => curFlavor.value.desc || product.value.description)
const dImg = computed(() => curFlavor.value.image || product.value.image)

// Build flat flavor list for the gallery grid
const allFlavorImages = computed(() => {
  const imgs: { name: string; zh: string; image: string; desc: string; seriesName: string; seriesZh: string }[] = []
  for (const s of seriesList.value) {
    for (const f of (s.flavors || [])) {
      imgs.push({ ...f, seriesName: s.name, seriesZh: s.zh })
    }
  }
  return imgs
})

// Detail images
const detailImages = computed(() => product.value.detailImages || [])

function getImg(img: string): string {
  if (!img) return '/uploads/placeholder.png'
  return img.startsWith('/') ? img : `/uploads/${img}`
}

const checkingOut = ref(false)
async function checkout() {
  checkingOut.value = true
  try {
    const r = await fetch('/api/create-checkout', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({productName:dName.value,price:product.value.price,productId:product.value.id}) })
    const d = await r.json()
    if (d.checkoutUrl) window.location.href = d.checkoutUrl
    else window.location.href = '/#contact'
  } catch { window.location.href = '/#contact' }
  finally { checkingOut.value = false }
}
useHead({ title: computed(() => `${dName.value} — LAFA`) })
</script>

<template>
  <section v-if="!product.id" class="section section-alt pt-20">
    <div class="max-w-[1200px] mx-auto text-center py-20">
      <p class="text-text-secondary">{{ t('product.notFound') }}</p>
      <NuxtLink to="/" class="btn btn-outline mt-6">{{ t('product.back') }}</NuxtLink>
    </div>
  </section>

  <template v-else>
    <!-- Hero image -->
    <section class="section section-alt pt-20">
      <div class="max-w-[1200px] mx-auto">
        <div class="grid md:grid-cols-2 gap-8 md:gap-12">
          <div>
            <div class="rounded-2xl overflow-hidden bg-[#0a0a0a] aspect-square mb-4">
              <img :src="getImg(dImg)" :alt="dName" class="w-full h-full object-cover" @error="(e:any)=>e.target.src='/uploads/placeholder.png'">
            </div>
            <div class="text-sm text-text-secondary leading-relaxed">{{ dDesc || t('product.noDescription') }}</div>
          </div>

          <div>
            <h1 class="prod-title">{{ dName }} / {{ product.name }}</h1>
            <div v-if="product.price" class="flex items-baseline gap-2 mb-4">
              <span class="prod-price">US ${{ product.price }}</span>
              <span v-if="product.comparePrice" class="prod-original">${{ product.comparePrice }}</span>
            </div>

            <p class="specs-section-title">{{ lang === 'zh' ? '参数' : 'Specifications' }}</p>
            <div v-if="product.specs?.length" class="specs-block mb-4">
              <div class="specs-labels"><span v-for="spec in product.specs" :key="spec.label" class="spec-label">{{ spec.label }}</span></div>
              <div class="specs-values"><span v-for="spec in product.specs" :key="spec.label" class="spec-value">{{ spec.value }}</span></div>
            </div>
            <div class="specs-divider"></div>

            <p class="specs-section-title">{{ lang === 'zh' ? '分类' : 'Category' }}</p>
            <div class="flex gap-1 mb-3">
              <button v-for="(s,i) in seriesList" :key="s.name" class="series-tab" :class="{active:activeSeriesIdx===i}" @click="selectSeries(i)">{{ lang==='zh'?s.zh:s.name }}</button>
            </div>

            <p class="specs-section-title">{{ lang === 'zh' ? '选择' : 'Select' }}</p>
            <div class="flex flex-wrap gap-2 mb-6">
              <button v-for="(f,i) in curSeries.flavors" :key="f.name" class="flavor-btn" :class="{active:activeFlavorIdx===i}" @click="selectFlavor(i)">{{ lang==='zh'?f.zh:f.name }}</button>
            </div>

            <button v-if="product.price" class="buy-btn" @click="checkout" :disabled="checkingOut">
              {{ checkingOut ? t('product.redirecting') : `${t('product.buyNow')}  $${product.price}` }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- All flavors gallery grid -->
    <section class="section bg-black">
      <div class="max-w-[1400px] mx-auto">
        <h2 class="sec-label mb-8">{{ lang === 'zh' ? '全部口味' : 'All Flavors' }}</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div v-for="(f, i) in allFlavorImages" :key="i"
            class="group cursor-pointer rounded-xl overflow-hidden bg-[#0a0a0a] border transition-all duration-300 hover:-translate-y-1"
            :class="dName === f.name ? 'border-gold' : 'border-transparent hover:border-[#333]'"
            @click="selectFlavor(i % curSeries.flavors.length); selectSeries(seriesList.findIndex(s => s.name === f.seriesName))">
            <div class="aspect-square overflow-hidden">
              <img :src="getImg(f.image)" :alt="lang==='zh'?f.zh:f.name" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy">
            </div>
            <div class="p-3">
              <p class="text-sm font-semibold text-text-primary truncate">{{ lang==='zh' ? f.zh : f.name }}</p>
              <p class="text-xs text-text-tertiary">{{ lang==='zh' ? f.seriesZh : f.seriesName }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Detail Images -->
    <section v-if="detailImages.length" class="section bg-black">
      <div class="max-w-[800px] mx-auto">
        <h2 class="sec-label mb-8">{{ lang === 'zh' ? '产品详情' : 'Product Details' }}</h2>
        <div class="space-y-4">
          <img v-for="(img, i) in detailImages" :key="i" :src="getImg(img)" :alt="`${product.name} detail ${i+1}`" class="w-full h-auto rounded-2xl" loading="lazy">
        </div>
      </div>
    </section>
  </template>
</template>
