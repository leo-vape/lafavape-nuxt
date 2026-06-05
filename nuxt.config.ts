// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-06-02',

  devtools: { enabled: false },

  css: ['~/assets/css/main.css'],

  modules: [
    '@nuxt/image',
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt'
  ],

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no' },
        { name: 'keywords', content: 'LAFA Vape, 电子烟, vape, 唐宋风味, Tang Dynasty, Song Dynasty, premium vape, Chinese vape, lychee vape, jasmine tea vape, nicotine vape' },
        { name: 'description', content: 'LAFA Vape — Tang-Song Flavors. Premium vape crafted for the global Chinese community. Lychee, Jasmine Tea, Osmanthus Oolong. Taste a thousand years of culture in every puff.' },
        { name: 'author', content: 'LAFA Vape' },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:title', content: 'LAFA Vape — Tang-Song Flavors | Premium Chinese Vape' },
        { property: 'og:description', content: 'Premium vape crafted for the global Chinese community. Every flavor tells a story from the Tang and Song dynasties.' },
        { property: 'og:image', content: '/uploads/placeholder.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:url', content: 'https://lafavape.com' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'LAFA Vape' },
        { property: 'og:locale', content: 'en_US' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'LAFA Vape — Tang-Song Flavors' },
        { name: 'twitter:description', content: 'Premium vape for the global Chinese community.' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'canonical', href: 'https://lafavape.com' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Long+Cang&display=swap' },
      ],
      script: [
        // Plausible Analytics — lightweight, privacy-friendly
        { 'src': 'https://plausible.io/js/script.js', 'defer': true, 'data-domain': 'lafavape.com', 'tagPriority': 'low' },
      ],
    }
  },

  image: {
    quality: 80,
    format: ['webp'],
    dir: 'public/uploads'
  },

  nitro: {
    preset: 'node-server',
    prerender: {
      routes: ['/blog', '/story', '/faq', '/refer', '/verify'],
      crawlLinks: false
    },
  },

  hooks: {
    'prerender:generate'(route) {
      // Generate sitemap during prerender
    },
  },

  // Nitro route rules for better SEO
  routeRules: {
    '/blog': { prerender: true },
    '/blog/**': { swr: 3600 },
    '/product/**': { swr: 3600 },
    '/story': { prerender: true },
    '/faq': { prerender: true },
    '/refer': { prerender: true },
    '/verify': { prerender: true },
  },

  typescript: {
    strict: false
  }
})
