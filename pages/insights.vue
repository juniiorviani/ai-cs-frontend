<script setup lang="ts">
import type { Customer } from '~/composables/useCustomers'

usePageTitle('AI Insights')

const { customers, atRisk, churnRiskMrr, totalMrr, needsAttention } = useCustomers()
const { cache, loadingId, errors, stage, analyze } = useChurnAnalysis()
const config = useRuntimeConfig()

const NOW = new Date('2026-08-16T00:00:00Z').getTime()
const DAY = 24 * 60 * 60 * 1000

function daysToRenewal(customer: Customer) {
  return Math.round((new Date(`${customer.renewalDate}T00:00:00Z`).getTime() - NOW) / DAY)
}

interface Driver {
  key: string
  title: string
  description: string
  icon: string
  color: string
  matches: Customer[]
}

const drivers = computed<Driver[]>(() => {
  const list: Driver[] = [
    {
      key: 'usage',
      title: 'Declining product usage',
      description: 'Sessions dropped more than 15% versus the previous 30 days.',
      icon: 'mdi-chart-line-variant',
      color: 'error',
      matches: customers.value.filter(c => c.usageChangePct <= -15)
    },
    {
      key: 'seats',
      title: 'Low seat utilization',
      description: 'Fewer than half of the licensed seats logged in this month.',
      icon: 'mdi-account-off-outline',
      color: 'warning',
      matches: customers.value.filter(c => c.activeSeats / c.seats < 0.5)
    },
    {
      key: 'support',
      title: 'Support pressure',
      description: 'Three or more tickets are still open on the account.',
      icon: 'mdi-ticket-account',
      color: 'error',
      matches: customers.value.filter(c => c.openTickets >= 3)
    },
    {
      key: 'sentiment',
      title: 'Detractor sentiment',
      description: 'Latest NPS answer is 6 or lower.',
      icon: 'mdi-emoticon-sad-outline',
      color: 'warning',
      matches: customers.value.filter(c => c.nps !== null && c.nps <= 6)
    },
    {
      key: 'renewal',
      title: 'Renewal risk window',
      description: 'Renewal lands within 90 days while health is below 75.',
      icon: 'mdi-calendar-alert',
      color: 'error',
      matches: customers.value.filter(c => daysToRenewal(c) <= 90 && daysToRenewal(c) >= 0 && c.healthScore < 75)
    }
  ]
  return list.filter(d => d.matches.length > 0).sort((a, b) => b.matches.length - a.matches.length)
})

function driverMrr(driver: Driver) {
  return driver.matches.reduce((sum, c) => sum + c.mrr, 0)
}

const segments = computed(() => {
  const build = (label: string, color: string, predicate: (c: Customer) => boolean) => {
    const matches = customers.value.filter(predicate)
    return {
      label,
      color,
      count: matches.length,
      mrr: matches.reduce((sum, c) => sum + c.mrr, 0)
    }
  }
  return [
    build('Healthy', 'success', c => statusFromHealth(c.healthScore) === 'Healthy'),
    build('Attention', 'warning', c => statusFromHealth(c.healthScore) === 'Attention'),
    build('At Risk', 'error', c => statusFromHealth(c.healthScore) === 'At Risk')
  ]
})

const analyzed = computed(() =>
  customers.value
    .filter(c => cache.value[c.id])
    .map(c => ({ customer: c, analysis: cache.value[c.id]! }))
    .sort((a, b) => b.analysis.churnRiskScore - a.analysis.churnRiskScore)
)

const batchRunning = ref(false)
const batchDone = ref(0)
const batchTotal = ref(0)
const batchFailures = ref<string[]>([])

async function analyzeAtRisk() {
  const queue = needsAttention.value
  if (!queue.length || batchRunning.value) return

  batchRunning.value = true
  batchDone.value = 0
  batchFailures.value = []
  batchTotal.value = queue.length

  for (const customer of queue) {
    const result = await analyze(customer)
    if (!result) batchFailures.value.push(customer.company)
    batchDone.value++
  }

  batchRunning.value = false
}

const batchProgress = computed(() =>
  batchTotal.value ? Math.round((batchDone.value / batchTotal.value) * 100) : 0
)

const currentlyAnalyzing = computed(() =>
  loadingId.value ? customers.value.find(c => c.id === loadingId.value)?.company : null
)

const lastError = computed(() => Object.values(errors.value).filter(Boolean).pop() || '')
</script>

