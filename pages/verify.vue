<script setup lang="ts">
const { t } = useI18n()
const code = ref('')
const verifying = ref(false)
const verifyResult = ref('')
const verifyValid = ref(false)
const verifyFlavor = ref('')
const verifyDate = ref('')
const verifyCount = ref<number | null>(null)

async function verifyCode() {
  if (!code.value) return
  verifying.value = true
  try {
    const res = await fetch('/api/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.value })
    })
    const data = await res.json()
    verifyValid.value = data.valid === true
    verifyResult.value = data.valid ? t('verify.valid') : t('verify.invalid')
    verifyFlavor.value = data.flavor || ''
    verifyDate.value = data.date || ''
    verifyCount.value = data.query_count ?? null
  } catch {
    verifyValid.value = false
    verifyResult.value = t('verify.error')
    verifyFlavor.value = ''
    verifyDate.value = ''
    verifyCount.value = null
  } finally {
    verifying.value = false
  }
}
useHead({ title: 'LAFA — Verify' })
</script>

<template>
  <section class="section section-alt pt-20">
    <div class="max-w-[420px] mx-auto text-center">
      <h1 class="sec-label mb-4">{{ t('verify.title') }}</h1>
      <div class="bg-surface rounded-[24px] p-8 border border-border">
        <input v-model="code" :placeholder="t('verify.placeholder')"
          class="form-input mb-4 text-center tracking-[0.2em] uppercase"
          @keyup.enter="verifyCode">
        <button @click="verifyCode" :disabled="verifying" class="btn btn-filled w-full">
          {{ verifying ? t('verify.verifying') : t('verify.btn') }}
        </button>

        <!-- Result -->
        <div v-if="verifyResult" class="mt-6 p-5 rounded-2xl text-center"
          :style="verifyValid
            ? 'background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.15)'
            : 'background:rgba(191,58,48,0.08);border:1px solid rgba(191,58,48,0.15)'">
          <p class="text-lg font-semibold mb-1" :style="verifyValid ? 'color:#4ade80' : 'color:#C41E24'">
            {{ verifyResult }}
          </p>
          <p v-if="verifyValid && verifyFlavor" class="text-[0.875rem] text-text-secondary mt-2">
            {{ t('verify.flavor') }}: {{ verifyFlavor }}
          </p>
          <p v-if="verifyValid && verifyDate" class="text-[0.875rem] text-text-secondary">
            {{ t('verify.date') }}: {{ verifyDate }}
          </p>
          <p v-if="verifyValid && verifyCount !== null" class="text-[0.75rem] text-text-tertiary mt-1">
            {{ t('verify.queried') }} {{ verifyCount }} {{ t('verify.times') }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
