<script setup lang="ts">
const { t, lang } = useI18n()

import blogData from '~/server/data/blog.json'
const blogs = blogData as any[]

function getImageUrl(image: string): string {
  if (!image) return '/uploads/placeholder.png'
  const base = `/uploads/${image.replace(/^.*[\\/]/, '')}`
  return base
}

function blogCardHTML(item: any): string {
  const isZh = lang.value === 'zh'
  const img = getImageUrl(item.image)
  const title = (isZh ? (item.zh_title || item.title) : item.title || '').replace(/"/g, '&quot;')
  const excerpt = (isZh ? (item.zh_excerpt || item.excerpt) : item.excerpt || '').replace(/"/g, '&quot;')
  const date = item.date ? new Date(item.date).toLocaleDateString(isZh ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''
  return `<a href="/blog/${item.slug || item.id}" class="card group"><div class="card-media"><img src="${img}" alt="${title}"></div><div class="card-body"><h3 class="card-title">${title}</h3><p class="card-desc">${excerpt}</p><p class="card-meta">${date} &middot; ${item.author || ''}</p><span class="card-cta">${t('card.read')} <span>&rarr;</span></span></div></a>`
}

const blogsHTML = computed(() => blogs.map(blogCardHTML).join(''))

useHead({ title: 'LAFA — Journal' })
</script>

<template>
  <section class="section section-alt pt-20">
    <div class="max-w-[1200px] mx-auto">
      <h1 class="sec-label mb-4">{{ t('sec.journal') }}</h1>
      <div class="card-grid" v-html="blogsHTML"></div>
      <div v-if="blogs.length === 0" class="text-center py-20"><p class="text-text-secondary">{{ t('card.noArticles') }}</p></div>
    </div>
  </section>
</template>
