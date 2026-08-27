<script setup lang="ts">
const { t, lang } = useI18n()
const route = useRoute()

import blogData from '~/server/data/blog.json'
const blogs = blogData as any[]

const blog = computed(() =>
  blogs.find((b: any) =>
    (b.slug && b.slug === String(route.params.id)) ||
    String(b.id) === String(route.params.id)
  ) || {}
)

const displayTitle = computed(() => lang.value === 'zh' ? (blog.value.zh_title || blog.value.title) : blog.value.title)
const displayExcerpt = computed(() => lang.value === 'zh' ? (blog.value.zh_excerpt || blog.value.excerpt) : blog.value.excerpt)

const toastMsg = ref(''); const toastType = ref('success')

function getImageUrl(image: string): string {
  if (!image) return '/uploads/placeholder.png'
  const base = `/uploads/${image.replace(/^.*[\\/]/, '')}`
  return base
}

const blogImageHTML = computed(() => {
  if (!blog.value.id) return ''
  const img = getImageUrl(blog.value.image)
  const alt = (displayTitle.value || '').replace(/"/g, '&quot;')
  return `<img src="${img}" alt="${alt}" class="w-full aspect-square object-cover">`
})

function formatDate(date: string): string {
  return date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''
}

function showToast(message: string, type: string = 'success') {
  toastMsg.value = message
  toastType.value = type
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

// Related articles: same-tag first, indexed only, max 3 — improves internal linking & topic clusters
const relatedBlogs = computed(() => {
  if (!blog.value.id) return []
  const rest = blogs.filter((b: any) => String(b.id) !== String(blog.value.id) && !b.noindex)
  const blogTags: string[] = blog.value.tags || []
  const scored = rest.map((b: any) => ({
    ...b,
    score: (b.tags || []).filter((t: string) => blogTags.includes(t)).length
  }))
  return scored.sort((a: any, b: any) => b.score - a.score).slice(0, 3)
})

useHead({
  title: computed(() => `LAFA — ${displayTitle.value || 'Article'}`),
  meta: [
    { name: 'description', content: computed(() => displayExcerpt.value || '') },
    // Honor per-post noindex flag (C-end legacy posts excluded from indexing)
    { name: 'robots', content: computed(() => blog.value.noindex ? 'noindex, nofollow' : 'index, follow') },
    { property: 'og:title', content: computed(() => `LAFA — ${displayTitle.value || 'Article'}`) },
    { property: 'og:description', content: computed(() => displayExcerpt.value || '') },
    { property: 'og:image', content: computed(() => `https://lafavape.com${blog.value.image || '/uploads/placeholder.png'}`) },
    { property: 'og:url', content: computed(() => `https://lafavape.com/blog/${blog.value.slug || blog.value.id}`) },
    { property: 'og:type', content: 'article' },
  ]
})
</script>

<template>
  <section class="section section-alt pt-20">
    <div class="max-w-[900px] mx-auto">
      <div v-if="!blog.id" class="text-center py-20">
        <p class="text-text-secondary">{{ t('blog.notFound') }}</p>
        <NuxtLink to="/blog" class="btn btn-outline mt-6">{{ t('blog.back') }}</NuxtLink>
      </div>
      <article v-else>
        <span class="section-eyebrow mb-6 inline-block">{{ blog.tags?.[0] || 'Journal' }}</span>
        <h1 class="section-heading mb-4">{{ displayTitle }}</h1>
        <p class="text-[0.875rem] text-text-tertiary mb-10">{{ formatDate(blog.date) }} &middot; {{ blog.author }}</p>
        <div class="rounded-[24px] overflow-hidden mb-12 bg-surface" v-html="blogImageHTML"></div>
        <div class="prose" v-html="lang === 'zh' && blog.zh_content ? blog.zh_content : blog.content"></div>
        <div class="flex flex-wrap gap-2 mt-12 mb-10">
          <span v-for="tag in blog.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
        <div class="flex gap-3 pt-8 border-t border-border">
          <button @click="likeBlog" class="btn btn-outline">{{ blog.likes || 0 }} &nbsp;{{ t('like') }}</button>
          <a :href="`https://x.com/intent/tweet?text=${encodeURIComponent(blog.title || '')}&url=https://lafavape.com/blog/${blog.id}`"
            target="_blank" class="btn btn-outline">{{ t('share') }}</a>
        </div>

        <div v-if="relatedBlogs.length" class="mt-14">
          <h2 class="text-[1.15rem] font-semibold mb-6">Related reads for vape shops</h2>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <NuxtLink
              v-for="rb in relatedBlogs"
              :key="rb.id"
              :to="`/blog/${rb.slug || rb.id}`"
              class="group block p-5 rounded-[16px] border border-border bg-surface transition hover:border-accent"
            >
              <span class="text-[0.75rem] uppercase tracking-wide text-text-tertiary">{{ rb.tags?.[0] || 'Journal' }}</span>
              <p class="mt-2 text-[0.95rem] font-medium leading-snug group-hover:text-accent">
                {{ lang === 'zh' ? (rb.zh_title || rb.title) : rb.title }}
              </p>
            </NuxtLink>
          </div>
        </div>
      </article>
      <ToastNotification :message="toastMsg" :type="toastType" />
    </div>
  </section>
</template>
