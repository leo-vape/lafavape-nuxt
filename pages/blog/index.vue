<script setup lang="ts">
const { t } = useI18n()
const { data: blogs } = await useFetch('/api/data/blog', { default: () => [] })
const searchQuery = ref(''); const currentPage = ref(1); const blogsPerPage = 6
const filteredBlogs = computed(() => {
  let f = blogs.value as any[]
  if (searchQuery.value) { const q = searchQuery.value.toLowerCase(); f = f.filter(b => b.title?.toLowerCase().includes(q) || b.excerpt?.toLowerCase().includes(q)) }
  return f
})
const paginatedBlogs = computed(() => { const s = (currentPage.value - 1) * blogsPerPage; return filteredBlogs.value.slice(s, s + blogsPerPage) })
useHead({ title: 'LAFA — Journal' })
</script>

<template>
  <section class="section section-alt pt-20">
    <div class="max-w-[1200px] mx-auto">
      <h1 class="sec-label mb-4">{{ t('sec.journal') }}</h1>
      <div class="card-grid">
        <BlogCard v-for="item in paginatedBlogs" :key="item.id" :item="item" />
      </div>
      <div v-if="(blogs as any[]).length === 0" class="text-center py-20"><p class="text-text-secondary">{{ t('card.noArticles') }}</p></div>
      <div v-if="filteredBlogs.length > blogsPerPage" class="flex justify-center items-center gap-3 mt-12">
        <button :disabled="currentPage === 1" @click="currentPage--" class="page-btn">{{ t('prev') }}</button>
        <span class="text-[0.875rem] text-text-tertiary">{{ currentPage }} / {{ Math.ceil(filteredBlogs.length / blogsPerPage) }}</span>
        <button :disabled="currentPage * blogsPerPage >= filteredBlogs.length" @click="currentPage++" class="page-btn">{{ t('next') }}</button>
      </div>
    </div>
  </section>
</template>
