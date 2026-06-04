<script setup lang="ts">
const { t, lang } = useI18n()
const route = useRoute()
const { data: products } = await useFetch('/api/data/products', { default: () => [] })
const product = computed(() => (products.value as any[])?.find((p: any) => String(p.id) === String(route.params.id)) || {})

const seriesList = computed(() => product.value.series || [])
const activeSeriesIdx = ref(0)
const activeFlavorIdx = ref(0)
const showShare = ref(false)

const curSeries = computed(() => seriesList.value[activeSeriesIdx.value] || {})
const curFlavor = computed(() => curSeries.value.flavors?.[activeFlavorIdx.value] || {})

function selectSeries(i: number) { activeSeriesIdx.value = i; activeFlavorIdx.value = 0 }
function selectFlavor(i: number) { activeFlavorIdx.value = i }

const dName = computed(() => curFlavor.value.name || product.value.name)
const dDesc = computed(() => curFlavor.value.desc || product.value.description)
const dImg = computed(() => curFlavor.value.image || product.value.image)

function getImg(img: string): string {
  if (!img) return '/uploads/placeholder.png'
  return `/uploads/${img.replace(/^.*[\\/]/, '')}`
}

const openTab = ref('desc')
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
    <section class="section section-alt pt-20">
      <div class="max-w-[1200px] mx-auto">
        <div class="grid md:grid-cols-2 gap-8 md:gap-12">
          <div>
            <div class="rounded-2xl overflow-hidden bg-[#0a0a0a] aspect-square mb-6">
              <img :src="getImg(dImg)" :alt="dName" class="w-full h-full object-cover" @error="(e:any)=>e.target.src='/uploads/placeholder.png'">
            </div>
            <!-- Description / Reviews tabs -->
            <div class="flex border-b border-border mb-4">
              <button class="prod-tab" :class="{active:openTab==='desc'}" @click="openTab='desc'">{{ lang==='zh'?'描述':'Description' }}</button>
              <button class="prod-tab" :class="{active:openTab==='rev'}" @click="openTab='rev'">{{ lang==='zh'?'评价':'Reviews' }}{{ (product.reviews||[]).length ? ` (${product.reviews.length})` : '' }}</button>
            </div>
            <div v-if="openTab==='desc'" class="text-sm text-text-secondary leading-relaxed pb-4">{{ dDesc || t('product.noDescription') }}</div>
            <div v-if="openTab==='rev'" class="pb-4">
              <div v-if="(product.reviews||[]).length" class="space-y-3">
                <div v-for="r in product.reviews" :key="r.name" class="bg-[#0a0a0a] rounded-xl p-4">
                  <div class="flex items-center justify-between mb-1"><p class="text-sm font-semibold text-text-primary">{{ r.name }}</p><div class="flex gap-0.5"><span v-for="i in 5" :key="i" class="text-xs" :class="i<=r.rating?'text-gold':'text-text-tertiary/30'">★</span></div></div>
                  <p class="text-xs text-text-secondary">{{ r.text }}</p>
                </div>
              </div>
              <p v-else class="text-text-tertiary text-sm">{{ t('product.noReviews') }}</p>
            </div>
          </div>

          <div>
            <h1 class="prod-title">{{ dName }} / {{ product.name }}</h1>
            <div v-if="product.price" class="flex items-baseline gap-2 mb-4">
              <span class="prod-price">US ${{ product.price }}</span>
              <span v-if="product.comparePrice" class="prod-original">${{ product.comparePrice }}</span>
            </div>

            <!-- Specs -->
            <p class="specs-section-title">{{ lang === 'zh' ? '参数' : 'Specifications' }}</p>
            <div v-if="product.specs?.length" class="specs-block mb-4">
              <div class="specs-labels">
                <span v-for="spec in product.specs" :key="spec.label" class="spec-label">{{ spec.label }}</span>
              </div>
              <div class="specs-values">
                <span v-for="spec in product.specs" :key="spec.label" class="spec-value">{{ spec.value }}</span>
              </div>
            </div>
            <div class="specs-divider"></div>

            <!-- Series -->
            <p class="specs-section-title">{{ lang === 'zh' ? '口味分类' : 'Category' }}</p>
            <div class="flex gap-1 mb-3">
              <button v-for="(s,i) in seriesList" :key="s.name" class="series-tab" :class="{active:activeSeriesIdx===i}" @click="selectSeries(i)">{{ lang==='zh'?s.zh:s.name }}</button>
            </div>

            <!-- Flavors -->
            <p class="specs-section-title">{{ lang === 'zh' ? '口味' : 'Flavor' }}</p>
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
  </template>
</template>
