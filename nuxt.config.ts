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
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=5.0' },
        { name: 'description', content: 'LAFA Vape — B2B vape supplier for US & Middle East vape shops and small wholesalers. Brand-flexible sourcing: LAFA own brand, other brands, or OEM white-label. US domestic stock (2-4 day delivery), full compliance documents (MSDS, UN38.3, COA), low-MOQ trial & sample orders.' },
        { name: 'keywords', content: 'vape wholesale, vape supplier, vape shop wholesale, small wholesale vape, disposable vape bulk, vape OEM ODM, white label vape, own brand vape, US vape wholesale, Middle East vape supplier, low MOQ vape, mixed flavors, MSDS, UN38.3, COA, LAFA Vape' },
        { name: 'author', content: 'LAFA Vape' },
        { name: 'robots', content: 'index, follow, max-snippet:-1, max-image-preview:large' },

        // Open Graph
        { property: 'og:title', content: 'LAFA Vape — Vape Wholesale for US & Middle East Shops' },
        { property: 'og:description', content: 'B2B vape supplier for US & Middle East vape shops and small wholesalers. Own brand, other brands, or OEM white-label. US domestic stock, full compliance docs, low-MOQ & sample orders.' },
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
        { name: 'twitter:title', content: 'LAFA Vape — Vape Wholesale for Shops & Small Wholesalers' },
        { name: 'twitter:description', content: 'Own brand, other brands, or OEM white-label. US domestic stock, full compliance docs, low-MOQ & mixed-SKU for US & Middle East shops.' },
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
