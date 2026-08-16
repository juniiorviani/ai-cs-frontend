<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  value: string
  icon: string
  color?: string
  subtitle?: string
  trend?: number | null
  trendSuffix?: string
  /** When true, a positive trend is bad (e.g. churn risk). */
  invertTrend?: boolean
}>(), {
  color: 'primary',
  subtitle: '',
  trend: null,
  trendSuffix: '% vs. last month',
  invertTrend: false
})

const trendColor = computed(() => {
  if (props.trend === null || props.trend === 0) return 'medium-emphasis'
  const good = props.invertTrend ? props.trend < 0 : props.trend > 0
  return good ? 'success' : 'error'
})

const trendIcon = computed(() =>
  (props.trend ?? 0) >= 0 ? 'mdi-trending-up' : 'mdi-trending-down'
)
</script>

<template>
  <VCard class="acs-card acs-card--hover h-100" elevation="0">
    <VCardText class="pa-5">
      <div class="d-flex align-start justify-space-between mb-3">
        <div>
          <div class="text-caption text-medium-emphasis text-uppercase font-weight-medium" style="letter-spacing: .06em;">
            {{ title }}
          </div>
          <div class="text-h4 font-weight-bold mt-2 acs-mono">{{ value }}</div>
        </div>
        <VAvatar :color="color" variant="tonal" rounded="lg" size="44">
          <VIcon :icon="icon" :color="color" />
        </VAvatar>
      </div>

      <div class="d-flex align-center ga-2">
        <VIcon
          v-if="trend !== null"
          :icon="trendIcon"
          size="16"
          :color="trendColor"
        />
        <span v-if="trend !== null" class="text-caption font-weight-medium" :class="`text-${trendColor}`">
          {{ trend > 0 ? '+' : '' }}{{ trend }}{{ trendSuffix }}
        </span>
        <span v-if="subtitle" class="text-caption text-medium-emphasis">{{ subtitle }}</span>
      </div>
    </VCardText>
  </VCard>
</template>
