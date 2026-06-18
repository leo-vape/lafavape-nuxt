<script setup lang="ts">
const { t, lang } = useI18n()
const { data: products } = await useFetch('/api/data/products', { default: () => [] })
const { data: stats } = await useFetch('/api/referral-stats', { default: () => ({ total: 0, shares: 0, visits: 0, referrers: {} }) })

const userId = ref('')
const referrals = ref(0)
const showShare = ref(false)
const shareLink = ref('')
const shareTitle = ref('')
const copied = ref(false)
const showClaim = ref(false)
const claimTier = ref(0)
const claimTitle = ref('')
const contact = ref('')

onMounted(() => {
  let id = localStorage.getItem('lafavape_ref_id')
  if (!id) { id = 'r_' + Math.random().toString(36).slice(2, 10); localStorage.setItem('lafavape_ref_id', id) }
  userId.value = id
  // Get referral visit count from server
  const refData = (stats.value as any)?.referrers?.[id]
  referrals.value = refData?.visits || 0
})

const REWARDS = computed(() => [
  { tier: 1, title: lang.value === 'zh' ? '欢迎礼' : 'Welcome Gift', need: 1 },
  { tier: 3, title: lang.value === 'zh' ? '银质奖励' : 'Silver Reward', need: 3 },
  { tier: 5, title: lang.value === 'zh' ? '金质奖励' : 'Gold Reward', need: 5 },
  { tier: 10, title: lang.value === 'zh' ? 'VIP 专属礼盒' : 'VIP Gift Box', need: 10 },
])

function getShareLink(productId?: number) {
  const base = 'https://lafavape.com'
  const path = productId ? `/product/${productId}` : ''
  return `${base}${path}?ref=${userId.value}`
}

function openShare(product?: any) {
  shareLink.value = getShareLink(product?.id)
  shareTitle.value = product ? product.name : 'LAFA Vape'
  showShare.value = true
}

async function copyLink() {
  await navigator.clipboard.writeText(shareLink.value)
  copied.value = true; setTimeout(() => copied.value = false, 2000)
  fetch('/api/referral-click', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product: shareTitle.value, type: 'share', refId: userId.value })
  }).catch(() => {})
  // Refresh referral count
  setTimeout(async () => {
    const r = await fetch('/api/referral-stats'); const d = await r.json()
    referrals.value = d.referrers?.[userId.value]?.visits || 0
  }, 500)
}

function openClaim(tier: number, title: string) {
  claimTier.value = tier; claimTitle.value = title; contact.value = ''
  showClaim.value = true
}

async function submitClaim() {
  if (!contact.value.trim()) return
  await fetch('/api/referral-reward', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: userId.value, tier: claimTier.value, title: claimTitle.value, contact: contact.value.trim() })
  })
  showClaim.value = false
}

useHead({ title: 'Refer a Friend — LAFA' })
</script>

