<script setup lang="ts">
const props = defineProps<{ item: any }>()
const { t } = useI18n()
function getImageUrl(image: string, size?: string): string {
  if (!image) return '/uploads/placeholder.png'
  const base = `/uploads/${image.replace(/^.*[\\/]/, '')}`
  if (size === 'small') return base.replace(/\.webp$/i, '_small.webp')
  return base
}
function formatDate(date: string): string { return date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '' }
</script>

<template>
  <NuxtLink :to="'/blog/' + item.id" class="card group">
    <div class="card-media">
      <picture>
        <source :srcset="getImageUrl(item.image, 'small')" media="(max-width: 768px)" type="image/webp">
        <img :src="getImageUrl(item.image)" :alt="item.title" loading="lazy"
          @error="(e: any) => e.target.src = '/uploads/placeholder.png'">
      </picture>
    </div>
    <div class="card-body">
      <h3 class="card-title">{{ item.title }}</h3>
      <p class="card-desc">{{ item.excerpt }}</p>
      <p class="card-meta">{{ formatDate(item.date) }} &middot; {{ item.author }}</p>
      <span class="card-cta group-hover:gap-2">{{ t('card.read') }} <span class="transition-transform group-hover:translate-x-1">&rarr;</span></span>
    </div>
  </NuxtLink>
</template>
