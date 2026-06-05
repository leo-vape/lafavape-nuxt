import { prodDb } from './database'

export function getAllProducts(): any[] {
  const products = prodDb.prepare('SELECT * FROM products ORDER BY id').all() as any[]
  return products.map(p => {
    const series = prodDb.prepare('SELECT * FROM product_series WHERE product_id = ? ORDER BY sort_order').all(p.id) as any[]
    const specs = prodDb.prepare('SELECT label, value FROM product_specs WHERE product_id = ?').all(p.id)
    const enriched = {
      ...p,
      specs,
      series: series.map(s => {
        const flavors = prodDb.prepare('SELECT * FROM product_flavors WHERE series_id = ? ORDER BY sort_order').all(s.id)
        return { ...s, flavors }
      }),
      images: JSON.parse(p.images || '[]')
    }
    if (p.price) enriched.price = p.price
    if (p.comparePrice) enriched.comparePrice = p.comparePrice
    return enriched
  })
}

export function getProductById(id: number): any {
  return getAllProducts().find((p: any) => p.id === id) || null
}

export function generateProductId(): number {
  const row = prodDb.prepare('SELECT MAX(id) as maxId FROM products').get() as any
  return (row?.maxId || 0) + 1
}

export function insertProduct(p: any) {
  const id = p.id || generateProductId()
  prodDb.prepare('INSERT INTO products (id, name, description, price, comparePrice, image, images, created_at) VALUES (?,?,?,?,?,?,?,?)')
    .run(id, p.name, p.description || '', p.price || null, p.comparePrice || null, p.image || '', JSON.stringify(p.images || []), p.created_at || new Date().toISOString())
  
  if (p.specs) {
    const ins = prodDb.prepare('INSERT INTO product_specs (product_id, label, value) VALUES (?,?,?)')
    p.specs.forEach((s: any) => ins.run(id, s.label, s.value))
  }
  
  if (p.series) {
    const insS = prodDb.prepare('INSERT INTO product_series (product_id, name, zh, sort_order) VALUES (?,?,?,?)')
    const insF = prodDb.prepare('INSERT INTO product_flavors (series_id, name, zh, image, desc, sort_order) VALUES (?,?,?,?,?,?)')
    p.series.forEach((s: any, si: number) => {
      const info = insS.run(id, s.name, s.zh, si)
      if (s.flavors) s.flavors.forEach((f: any, fi: number) => {
        insF.run(info.lastInsertRowid, f.name, f.zh, f.image || '', f.desc || '', fi)
      })
    })
  }
  return id
}

export function updateProduct(id: number, updates: any) {
  if (updates.name !== undefined) prodDb.prepare('UPDATE products SET name=? WHERE id=?').run(updates.name, id)
  if (updates.description !== undefined) prodDb.prepare('UPDATE products SET description=? WHERE id=?').run(updates.description, id)
  if (updates.price !== undefined) prodDb.prepare('UPDATE products SET price=? WHERE id=?').run(updates.price, id)
  if (updates.comparePrice !== undefined) prodDb.prepare('UPDATE products SET comparePrice=? WHERE id=?').run(updates.comparePrice, id)
  if (updates.image !== undefined) prodDb.prepare('UPDATE products SET image=? WHERE id=?').run(updates.image, id)
  if (updates.images !== undefined) prodDb.prepare('UPDATE products SET images=? WHERE id=?').run(JSON.stringify(updates.images), id)
  
  if (updates.specs !== undefined) {
    prodDb.prepare('DELETE FROM product_specs WHERE product_id = ?').run(id)
    const ins = prodDb.prepare('INSERT INTO product_specs (product_id, label, value) VALUES (?,?,?)')
    updates.specs.forEach((s: any) => ins.run(id, s.label, s.value))
  }
  
  if (updates.series !== undefined) {
    prodDb.prepare('DELETE FROM product_flavors WHERE series_id IN (SELECT id FROM product_series WHERE product_id = ?)').run(id)
    prodDb.prepare('DELETE FROM product_series WHERE product_id = ?').run(id)
    const insS = prodDb.prepare('INSERT INTO product_series (product_id, name, zh, sort_order) VALUES (?,?,?,?)')
    const insF = prodDb.prepare('INSERT INTO product_flavors (series_id, name, zh, image, desc, sort_order) VALUES (?,?,?,?,?,?)')
    updates.series.forEach((s: any, si: number) => {
      const info = insS.run(id, s.name, s.zh, si)
      if (s.flavors) s.flavors.forEach((f: any, fi: number) => {
        insF.run(info.lastInsertRowid, f.name, f.zh, f.image || '', f.desc || '', fi)
      })
    })
  }
}

export function deleteProduct(id: number) {
  prodDb.prepare('DELETE FROM products WHERE id = ?').run(id)
}
