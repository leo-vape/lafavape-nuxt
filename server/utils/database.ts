import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const dataDir = path.join(process.cwd(), 'server/data')
fs.mkdirSync(dataDir, { recursive: true })

const subDbFile = path.join(dataDir, 'subscribers.db')
const codeDbFile = path.join(dataDir, 'codes.db')
const prodDbFile = path.join(dataDir, 'products.db')

// ── Subscribers DB ──
const subDb = new Database(subDbFile)
subDb.pragma('journal_mode = WAL')
subDb.exec(`CREATE TABLE IF NOT EXISTS subscribers (email TEXT PRIMARY KEY, subscribed_at TEXT)`)

// ── Codes DB ──
const codeDb = new Database(codeDbFile)
codeDb.pragma('journal_mode = WAL')
codeDb.exec(`CREATE TABLE IF NOT EXISTS codes (code TEXT PRIMARY KEY, flavor TEXT, date TEXT, query_count INTEGER DEFAULT 0)`)

// ── Products DB ──
const prodDb = new Database(prodDbFile)
prodDb.pragma('journal_mode = WAL')
prodDb.pragma('foreign_keys = ON')
prodDb.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    price REAL,
    comparePrice REAL,
    image TEXT DEFAULT '',
    images TEXT DEFAULT '[]',
    created_at TEXT DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS product_series (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    zh TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS product_flavors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    series_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    zh TEXT NOT NULL,
    image TEXT DEFAULT '',
    desc TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (series_id) REFERENCES product_series(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS product_specs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );
`)

// Seed: insert default product if DB is empty
const rowCount = prodDb.prepare('SELECT COUNT(*) as c FROM products').get() as any
if (rowCount.c === 0) {
  prodDb.prepare('INSERT INTO products (id, name, description, price, comparePrice, image, created_at) VALUES (?,?,?,?,?,?,?)')
    .run(1, 'LAFA Pod Pro', 'Premium pod system with ceramic coil for pure flavor delivery.', 24.99, 29.99, '/uploads/384c4c0c-1b71-4f09-a9ce-15a45457d936.webp', new Date().toISOString())
  prodDb.prepare('INSERT INTO product_specs (product_id, label, value) VALUES (?,?,?)').run(1, 'Puffs', '600 Puffs')
  prodDb.prepare('INSERT INTO product_specs (product_id, label, value) VALUES (?,?,?)').run(1, 'Nicotine', '3% / 5%')
  prodDb.prepare('INSERT INTO product_specs (product_id, label, value) VALUES (?,?,?)').run(1, 'Battery', '350mAh')
  prodDb.prepare('INSERT INTO product_specs (product_id, label, value) VALUES (?,?,?)').run(1, 'Pod', '1.8ml')
  const s1 = prodDb.prepare('INSERT INTO product_series (product_id, name, zh, sort_order) VALUES (?,?,?,?)').run(1, 'Fruit', '水果味', 0)
  const flavors1 = [
    ['Lychee Ice', '荔枝冰', '/uploads/384c4c0c-1b71-4f09-a9ce-15a45457d936.webp', 'Crisp lychee with cool menthol finish'],
    ['Grape Mist', '葡萄雾', '/uploads/2bedb5cd-198a-4ae7-9379-4555a8e1bb27.webp', 'Bold grape with chilled mist'],
    ['Watermelon Ice', '西瓜冰', '/uploads/ac6a5144-cf01-4bc7-9e89-f6142c1358b5.webp', 'Sweet watermelon with icy exhale'],
    ['Strawberry Blast', '草莓爆炸', '/uploads/384c4c0c-1b71-4f09-a9ce-15a45457d936.webp', 'Ripe strawberry burst'],
    ['Green Grape', '青提', '/uploads/2bedb5cd-198a-4ae7-9379-4555a8e1bb27.webp', 'Crisp green grape essence'],
    ['Guava Ice', '番石榴冰', '/uploads/ac6a5144-cf01-4bc7-9e89-f6142c1358b5.webp', 'Tropical guava with cool touch'],
  ]
  flavors1.forEach((f, i) => prodDb.prepare('INSERT INTO product_flavors (series_id, name, zh, image, desc, sort_order) VALUES (?,?,?,?,?,?)').run(s1.lastInsertRowid, f[0], f[1], f[2], f[3], i))
  const s2 = prodDb.prepare('INSERT INTO product_series (product_id, name, zh, sort_order) VALUES (?,?,?,?)').run(1, 'Tea', '茶味', 1)
  const flavors2 = [
    ['Jasmine Green Tea', '茉莉花茶', '/uploads/d812903d-892e-4f7d-a9e9-9797806b415d.webp', 'Floral jasmine with smooth green tea'],
    ['Osmanthus Oolong', '桂花乌龙', '/uploads/ac6a5144-cf01-4bc7-9e89-f6142c1358b5.webp', 'Sweet osmanthus with roasted oolong'],
    ['Longjing Green', '龙井', '/uploads/d812903d-892e-4f7d-a9e9-9797806b415d.webp', 'Classic Dragon Well tea'],
    ['Earl Grey', '伯爵茶', '/uploads/ac6a5144-cf01-4bc7-9e89-f6142c1358b5.webp', 'Bergamot-infused black tea'],
  ]
  flavors2.forEach((f, i) => prodDb.prepare('INSERT INTO product_flavors (series_id, name, zh, image, desc, sort_order) VALUES (?,?,?,?,?,?)').run(s2.lastInsertRowid, f[0], f[1], f[2], f[3], i))
  console.log('Default product seeded')
}

// Migration: import existing JSON products into SQLite
const migratedFlag = path.join(dataDir, '.products_migrated')
if (!fs.existsSync(migratedFlag)) {
  try {
    const jsonPath = path.join(dataDir, 'products.json')
    if (fs.existsSync(jsonPath)) {
      const products = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
      const insertP = prodDb.prepare('INSERT OR IGNORE INTO products (id, name, description, price, comparePrice, image, images, created_at) VALUES (?,?,?,?,?,?,?,?)')
      const insertS = prodDb.prepare('INSERT INTO product_series (product_id, name, zh, sort_order) VALUES (?,?,?,?)')
      const insertF = prodDb.prepare('INSERT INTO product_flavors (series_id, name, zh, image, desc, sort_order) VALUES (?,?,?,?,?,?)')
      const insertSp = prodDb.prepare('INSERT INTO product_specs (product_id, label, value) VALUES (?,?,?)')

      const tx = prodDb.transaction(() => {
        for (const p of products) {
          insertP.run(p.id, p.name, p.description || '', p.price || null, p.comparePrice || null, p.image || '', JSON.stringify(p.images || []), p.date || new Date().toISOString())
          if (p.specs) p.specs.forEach((s: any) => insertSp.run(p.id, s.label, s.value))
          if (p.series) p.series.forEach((s: any, si: number) => {
            const info = insertS.run(p.id, s.name, s.zh, si)
            if (s.flavors) s.flavors.forEach((f: any, fi: number) => {
              insertF.run(info.lastInsertRowid, f.name, f.zh, f.image || '', f.desc || '', fi)
            })
          })
        }
      })
      tx()
      console.log(`Migrated ${products.length} products from JSON to SQLite`)
    }
  } catch (e: any) { console.error('Product migration error:', e.message) }
  fs.writeFileSync(migratedFlag, 'done')
}

export { subDb, codeDb, prodDb }
