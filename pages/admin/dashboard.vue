<script setup lang="ts">
const { t, lang } = useI18n()
definePageMeta({ layout: false })

const activeSection = ref('products')
const contentHtml = ref('')
const loading = ref(false)

// Notification
const notification = ref({ message: '', type: 'success', show: false })
const aMsg = (zh: string, en: string) => lang.value === 'zh' ? zh : en

function showNotification(msg: string, type = 'success') {
  notification.value = { message: msg, type, show: true }
  setTimeout(() => { notification.value.show = false }, 3000)
}

// Edit modal state
const editModal = ref({ open: false, type: '', id: '', title: '', description: '', name: '', content: '', author: '', tags: '',
  price: '', comparePrice: '', specFlavor: '', specPuffs: '', specNicotine: '', specBattery: '', specPod: '', specCharging: '', reviews: '' })
function openEditModal(type: string, item: any) {
  const specs = item.specs || []
  const getSpec = (label: string) => specs.find((s: any) => s.label === label)?.value || ''
  editModal.value = {
    open: true, type,
    id: String(item.id),
    title: item.title || '',
    description: item.description || '',
    name: item.name || '',
    content: item.content || '',
    author: item.author || '',
    tags: (item.tags || []).join(', '),
    price: item.price ?? '',
    comparePrice: item.comparePrice ?? '',
    specFlavor: getSpec('Flavor'),
    specPuffs: getSpec('Puffs'),
    specNicotine: getSpec('Nicotine'),
    specBattery: getSpec('Battery'),
    specPod: getSpec('Pod'),
    specCharging: getSpec('Charging'),
    reviews: (item.reviews || []).map((r: any) => `${r.name}|${r.rating}|${r.text}`).join('\n'),
  }
}
function closeEditModal() { editModal.value.open = false }
async function submitEdit() {
  const m = editModal.value; const fd = new FormData(); fd.append('id', m.id)
  let ep = ''
  if (m.type === 'hero') { fd.append('title', m.title); fd.append('description', m.description); ep = 'edit-hero' }
  else if (m.type === 'product') {
    fd.append('name', m.name); fd.append('description', m.description); ep = 'edit-product'
    // Price fields
    if (m.price) fd.append('price', m.price)
    if (m.comparePrice) fd.append('comparePrice', m.comparePrice)
    const sp: {label:string,value:string}[] = []
    const sf = [{k:'specFlavor',l:'Flavor'},{k:'specPuffs',l:'Puffs'},{k:'specNicotine',l:'Nicotine'},{k:'specBattery',l:'Battery'},{k:'specPod',l:'Pod'},{k:'specCharging',l:'Charging'}]
    sf.forEach(({k,l}) => { const v = (m as any)[k]?.trim(); if (v) sp.push({label:l,value:v}) })
    fd.append('specs', JSON.stringify(sp))
    const revs: {name:string,rating:number,date:string,text:string}[] = []
    if (m.reviews) {
      m.reviews.split('\n').forEach((line: string) => {
        const parts = line.split('|')
        if (parts.length >= 3) {
          revs.push({ name: parts[0].trim(), rating: parseInt(parts[1]) || 5, date: new Date().toISOString().split('T')[0], text: parts.slice(2).join('|').trim() })
        }
      })
    }
    fd.append('reviews', JSON.stringify(revs))
  }
  else if (m.type === 'blog') { fd.append('title', m.title); fd.append('content', m.content); fd.append('author', m.author); fd.append('tags', m.tags); ep = 'edit-blog' }
  const fi = document.getElementById('editImage') as HTMLInputElement
  if (fi?.files?.[0]) fd.append('image', fi.files[0])
  try {
    const r = await fetch(`/api/admin/${ep}`, { method: 'POST', body: fd }); const d = await r.json()
    if (r.ok && d.success) { showNotification(aMsg('保存成功', 'Saved')); closeEditModal(); loadSection(m.type === 'product' ? 'products' : m.type === 'blog' ? 'blogs' : 'hero') }
    else showNotification(d.message || d.error || aMsg('操作失败', 'Operation failed'), 'error')
  } catch (e: any) { showNotification(e.message, 'error') }
}

// Upload helpers
async function uploadItem(endpoint: string, formData: FormData, reloadSection: string) {
  loading.value = true
  try {
    const res = await fetch(`/api/admin/${endpoint}`, {
      method: 'POST',
      body: formData
    })
    const data = await res.json()
    if (res.ok && data.success) {
      showNotification(aMsg(`上传成功！ID： ${data.heroId || data.productId || data.blogId || ''}`, `Uploaded! ID: ${data.heroId || data.productId || data.blogId || ''}`))
      loadSection(reloadSection)
    } else {
      showNotification(`Failed: ${data.message || data.error}`, 'error')
    }
  } catch (e: any) {
    showNotification(`Failed: ${e.message}`, 'error')
  } finally {
    loading.value = false
  }
}

