<script setup lang="ts">
import type { CustomerStatus } from '~/composables/useCustomers'

const props = defineProps<{
  status: CustomerStatus
  size?: string
}>()

const icon = computed(() => {
  if (props.status === 'Healthy') return 'mdi-check-circle-outline'
  if (props.status === 'Attention') return 'mdi-alert-outline'
  return 'mdi-alert-octagon-outline'
})
</script>

<template>
  <VChip
    :color="statusColor(status)"
    :size="size || 'small'"
    variant="tonal"
    :prepend-icon="icon"
    class="font-weight-medium"
  >
    {{ status }}
  </VChip>
</template>
