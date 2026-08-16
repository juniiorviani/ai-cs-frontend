<script setup lang="ts">
const props = withDefaults(defineProps<{
  values: number[]
  color?: string
  height?: number
}>(), {
  color: 'primary',
  height: 40
})

const geometry = computed(() => {
  const values = props.values
  if (values.length < 2) return { line: '', area: '' }

  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1
  const stepX = 100 / (values.length - 1)

  const points = values.map((value, index) => {
    const x = index * stepX
    const y = 30 - ((value - min) / span) * 26 - 2
    return `${x.toFixed(2)},${y.toFixed(2)}`
  })

  return {
    line: points.join(' '),
    area: `0,32 ${points.join(' ')} 100,32`
  }
})

const uid = useId()
</script>

<template>
  <svg
    :height="height"
    width="100%"
    viewBox="0 0 100 32"
    preserveAspectRatio="none"
    role="img"
    aria-label="Usage trend"
  >
    <defs>
      <linearGradient :id="`spark-${uid}`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" :stop-color="`rgb(var(--v-theme-${color}))`" stop-opacity="0.35" />
        <stop offset="100%" :stop-color="`rgb(var(--v-theme-${color}))`" stop-opacity="0" />
      </linearGradient>
    </defs>
    <polygon :points="geometry.area" :fill="`url(#spark-${uid})`" />
    <polyline
      :points="geometry.line"
      fill="none"
      :stroke="`rgb(var(--v-theme-${color}))`"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      vector-effect="non-scaling-stroke"
    />
  </svg>
</template>
