<script setup lang="ts">
import type { Customer, CustomerStatus } from '~/composables/useCustomers'

usePageTitle('Customers')

const { customers, totalMrr, atRisk } = useCustomers()

const search = ref<string | null>('')
const statusFilter = ref<CustomerStatus | 'All'>('All')

// `clearable` sets the model to null; the table filter expects a string.
const searchTerm = computed(() => search.value ?? '')

const statusOptions: Array<CustomerStatus | 'All'> = ['All', 'Healthy', 'Attention', 'At Risk']

const headers = [
  { title: 'Company', key: 'company', width: '26%' },
  { title: 'MRR', key: 'mrr', align: 'end' as const },
  { title: 'Health Score', key: 'healthScore', width: '18%' },
  { title: 'Usage (30d)', key: 'usage30d', width: '18%' },
  { title: 'Tickets', key: 'openTickets', align: 'center' as const },
  { title: 'Status', key: 'status', align: 'end' as const, sortable: false }
]

const rows = computed(() =>
  customers.value
    .map(c => ({ ...c, status: statusFromHealth(c.healthScore) }))
    .filter(c => statusFilter.value === 'All' || c.status === statusFilter.value)
)

function openCustomer(_event: unknown, row: { item: Customer }) {
  navigateTo(`/customers/${row.item.id}`)
}
</script>

<template>
  <div>
    <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-6">
      <div>
        <h1 class="text-h5 text-md-h4 font-weight-bold">Customers</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">
          {{ customers.length }} accounts · {{ formatCurrency(totalMrr) }} MRR · {{ atRisk.length }} at risk
        </p>
      </div>
    </div>

    <VCard class="acs-card" elevation="0">
      <VCardText class="pb-0">
        <VRow align="center" dense>
          <VCol cols="12" md="5">
            <VTextField
              v-model="search"
              placeholder="Search by company, industry or CSM"
              prepend-inner-icon="mdi-magnify"
              density="comfortable"
              hide-details
              clearable
            />
          </VCol>
          <VCol cols="12" md="4">
            <VSelect
              v-model="statusFilter"
              :items="statusOptions"
              label="Status"
              density="comfortable"
              hide-details
            />
          </VCol>
          <VCol cols="12" md="3" class="text-md-right">
            <span class="text-caption text-medium-emphasis">
              Click a row to open the account
            </span>
          </VCol>
        </VRow>
      </VCardText>

      <VDataTable
        :headers="headers"
        :items="rows"
        :search="searchTerm"
        :filter-keys="['company', 'industry', 'csm', 'plan']"
        item-value="id"
        :items-per-page="10"
        class="bg-transparent mt-2"
        hover
        mobile-breakpoint="md"
        @click:row="openCustomer"
      >
        <template #item.company="{ item }">
          <div class="d-flex align-center ga-3 py-2 acs-row-link">
            <VAvatar :color="healthColor(item.healthScore)" variant="tonal" rounded="lg" size="38">
              <span class="text-caption font-weight-bold">{{ item.company.slice(0, 2).toUpperCase() }}</span>
            </VAvatar>
            <div>
              <div class="text-body-2 font-weight-bold">{{ item.company }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.industry }} · {{ item.plan }}</div>
            </div>
          </div>
        </template>

        <template #item.mrr="{ item }">
          <span class="text-body-2 font-weight-bold acs-mono">{{ formatCurrency(item.mrr) }}</span>
        </template>

        <template #item.healthScore="{ item }">
          <div style="min-width: 130px;">
            <div class="d-flex justify-space-between text-caption mb-1">
              <span :class="`text-${healthColor(item.healthScore)} font-weight-bold`">{{ item.healthScore }}</span>
              <span class="text-disabled">/ 100</span>
            </div>
            <VProgressLinear
              :model-value="item.healthScore"
              :color="healthColor(item.healthScore)"
              height="6"
              rounded
            />
          </div>
        </template>

        <template #item.usage30d="{ item }">
          <div class="d-flex align-center ga-3" style="min-width: 150px;">
            <div style="width: 64px;">
              <SparkLine
                :values="item.usageTrend"
                :color="item.usageChangePct >= 0 ? 'success' : 'error'"
                :height="28"
              />
            </div>
            <div>
              <div class="text-body-2 acs-mono">{{ formatNumber(item.usage30d) }}</div>
              <div
                class="text-caption font-weight-medium"
                :class="item.usageChangePct >= 0 ? 'text-success' : 'text-error'"
              >
                {{ item.usageChangePct > 0 ? '+' : '' }}{{ item.usageChangePct }}%
              </div>
            </div>
          </div>
        </template>

        <template #item.openTickets="{ item }">
          <VChip
            size="small"
            variant="tonal"
            :color="item.openTickets >= 4 ? 'error' : item.openTickets >= 2 ? 'warning' : 'success'"
            prepend-icon="mdi-ticket-outline"
          >
            {{ item.openTickets }}
          </VChip>
        </template>

        <template #item.status="{ item }">
          <StatusChip :status="item.status" />
        </template>

        <template #no-data>
          <div class="pa-8 text-center text-medium-emphasis">
            No customers match the current filters.
          </div>
        </template>
      </VDataTable>
    </VCard>
  </div>
</template>
