<script setup lang="ts">
const props = defineProps<{ item: any }>()
const { lang } = useI18n()

const displayName = computed(() => lang.value === 'zh' ? (props.item.zh || props.item.name) : props.item.name)

function getImageUrl(image: string): string {
  if (!image) return '/uploads/placeholder.png'
  return image.startsWith('/') ? image : `/uploads/${image}`
}
</script>

<template>
  <a :href="'/product/' + item.id" class="card card-overlay group">
    <div class="card-media">
      <img :src="getImageUrl(item.image)" :alt="displayName">
    </div>
    <div class="card-overlay-text">
      <h3 class="card-title">{{ displayName }}</h3>
      <div v-if="item.price" class="flex items-baseline gap-2 mt-1">
        <span class="text-sm font-semibold text-white">US ${{ item.price }}</span>
        <span v-if="item.comparePrice" class="text-xs line-through" style="color:#C41E24">${{ item.comparePrice }}</span>
      </div>
    </div>
  </a>
</template>