<template>
  <div>
    <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-6">
      <div>
        <h1 class="text-h5 text-md-h4 font-weight-bold">AI Insights</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Churn drivers across the portfolio and every analysis your team has run
        </p>
      </div>
      <VBtn
        color="primary"
        variant="flat"
        prepend-icon="mdi-brain"
        :loading="batchRunning"
        :disabled="!needsAttention.length"
        @click="analyzeAtRisk"
      >
        Analyze accounts needing attention
      </VBtn>
    </div>

    <VCard v-if="batchRunning || batchDone" class="acs-card mb-6" elevation="0">
      <VCardText class="pa-5">
        <div class="d-flex justify-space-between align-center mb-2 flex-wrap ga-2">
          <span class="text-body-2 font-weight-medium">
            <template v-if="batchRunning">
              Analyzing {{ currentlyAnalyzing }} — {{ stage }}
            </template>
            <template v-else>
              Batch finished · {{ batchDone }} of {{ batchTotal }} accounts processed
            </template>
          </span>
          <span class="text-caption text-medium-emphasis acs-mono">{{ batchDone }}/{{ batchTotal }}</span>
        </div>
        <VProgressLinear :model-value="batchProgress" color="primary" height="8" rounded />
        <div v-if="batchFailures.length" class="text-caption text-error mt-2">
          Failed: {{ batchFailures.join(', ') }}
        </div>
      </VCardText>
    </VCard>

    <VRow class="mb-2">
      <VCol cols="12" md="4">
        <StatCard
          title="Accounts at risk"
          :value="String(atRisk.length)"
          icon="mdi-alert-octagon-outline"
          color="error"
          :subtitle="`${formatCurrency(churnRiskMrr)} MRR exposed`"
        />
      </VCol>
      <VCol cols="12" md="4">
        <StatCard
          title="Risk concentration"
          :value="`${Math.round((churnRiskMrr / (totalMrr || 1)) * 100)}%`"
          icon="mdi-chart-donut"
          color="warning"
          subtitle="Share of MRR in at-risk accounts"
        />
      </VCol>
      <VCol cols="12" md="4">
        <StatCard
          title="AI analyses run"
          :value="String(analyzed.length)"
          icon="mdi-brain"
          color="primary"
          :subtitle="`${customers.length - analyzed.length} accounts not analyzed yet`"
        />
      </VCol>
    </VRow>

    <VRow class="mb-2">
      <VCol cols="12" lg="7">
        <VCard class="acs-card h-100" elevation="0">
          <VCardItem class="pb-0">
            <VCardTitle class="text-subtitle-1 font-weight-bold">Top churn drivers</VCardTitle>
            <VCardSubtitle class="text-caption">Patterns detected across the mock account base</VCardSubtitle>
          </VCardItem>
          <VCardText class="pt-4">
            <div v-for="driver in drivers" :key="driver.key" class="mb-5">
              <div class="d-flex align-center ga-3 mb-2">
                <VAvatar :color="driver.color" variant="tonal" size="36" rounded="lg">
                  <VIcon :icon="driver.icon" size="18" />
                </VAvatar>
                <div class="flex-grow-1">
                  <div class="d-flex justify-space-between align-center flex-wrap ga-1">
                    <span class="text-body-2 font-weight-bold">{{ driver.title }}</span>
                    <span class="text-caption text-medium-emphasis acs-mono">
                      {{ driver.matches.length }} accounts · {{ formatCurrency(driverMrr(driver)) }}
                    </span>
                  </div>
                  <div class="text-caption text-medium-emphasis">{{ driver.description }}</div>
                </div>
              </div>

              <VProgressLinear
                :model-value="(driver.matches.length / customers.length) * 100"
                :color="driver.color"
                height="6"
                rounded
                class="mb-2"
              />

              <div class="d-flex flex-wrap ga-2">
                <VChip
                  v-for="match in driver.matches"
                  :key="match.id"
                  size="x-small"
                  variant="outlined"
                  :to="`/customers/${match.id}`"
                >
                  {{ match.company }}
                </VChip>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" lg="5">
        <VCard class="acs-card mb-6" elevation="0">
          <VCardItem class="pb-0">
            <VCardTitle class="text-subtitle-1 font-weight-bold">Revenue by health segment</VCardTitle>
          </VCardItem>
          <VCardText class="pt-4">
            <div v-for="segment in segments" :key="segment.label" class="mb-4">
              <div class="d-flex justify-space-between text-body-2 mb-1">
                <span>
                  <VIcon icon="mdi-circle" size="10" :color="segment.color" class="mr-2" />
                  {{ segment.label }} ({{ segment.count }})
                </span>
                <span class="font-weight-bold acs-mono">{{ formatCurrency(segment.mrr) }}</span>
              </div>
              <VProgressLinear
                :model-value="(segment.mrr / (totalMrr || 1)) * 100"
                :color="segment.color"
                height="8"
                rounded
              />
            </div>
          </VCardText>
        </VCard>

        <VCard class="acs-card" elevation="0">
          <VCardItem class="pb-0">
            <VCardTitle class="text-subtitle-1 font-weight-bold">Analysis backend</VCardTitle>
          </VCardItem>
          <VCardText class="pt-4">
            <div class="d-flex align-center ga-3 mb-3">
              <VIcon
                :icon="config.public.backendConfigured ? 'mdi-check-circle' : 'mdi-alert-circle'"
                :color="config.public.backendConfigured ? 'success' : 'warning'"
              />
              <div>
                <div class="text-body-2 font-weight-medium">
                  {{ config.public.backendConfigured ? 'BACKEND_URL is configured' : 'BACKEND_URL is not set' }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  Analyses call POST {BACKEND_URL}/customers/{id}/analyze
                </div>
              </div>
            </div>
            <VAlert
              v-if="!config.public.backendConfigured"
              type="warning"
              variant="tonal"
              density="comfortable"
              class="text-caption"
              text="Set the BACKEND_URL environment variable in the platform so the AI analysis can reach the service. Everything else on this app runs on mock data."
            />
            <VAlert
              v-else-if="lastError"
              type="error"
              variant="tonal"
              density="comfortable"
              class="text-caption"
              :text="`Last error: ${lastError}`"
            />
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VCard class="acs-card" elevation="0">
      <VCardItem>
        <VCardTitle class="text-subtitle-1 font-weight-bold">Analyses returned by the AI</VCardTitle>
        <VCardSubtitle class="text-caption">
          Results are kept for this session — open an account to see the full breakdown
        </VCardSubtitle>
      </VCardItem>

      <VCardText>
        <div v-if="!analyzed.length" class="text-center py-8">
          <VIcon icon="mdi-radar" size="40" color="primary" class="mb-3" />
          <div class="text-body-2 text-medium-emphasis">
            No analysis has been run yet. Start with the accounts that need attention.
          </div>
        </div>

        <VRow v-else>
          <VCol v-for="entry in analyzed" :key="entry.customer.id" cols="12" md="6" xl="4">
            <VCard class="acs-card acs-card--hover h-100" elevation="0" :to="`/customers/${entry.customer.id}`">
              <VCardText class="pa-4">
                <div class="d-flex justify-space-between align-start mb-3 ga-2">
                  <div>
                    <div class="text-body-2 font-weight-bold">{{ entry.customer.company }}</div>
                    <div class="text-caption text-medium-emphasis">
                      {{ formatCurrency(entry.customer.mrr) }} MRR · {{ entry.customer.plan }}
                    </div>
                  </div>
                  <VChip
                    size="small"
                    variant="flat"
                    :color="riskLevelColor(entry.analysis.riskLevel)"
                  >
                    {{ entry.analysis.riskLevel }}
                  </VChip>
                </div>

                <div class="d-flex justify-space-between text-caption mb-1">
                  <span>Churn risk score</span>
                  <span class="font-weight-bold acs-mono">{{ entry.analysis.churnRiskScore }}/100</span>
                </div>
                <VProgressLinear
                  :model-value="entry.analysis.churnRiskScore"
                  :color="riskLevelColor(entry.analysis.riskLevel)"
                  height="8"
                  rounded
                  class="mb-3"
                />

                <div class="text-caption text-medium-emphasis mb-2" style="min-height: 40px;">
                  {{ entry.analysis.explanation ? entry.analysis.explanation.slice(0, 140) : 'No written explanation returned.' }}
                  <span v-if="entry.analysis.explanation.length > 140">…</span>
                </div>

                <div class="d-flex flex-wrap ga-1">
                  <VChip size="x-small" variant="tonal" prepend-icon="mdi-flag-variant">
                    {{ entry.analysis.signals.length }} signals
                  </VChip>
                  <VChip size="x-small" variant="tonal" color="warning" prepend-icon="mdi-lightbulb-on-outline">
                    {{ entry.analysis.recommendedActions.length }} actions
                  </VChip>
                </div>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </div>
</template>
