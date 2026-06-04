import { readJsonFile, getDataPath } from '../utils/fileUtils'

export default defineEventHandler(async (event) => {
  const baseUrl = 'https://lafavape.com'

  // Static pages
  const staticPages = [
    { url: '/', priority: '1.0' },
    { url: '/blog', priority: '0.8' },
    { url: '/story', priority: '0.9' },
    { url: '/faq', priority: '0.7' },
    { url: '/refer', priority: '0.6' },
    { url: '/verify', priority: '0.6' },
  ]

  let urls = staticPages.map(p =>
    `  <url><loc>${baseUrl}${p.url}</loc><changefreq>weekly</changefreq><priority>${p.priority}</priority></url>`
  )

  // Dynamic product pages
  try {
    const products = await readJsonFile(getDataPath('products')) || []
    products.forEach((p: any) => {
      urls.push(`  <url><loc>${baseUrl}/product/${p.id}</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`)
    })
  } catch {}

  // Dynamic blog pages
  try {
    const blogs = await readJsonFile(getDataPath('blog')) || []
    blogs.forEach((b: any) => {
      urls.push(`  <url><loc>${baseUrl}/blog/${b.id}</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`)
    })
  } catch {}

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`

  setHeader(event, 'Content-Type', 'application/xml')
  return xml
})
