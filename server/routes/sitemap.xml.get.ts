import productsData from '../data/products.json'
import blogData from '../data/blog.json'

export default defineEventHandler(async (event) => {
  const baseUrl = 'https://lafavape.com'

  const staticPages = [
    // Homepage → https://lafavape.com (no trailing slash, matches the page's canonical)
    { url: '', priority: '1.0', changefreq: 'weekly' },
    { url: '/story', priority: '0.7', changefreq: 'monthly' },
    { url: '/blog', priority: '0.9', changefreq: 'weekly' },
    { url: '/wholesale', priority: '0.9', changefreq: 'monthly' },
    { url: '/faq', priority: '0.6', changefreq: 'monthly' },
    { url: '/verify', priority: '0.5', changefreq: 'monthly' },
    { url: '/compliance', priority: '0.6', changefreq: 'yearly' },
    { url: '/terms', priority: '0.4', changefreq: 'yearly' },
    { url: '/privacy', priority: '0.4', changefreq: 'yearly' },
  ]

  let urls = staticPages.map(p =>
    `  <url><loc>${baseUrl}${p.url}</loc><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`
  )

  const products: any[] = Array.isArray(productsData) ? productsData : []
  for (const p of products) {
    urls.push(`  <url><loc>${baseUrl}/product/${p.id}</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`)
  }

  const blogs: any[] = Array.isArray(blogData) ? blogData : []
  for (const b of blogs) {
    urls.push(`  <url><loc>${baseUrl}/blog/${b.slug || b.id}</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`)
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`

  setHeader(event, 'Content-Type', 'application/xml')
  return xml
})
