<script setup lang="ts">
const { t } = useI18n()
const name = ref('')
const email = ref('')
const message = ref('')
const subEmail = ref('')
const emit = defineEmits(['toast'])

async function submitContact() {
  try {
    const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.value, email: email.value, message: message.value }) })
    if (res.ok) { emit('toast', { message: t('form.sent'), type: 'success' }); name.value = ''; email.value = ''; message.value = '' }
    else emit('toast', { message: t('form.failed'), type: 'error' })
  } catch { emit('toast', { message: t('form.error'), type: 'error' }) }
}

async function subscribeNews() {
  try {
    const res = await fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: subEmail.value }) })
    if (res.ok) { emit('toast', { message: t('newsletter.success'), type: 'success' }); subEmail.value = '' }
    else emit('toast', { message: t('newsletter.failed'), type: 'error' })
  } catch { emit('toast', { message: t('form.error'), type: 'error' }) }
}
</script>

<template>
  <div class="contact-wrap">
    <form @submit.prevent="submitContact" class="contact-form">
      <div class="contact-row">
        <input v-model="name" type="text" :placeholder="t('form.namePlace')" required class="contact-input">
        <input v-model="email" type="email" :placeholder="t('form.emailPlace')" required class="contact-input">
      </div>
      <textarea v-model="message" rows="3" :placeholder="t('form.msgPlace')" required class="contact-input contact-textarea"></textarea>
      <button type="submit" class="contact-btn">{{ t('form.sendBtn') }}</button>
    </form>
    <div class="contact-divider"></div>
    <form @submit.prevent="subscribeNews" class="subscribe-form">
      <input v-model="subEmail" type="email" :placeholder="t('form.subPlace')" required class="contact-input subscribe-input">
      <button type="submit" class="contact-btn subscribe-btn">{{ t('form.subBtn') }}</button>
    </form>
  </div>
</template>
