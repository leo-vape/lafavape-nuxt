<script setup lang="ts">
const { t, lang } = useI18n()
const route = useRoute()
const { data: products } = await useFetch('/api/data/products', { default: () => [] })
const product = computed(() => (products.value as any[])?.find((p: any) => String(p.id) === String(route.params.id)) || {})

const seriesList = computed(() => product.value.series || [])
const activeSeriesIdx = ref(0)

const curSeries = computed(() => seriesList.value[activeSeriesIdx.value] || {})

function selectSeries(i: number) { activeSeriesIdx.value = i }

// Build flat flavor list from all series
const allFlavors = computed(() => {
  const items: any[] = []
  for (const s of seriesList.value) {
    for (const f of (s.flavors || [])) {
      items.push({ ...f, seriesName: s.name, seriesZh: s.zh })
    }
  }
  return items
})

// Filtered by current series tab (or all when series count > 1, show tab filtering)
const showTabs = computed(() => seriesList.value.length > 1)
const displayFlavors = computed(() => {
  if (!showTabs.value) return allFlavors.value
  return allFlavors.value.filter((f: any) => f.seriesName === curSeries.value.name)
})

function getImg(img: string): string {
  if (!img) return '/uploads/placeholder.png'
  return img.startsWith('/') ? img : `/uploads/${img}`
}

const checkingOut = ref(false)
async function checkout(flavorName: string) {
  checkingOut.value = true
  try {
    const r = await fetch('/api/create-checkout', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({productName:flavorName,price:product.value.price,productId:product.value.id}) })
    const d = await r.json()
    if (d.checkoutUrl) window.location.href = d.checkoutUrl
    else window.location.href = '/#contact'
  } catch { window.location.href = '/#contact' }
  finally { checkingOut.value = false }
}
useHead({ title: computed(() => `${product.value.name} — LAFA`) })
</script>

<template>
  <section v-if="!product.id" class="section section-alt pt-20">
    <div class="max-w-[1200px] mx-auto text-center py-20">
      <p class="text-text-secondary">{{ t('product.notFound') }}</p>
      <NuxtLink to="/" class="btn btn-outline mt-6">{{ t('product.back') }}</NuxtLink>
    </div>
  </section>

  <template v-else>
    <section class="section pt-20">
      <div class="max-w-[1400px] mx-auto">
        <!-- Header -->
        <div class="text-center mb-10">
          <h1 class="text-3xl sm:text-4xl font-bold text-text-primary mb-2">{{ product.name }}</h1>
          <p class="text-text-secondary text-sm max-w-lg mx-auto">{{ product.description }}</p>
          <div v-if="product.price" class="mt-3">
            <span class="text-2xl font-bold text-text-primary">US ${{ product.price }}</span>
            <span v-if="product.comparePrice" class="ml-2 text-base line-through text-text-tertiary">${{ product.comparePrice }}</span>
          </div>
          <div v-if="product.specs?.length" class="flex justify-center gap-6 mt-3 text-sm text-text-secondary">
            <span v-for="spec in product.specs" :key="spec.label">{{ spec.label }}: <strong class="text-text-primary">{{ spec.value }}</strong></span>
          </div>
        </div>

        <!-- Series Tabs -->
        <div v-if="showTabs" class="flex justify-center gap-2 mb-8">
          <button v-for="(s,i) in seriesList" :key="s.name" class="series-tab text-sm" :class="{active:activeSeriesIdx===i}" @click="selectSeries(i)">{{ lang==='zh'?s.zh:s.name }}</button>
        </div>

        <!-- Flavor Cards Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div v-for="(f, i) in displayFlavors" :key="i"
            class="group rounded-xl overflow-hidden bg-[#0a0a0a] border border-transparent hover:border-[#333] transition-all duration-300 hover:-translate-y-1">
            <div class="aspect-square overflow-hidden">
              <img :src="getImg(f.image)" :alt="lang==='zh'?f.zh:f.name" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" @error="(e:any)=>e.target.src='/uploads/placeholder.png'">
            </div>
            <div class="p-3">
              <p class="text-sm font-semibold text-text-primary truncate">{{ lang==='zh' ? f.zh : f.name }}</p>
              <p v-if="showTabs" class="text-xs text-text-tertiary mb-2">{{ lang==='zh' ? f.seriesZh : f.seriesName }}</p>
              <p class="text-xs text-text-secondary line-clamp-2 mb-3">{{ f.desc }}</p>
              <button v-if="product.price" class="w-full py-2 text-xs font-semibold rounded-lg bg-[#C41E24] text-white hover:bg-[#a0181e] transition"
                @click="checkout(f.name)" :disabled="checkingOut">
                {{ checkingOut ? '...' : `Buy — $${product.price}` }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </template>
</template>
