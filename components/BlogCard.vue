<script setup lang="ts">
const props = defineProps<{ item: any }>()
const { t } = useI18n()
function getImageUrl(image: string): string {
  if (!image) return '/uploads/placeholder.png'
  const base = `/uploads/${image.replace(/^.*[\\/]/, '')}`
  return base
}
function formatDate(date: string): string { return date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '' }
</script>

<template>
  <a :href="'/blog/' + item.id" class="card group">
    <div class="card-media">
      <img :src="getImageUrl(item.image)" :alt="item.title">
    </div>
    <div class="card-body">
      <h3 class="card-title">{{ item.title }}</h3>
      <p class="card-desc">{{ item.excerpt }}</p>
      <p class="card-meta">{{ formatDate(item.date) }} &middot; {{ item.author }}</p>
      <span class="card-cta group-hover:gap-2">{{ t('card.read') }} <span class="transition-transform group-hover:translate-x-1">&rarr;</span></span>
    </div>
  </a>
</template>
