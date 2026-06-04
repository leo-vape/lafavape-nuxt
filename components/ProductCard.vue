<script setup lang="ts">
const props = defineProps<{ item: any }>()
const { t, lang } = useI18n()

const displayTitle = computed(() => {
  const s = props.item.series?.[0]
  if (s?.flavors?.length) {
    const f = s.flavors[0]
    return lang.value === 'zh' ? (f.zh || f.name) : f.name
  }
  return props.item.name
})
const displayImage = computed(() => {
  const s = props.item.series?.[0]
  if (s?.flavors?.length) return s.flavors[0].image || props.item.image
  return props.item.image
})
function getImageUrl(image: string, size?: string): string {
  if (!image) return '/uploads/placeholder.png'
  const base = `/uploads/${image.replace(/^.*[\\/]/, '')}`
  if (size === 'small') return base.replace(/\.webp$/i, '_small.webp')
  return base
}
</script>

<template>
  <NuxtLink :to="'/product/' + item.id" class="card card-overlay group">
    <div class="card-media">
      <picture>
        <source :srcset="getImageUrl(displayImage, 'small')" media="(max-width: 768px)" type="image/webp">
        <img :src="getImageUrl(displayImage)" :alt="displayTitle" loading="lazy"
          @error="(e: any) => e.target.src = '/uploads/placeholder.png'">
      </picture>
    </div>
    <div class="card-overlay-text">
      <h3 class="card-title">{{ displayTitle }} / {{ item.name }}</h3>
      <div v-if="item.price" class="flex items-baseline gap-2 mt-1">
        <span class="text-sm font-semibold text-white">US ${{ item.price }}</span>
        <span v-if="item.comparePrice" class="text-xs line-through" style="color:#C41E24">${{ item.comparePrice }}</span>
      </div>
    </div>
  </NuxtLink>
</template>