async function deleteItem(endpoint: string, id: string, reloadSection: string) {
  try {
    const res = await fetch(`/api/admin/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, code: id })
    })
    const data = await res.json()
    if (data.success) { showNotification(aMsg('删除成功', 'Deleted')); loadSection(reloadSection) }
    else showNotification(`Failed: ${data.message || data.error}`, 'error')
  } catch (e: any) { showNotification(`Failed: ${e.message}`, 'error') }
}

async function saveWxId() {
  const wxId = (document.getElementById('wxId') as HTMLInputElement)?.value
  try {
    const body: any = { wxId }
    if (emailVerified && pendingEmail) body.contactEmail = pendingEmail
    const r = await fetch('/api/settings', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
    const d = await r.json()
    if (d.success) { emailVerified = false; pendingEmail = ''; showNotification(aMsg('保存成功', 'Saved')) }
    else showNotification(aMsg('保存失败', 'Save failed'), 'error')
  } catch (e: any) { showNotification(e.message, 'error') }
}
async function changePassword() {
  const cur = (document.getElementById('currentPassword') as HTMLInputElement)?.value
  const pwd = (document.getElementById('newPassword') as HTMLInputElement)?.value
  const cfm = (document.getElementById('confirmPassword') as HTMLInputElement)?.value
  if (!cur) return showNotification(aMsg('请输入当前密码', 'Enter current password'), 'error')
  if (!pwd || pwd.length < 6) return showNotification(aMsg('新密码至少6位', 'Min 6 characters'), 'error')
  if (pwd !== cfm) return showNotification(aMsg('两次密码不一致', 'Passwords do not match'), 'error')
  try {
    const r = await fetch('/api/change-password', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ currentPassword: cur, newPassword: pwd }) })
    const d = await r.json()
    if (d.success) showNotification(aMsg('密码修改成功', 'Password changed'))
    else showNotification(d.message || aMsg('密码修改失败', 'Password change failed'), 'error')
  } catch (e: any) { showNotification(e.message, 'error') }
}

async function uploadHero() {
  const title = (document.getElementById('heroTitle') as HTMLInputElement)?.value
  const desc = (document.getElementById('heroDesc') as HTMLTextAreaElement)?.value
  const file = (document.getElementById('heroImage') as HTMLInputElement)?.files?.[0]
  if (!title || !desc || !file) return showNotification(aMsg('请填写所有字段', 'All fields required'), 'error')
  const fd = new FormData(); fd.append('title', title); fd.append('description', desc); fd.append('image', file)
  await uploadItem('upload-hero', fd, 'hero')
}

// Quick flavor data
const quickFlavors: Record<string, { en: string; zh: string }[]> = {
  '水果味': [
    { en: 'Lychee Ice', zh: '荔枝冰' }, { en: 'Grape Mist', zh: '葡萄雾' },
    { en: 'Watermelon Ice', zh: '西瓜冰' }, { en: 'Strawberry Blast', zh: '草莓爆炸' },
    { en: 'Green Grape', zh: '青提' }, { en: 'Mango Ice', zh: '芒果冰' },
    { en: 'Blueberry', zh: '蓝莓' }, { en: 'Peach Oolong', zh: '蜜桃乌龙' },
  ],
  '茶味': [
    { en: 'Jasmine Green Tea', zh: '茉莉花茶' }, { en: 'Osmanthus Oolong', zh: '桂花乌龙' },
    { en: 'Longjing Green', zh: '龙井' }, { en: 'Earl Grey', zh: '伯爵茶' },
    { en: 'Matcha Latte', zh: '抹茶拿铁' }, { en: 'Tieguanyin', zh: '铁观音' },
  ],
  '其他': [
    { en: 'Mung Bean', zh: '绿豆' }, { en: 'Taro Milk', zh: '香芋奶茶' },
    { en: 'Cola Ice', zh: '可乐冰' }, { en: 'Mint Blast', zh: '薄荷爆炸' },
    { en: 'Coffee Latte', zh: '咖啡拿铁' }, { en: 'Energy Drink', zh: '能量饮料' },
  ],
}

function buildFlavorPicker(series: string) {
  const flavors = quickFlavors[series] || quickFlavors['其他']
  return flavors.map(f =>
    `<button onclick="document.getElementById('specFlavor').value='${f.en}';document.getElementById('specFlavorZh').value='${f.zh}';updateProductPreview()" class="text-xs px-2 py-1 rounded-lg bg-white/5 hover:bg-gold/15 text-text-secondary hover:text-gold border border-white/5 hover:border-gold/30 transition-all">${f.zh}<span class="text-text-tertiary ml-1">${f.en}</span></button>`
  ).join('')
}

function updateProductPreview() {
  const name = (document.getElementById('productName') as HTMLInputElement)?.value || '产品名称'
  const flavor = (document.getElementById('specFlavor') as HTMLInputElement)?.value || ''
  const flavorZh = (document.getElementById('specFlavorZh') as HTMLInputElement)?.value || flavor
  const price = (document.getElementById('productPrice') as HTMLInputElement)?.value
  const compare = (document.getElementById('productComparePrice') as HTMLInputElement)?.value
  const prevTitle = document.getElementById('prevTitle')
  const prevPrice = document.getElementById('prevPrice')
  const prevCompare = document.getElementById('prevCompare')
  if (prevTitle) prevTitle.textContent = `${flavorZh || flavorName} / ${name}`
  if (prevPrice) prevPrice.textContent = price ? `$${price}` : ''
  if (prevCompare) {
    prevCompare.textContent = compare ? `$${compare}` : ''
    prevCompare.style.display = compare ? '' : 'none'
  }
}

async function uploadProduct() {
  const name = (document.getElementById('productName') as HTMLInputElement)?.value
  const desc = (document.getElementById('productDesc') as HTMLTextAreaElement)?.value
  const price = (document.getElementById('productPrice') as HTMLInputElement)?.value
  const comparePrice = (document.getElementById('productComparePrice') as HTMLInputElement)?.value
  const files = (document.getElementById('productImage') as HTMLInputElement)?.files
  const seriesZh = (document.getElementById('productSeries') as HTMLSelectElement)?.value
  const flavorName = (document.getElementById('specFlavor') as HTMLInputElement)?.value?.trim()
  const flavorZh = (document.getElementById('specFlavorZh') as HTMLInputElement)?.value?.trim()
  if (!name || !flavorName) return showNotification(aMsg('请填写产品名称和口味名称', 'Product name and flavor required'), 'error')

  // Series mapping
  const seriesMap: Record<string, { name: string; zh: string }> = {
    '水果味': { name: 'Fruit', zh: '水果味' },
    '茶味': { name: 'Tea', zh: '茶味' },
    '其他': { name: 'Other', zh: '其他' },
  }
  const series = seriesMap[seriesZh] || { name: 'Other', zh: '其他' }

  // Auto-append units to specs
  const specFields: { id: string; label: string; suffix: string }[] = [
    { id: 'specPuffs', label: 'Puffs', suffix: ' Puffs' },
    { id: 'specNicotine', label: 'Nicotine', suffix: '%' },
    { id: 'specBattery', label: 'Battery', suffix: 'mAh' },
    { id: 'specPod', label: 'Pod', suffix: 'ml' },
    { id: 'specCharging', label: 'Charging', suffix: '' },
  ]
  const specs: {label:string,value:string}[] = []
  specFields.forEach(f => {
    let val = (document.getElementById(f.id) as HTMLInputElement)?.value?.trim()
    if (!val) return
    if (f.suffix && !val.endsWith(f.suffix.replace(' ', ''))) {
      val += f.suffix
    }
    specs.push({ label: f.label, value: val })
  })

  const fd = new FormData()
  fd.append('name', name)
  fd.append('description', desc || '')
  fd.append('specs', JSON.stringify(specs))
  if (files && files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      fd.append('images', files[i])
    }
  }
  fd.append('seriesName', series.name)
  fd.append('seriesZh', series.zh)
  fd.append('flavorName', flavorName)
  fd.append('flavorZh', flavorZh || flavorName)
  if (price) fd.append('price', price)
  if (comparePrice) fd.append('comparePrice', comparePrice)
  await uploadItem('upload-product', fd, 'products')
}

async function batchUploadProducts() {
  const file = (document.getElementById('batchCsvFile') as HTMLInputElement)?.files?.[0]
  const defaultImg = (document.getElementById('batchDefaultImage') as HTMLInputElement)?.files?.[0]
  if (!file) return showNotification(aMsg('请选择CSV文件', 'Select a CSV file'), 'error')

  const btn = document.querySelector('#batchImportBtn') as HTMLButtonElement
  const result = document.getElementById('batchResult')

  // Read CSV locally to count rows
  const text = await file.text()
  const lines = text.trim().split('\n')
  const rowCount = lines.length - 1 // minus header
  if (rowCount <= 0) return showNotification(aMsg('CSV无数据行', 'CSV has no data'), 'error')

  const isZh = lang.value === 'zh'
  // Show preview
  if (result) {
    result.classList.remove('hidden', 'animate-pulse')
    result.innerHTML = isZh ? `📋 预览：将导入 <b>${rowCount}</b> 个产品` : `📋 Preview: importing <b>${rowCount}</b> products`
  }
  await new Promise(r => setTimeout(r, 800))

  // Start upload with progress
  if (btn) { btn.disabled = true; btn.textContent = isZh ? '⏳ 导入中...' : '⏳ Importing...' }
  if (result) { result.classList.add('animate-pulse'); result.innerHTML = isZh ? `⏳ 正在导入 ${rowCount} 个产品...` : `⏳ Importing ${rowCount} products...` }

  const fd = new FormData(); fd.append('file', file)
  if (defaultImg) fd.append('defaultImage', defaultImg)

  const startTime = Date.now()
  // Progress dots animation
  let dots = 0
  const progressTimer = setInterval(() => {
    if (result) {
      dots = (dots + 1) % 4
      result.innerHTML = isZh ? `⏳ 正在导入 ${rowCount} 个产品${'.'.repeat(dots)}` : `⏳ Importing ${rowCount} products${'.'.repeat(dots)}`
    }
  }, 500)

  try {
    const r = await fetch('/api/admin/upload-batch-products', { method: 'POST', body: fd })
    clearInterval(progressTimer)
    const d = await r.json()
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    if (d.success) {
      if (result) {
        result.classList.remove('animate-pulse')
        let namesHtml = ''
        if (d.names?.length) {
          namesHtml = '<div class="mt-1 text-xs text-text-tertiary">' + d.names.map((n: string) => n).join(' · ') + '</div>'
        }
        let skippedHtml = ''
        if (d.skipped > 0) {
          skippedHtml = isZh
            ? `<div class="mt-1 text-xs text-text-tertiary/60">⚠ 跳过 ${d.skipped} 个重复：${(d.skippedNames||[]).join(' · ')}</div>`
            : `<div class="mt-1 text-xs text-text-tertiary/60">⚠ Skipped ${d.skipped} duplicates: ${(d.skippedNames||[]).join(' · ')}</div>`
        }
        result.innerHTML = (isZh ? `✅ 成功导入 <b>${d.count}</b> 个产品（${elapsed}秒）` : `✅ Imported <b>${d.count}</b> products (${elapsed}s)`) + namesHtml + skippedHtml
      }
      showNotification(isZh ? `成功导入 ${d.count} 个产品` + (d.skipped > 0 ? `，跳过 ${d.skipped} 个重复` : '') : `Imported ${d.count} products` + (d.skipped > 0 ? `, skipped ${d.skipped} duplicates` : ''))
      setTimeout(() => loadSection('products'), 2500)
    } else {
      if (result) { result.classList.remove('animate-pulse'); result.innerHTML = `❌ ${d.message || (isZh ? '导入失败' : 'Import failed')}` }
      showNotification(d.message || aMsg('导入失败', 'Import failed'), 'error')
    }
  } catch (e: any) {
    clearInterval(progressTimer)
    if (result) { result.classList.remove('animate-pulse'); result.innerHTML = `❌ ${e.message}` }
    showNotification(e.message, 'error')
  }
  if (btn) { btn.disabled = false; btn.textContent = isZh ? '导入' : 'Import' }
}

async function uploadBlog() {
  const title = (document.getElementById('blogTitle') as HTMLInputElement)?.value
  const content = (document.getElementById('blogContent') as HTMLTextAreaElement)?.value
  const author = (document.getElementById('blogAuthor') as HTMLInputElement)?.value
  const tags = (document.getElementById('blogTags') as HTMLInputElement)?.value
  const file = (document.getElementById('blogImage') as HTMLInputElement)?.files?.[0]
  if (!title || !content || !author || !tags || !file) return showNotification(aMsg('请填写所有字段', 'All fields required'), 'error')
  const fd = new FormData(); fd.append('title', title); fd.append('content', content); fd.append('author', author); fd.append('tags', tags); fd.append('image', file)
  await uploadItem('upload-blog', fd, 'blogs')
}

async function uploadCode() {
  const file = (document.getElementById('codeFile') as HTMLInputElement)?.files?.[0]
  if (!file) return showNotification(aMsg('请选择CSV文件', 'Select a CSV file'), 'error')
  const fd = new FormData(); fd.append('file', file)
  await uploadItem('upload-code', fd, 'codes')
}


async function loadSection(section: string) {
  activeSection.value = section; loading.value = true
  try {
    let html = ''
    switch (section) {
      case 'hero': {
        html += `<div class="bg-surface rounded-2xl p-6 border border-border mb-8 space-y-4">
          <p class="text-xs text-text-tertiary">以下为默认模板值，可直接使用或修改</p>
          <input id="heroTitle" placeholder="标题" value="唐宋风味 · 新品尝鲜" class="form-input" />
          <textarea id="heroDesc" placeholder="描述" class="form-input">匠心打造，致敬东方韵味。每一口都是千年的传承。</textarea>
          <input id="heroImage" type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="text-text-secondary text-sm" />
          <button onclick="window._uploadHero()" class="btn btn-filled">上传轮播</button></div>
          <h3 class="text-lg font-semibold text-text-primary mb-4">轮播列表</h3>`
        const res = await fetch('/api/data/hero'); const items = await res.json()
        if (items?.length) {
          html += '<div class="space-y-3">'
          items.forEach((item: any) => {
            html += `<div class="content-item"><img src="${(item.image || '').replace(/^\/Uploads\b/, '/uploads') || '/uploads/placeholder.png'}" class="w-16 h-16 object-cover rounded-xl" />
              <div class="flex-1"><h4 class="text-sm font-medium text-text-primary">${item.title}</h4><p class="text-xs text-text-tertiary">${(item.description||'').slice(0,50)}</p></div>
              <div class="flex items-center gap-2"><button class="text-xs text-gold bg-gold/8 px-3 py-1 rounded-full hover:bg-gold/15 transition-colors" onclick="window._editHero('${item.id}','${item.title.replace(/'/g,"\\'")}','${item.description.replace(/'/g,"\\'")}')">编辑</button>
              <button class="btn-destructive" onclick="window._deleteHero('${item.id}')">删除</button></div></div>`
          }); html += '</div>'
        } else html += '<p class="text-text-secondary text-sm">暂无内容</p>'
        break
      }
      case 'products': {
        html += `<div class="grid lg:grid-cols-[1fr_300px] gap-6">
          <div class="space-y-5">
            <div class="bg-surface rounded-2xl p-6 border border-border space-y-4">
              <!-- 1. Name + Series -->
              <div class="flex gap-3">
                <input id="productName" placeholder="英文名 / 中文名" value="LAFA Pod Pro / 拉法雾化器" class="form-input flex-1" autocomplete="off" oninput="updateProductPreview()" />
                <label class="flex items-center gap-2">
                  <span class="text-xs text-text-secondary shrink-0">口味分类</span>
                  <select id="productSeries" onchange="
                    document.getElementById('flavorPicker').innerHTML = window._buildFlavorPicker(this.value);
                    document.getElementById('specFlavor').value=''; document.getElementById('specFlavorZh').value='';
                    updateProductPreview();
                  " class="form-input">
                    <option value="水果味">水果味</option>
                    <option value="茶味">茶味</option>
                    <option value="其他" selected>其他</option>
                  </select>
                </label>
              </div>

              <!-- 2. Quick flavor picker -->
              <div>
                <label class="form-label mb-1.5">快捷选口味 <span class="text-xs text-text-tertiary">（点击自动填入）</span></label>
                <div id="flavorPicker" class="flex flex-wrap gap-1.5">${buildFlavorPicker('其他')}</div>
                <div class="flex gap-2 mt-3">
                  <input id="specFlavor" placeholder="口味英文名" value="Lychee Ice" class="form-input flex-1" autocomplete="off" oninput="updateProductPreview()" />
                  <input id="specFlavorZh" placeholder="口味中文名" value="荔枝冰" class="form-input flex-1" autocomplete="off" oninput="updateProductPreview()" />
                </div>
              </div>

              <!-- 3. Price -->
              <div class="flex gap-3">
                <div class="flex-1"><label class="form-label">价格 $</label><input id="productPrice" value="24.99" class="form-input" oninput="updateProductPreview()" /></div>
                <div class="flex-1"><label class="form-label">原价 $ <span class="text-text-tertiary text-xs">(划线)</span></label><input id="productComparePrice" value="34.99" class="form-input" oninput="updateProductPreview()" /></div>
              </div>

              <!-- 4. Image drop zone -->
              <div>
                <label class="form-label">产品图片 <span class="text-xs text-text-tertiary">（可多张）</span></label>
                <label id="imgDropZone" for="productImage" class="flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-gold/40 hover:bg-gold/[0.02] transition-all">
                  <span class="text-2xl">📸</span>
                  <p class="text-sm text-text-secondary">点击或拖拽上传图片</p>
                  <p class="text-xs text-text-tertiary">第一张为主图，可多选</p>
                  <p id="imgCount" class="text-xs text-gold hidden"></p>
                </label>
                <input id="productImage" type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" class="hidden" onchange="document.getElementById('imgCount').textContent='已选 '+this.files.length+' 张';document.getElementById('imgCount').classList.remove('hidden')" />
              </div>

              <!-- 5. Advanced (hidden by default) -->
              <details class="mt-2">
                <summary class="text-xs text-text-tertiary cursor-pointer hover:text-text-secondary">⚙️ 高级设置（参数、描述）</summary>
                <div class="mt-3 space-y-3 pl-1">
                  <div>
                    <label class="form-label">产品描述 <span class="text-text-tertiary text-xs">(选填，支持HTML/图片)</span></label>
                    <textarea id="productDesc" placeholder="产品描述（可选，可粘贴图片地址）" class="form-input" rows="2">新一代雾化体验，口感纯净，造型优雅。</textarea>
                    <p class="text-xs text-text-tertiary mt-1">插入图片：&lt;img src="/uploads/xxx.webp" /&gt;</p>
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <div><label class="form-label text-xs">口数 <span class="text-text-tertiary">(puffs)</span></label><input id="specPuffs" placeholder="600" value="600" class="form-input" /></div>
                    <div><label class="form-label text-xs">尼古丁 <span class="text-text-tertiary">(%)</span></label><input id="specNicotine" placeholder="3" value="3" class="form-input" /></div>
                    <div><label class="form-label text-xs">电池 <span class="text-text-tertiary">(mAh)</span></label><input id="specBattery" placeholder="350" value="350" class="form-input" /></div>
                    <div><label class="form-label text-xs">烟弹 <span class="text-text-tertiary">(ml)</span></label><input id="specPod" placeholder="1.8" value="1.8" class="form-input" /></div>
                    <div><label class="form-label text-xs">充电</label><input id="specCharging" placeholder="USB-C" value="USB-C" class="form-input" /></div>
                  </div>
                </div>
              </details>

              <!-- 6. Submit -->
              <button onclick="window._uploadProduct()" class="btn btn-filled w-full py-2.5 text-sm font-semibold">🚀 发布产品</button>
            </div>

            <!-- Batch import -->
            <details class="bg-surface rounded-2xl p-5 border border-border">
              <summary class="text-sm font-medium text-text-primary cursor-pointer">📦 批量导入 CSV</summary>
              <div class="mt-3 space-y-3">
                <p class="text-xs text-text-tertiary">
                  列：name(品名), categoryName(分类), categoryZh(分类中文), flavorName, flavorZh, price, comparePrice, puffs, nicotine, battery, pod, charging
                  <a href="/product-template.csv" download class="text-gold hover:underline ml-2">📥 下载模板</a>
                </p>
                <div class="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <div><label class="form-label text-xs">CSV 文件</label><input id="batchCsvFile" type="file" accept=".csv" class="text-xs text-text-secondary w-full" /></div>
                  <div><label class="form-label text-xs">默认图片 <span class="text-text-tertiary">(选填)</span></label><input id="batchDefaultImage" type="file" accept="image/jpeg,image/png,image/webp" class="text-xs text-text-secondary w-full" /></div>
                  <div class="flex items-end"><button id="batchImportBtn" onclick="window._batchUploadProducts()" class="btn btn-filled text-xs">导入</button></div>
                </div>
                <p id="batchResult" class="text-xs text-gold/80 hidden animate-pulse">正在处理，请稍候...</p>
              </div>
            </details>

            <!-- Product list -->
            <h3 class="text-lg font-semibold text-text-primary mt-4">产品列表</h3>`
        const res = await fetch('/api/data/products'); const items = await res.json()
        if (items?.length) {
          html += '<div class="space-y-2">'
          items.forEach((item: any) => {
            const flavors = item.series?.[0]?.flavors?.map((f:any) => f.zh || f.name).join(', ') || ''
            const priceStr = item.price ? `$${item.price}` : ''
            html += `<div class="content-item"><img src="${(item.image || '').replace(/^\/Uploads\b/, '/uploads') || '/uploads/placeholder.png'}" class="w-12 h-12 object-cover rounded-lg" />
              <div class="flex-1 min-w-0"><h4 class="text-sm font-medium text-text-primary truncate">${item.name}</h4><p class="text-xs text-text-tertiary">${flavors || '无口味'} · ${item.series?.[0]?.zh || ''}</p></div>
              <span class="text-sm font-semibold text-gold shrink-0">${priceStr}</span>
              <button class="btn-destructive text-xs" onclick="window._deleteProduct('${item.id}')">🗑</button></div>`
          }); html += '</div>'
        } else html += '<p class="text-text-secondary text-sm">暂无产品</p>'
        html += '</div>'

        // Right: Live Preview
        html += `<div class="hidden lg:block">
            <h3 class="text-sm font-medium text-text-secondary mb-3">实时预览</h3>
            <div id="productPreview" class="card overflow-hidden sticky top-6" style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:16px">
              <div class="card-media bg-white/5 h-40 flex items-center justify-center text-text-tertiary text-sm">
                上传图片后预览
              </div>
              <div class="card-body p-4">
                <h3 id="prevTitle" class="text-sm font-semibold text-text-primary">LAFA Pod Pro - Lychee Ice</h3>
                <div class="flex items-baseline gap-2 mt-2">
                  <span id="prevPrice" class="text-sm font-semibold text-text-primary">$24.99</span>
                  <span id="prevCompare" class="text-xs line-through" style="color:#C41E24">$34.99</span>
                </div>
              </div>
            </div>
          </div>`

        break
      }
      case 'codes': {
        const [statsRes, codesRes] = await Promise.all([fetch('/api/admin/codes-stats'), fetch('/api/admin/codes')])
        const stats = await statsRes.json(); const codes = await codesRes.json()
        html += `<p class="text-text-secondary mb-6">总计： ${stats.total || 0} 条 · 查询： ${stats.total_queries || 0}</p>`
        html += `<div class="bg-surface rounded-2xl p-6 border border-border mb-8 space-y-4"><input id="codeFile" type="file" accept=".csv" class="text-text-secondary text-sm" /><button onclick="window._uploadCode()" class="btn btn-filled">上传CSV</button></div><h3 class="text-lg font-semibold text-text-primary mb-4">防伪码列表（前100条）</h3>`
        if (codes?.length) {
          html += '<div class="space-y-2">'
          codes.forEach((c: any) => { html += `<div class="content-item"><span class="flex-1 text-text-secondary text-sm">${c.code} · ${c.flavor||'-'} · ${c.date||'-'} · 查询次数： ${c.query_count||0}</span><button class="btn-destructive" onclick="window._deleteCode('${c.code}')">删除</button></div>` })
          html += '</div>'
        } else html += '<p class="text-text-secondary text-sm">暂无防伪码</p>'
        break
      }
      case 'blogs': {
        html += `<div class="bg-surface rounded-2xl p-6 border border-border mb-8 space-y-4">
          <p class="text-xs text-text-tertiary">以下为默认模板值，可直接使用或修改</p>
          <input id="blogTitle" placeholder="标题" value="新品发布：东方韵味系列" class="form-input" />
          <textarea id="blogContent" placeholder="内容" class="form-input">从唐宋茶文化中汲取灵感，我们推出了全新东方韵味系列...</textarea>
          <input id="blogAuthor" placeholder="作者" value="LAFA Editorial" class="form-input" />
          <input id="blogTags" placeholder="标签（逗号分隔）" value="新品,东方,风味" class="form-input" />
          <input id="blogImage" type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="text-text-secondary text-sm" />
          <button onclick="window._uploadBlog()" class="btn btn-filled">上传文章</button></div>
          <h3 class="text-lg font-semibold text-text-primary mb-4">文章列表</h3>`
        const res = await fetch('/api/data/blog'); const items = await res.json()
        if (items?.length) {
          html += '<div class="space-y-3">'
          items.forEach((item: any) => {
            html += `<div class="content-item"><img src="${item.image||'/uploads/placeholder.png'}" class="w-16 h-16 object-cover rounded-xl" />
              <div class="flex-1"><h4 class="text-sm font-medium text-text-primary">${item.title}</h4><p class="text-xs text-text-tertiary">${item.excerpt||''}</p><p class="text-xs text-text-tertiary/50">${item.author} · ${item.date}</p></div>
              <div class="flex items-center gap-2"><button class="text-xs text-gold bg-gold/8 px-3 py-1 rounded-full hover:bg-gold/15 transition-colors" onclick="window._editBlog('${item.id}','${item.title.replace(/'/g,"\\'")}','${item.content.replace(/'/g,"\\'").replace(/\n/g,'\\n')}','${item.author.replace(/'/g,"\\'")}','${(item.tags||[]).join(',').replace(/'/g,"\\'")}')">编辑</button>
              <button class="btn-destructive" onclick="window._deleteBlog('${item.id}')">删除</button></div></div>`
          }); html += '</div>'
        } else html += '<p class="text-text-secondary text-sm">暂无内容</p>'
        break
      }
      case 'contacts': {
        try {
          const res = await fetch('/api/admin/contacts'); const data = await res.json()
          const contacts = data.contacts || []; const subscribers = data.subscribers || []
          html += '<h3 class="text-lg font-semibold text-text-primary mb-4">最近消息</h3>'
          if (contacts.length) {
            html += '<div class="space-y-3 mb-8">'
            contacts.forEach((c: any) => { html += `<div class="content-item"><div class="flex-1"><p class="text-sm font-medium text-text-primary">${c.name||'匿名'} <span class="text-text-tertiary text-xs font-normal ml-2">${c.email||''}</span></p><p class="text-[0.8125rem] text-text-secondary mt-1">${c.message||''}</p></div></div>` })
            html += '</div>'
          } else html += '<p class="text-text-secondary text-sm mb-8">暂无消息.</p>'
          html += '<h3 class="text-lg font-semibold text-text-primary mb-4">订阅者</h3>'
          if (subscribers.length) {
            html += '<div class="space-y-2">'
            subscribers.forEach((s: any) => { html += `<div class="content-item"><span class="flex-1 text-text-secondary text-sm">${s.email}</span><span class="text-text-tertiary text-xs">${s.subscribed_at?.split('T')[0]||''}</span></div>` })
            html += '</div>'
          } else html += '<p class="text-text-secondary text-sm">暂无订阅.</p>'
        } catch (e: any) { html += `<p class="text-accent-red">Error: ${e.message}</p>` }
        break
      }
      case 'referrals': {
        try {
          const res = await fetch('/api/admin/referral-claims'); const data = await res.json()
          const refs = data.referrals || {}; const claims = data.claims || []
          html += `<div class="grid grid-cols-3 gap-4 mb-8">
            <div class="bg-surface rounded-2xl p-5 text-center border border-border"><p class="text-[1.5rem] font-semibold text-text-primary">${refs.total||0}</p><p class="text-[0.6875rem] text-text-tertiary uppercase tracking-[0.1em]">总点击</p></div>
            <div class="bg-surface rounded-2xl p-5 text-center border border-border"><p class="text-[1.5rem] font-semibold text-text-primary">${refs.shares||0}</p><p class="text-[0.6875rem] text-text-tertiary uppercase tracking-[0.1em]">分享次数</p></div>
            <div class="bg-surface rounded-2xl p-5 text-center border border-border"><p class="text-[1.5rem] font-semibold text-text-primary">${refs.visits||0}</p><p class="text-[0.6875rem] text-text-tertiary uppercase tracking-[0.1em]">访问次数</p></div></div>`
          const referrers = refs.referrers || {}; const refIds = Object.keys(referrers)
          if (refIds.length) {
            html += '<h3 class="text-lg font-semibold text-text-primary mb-4">推荐排行</h3><div class="space-y-2 mb-8">'
            refIds.sort((a:string,b:string) => (referrers[b]?.visits||0)-(referrers[a]?.次访问||0))
            refIds.slice(0,20).forEach((rid:string) => { const r = referrers[rid]; html += `<div class="content-item"><span class="flex-1 text-text-secondary text-sm font-mono">${rid}</span><span class="text-text-tertiary text-sm">${r.visits} 次访问</span></div>` })
            html += '</div>'
          }
          html += '<h3 class="text-lg font-semibold text-text-primary mb-4">奖励申请</h3>'
          if (claims.length) {
            html += '<div class="space-y-3">'
            claims.forEach((c:any,i:number) => {
              const isFulfilled = c.status === 'fulfilled'
              html += `<div class="content-item"><div class="flex-1"><div class="flex items-center gap-2 mb-1"><span class="text-sm font-medium text-text-primary">${c.title}</span><span class="text-[0.6875rem] px-2 py-0.5 rounded-full ${isFulfilled?'bg-green-500/15 text-green-400':'bg-gold/15 text-gold'}">${c.status}</span></div><p class="text-[0.8125rem] text-text-secondary">👤 ${c.contact}</p><p class="text-[0.6875rem] text-text-tertiary">ID: ${c.userId} · ${new Date(c.claimedAt).toLocaleString()}</p></div><button class="text-xs font-medium ${isFulfilled?'text-text-tertiary bg-white/5':'text-gold bg-gold/10'} px-3 py-1.5 rounded-full hover:bg-gold/20 transition-colors" onclick="window._fulfillClaim(${i})">${isFulfilled?'撤销':'处理'}</button></div>`
            }); html += '</div>'
          } else html += '<p class="text-text-secondary text-sm">暂无奖励申请.</p>'
        } catch (e: any) { html += `<p class="text-accent-red">Error: ${e.message}</p>` }
        break
      }
      case 'settings': {
        let s: any = {}
        try { s = await (await fetch('/api/data/settings')).json() } catch {}
        html += `<div class="space-y-6">
          <div class="bg-surface rounded-2xl p-6 border border-border"><label class="form-label mb-2">微信号</label><div class="flex gap-2"><input id="wxId" placeholder="你的微信号" value="${s.wxId||''}" class="form-input flex-1" /><button onclick="window._saveWxId()" class="btn btn-outline text-xs shrink-0">保存</button></div></div>
          <div class="bg-surface rounded-2xl p-6 border border-border"><label class="form-label mb-2">联系邮箱</label><div class="flex gap-2"><input id="contactEmail" placeholder="你的邮箱" value="${s.contactEmail||''}" class="form-input flex-1" /><button id="sendCodeBtn" onclick="window._sendVerifyCode()" class="btn btn-outline text-xs shrink-0">发送验证码</button></div><div id="verifyCodeRow" style="display:none" class="flex gap-2 mt-2"><input id="verifyCode" placeholder="验证码" class="form-input flex-1" maxlength="6" /><button onclick="window._verifyCode()" class="btn btn-filled text-xs shrink-0">验证</button></div></div>
          <div class="bg-surface rounded-2xl p-6 border border-border"><label class="form-label mb-2">修改密码</label><div class="space-y-2"><input id="currentPassword" type="password" placeholder="当前密码" class="form-input" /><input id="newPassword" type="password" placeholder="新密码" class="form-input" /><input id="confirmPassword" type="password" placeholder="确认新密码" class="form-input" /><button onclick="window._changePassword()" class="btn btn-outline text-xs">修改密码</button></div></div></div>`
        break
      }
    }
    contentHtml.value = html
  } catch (e: any) {
    contentHtml.value = `<p class="text-accent-red">Error: ${e.message}</p>`
  } finally {
    loading.value = false
    nextTick(() => {
      setTimeout(() => {
        const saved = JSON.parse(localStorage.getItem("admin_form_" + section) || "{}");
        Object.keys(saved).forEach(id => {
          const el = document.getElementById(id);
          if (el) (el as HTMLInputElement).value = saved[id];
        });
      }, 100);
      ;(window as any)._uploadHero = uploadHero
      ;(window as any)._uploadProduct = uploadProduct
      ;(window as any)._batchUploadProducts = batchUploadProducts
      ;(window as any)._buildFlavorPicker = buildFlavorPicker
      ;(window as any).updateProductPreview = updateProductPreview
      ;(window as any)._uploadBlog = uploadBlog
      ;(window as any)._uploadCode = uploadCode
      ;(window as any)._saveWxId = saveWxId
      ;(window as any)._changePassword = changePassword
      ;(window as any)._deleteHero = (id: string) => deleteItem('delete-hero', id, 'hero')
      ;(window as any)._deleteProduct = (id: string) => deleteItem('delete-product', id, 'products')
      ;(window as any)._deleteBlog = (id: string) => deleteItem('delete-blog', id, 'blogs')
      ;(window as any)._deleteCode = (code: string) => deleteItem('delete-code', code, 'codes')
      ;(window as any)._editHero = (id: string, title: string, desc: string) => openEditModal('hero', { id, title, description: desc })
      ;(window as any)._editProduct = async (id: string, name: string, desc: string) => {
        try { const r = await fetch('/api/data/products'); const items = await r.json(); const item = items.find((p:any) => String(p.id) === String(id)); openEditModal('product', item || { id, name, description: desc, specs:[] }) }
        catch { openEditModal('product', { id, name, description: desc, specs:[] }) }
      }
      ;(window as any)._editBlog = (id: string, title: string, content: string, author: string, tags: string) => openEditModal('blog', { id, title, content, author, tags: tags.split(',').filter(t => t.trim()) })
      let emailVerified = false; let pendingEmail = ''
      ;(window as any)._sendVerifyCode = async () => {
        const email = (document.getElementById('contactEmail') as HTMLInputElement)?.value?.trim()
        if (!email) return showNotification('请先输入邮箱', 'error')
        pendingEmail = email; const btn = document.getElementById('sendCodeBtn')
        if (btn) { btn.textContent = '...'; (btn as HTMLButtonElement).disabled = true }
        try {
          const res = await fetch('/api/admin/send-verify-email', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email}) })
          const data = await res.json()
          if (data.success) { showNotification(data.sent ? "验证码已发送至 " + email : "邮件发送失败，验证码: " + data.code); const row = document.getElementById('verifyCodeRow'); if (row) row.style.display = 'flex'; const codeInput = document.getElementById('verifyCode') as HTMLInputElement; if (codeInput) codeInput.value = data.code }
          else showNotification(data.message||'操作失败','error')
        } catch (e:any) { showNotification(e.message,'error') }
        if (btn) { btn.textContent = 'Send Code'; (btn as HTMLButtonElement).disabled = false }
      }
      ;(window as any)._verifyCode = async () => {
        const code = (document.getElementById('verifyCode') as HTMLInputElement)?.value?.trim()
        if (!code) return showNotification('请输入验证码','error')
        try {
          const res = await fetch('/api/admin/verify-email-code', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email:pendingEmail,code}) })
          const data = await res.json()
          if (data.success) { emailVerified = true; showNotification('邮箱已验证，请点击保存设置'); const row = document.getElementById('verifyCodeRow'); if (row) row.style.display = 'none'; const btn = document.getElementById('sendCodeBtn'); if (btn) { btn.textContent = '✓ 已验证'; btn.style.color = '#4ade80' } }
          else showNotification(data.message||'验证码无效','error')
        } catch (e:any) { showNotification(e.message,'error') }
      }
      ;(window as any)._fulfillClaim = async (index: number) => {
        try { const res = await fetch('/api/admin/referral-fulfill', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({index}) }); const data = await res.json()
        if (data.success) showNotification(`申请 ${data.status==='已处理'?'已处理':'已重开'}!`); loadSection('referrals') }
        catch (e:any) { showNotification(e.message,'error') }
      }
    })
  }
}

onMounted(() => { loadSection('products') })
const menuOpen = ref(false)
function toggleMenu() { menuOpen.value = !menuOpen.value }
</script>

<template>
  <div class="min-h-screen bg-black">
    <nav class="nav-glass h-12 flex items-center px-5 md:px-10">
      <div class="w-full max-w-[1200px] mx-auto flex items-center justify-between">
        <div class="flex items-center gap-8">
          <span class="text-sm font-semibold text-text-primary">管理后台</span>
          <div class="hidden md:flex items-center gap-6">
            <a v-for="s in ['products', 'hero', 'codes', 'blogs', 'contacts', 'settings', 'referrals']" :key="s" href="#" @click.prevent="loadSection(s)" class="text-xs text-text-secondary hover:text-text-primary transition-colors uppercase tracking-wider" :class="{ 'admin-nav-link-active': activeSection===s }">{{ s==='hero'?'首页轮播':s==='products'?'产品管理':s==='codes'?'防伪码':s==='blogs'?'博客管理':s==='contacts'?'消息订阅':s==='settings'?'系统设置':'推荐裂变' }}</a>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <NuxtLink to="/" class="text-xs text-text-secondary hover:text-text-primary transition-colors">← 网站</NuxtLink>
          <button class="md:hidden text-text-secondary" @click="toggleMenu">{{ menuOpen ? '✕' : '☰' }}</button>
        </div>
      </div>
    </nav>
    <div v-if="menuOpen" class="fixed inset-0 top-12 z-40 bg-black/95 backdrop-blur-xl flex flex-col items-center pt-16 gap-6 md:hidden" @click="menuOpen=false">
      <a v-for="s in ['products', 'hero', 'codes', 'blogs', 'contacts', 'settings', 'referrals']" :key="s" href="#" @click.prevent="loadSection(s);menuOpen=false" class="text-xl font-medium text-text-secondary hover:text-text-primary transition-colors uppercase tracking-wider" :class="{ 'admin-nav-link-active': activeSection===s }">{{ s==='hero'?'首页轮播':s==='products'?'产品管理':s==='codes'?'防伪码':s==='blogs'?'博客管理':s==='contacts'?'消息订阅':s==='settings'?'系统设置':'推荐裂变' }}</a>
    </div>
    <div class="max-w-[1280px] mx-auto p-5 md:p-8" style="padding-top:100px">
      <div v-if="loading" class="flex justify-center py-8"><div class="skeleton h-6 w-32"></div></div>
      <div v-html="contentHtml"></div>
    </div>
    <!-- Edit Modal -->
    <Teleport to="body">
      <div v-if="editModal.open" class="fixed inset-0 z-[300] flex items-center justify-center p-5" style="background:rgba(0,0,0,0.8);backdrop-filter:blur(8px)">
        <div class="bg-surface rounded-[24px] p-6 md:p-8 w-full max-w-[480px] max-h-[90vh] overflow-y-auto border border-border">
          <div class="flex items-center justify-between mb-6"><h3 class="text-lg font-semibold text-text-primary capitalize">编辑{{ editModal.type }}</h3><button class="text-text-secondary hover:text-text-primary text-xl leading-none" @click="closeEditModal">✕</button></div>
          <div class="space-y-4">
            <template v-if="editModal.type==='hero'"><input v-model="editModal.title" placeholder="标题" class="form-input"><textarea v-model="editModal.description" placeholder="描述" class="form-input" rows="3"></textarea></template>
            <template v-else-if="editModal.type==='product'">
              <input v-model="editModal.name" placeholder="名称" class="form-input">
              <textarea v-model="editModal.description" placeholder="描述" class="form-input" rows="2"></textarea>
              <div class="grid grid-cols-2 gap-2">
                <div><label class="form-label">价格（$）</label><input v-model="editModal.price" placeholder="24.99" class="form-input"></div>
                <div><label class="form-label">对比价（$）</label><input v-model="editModal.comparePrice" placeholder="34.99" class="form-input"></div>
                <div><label class="form-label">口味</label><input v-model="editModal.specFlavor" placeholder="Lychee Ice" class="form-input"></div>
                <div><label class="form-label">口数</label><input v-model="editModal.specPuffs" placeholder="600" class="form-input"></div>
                <div><label class="form-label">尼古丁</label><input v-model="editModal.specNicotine" placeholder="3%" class="form-input"></div>
                <div><label class="form-label">电池</label><input v-model="editModal.specBattery" placeholder="350mAh" class="form-input"></div>
                <div><label class="form-label">烟弹</label><input v-model="editModal.specPod" placeholder="1.8ml" class="form-input"></div>
                <div><label class="form-label">充电</label><input v-model="editModal.specCharging" placeholder="USB-C" class="form-input"></div>
              </div>
              <div><label class="form-label">评价（名称 | 评分 | 内容）</label><textarea v-model="editModal.reviews" placeholder="Alex|5|Great flavor!" class="form-input" rows="3"></textarea></div>
            </template>
            <template v-else-if="editModal.type==='blog'"><input v-model="editModal.title" placeholder="标题" class="form-input"><textarea v-model="editModal.content" placeholder="内容" class="form-input" rows="5"></textarea><input v-model="editModal.author" placeholder="作者" class="form-input"><input v-model="editModal.tags" placeholder="标签（逗号分隔）" class="form-input"></template>
            <div><label class="form-label">图片（可选）</label><input id="editImage" type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="text-text-secondary text-sm"></div>
          </div>
          <div class="flex gap-3 mt-6"><button class="btn btn-filled flex-1" @click="submitEdit">保存</button><button class="btn btn-outline flex-1" @click="closeEditModal">取消</button></div>
        </div>
      </div>
    </Teleport>
    <Teleport to="body"><div v-if="notification.show" class="notification" :class="notification.type">{{ notification.message }}</div></Teleport>
  </div>
</template>
