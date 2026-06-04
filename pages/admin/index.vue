<script setup lang="ts">
const { t, lang, toggleLang } = useI18n()
const password = ref('')
const error = ref('')

async function login() {
  error.value = ''
  if (!password.value) return
  try {
    const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: password.value }) })
    const data = await res.json()
    if (data.success) window.location.href = '/admin/dashboard'
    else error.value = t('admin.error')
  } catch (e: any) { error.value = e.message }
}

useHead({ title: 'LAFA — Admin' })
definePageMeta({ layout: false })
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-black p-5" style="padding-top:80px"">
    <div class="bg-surface rounded-[24px] p-10 max-w-[380px] w-full border border-border">
      <p class="text-[0.75rem] font-semibold tracking-[0.2em] uppercase text-text-tertiary mb-1 text-center">{{ t('admin.title') }}</p>
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-xl font-semibold text-text-primary">LAFA</h1>
        <button @click="toggleLang" class="text-xs text-gold bg-gold/10 px-2 py-1 rounded">{{ lang === 'zh' ? 'EN' : '中文' }}</button>
      </div>
      <form @submit.prevent="login" class="space-y-4" autocomplete="off" name="admin-login">
        <input type="password" v-model="password" :placeholder="t('admin.password')" required class="form-input text-center" autocomplete="new-password" name="admin-pass">
        <button type="submit" class="btn btn-filled w-full">{{ t('admin.signIn') }}</button>
      </form>
      <p v-if="error" class="text-red text-[0.8125rem] mt-4 text-center">{{ error }}</p>
    </div>
  </div>
</template>
