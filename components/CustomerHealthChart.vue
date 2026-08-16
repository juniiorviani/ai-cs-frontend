<script setup lang="ts">
import type { Customer } from '~/composables/useCustomers'

const props = defineProps<{
  customers: Customer[]
}>()

const sorted = computed(() => [...props.customers].sort((a, b) => b.healthScore - a.healthScore))

const distribution = computed(() => {
  const total = props.customers.length || 1
  const buckets = [
    { label: 'Healthy', color: 'success', count: 0 },
    { label: 'Attention', color: 'warning', count: 0 },
    { label: 'At Risk', color: 'error', count: 0 }
  ]
  for (const customer of props.customers) {
    const status = statusFromHealth(customer.healthScore)
    const bucket = buckets.find(b => b.label === status)
    if (bucket) bucket.count++
  }
  return buckets.map(b => ({ ...b, pct: Math.round((b.count / total) * 100) }))
})

function initials(company: string) {
  return company
    .split(' ')
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase()
}
</script>

<template>
  <VCard class="acs-card h-100" elevation="0">
    <VCardItem class="pb-0">
      <VCardTitle class="text-subtitle-1 font-weight-bold">Customer Health</VCardTitle>
      <VCardSubtitle class="text-caption">Health score per account (0–100)</VCardSubtitle>
    </VCardItem>

    <VCardText class="pt-4">
      <div class="d-flex ga-4 mb-5 flex-wrap">
        <div v-for="bucket in distribution" :key="bucket.label" class="d-flex align-center ga-2">
          <span
            class="d-inline-block rounded-circle"
            :style="{ width: '10px', height: '10px', background: `rgb(var(--v-theme-${bucket.color}))` }"
          />
          <span class="text-caption text-medium-emphasis">
            {{ bucket.label }} · <strong class="text-high-emphasis">{{ bucket.count }}</strong> ({{ bucket.pct }}%)
          </span>
        </div>
      </div>

      <div class="acs-chart">
        <div class="acs-chart__grid">
          <div v-for="line in [100, 75, 50, 25, 0]" :key="line" class="acs-chart__gridline">
            <span class="text-caption text-disabled">{{ line }}</span>
          </div>
        </div>

        <div class="acs-chart__bars">
          <div
            v-for="customer in sorted"
            :key="customer.id"
            class="acs-chart__col"
          >
            <VTooltip :text="`${customer.company} · health ${customer.healthScore}`" location="top">
              <template #activator="{ props: tooltip }">
                <NuxtLink v-bind="tooltip" :to="`/customers/${customer.id}`" class="acs-chart__track">
                  <div
                    class="acs-chart__bar"
                    :style="{
                      height: `${customer.healthScore}%`,
                      background: `rgb(var(--v-theme-${healthColor(customer.healthScore)}))`
                    }"
                  />
                </NuxtLink>
              </template>
            </VTooltip>
            <span class="acs-chart__label text-caption text-medium-emphasis">
              {{ initials(customer.company) }}
            </span>
          </div>
        </div>
      </div>
    </VCardText>
  </VCard>
</template>

<style scoped>
.acs-chart {
  position: relative;
  padding-left: 28px;
}

.acs-chart__grid {
  position: absolute;
  inset: 0 0 26px 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
}

.acs-chart__gridline {
  border-top: 1px dashed rgba(var(--v-theme-on-surface), 0.12);
  position: relative;
}

.acs-chart__gridline span {
  position: absolute;
  left: -28px;
  top: -8px;
}

.acs-chart__bars {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 200px;
}

.acs-chart__col {
  flex: 1 1 0;
  min-width: 22px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.acs-chart__track {
  display: flex;
  align-items: flex-end;
  height: calc(100% - 26px);
  width: 100%;
}

.acs-chart__bar {
  width: 100%;
  border-radius: 6px 6px 2px 2px;
  min-height: 4px;
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.acs-chart__track:hover .acs-chart__bar {
  opacity: 0.82;
  transform: scaleY(1.02);
  transform-origin: bottom;
}

.acs-chart__label {
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
