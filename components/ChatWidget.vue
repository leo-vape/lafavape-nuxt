<script setup lang="ts">
const { lang } = useI18n()
const open = ref(false)
const copied = ref(false)
const wxId = ref('')

onMounted(async () => {
  try { const r = await fetch('/api/data/settings'); const d = await r.json(); wxId.value = d.wxId || '' } catch {}
})

function copyWxId() { navigator.clipboard.writeText(wxId.value); copied.value = true; setTimeout(() => copied.value = false, 2000) }
function openWechat() { window.open('weixin://') }
</script>

<template>
  <button v-if="!open && wxId" class="wx-float-btn" @click="open = true" aria-label="微信客服">💬</button>

  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[200] flex items-center justify-center p-4" style="background:rgba(0,0,0,0.88)" @click="open = false">
      <div class="wx-dialog" @click.stop>
        <div class="wx-dialog-head">
          <p class="wx-dialog-title">{{ lang === 'zh' ? '微信客服' : 'WeChat Support' }}</p>
          <p class="wx-dialog-sub">{{ lang === 'zh' ? '扫码添加，在线实时回复' : 'Scan to chat, real-time response' }}</p>
        </div>

        <div class="wx-qr-wrap">
          <img src="/wx-qr.png" alt="WeChat QR" class="wx-qr-img" @error="(e:any)=>{e.target.style.display='none';e.target.nextElementSibling.style.display='flex'}">
          <div class="wx-qr-placeholder" style="display:none">
            <p>请上传微信二维码</p>
            <p class="text-xs text-text-tertiary mt-1">public/wx-qr.png</p>
          </div>
        </div>

        <div class="wx-id-box">
          <span class="wx-id-label">{{ lang === 'zh' ? '微信号' : 'WeChat ID' }}</span>
          <span class="wx-id-value">{{ wxId }}</span>
          <button class="wx-copy-btn" @click="copyWxId">{{ copied ? '✓' : lang === 'zh' ? '复制' : 'Copy' }}</button>
        </div>

        <a v-if="wxId" :href="'https://weixin.qq.com/r/' + wxId" target="_blank" class="wx-open-btn" @click="openWechat">
          {{ lang === 'zh' ? '打开微信添加好友' : 'Open WeChat to Add' }}
        </a>

        <p class="wx-footer-text">⏱ {{ lang === 'zh' ? '工作日 5 分钟内回复' : 'Reply within 5 min on workdays' }}</p>
        <button class="wx-close" @click="open = false">{{ lang === 'zh' ? '关闭' : 'Close' }}</button>
      </div>
    </div>
  </Teleport>
</template>
