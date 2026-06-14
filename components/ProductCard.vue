<script setup lang="ts">
const props = defineProps<{ item: any }>()
const { lang } = useI18n()

const displayName = computed(() => lang.value === 'zh' ? (props.item.zh || props.item.name) : props.item.name)

function getImageUrl(image: string, size?: string): string {
  if (!image) return '/uploads/placeholder.png'
  const img = image.startsWith('/') ? image : `/uploads/${image}`
  if (size === 'small') return img.replace(/\.(webp|png|jpg)$/i, '_small.$1')
  return img
}
</script>

<template>
  <NuxtLink :to="'/product/' + item.id" class="card card-overlay group">
    <div class="card-media">
      <picture>
        <source :srcset="getImageUrl(item.image, 'small')" media="(max-width: 768px)" type="image/webp">
        <img :src="getImageUrl(item.image)" :alt="displayName" loading="lazy"
          @error="(e: any) => e.target.src = '/uploads/placeholder.png'">
      </picture>
    </div>
    <div class="card-overlay-text">
      <h3 class="card-title">{{ displayName }}</h3>
      <div v-if="item.price" class="flex items-baseline gap-2 mt-1">
        <span class="text-sm font-semibold text-white">US ${{ item.price }}</span>
        <span v-if="item.comparePrice" class="text-xs line-through" style="color:#C41E24">${{ item.comparePrice }}</span>
      </div>
    </div>
  </NuxtLink>
</template>
