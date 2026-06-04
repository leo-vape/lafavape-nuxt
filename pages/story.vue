<script setup lang="ts">
const { lang } = useI18n()
useHead({ title: lang.value === 'zh' ? '品牌故事 — LAFA' : 'Our Story — LAFA' })
</script>

<template>
  <section class="section section-alt pt-16 pb-24">
    <div class="max-w-[800px] mx-auto text-center">

      <!-- Eyebrow -->
      <span class="section-eyebrow mb-8">{{ lang === 'zh' ? '品牌故事' : 'Our Story' }}</span>

      <!-- Verse 1 -->
      <p class="text-[1.125rem] text-text-secondary/80 leading-[2.2] mb-4 tracking-wide">
        {{ lang === 'zh'
          ? '游子无疆，一生要强，不低眉，不退让，扛下孤独，吞尽风浪'
          : 'Wander far, stand firm; never bow or yield, bear solitude, weather every storm' }}
      </p>

      <!-- Verse 2 -->
      <p class="text-[1.125rem] text-text-secondary/80 leading-[2.2] mb-10 tracking-wide">
        {{ lang === 'zh'
          ? '雾化万千，故土深情，精神归处，独缺一份<span class="text-gold font-medium">专属偏爱</span>'
          : 'Amid mist and longing for home, one&rsquo;s heart lacks <span class="text-gold font-medium">true devotion</span>' }}
      </p>

      <!-- Declaration 1 -->
      <div class="my-12">
        <div class="w-8 h-px bg-gold/30 mx-auto mb-6"></div>
        <p class="text-[1.5rem] font-semibold text-text-primary tracking-wider">
          LAFA，<span class="text-gold">为此而生</span>
        </p>
        <p class="text-xs text-text-tertiary mt-2 tracking-[0.2em] uppercase">
          {{ lang === 'zh' ? '' : 'LAFA was made to fill that void' }}
        </p>
        <div class="w-8 h-px bg-gold/30 mx-auto mt-6"></div>
      </div>

      <!-- Verse 3 -->
      <p class="text-[1.125rem] text-text-secondary/80 leading-[2.2] mb-4 tracking-wide">
        {{ lang === 'zh'
          ? '以故土匠心，永不妥协，雕琢每一口<span class="text-gold font-medium">温润</span>'
          : 'Crafted with homeland grit and uncompromising standards, every sip is <span class="text-gold font-medium">smooth</span>' }}
      </p>

      <!-- Verse 4 -->
      <p class="text-[1.125rem] text-text-secondary/80 leading-[2.2] mb-10 tracking-wide">
        {{ lang === 'zh'
          ? '昼夜奔波的疲惫，灯火阑珊的落寞，一口熟悉的风味，消解劳顿；一缕故土气息，抚慰万里乡愁'
          : 'Tired from endless journeys, lost in lonely nights: a familiar taste eases fatigue; a whiff of home heals homesickness' }}
      </p>

      <!-- Declaration 2 -->
      <div class="my-12">
        <div class="w-8 h-px bg-gold/30 mx-auto mb-6"></div>
        <p class="text-[1.5rem] font-semibold text-text-primary tracking-wider">
          LAFA，不止是品质的执念，<br>更是<span class="text-gold">灵魂的共鸣</span>
        </p>
        <p class="text-xs text-text-tertiary mt-2 tracking-[0.2em] uppercase">
          {{ lang === 'zh' ? '' : 'LAFA stands for fine craftsmanship and spiritual kinship' }}
        </p>
        <div class="w-8 h-px bg-gold/30 mx-auto mt-6"></div>
      </div>

      <!-- Verse 5 — Tagline -->
      <p class="text-[1.25rem] text-text-secondary/90 leading-[2.2] mb-10 font-medium tracking-wide">
        {{ lang === 'zh'
          ? '让每一位奔赴山海的勇敢华人，终有一口......<span class="text-gold font-semibold">故土的质感，不灭的偏爱</span>'
          : 'For every overseas Chinese chasing dreams across the globe, it brings <span class="text-gold font-semibold">authentic hometown flavor and lifelong fondness</span>' }}
      </p>

      <!-- Closing -->
      <p class="text-[1.375rem] text-text-primary font-semibold leading-[2.2] tracking-widest">
        {{ lang === 'zh'
          ? 'LAFA，<span class="text-gold">懂你的坚守</span>，<span class="text-gold">敬你的要强</span>，<span class="text-gold">予你的滚烫</span>'
          : 'LAFA <span class="text-gold">sees your perseverance</span>, <span class="text-gold">respects your grit</span>, and <span class="text-gold">warms your soul</span>' }}
      </p>

      <!-- CTA -->
      <div class="mt-16">
        <NuxtLink to="/#products" class="btn btn-filled text-[0.9375rem] py-3 px-8">
          {{ lang === 'zh' ? '探索产品' : 'Explore Products' }}
        </NuxtLink>
      </div>

    </div>
  </section>
</template>
