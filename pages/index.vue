<script setup lang="ts">
usePageTitle('Overview')

const {
  customers,
  totalMrr,
  activeCustomers,
  atRisk,
  churnRiskMrr,
  needsAttention,
  averageHealth
} = useCustomers()

const churnRiskShare = computed(() =>
  Math.round((churnRiskMrr.value / (totalMrr.value || 1)) * 100)
)

const avgNps = computed(() => {
  const scored = customers.value.filter(c => c.nps !== null)
  if (!scored.length) return 0
  return Math.round((scored.reduce((sum, c) => sum + (c.nps ?? 0), 0) / scored.length) * 10) / 10
})

const renewalsNext90Days = computed(() => {
  const now = new Date('2026-08-16T00:00:00Z').getTime()
  const limit = now + 90 * 24 * 60 * 60 * 1000
  return customers.value.filter((c) => {
    const date = new Date(`${c.renewalDate}T00:00:00Z`).getTime()
    return date >= now && date <= limit
  })
})

const attentionTotalMrr = computed(() =>
  needsAttention.value.reduce((sum, c) => sum + c.mrr, 0)
)
</script>

<template>
  <div>
    <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-6">
      <div>
        <h1 class="text-h5 text-md-h4 font-weight-bold">Overview</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Portfolio health across {{ activeCustomers }} accounts · updated today
        </p>
      </div>
      <VBtn color="primary" variant="flat" prepend-icon="mdi-account-search-outline" to="/customers">
        Browse customers
      </VBtn>
    </div>

    <VRow class="mb-2">
      <VCol cols="12" sm="6" lg="3">
        <StatCard
          title="Total MRR"
          :value="formatCurrency(totalMrr)"
          icon="mdi-cash-multiple"
          color="primary"
          :trend="4.2"
        />
      </VCol>
      <VCol cols="12" sm="6" lg="3">
        <StatCard
          title="Active customers"
          :value="String(activeCustomers)"
          icon="mdi-account-group-outline"
          color="info"
          subtitle="No churn in the last 30 days"
        />
      </VCol>
      <VCol cols="12" sm="6" lg="3">
        <StatCard
          title="Customers at risk"
          :value="String(atRisk.length)"
          icon="mdi-alert-octagon-outline"
          color="error"
          :trend="1"
          trend-suffix=" vs. last month"
          invert-trend
        />
      </VCol>
      <VCol cols="12" sm="6" lg="3">
        <StatCard
          title="Churn risk MRR"
          :value="formatCurrency(churnRiskMrr)"
          icon="mdi-trending-down"
          color="warning"
          :subtitle="`${churnRiskShare}% of total MRR exposed`"
        />
      </VCol>
    </VRow>

    <VRow class="mb-2">
      <VCol cols="12" lg="8">
        <CustomerHealthChart :customers="customers" />
      </VCol>

      <VCol cols="12" lg="4">
        <VCard class="acs-card h-100" elevation="0">
          <VCardItem class="pb-0">
            <VCardTitle class="text-subtitle-1 font-weight-bold">Portfolio signals</VCardTitle>
            <VCardSubtitle class="text-caption">Rolling 30-day window</VCardSubtitle>
          </VCardItem>

          <VCardText class="pt-4">
            <div class="mb-5">
              <div class="d-flex justify-space-between align-center mb-1">
                <span class="text-body-2">Average health score</span>
                <span class="text-body-2 font-weight-bold acs-mono">{{ averageHealth }}</span>
              </div>
              <VProgressLinear
                :model-value="averageHealth"
                :color="healthColor(averageHealth)"
                height="8"
                rounded
              />
            </div>

            <div class="mb-5">
              <div class="d-flex justify-space-between align-center mb-1">
                <span class="text-body-2">MRR exposed to churn</span>
                <span class="text-body-2 font-weight-bold acs-mono">{{ churnRiskShare }}%</span>
              </div>
              <VProgressLinear :model-value="churnRiskShare" color="error" height="8" rounded />
            </div>

            <VDivider class="my-4" />

            <div class="d-flex justify-space-between align-center mb-3">
              <span class="text-body-2 text-medium-emphasis">
                <VIcon icon="mdi-emoticon-outline" size="16" class="mr-1" />Average NPS
              </span>
              <span class="text-body-2 font-weight-bold acs-mono">{{ avgNps }}</span>
            </div>

            <div class="d-flex justify-space-between align-center mb-3">
              <span class="text-body-2 text-medium-emphasis">
                <VIcon icon="mdi-calendar-check-outline" size="16" class="mr-1" />Renewals in 90 days
              </span>
              <span class="text-body-2 font-weight-bold acs-mono">{{ renewalsNext90Days.length }}</span>
            </div>

            <div class="d-flex justify-space-between align-center">
              <span class="text-body-2 text-medium-emphasis">
                <VIcon icon="mdi-account-alert-outline" size="16" class="mr-1" />Accounts needing action
              </span>
              <span class="text-body-2 font-weight-bold acs-mono">{{ needsAttention.length }}</span>
            </div>

            <VAlert
              v-if="renewalsNext90Days.length"
              class="mt-5"
              variant="tonal"
              color="warning"
              density="comfortable"
              icon="mdi-clock-alert-outline"
            >
              <span class="text-caption">
                {{ renewalsNext90Days.map(c => c.company).join(', ') }} renew within 90 days.
              </span>
            </VAlert>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VCard class="acs-card" elevation="0">
      <VCardItem>
        <VCardTitle class="text-subtitle-1 font-weight-bold">
          <VIcon icon="mdi-lifebuoy" size="18" color="error" class="mr-2" />
          Customers Requiring Attention
        </VCardTitle>
        <VCardSubtitle class="text-caption">
          {{ needsAttention.length }} accounts · {{ formatCurrency(attentionTotalMrr) }} MRR at stake
        </VCardSubtitle>
      </VCardItem>

      <VCardText>
        <VRow>
          <VCol
            v-for="customer in needsAttention"
            :key="customer.id"
            cols="12"
            md="6"
            xl="4"
          >
            <VCard
              class="acs-card acs-card--hover h-100"
              elevation="0"
              :to="`/customers/${customer.id}`"
            >
              <VCardText class="pa-4">
                <div class="d-flex align-start justify-space-between mb-3 ga-2">
                  <div class="d-flex align-center ga-3">
                    <VAvatar :color="healthColor(customer.healthScore)" variant="tonal" rounded="lg" size="40">
                      <span class="text-caption font-weight-bold">
                        {{ customer.company.slice(0, 2).toUpperCase() }}
                      </span>
                    </VAvatar>
                    <div>
                      <div class="text-body-2 font-weight-bold">{{ customer.company }}</div>
                      <div class="text-caption text-medium-emphasis">{{ customer.plan }} · {{ customer.csm }}</div>
                    </div>
                  </div>
                  <StatusChip :status="statusFromHealth(customer.healthScore)" />
                </div>

                <SparkLine
                  :values="customer.usageTrend"
                  :color="customer.usageChangePct >= 0 ? 'success' : 'error'"
                  :height="42"
                />

                <VRow dense class="mt-2">
                  <VCol cols="4">
                    <div class="text-caption text-medium-emphasis">MRR</div>
                    <div class="text-body-2 font-weight-bold acs-mono">{{ formatCurrency(customer.mrr) }}</div>
                  </VCol>
                  <VCol cols="4">
                    <div class="text-caption text-medium-emphasis">Health</div>
                    <div class="text-body-2 font-weight-bold acs-mono" :class="`text-${healthColor(customer.healthScore)}`">
                      {{ customer.healthScore }}
                    </div>
                  </VCol>
                  <VCol cols="4">
                    <div class="text-caption text-medium-emphasis">Usage 30d</div>
                    <div
                      class="text-body-2 font-weight-bold acs-mono"
                      :class="customer.usageChangePct >= 0 ? 'text-success' : 'text-error'"
                    >
                      {{ customer.usageChangePct > 0 ? '+' : '' }}{{ customer.usageChangePct }}%
                    </div>
                  </VCol>
                </VRow>

                <VDivider class="my-3" />

                <div class="d-flex align-center justify-space-between">
                  <span class="text-caption text-medium-emphasis">
                    <VIcon icon="mdi-ticket-outline" size="14" class="mr-1" />
                    {{ customer.openTickets }} open tickets
                  </span>
                  <span class="text-caption text-primary font-weight-medium">
                    Analyze with AI
                    <VIcon icon="mdi-chevron-right" size="14" />
                  </span>
                </div>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </div>
</template>
