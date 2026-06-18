<script setup lang="ts">
const { t, lang } = useI18n()
const route = useRoute()

// Direct static import — no API call, no payload serialization issue
import productsData from '~/server/data/products.json'
const products = productsData as any[]

const product = computed(() =>
  products.find((p: any) => String(p.id) === String(route.params.id)) || {}
)

const displayName = computed(() => lang.value === 'zh' ? (product.value.zh || product.value.name) : product.value.name)

function getImg(img: string): string {
  if (!img) return '/uploads/placeholder.png'
  return img.startsWith('/') ? img : `/uploads/${img}`
}

const productImageHTML = computed(() => {
  if (!product.value.id) return ''
  const img = getImg(product.value.image)
  const alt = displayName.value.replace(/"/g, '&quot;')
  return `<img src="${img}" alt="${alt}" class="w-full h-full object-cover">`
})

const checkingOut = ref(false)
async function checkout() {
  checkingOut.value = true
  try {
    const r = await fetch('/api/create-checkout', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({productName:displayName.value,price:product.value.price,productId:product.value.id}) })
    const d = await r.json()
    if (d.checkoutUrl) window.location.href = d.checkoutUrl
    else window.location.href = '/#contact'
  } catch { window.location.href = '/#contact' }
  finally { checkingOut.value = false }
}
useHead({
  title: computed(() => `${displayName.value || 'Product'} — LAFA`),
  meta: computed(() => product.value.id ? [
    { name: 'description', content: product.value.description || '' },
    { property: 'og:title', content: `${displayName.value} — LAFA` },
    { property: 'og:description', content: product.value.description || '' },
    { property: 'og:image', content: getImg(product.value.image) },
    { property: 'og:url', content: `https://lafavape.com/product/${product.value.id}` },
    { property: 'og:type', content: 'product' },
    { property: 'product:price:amount', content: String(product.value.price || 0) },
    { property: 'product:price:currency', content: 'USD' },
  ] : [])
})
</script>

<template>
  <section v-if="product.id" class="section section-alt pt-20">
    <div class="max-w-[1200px] mx-auto">
      <div class="grid md:grid-cols-2 gap-8 md:gap-12">
        <div>
          <div class="rounded-2xl overflow-hidden bg-[#0a0a0a] aspect-square mb-4" v-html="productImageHTML"></div>
          <p class="text-sm text-text-secondary leading-relaxed">{{ product.description }}</p>
        </div>
        <div>
          <h1 class="prod-title">{{ displayName }}</h1>
          <p v-if="product.categoryZh" class="text-sm text-text-tertiary mb-3">{{ lang === 'zh' ? product.categoryZh : product.category }}</p>
          <div v-if="product.price" class="flex items-baseline gap-2 mb-6">
            <span class="prod-price">US ${{ product.price }}</span>
            <span v-if="product.comparePrice" class="prod-original">${{ product.comparePrice }}</span>
          </div>
          <p class="specs-section-title">{{ lang === 'zh' ? '参数' : 'Specifications' }}</p>
          <div v-if="product.specs?.length" class="specs-block mb-6">
            <div class="specs-labels"><span v-for="spec in product.specs" :key="spec.label" class="spec-label">{{ spec.label }}</span></div>
            <div class="specs-values"><span v-for="spec in product.specs" :key="spec.label" class="spec-value">{{ spec.value }}</span></div>
          </div>
          <div class="specs-divider"></div>
          <button v-if="product.price" class="buy-btn" @click="checkout" :disabled="checkingOut">
            {{ checkingOut ? t('product.redirecting') : `${t('product.buyNow')} — $${product.price}` }}
          </button>
          <NuxtLink to="/" class="block text-center text-xs text-text-tertiary hover:text-gold mt-4 transition">{{ t('product.back') }}</NuxtLink>
        </div>
      </div>
    </div>
  </section>
  <section v-else class="section section-alt pt-20">
    <div class="max-w-[1200px] mx-auto text-center py-20">
      <p class="text-text-secondary">{{ t('product.notFound') }}</p>
      <NuxtLink to="/" class="btn btn-outline mt-6">{{ t('product.back') }}</NuxtLink>
    </div>
  </section>
</template>
