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
        { name: 'description', content: 'LAFA Vape — Tang-Song Flavors. Premium vape crafted for the global Chinese community. Every flavor tells a story from the Tang and Song dynasties.' },
        { name: 'keywords', content: 'LAFA Vape, 电子烟, vape, 唐宋风味, Tang Dynasty, Song Dynasty, premium vape, Chinese vape, lychee vape, jasmine tea vape, osmanthus oolong, longjing tea vape, ceramic coil vape' },
        { name: 'author', content: 'LAFA Vape' },
        { name: 'robots', content: 'index, follow, max-snippet:-1, max-image-preview:large' },

        // Open Graph
        { property: 'og:title', content: 'LAFA Vape — Tang-Song Flavors | Premium Chinese Vape' },
        { property: 'og:description', content: 'Premium vape crafted for the global Chinese community. Inspired by Tang and Song dynasty flavors.' },
        { property: 'og:image', content: '/uploads/hero1.webp' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:type', content: 'image/webp' },
        { property: 'og:url', content: 'https://lafavape.com' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'LAFA Vape' },
        { property: 'og:locale', content: 'en_US' },
        { property: 'og:locale:alternate', content: 'zh_CN' },

        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'LAFA Vape — Tang-Song Flavors' },
        { name: 'twitter:description', content: 'Premium vape for the global Chinese community.' },
        { name: 'twitter:image', content: '/uploads/hero1.webp' },

        // Additional SEO
        { name: 'theme-color', content: '#000000' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'canonical', href: 'https://lafavape.com' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Long+Cang&display=swap', media: 'print', onload: 'this.media=\'all\'' },
        { rel: 'preload', href: '/uploads/hero1.webp', as: 'image', type: 'image/webp' },
      ],
      script: [
        { 'src': 'https://plausible.io/js/script.js', 'defer': true, 'data-domain': 'lafavape.com', 'tagPriority': 'low' },
      ],
      // Structured data for organization
      __dangerouslyDisableSanitizers: ['script'],
    }
  },

  image: {
    quality: 80,
    format: ['webp'],
    dir: 'public/uploads'
  },

  nitro: {
    preset: 'vercel',
    prerender: {
      crawlLinks: true,
      failOnError: false,
    },
    hooks: {
      async 'prerender:routes'(routes) {
        const fs = await import('fs')
        const dataDir = 'server/data'
        try {
          JSON.parse(fs.readFileSync(`${dataDir}/products.json`, 'utf-8'))
            .forEach((p: any) => routes.add(`/product/${p.id}`))
        } catch {}
        try {
          JSON.parse(fs.readFileSync(`${dataDir}/blog.json`, 'utf-8'))
            .forEach((b: any) => routes.add(`/blog/${b.id}`))
        } catch {}
      },
    },
    // Gzip compression
    compressPublicAssets: true,
  },

  routeRules: {
    '/api/**': { cors: true },
    // Cache static assets
    '/uploads/**': { headers: { 'Cache-Control': 'public, max-age=2592000, immutable' } },
    '/_nuxt/**': { headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },
  },

  typescript: {
    strict: false
  },

  // Performance optimizations
  experimental: {
    payloadExtraction: true,
    renderJsonPayloads: true,
  },

  vite: {
    build: {
      cssMinify: true,
      minify: 'terser',
    },
  },
})
