<script setup lang="ts">
const { t, lang } = useI18n()
const route = useRoute()
const { data: products } = await useFetch('/api/data/products', { default: () => [] })
const product = computed(() => (products.value as any[])?.find((p: any) => String(p.id) === String(route.params.id)) || {})

const displayName = computed(() => lang.value === 'zh' ? (product.value.zh || product.value.name) : product.value.name)

function getImg(img: string): string {
  if (!img) return '/uploads/placeholder.png'
  return img.startsWith('/') ? img : `/uploads/${img}`
}

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
useHead({ title: computed(() => `${displayName.value} — LAFA`) })
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
            <div class="rounded-2xl overflow-hidden bg-[#0a0a0a] aspect-square mb-4">
              <img :src="getImg(product.image)" :alt="displayName" class="w-full h-full object-cover" @error="(e:any)=>e.target.src='/uploads/placeholder.png'">
            </div>
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
  </template>
</template>