<template>
  <section class="section section-alt pt-20">
    <div class="max-w-[900px] mx-auto text-center">
      <h1 class="sec-label mb-4">
        {{ lang === 'zh' ? '推荐给朋友' : 'Refer a Friend' }}
      </h1>
      <p class="section-subheading mx-auto mb-12">
        {{ lang === 'zh'
          ? '分享你的专属链接给朋友。朋友通过你的链接访问，你就能获得奖励。'
          : 'Share your unique link. When friends visit through your link, you earn rewards.' }}
      </p>

      <!-- Stats -->
      <div class="flex items-center justify-center gap-6 mb-12">
        <div class="bg-[#0a0a0a] rounded-2xl px-8 py-4 text-center border border-border">
          <p class="text-[1.5rem] font-semibold text-text-primary">{{ stats.total || 0 }}</p>
          <p class="text-[0.6875rem] text-text-tertiary uppercase tracking-[0.1em]">{{ lang === 'zh' ? '总分享' : 'Total Shares' }}</p>
        </div>
        <div class="bg-[#0a0a0a] rounded-2xl px-8 py-4 text-center border border-border">
          <p class="text-[1.5rem] font-semibold text-text-primary">{{ referrals }}</p>
          <p class="text-[0.6875rem] text-text-tertiary uppercase tracking-[0.1em]">{{ lang === 'zh' ? '我的推荐访问' : 'My Referrals' }}</p>
        </div>
      </div>

      <!-- Rewards Progress -->
      <div class="bg-[#0a0a0a] rounded-2xl p-6 mb-8 border border-border max-w-[440px] mx-auto">
        <p class="text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-text-tertiary mb-4">
          {{ lang === 'zh' ? '奖励进度' : 'Reward Progress' }}
        </p>
        <div class="space-y-3">
          <div v-for="r in REWARDS" :key="r.tier" class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
              :class="referrals >= r.need ? 'bg-gold/20 text-gold' : 'bg-white/5 text-text-tertiary'">
              {{ referrals >= r.need ? '✓' : r.need }}
            </div>
            <div class="flex-1 text-left">
              <p class="text-[0.8125rem] font-medium text-text-primary">{{ r.title }}</p>
              <p class="text-[0.6875rem] text-text-tertiary">{{ r.need }}+ {{ lang === 'zh' ? '次推荐访问' : 'referral visits' }}</p>
            </div>
            <button
              v-if="referrals >= r.need"
              class="text-[0.75rem] font-semibold text-gold bg-gold/10 px-3 py-1.5 rounded-full hover:bg-gold/20 transition-colors"
              @click="openClaim(r.tier, r.title)">
              {{ lang === 'zh' ? '领取' : 'Claim' }}
            </button>
            <span v-else class="text-[0.6875rem] text-text-tertiary">
              {{ lang === 'zh' ? '未解锁' : 'Locked' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Product Share Cards -->
      <p class="text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-text-tertiary mb-4">
        {{ lang === 'zh' ? '选择产品分享' : 'Share a Product' }}
      </p>
      <div v-if="(products as any[]).length" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div v-for="item in (products as any[])" :key="item.id"
          class="bg-[#0a0a0a] rounded-2xl p-4 flex items-center gap-4 text-left border border-border hover:border-border-active transition-colors cursor-pointer"
          @click="openShare(item)">
          <img :src="'/uploads/' + (item.image || '').replace(/^.*[\\/]/, '')"
            class="w-12 h-12 rounded-xl object-cover flex-shrink-0"
            @error="(e: any) => e.target.src = '/uploads/placeholder.png'">
          <div class="flex-1 min-w-0">
            <p class="text-[0.875rem] font-semibold text-text-primary truncate">{{ item.name }}</p>
            <p class="text-[0.6875rem] text-text-tertiary truncate">{{ item.specs?.map((s:any) => s.value).join(' · ') }}</p>
          </div>
          <span class="text-gold text-lg flex-shrink-0">📤</span>
        </div>
      </div>

      <!-- General Share -->
      <button class="btn btn-outline" @click="openShare()">
        📤 {{ lang === 'zh' ? '分享 LAFA Vape' : 'Share LAFA Vape' }}
      </button>
    </div>

    <!-- Share Modal -->
    <Teleport to="body">
      <div v-if="showShare" class="fixed inset-0 flex items-center justify-center p-5" style="z-index:300;background:rgba(0,0,0,0.88);backdrop-filter:blur(8px)" @click="showShare = false">
        <div class="bg-[#111] rounded-2xl p-6 max-w-[360px] w-full text-center border border-border" @click.stop>
          <p class="text-xl mb-2">📤</p>
          <p class="text-[0.9375rem] font-semibold text-text-primary mb-1">
            {{ lang === 'zh' ? '你的专属分享链接' : 'Your Unique Share Link' }}
          </p>
          <p class="text-[0.75rem] text-text-secondary mb-4">
            {{ lang === 'zh' ? '朋友通过此链接访问，计入你的推荐' : 'Visits through this link count as your referral.' }}
          </p>
          <div class="flex gap-2 mb-3">
            <input :value="shareLink" readonly class="form-input flex-1 text-[0.6875rem] text-center" @click="($event.target as HTMLInputElement).select()">
            <button class="btn btn-filled text-[0.8125rem] shrink-0" @click="copyLink">
              {{ copied ? '✓' : (lang === 'zh' ? '复制' : 'Copy') }}
            </button>
          </div>
          <div class="bg-[#0a0a0a] rounded-xl p-4 mt-4">
            <p class="text-[0.75rem] text-text-secondary leading-relaxed">
              {{ lang === 'zh'
                ? '💡 微信中打开？点击右上角 ··· → 分享给朋友。链接中已包含你的专属推荐码。'
                : '💡 On WeChat? Tap ··· → Share. Your unique referral code is in the link.' }}
            </p>
          </div>
          <button class="w-full py-2 text-text-secondary text-sm bg-transparent border-none mt-3" @click="showShare = false">Close</button>
        </div>
      </div>
    </Teleport>

    <!-- Claim Modal -->
    <Teleport to="body">
      <div v-if="showClaim" class="fixed inset-0 flex items-center justify-center p-5" style="z-index:400;background:rgba(0,0,0,0.9);backdrop-filter:blur(12px)" @click="showClaim = false">
        <div class="bg-[#111] rounded-2xl p-8 max-w-[360px] w-full text-center border border-gold/30" @click.stop>
          <div class="text-4xl mb-4">🎁</div>
          <p class="text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-gold mb-2">
            {{ lang === 'zh' ? '领取奖励' : 'Claim Reward' }}
          </p>
          <p class="text-[1.125rem] font-semibold text-text-primary mb-2">{{ claimTitle }}</p>
          <p class="text-[0.8125rem] text-text-secondary mb-6">
            {{ lang === 'zh' ? '请留下联系方式，我们会与你联系发放奖励。' : 'Leave your contact info and we will reach out to deliver your reward.' }}
          </p>
          <input v-model="contact" :placeholder="lang === 'zh' ? '微信 / 邮箱 / 手机号' : 'WeChat / Email / Phone'" class="form-input mb-4 text-center">
          <button class="btn btn-filled w-full" @click="submitClaim" :disabled="!contact.trim()">
            {{ lang === 'zh' ? '确认领取' : 'Claim Reward' }}
          </button>
          <button class="w-full py-2 text-text-secondary text-sm bg-transparent border-none mt-2" @click="showClaim = false">Cancel</button>
        </div>
      </div>
    </Teleport>
  </section>
</template>
