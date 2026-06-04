<script setup lang="ts">
const props = defineProps<{ message: string; type?: string }>()
const show = ref(false)
watchEffect(() => { if (props.message) { show.value = true; const t = setTimeout(() => show.value = false, 3000); return () => clearTimeout(t) } })
</script>
<template>
  <Teleport to="body">
    <div v-if="show" class="toast" :class="type === 'error' ? 'error' : 'success'">{{ message }}</div>
  </Teleport>
</template>
