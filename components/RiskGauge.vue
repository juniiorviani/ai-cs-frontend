<script setup lang="ts">
const props = withDefaults(defineProps<{
  score: number
  color?: string
  label?: string
  size?: number
}>(), {
  color: 'error',
  label: 'Churn risk',
  size: 168
})

const RADIUS = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const displayed = ref(0)
const offset = computed(() => CIRCUMFERENCE * (1 - displayed.value / 100))

function animateTo(target: number) {
  if (!import.meta.client) {
    displayed.value = target
    return
  }
  const start = performance.now()
  const from = displayed.value
  const duration = 900

  const step = (now: number) => {
    const progress = Math.min(1, (now - start) / duration)
    // ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3)
    displayed.value = Math.round(from + (target - from) * eased)
    if (progress < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

onMounted(() => animateTo(props.score))
watch(() => props.score, value => animateTo(value))
</script>

<template>
  <div class="text-center">
    <svg :width="size" :height="size" viewBox="0 0 128 128" role="img" :aria-label="`${label}: ${score} of 100`">
      <circle
        cx="64"
        cy="64"
        :r="RADIUS"
        fill="none"
        stroke="rgba(var(--v-theme-on-surface), 0.10)"
        stroke-width="12"
      />
      <circle
        cx="64"
        cy="64"
        :r="RADIUS"
        fill="none"
        :stroke="`rgb(var(--v-theme-${color}))`"
        stroke-width="12"
        stroke-linecap="round"
        :stroke-dasharray="CIRCUMFERENCE"
        :stroke-dashoffset="offset"
        transform="rotate(-90 64 64)"
      />
      <text
        x="64"
        y="60"
        text-anchor="middle"
        dominant-baseline="middle"
        :fill="`rgb(var(--v-theme-${color}))`"
        font-size="30"
        font-weight="700"
      >
        {{ displayed }}
      </text>
      <text
        x="64"
        y="82"
        text-anchor="middle"
        dominant-baseline="middle"
        fill="rgba(var(--v-theme-on-surface), 0.6)"
        font-size="11"
      >
        / 100
      </text>
    </svg>
    <div class="text-caption text-medium-emphasis mt-1">{{ label }}</div>
  </div>
</template>
