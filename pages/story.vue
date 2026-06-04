<script setup lang="ts">
const { lang } = useI18n()
useHead({ title: lang.value === 'zh' ? '品牌故事 — LAFA' : 'Our Story — LAFA' })
</script>

<template>
  <section class="section section-alt pt-20">
    <div class="max-w-[900px] mx-auto">
      <span class="section-eyebrow">{{ lang === 'zh' ? '品牌故事' : 'Our Story' }}</span>
      <h1 class="section-heading mb-6">{{ lang === 'zh' ? '穿唐越宋，品味非凡' : 'Taste of the Golden Ages' }}</h1>

      <!-- Intro -->
      <p class="text-[0.9375rem] text-text-secondary leading-relaxed mb-8">
        {{ lang === 'zh'
          ? 'LAFA 诞生于一个简单的追问：电子烟可以不只是工具吗？可以是文化的载体吗？'
          : 'LAFA was born from a simple question: can vaping be more than a device? Can it carry culture?' }}
      </p>

      <!-- Tang Dynasty -->
      <div class="bg-[#0a0a0a] rounded-2xl p-8 mb-8 border border-border">
        <div class="flex items-center gap-3 mb-4">
          <span class="text-2xl">🏯</span>
          <h2 class="text-[1.25rem] font-semibold text-text-primary">{{ lang === 'zh' ? '大唐：开放的味觉' : 'Tang: The Open Palate' }}</h2>
        </div>
        <p class="text-[0.875rem] text-text-secondary leading-relaxed">
          {{ lang === 'zh'
            ? '公元 618-907 年，大唐帝国以开放包容闻名于世。丝绸之路带来了异域的香料、水果和风味——荔枝从岭南快马送入长安，桂花在中秋月下飘香，西域的葡萄在长安的酒肆中发酵。这种对味觉的探索精神，正是 LAFA Tang Collection 的灵感来源。'
            : '618-907 AD. The Tang Empire was known for its openness. The Silk Road brought exotic spices, fruits, and flavors from across Asia — lychee raced from the south to Chang\'an for imperial consorts, osmanthus bloomed under autumn moons, and grapes from the Western Regions fermented in the capital\'s taverns. This spirit of taste discovery inspires our Tang Collection.' }}
        </p>
      </div>

      <!-- Song Dynasty -->
      <div class="bg-[#0a0a0a] rounded-2xl p-8 mb-8 border border-border">
        <div class="flex items-center gap-3 mb-4">
          <span class="text-2xl">🍵</span>
          <h2 class="text-[1.25rem] font-semibold text-text-primary">{{ lang === 'zh' ? '大宋：精致的仪式' : 'Song: The Refined Ritual' }}</h2>
        </div>
        <p class="text-[0.875rem] text-text-secondary leading-relaxed">
          {{ lang === 'zh'
            ? '公元 960-1279 年，宋朝是中国美学的巅峰。茶道成为文人雅士的日常仪式——点茶、斗茶、品茶，每一步都讲究分寸。茉莉花茶在瓷杯中绽放，龙井在虎跑泉水中舒展。这种对「雅」的追求，成就了 LAFA Song Collection 的精致口感。'
            : '960-1279 AD. The Song Dynasty represents the peak of Chinese aesthetics. The tea ceremony became a daily ritual for scholars — whisking, comparing, and savoring tea was an art form. Jasmine blossoms unfurled in porcelain cups, Dragon Well leaves danced in spring water. This pursuit of refinement shapes the elegant taste of our Song Collection.' }}
        </p>
      </div>

      <!-- LAFA Today -->
      <div class="bg-[#0a0a0a] rounded-2xl p-8 mb-8 border border-border">
        <div class="flex items-center gap-3 mb-4">
          <span class="text-2xl">✨</span>
          <h2 class="text-[1.25rem] font-semibold text-text-primary">{{ lang === 'zh' ? '今日 LAFA' : 'LAFA Today' }}</h2>
        </div>
        <p class="text-[0.875rem] text-text-secondary leading-relaxed">
          {{ lang === 'zh'
            ? '我们将千年文化凝练于现代科技。陶瓷雾化芯保留最纯粹的风味，精准气流调节让每一口都是享受。LAFA 不只是一个电子烟品牌——是一座连接唐宋与现代的桥梁，一份可以品味的文化遗产。'
            : 'We distill a millennium of culture into modern technology. Ceramic coils preserve the purest flavor. Precision airflow makes every draw a pleasure. LAFA is more than a vape brand — it\'s a bridge between the golden ages and today, a heritage you can taste.' }}
        </p>
      </div>

      <!-- CTA -->
      <div class="text-center">
        <NuxtLink to="/#products" class="btn btn-filled text-[0.9375rem] py-3 px-8">
          {{ lang === 'zh' ? '探索产品' : 'Explore Products' }}
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
