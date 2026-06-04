<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const toastMsg = ref('')
const toastType = ref('success')

const { data: blogs, pending, error: fetchError } = await useFetch('/api/data/blog', { default: () => [] })

const blog = computed(() => {
  const id = route.params.id
  return (blogs.value as any[]).find((b: any) => String(b.id) === String(id)) || {}
})

const loading = computed(() => pending.value)
const error = computed(() => {
  if (fetchError.value) return 'Failed to load'
  if (!pending.value && !blog.value.id) return t('blog.notFound')
  return ''
})

function getImageUrl(image: string, size?: string): string {
  if (!image) return '/uploads/placeholder.png'
  const base = `/uploads/${image.replace(/^.*[\\/]/, '')}`
  if (size === 'small') return base.replace(/\.webp$/i, '_small.webp')
  return base
}

function formatDate(date: string): string {
  return date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''
}

async function likeBlog() {
  try {
    const res = await fetch('/api/like-blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: blog.value.id })
    })
    const data = await res.json()
    if (data.success) { blog.value.likes = data.likes; showToast('Liked!', 'success') }
  } catch { showToast('Error, try again.', 'error') }
}

useHead({
  title: computed(() => `LAFA — ${blog.value.title || 'Article'}`),
  meta: [
    { name: 'description', content: computed(() => blog.value.excerpt || '') },
    { property: 'og:title', content: computed(() => `LAFA — ${blog.value.title || 'Article'}`) },
    { property: 'og:image', content: computed(() => blog.value.image || '/uploads/placeholder.png') },
  ]
})
</script>

<template>
  <section class="section section-alt pt-20">
    <div class="max-w-[900px] mx-auto">
      <div v-if="loading" class="text-center py-20 space-y-4">
        <div class="skeleton h-8 w-48 mx-auto"></div>
        <div class="skeleton h-80 w-full"></div>
      </div>
      <div v-else-if="error" class="text-center py-20">
        <p class="text-text-secondary">{{ error }}</p>
        <NuxtLink to="/blog" class="btn btn-outline mt-6">{{ t('blog.back') }}</NuxtLink>
      </div>
      <article v-else-if="blog.id">
        <span class="section-eyebrow mb-6 inline-block">{{ blog.tags?.[0] || t('section.journal') }}</span>
        <h1 class="section-heading mb-4">{{ blog.title }}</h1>
        <p class="text-[0.875rem] text-text-tertiary mb-10">{{ formatDate(blog.date) }} &middot; {{ blog.author }}</p>
        <div class="rounded-[24px] overflow-hidden mb-12 bg-surface">
          <picture>
            <source :srcset="getImageUrl(blog.image, 'small')" media="(max-width: 768px)" type="image/webp">
            <img :src="getImageUrl(blog.image)" :alt="blog.title" class="w-full aspect-square object-cover"
              @error="(e: any) => e.target.src = '/uploads/placeholder.png'">
          </picture>
        </div>
        <div class="prose" v-html="blog.content"></div>
        <div class="flex flex-wrap gap-2 mt-12 mb-10">
          <span v-for="tag in blog.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
        <div class="flex gap-3 pt-8 border-t border-border">
          <button @click="likeBlog" class="btn btn-outline">{{ blog.likes || 0 }} &nbsp;{{ t('like') }}</button>
          <a :href="`https://x.com/intent/tweet?text=${encodeURIComponent(blog.title || '')}&url=https://lafavape.com/blog/${blog.id}`"
            target="_blank" class="btn btn-outline">{{ t('share') }}</a>
        </div>
      </article>
      <div v-else class="text-center py-20">
        <p class="text-text-secondary">{{ t('blog.notFound') }}</p>
      </div>
      <ToastNotification :message="toastMsg" :type="toastType" />
    </div>
  </section>
</template>
