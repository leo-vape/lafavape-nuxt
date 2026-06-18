<script setup lang="ts">
const { lang } = useI18n()

const proofs = [
  { name: 'Wei L.', action: 'purchased', product: 'Lychee Ice', time: '2 min ago' },
  { name: 'Yun C.', action: 'reviewed', product: 'Jasmine Green Tea', time: '5 min ago', rating: 5 },
  { name: 'Alex H.', action: 'verified', product: 'Grape Mist', time: '8 min ago' },
  { name: 'Ming Z.', action: 'purchased', product: 'Osmanthus Oolong', time: '3 min ago' },
]

const visible = ref(false)
const current = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    visible.value = true
    setTimeout(() => { visible.value = false }, 5000)
    current.value = (current.value + 1) % proofs.length
  }, 8000)
  setTimeout(() => { visible.value = true }, 3000)
  setTimeout(() => { visible.value = false }, 8000)
})

onUnmounted(() => { if (timer) clearInterval(timer) })

function actionText(p: typeof proofs[0]) {
  if (p.action === 'purchased') return lang.value === 'zh' ? '购买了' : 'purchased'
  if (p.action === 'reviewed') return lang.value === 'zh' ? `评价了 (${p.rating}⭐)` : `rated ${p.rating}⭐`
  return lang.value === 'zh' ? '验证了' : 'verified'
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible && proofs.length"
      class="fixed bottom-20 left-4 bg-[#1a1a1a]/95 backdrop-blur-xl border border-border rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl max-w-[320px]"
      style="z-index:250;animation:fadeUp 0.4s ease-out">
      <div class="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
        {{ proofs[current].action === 'purchased' ? '🛒' : proofs[current].action === 'reviewed' ? '⭐' : '✅' }}
      </div>
      <div class="min-w-0">
        <p class="text-[0.75rem] text-text-primary font-medium truncate">{{ proofs[current].name }}</p>
        <p class="text-[0.6875rem] text-text-tertiary">
          {{ actionText(proofs[current]) }}
          <span class="text-text-secondary">{{ proofs[current].product }}</span>
        </p>
        <p class="text-[0.625rem] text-text-tertiary/50 mt-0.5">{{ proofs[current].time }}</p>
      </div>
    </div>
  </Teleport>
</template>
