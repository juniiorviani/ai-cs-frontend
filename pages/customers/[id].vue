<script setup lang="ts">
const route = useRoute()
const { getCustomer } = useCustomers()
const { cache, loadingId, errors, stage, analyze } = useChurnAnalysis()

const customerId = computed(() => String(route.params.id))
const customer = computed(() => getCustomer(customerId.value))

if (!customer.value) {
  throw createError({ statusCode: 404, statusMessage: 'Customer not found', fatal: true })
}

usePageTitle(customer.value.company)

const status = computed(() => statusFromHealth(customer.value!.healthScore))
const analysis = computed(() => cache.value[customerId.value] ?? null)
const isAnalyzing = computed(() => loadingId.value === customerId.value)
const error = computed(() => errors.value[customerId.value] || '')

const showPlan = ref(false)
const snackbar = ref(false)
const snackbarText = ref('')

const seatUtilization = computed(() =>
  Math.round((customer.value!.activeSeats / customer.value!.seats) * 100)
)

const ticketPriorityColor: Record<string, string> = {
  Urgent: 'error',
  High: 'error',
  Medium: 'warning',
  Low: 'success'
}

const sentimentIcon: Record<string, string> = {
  Positive: 'mdi-emoticon-happy-outline',
  Neutral: 'mdi-emoticon-neutral-outline',
  Negative: 'mdi-emoticon-sad-outline'
}

const usageWeeks = computed(() =>
  customer.value!.usageTrend.map((value, index) => ({
    label: `W${index + 1}`,
    value
  }))
)

const maxWeekUsage = computed(() => Math.max(...customer.value!.usageTrend))

async function runAnalysis(alsoShowPlan = false) {
  const result = await analyze(customer.value!)

  if (result) {
    if (alsoShowPlan) showPlan.value = true
    snackbarText.value = `Analysis ready · ${result.riskLevel} risk (${result.churnRiskScore}/100)`
    snackbar.value = true
    await nextTick()
    scrollToAnalysis()
  }
}

async function generatePlan() {
  if (!analysis.value) {
    // No analysis yet: run it first, then surface the recommended actions.
    await runAnalysis(true)
    return
  }
  showPlan.value = true
  snackbarText.value = 'Retention plan built from the latest AI analysis'
  snackbar.value = true
  await nextTick()
  scrollToAnalysis()
}

function scrollToAnalysis() {
  if (!import.meta.client) return
  document.getElementById('ai-analysis')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div v-if="customer">
    <VBreadcrumbs
      class="px-0 pt-0 text-caption"
      :items="[
        { title: 'Customers', to: '/customers' },
        { title: customer.company, disabled: true }
      ]"
    />

    <VCard class="acs-card acs-gradient mb-6" elevation="0">
      <VCardText class="pa-5 pa-md-6">
        <div class="d-flex flex-wrap align-center justify-space-between ga-4">
          <div class="d-flex align-center ga-4">
            <VAvatar :color="healthColor(customer.healthScore)" variant="flat" rounded="lg" size="60">
              <span class="text-h6 font-weight-bold text-white">
                {{ customer.company.slice(0, 2).toUpperCase() }}
              </span>
            </VAvatar>
            <div>
              <div class="d-flex align-center ga-3 flex-wrap">
                <h1 class="text-h5 text-md-h4 font-weight-bold">{{ customer.company }}</h1>
                <StatusChip :status="status" />
              </div>
              <div class="text-body-2 text-medium-emphasis mt-1">
                {{ customer.industry }} · {{ customer.plan }} plan · {{ formatCurrency(customer.mrr) }} MRR
                <span class="mx-1">·</span>
                <a :href="`https://${customer.domain}`" target="_blank" rel="noopener" class="text-primary">
                  {{ customer.domain }}
                </a>
              </div>
            </div>
          </div>

          <div class="d-flex ga-3 flex-wrap">
            <VBtn
              color="primary"
              variant="flat"
              size="large"
              prepend-icon="mdi-brain"
              :loading="isAnalyzing"
              @click="runAnalysis(false)"
            >
              Analyze with AI
            </VBtn>
            <VBtn
              color="primary"
              variant="outlined"
              size="large"
              prepend-icon="mdi-clipboard-text-outline"
              :disabled="isAnalyzing"
              @click="generatePlan"
            >
              Generate Retention Plan
            </VBtn>
          </div>
        </div>
      </VCardText>
    </VCard>

    <!-- AI analysis -->
    <section id="ai-analysis" class="mb-6">
      <AiThinking v-if="isAnalyzing" :stage="stage" :company="customer.company" />

      <template v-else>
        <VAlert
          v-if="error"
          type="error"
          variant="tonal"
          class="mb-4"
          icon="mdi-cloud-alert"
        >
          <div class="text-body-2 font-weight-medium">The AI analysis could not be completed</div>
          <div class="text-caption mt-1">{{ error }}</div>
          <template #append>
            <VBtn size="small" variant="text" color="error" @click="runAnalysis(false)">Retry</VBtn>
          </template>
        </VAlert>

        <AiAnalysisPanel
          v-if="analysis"
          :analysis="analysis"
          :company="customer.company"
          :show-plan="showPlan"
        />

        <VCard v-else-if="!error" class="acs-card" elevation="0">
          <VCardText class="pa-8 text-center">
            <VAvatar color="primary" variant="tonal" size="64" class="mb-4">
              <VIcon icon="mdi-brain" size="32" color="primary" />
            </VAvatar>
            <div class="text-h6 font-weight-bold mb-2">No AI analysis yet</div>
            <p class="text-body-2 text-medium-emphasis mb-4 mx-auto" style="max-width: 520px;">
              Run the churn model against {{ customer.company }}'s usage, tickets and account history to get a
              risk score, the signals behind it and the actions your team should take next.
            </p>
            <VBtn color="primary" variant="flat" prepend-icon="mdi-play" @click="runAnalysis(false)">
              Analyze with AI
            </VBtn>
          </VCardText>
        </VCard>
      </template>
    </section>

    <VRow>
      <!-- Usage & engagement -->
      <VCol cols="12" lg="8">
        <VCard class="acs-card mb-6" elevation="0">
          <VCardItem class="pb-0">
            <VCardTitle class="text-subtitle-1 font-weight-bold">Usage metrics</VCardTitle>
            <VCardSubtitle class="text-caption">Weekly sessions over the last 12 weeks</VCardSubtitle>
          </VCardItem>

          <VCardText class="pt-4">
            <VRow class="mb-2">
              <VCol cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Sessions (30d)</div>
                <div class="text-h6 font-weight-bold acs-mono">{{ formatNumber(customer.usage30d) }}</div>
              </VCol>
              <VCol cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Change</div>
                <div
                  class="text-h6 font-weight-bold acs-mono"
                  :class="customer.usageChangePct >= 0 ? 'text-success' : 'text-error'"
                >
                  {{ customer.usageChangePct > 0 ? '+' : '' }}{{ customer.usageChangePct }}%
                </div>
              </VCol>
              <VCol cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Active seats</div>
                <div class="text-h6 font-weight-bold acs-mono">
                  {{ customer.activeSeats }}<span class="text-body-2 text-disabled">/{{ customer.seats }}</span>
                </div>
              </VCol>
              <VCol cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Health score</div>
                <div class="text-h6 font-weight-bold acs-mono" :class="`text-${healthColor(customer.healthScore)}`">
                  {{ customer.healthScore }}
                </div>
              </VCol>
            </VRow>

            <div class="acs-usage mb-5">
              <div
                v-for="week in usageWeeks"
                :key="week.label"
                class="acs-usage__col"
              >
                <VTooltip :text="`${week.label}: ${formatNumber(week.value)} sessions`" location="top">
                  <template #activator="{ props: tooltip }">
                    <div v-bind="tooltip" class="acs-usage__track">
                      <div
                        class="acs-usage__bar"
                        :style="{
                          height: `${Math.max(4, (week.value / maxWeekUsage) * 100)}%`,
                          background: `rgb(var(--v-theme-${customer.usageChangePct >= 0 ? 'success' : 'error'}))`
                        }"
                      />
                    </div>
                  </template>
                </VTooltip>
                <span class="text-caption text-disabled">{{ week.label }}</span>
              </div>
            </div>

            <div class="mb-2 text-body-2 font-weight-medium">Seat utilization</div>
            <VProgressLinear
              :model-value="seatUtilization"
              :color="seatUtilization >= 70 ? 'success' : seatUtilization >= 40 ? 'warning' : 'error'"
              height="10"
              rounded
              class="mb-5"
            >
              <span class="text-caption font-weight-bold">{{ seatUtilization }}%</span>
            </VProgressLinear>

            <div class="mb-2 text-body-2 font-weight-medium">Feature adoption</div>
            <div v-for="feature in customer.featureAdoption" :key="feature.name" class="mb-3">
              <div class="d-flex justify-space-between text-caption mb-1">
                <span>{{ feature.name }}</span>
                <span class="font-weight-bold acs-mono">{{ feature.adoption }}%</span>
              </div>
              <VProgressLinear
                :model-value="feature.adoption"
                :color="feature.adoption >= 60 ? 'primary' : feature.adoption >= 30 ? 'warning' : 'error'"
                height="6"
                rounded
              />
            </div>
          </VCardText>
        </VCard>

        <VCard class="acs-card" elevation="0">
          <VCardItem class="pb-0">
            <VCardTitle class="text-subtitle-1 font-weight-bold">Recent tickets</VCardTitle>
            <VCardSubtitle class="text-caption">
              {{ customer.openTickets }} open · {{ customer.tickets.length }} in the last 60 days
            </VCardSubtitle>
          </VCardItem>

          <VCardText class="pt-3">
            <VList class="bg-transparent pa-0" density="comfortable">
              <template v-for="(ticket, index) in customer.tickets" :key="ticket.id">
                <VListItem class="px-0">
                  <template #prepend>
                    <VAvatar :color="ticketPriorityColor[ticket.priority]" variant="tonal" size="36" class="mr-3">
                      <VIcon :icon="sentimentIcon[ticket.sentiment]" size="18" />
                    </VAvatar>
                  </template>

                  <VListItemTitle class="text-body-2 font-weight-medium" style="white-space: normal;">
                    {{ ticket.subject }}
                  </VListItemTitle>
                  <VListItemSubtitle class="text-caption">
                    {{ ticket.id }} · opened {{ formatDate(ticket.openedAt) }} · {{ ticket.sentiment }}
                  </VListItemSubtitle>

                  <template #append>
                    <div class="d-flex ga-2 align-center">
                      <VChip size="x-small" variant="tonal" :color="ticketPriorityColor[ticket.priority]">
                        {{ ticket.priority }}
                      </VChip>
                      <VChip
                        size="x-small"
                        variant="flat"
                        :color="ticket.status === 'Open' ? 'error' : ticket.status === 'Pending' ? 'warning' : 'success'"
                      >
                        {{ ticket.status }}
                      </VChip>
                    </div>
                  </template>
                </VListItem>
                <VDivider v-if="index < customer.tickets.length - 1" />
              </template>
            </VList>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Account profile & history -->
      <VCol cols="12" lg="4">
        <VCard class="acs-card mb-6" elevation="0">
          <VCardItem class="pb-0">
            <VCardTitle class="text-subtitle-1 font-weight-bold">Account information</VCardTitle>
          </VCardItem>
          <VCardText class="pt-4">
            <VList class="bg-transparent pa-0" density="compact">
              <VListItem class="px-0" prepend-icon="mdi-account-tie">
                <VListItemTitle class="text-body-2">{{ customer.csm }}</VListItemTitle>
                <VListItemSubtitle class="text-caption">Customer Success Manager</VListItemSubtitle>
              </VListItem>
              <VListItem class="px-0" prepend-icon="mdi-account-circle-outline">
                <VListItemTitle class="text-body-2">{{ customer.contactName }}</VListItemTitle>
                <VListItemSubtitle class="text-caption">{{ customer.contactEmail }}</VListItemSubtitle>
              </VListItem>
              <VListItem class="px-0" prepend-icon="mdi-calendar-start">
                <VListItemTitle class="text-body-2">{{ formatDate(customer.customerSince) }}</VListItemTitle>
                <VListItemSubtitle class="text-caption">Customer since</VListItemSubtitle>
              </VListItem>
              <VListItem class="px-0" prepend-icon="mdi-calendar-refresh-outline">
                <VListItemTitle class="text-body-2">{{ formatDate(customer.renewalDate) }}</VListItemTitle>
                <VListItemSubtitle class="text-caption">Renewal date</VListItemSubtitle>
              </VListItem>
              <VListItem class="px-0" prepend-icon="mdi-login-variant">
                <VListItemTitle class="text-body-2">{{ formatDate(customer.lastLogin) }}</VListItemTitle>
                <VListItemSubtitle class="text-caption">Last login</VListItemSubtitle>
              </VListItem>
              <VListItem class="px-0" prepend-icon="mdi-emoticon-outline">
                <VListItemTitle class="text-body-2">
                  {{ customer.nps === null ? 'Not answered' : `${customer.nps}/10` }}
                </VListItemTitle>
                <VListItemSubtitle class="text-caption">Latest NPS</VListItemSubtitle>
              </VListItem>
            </VList>
          </VCardText>
        </VCard>

        <VCard class="acs-card" elevation="0">
          <VCardItem class="pb-0">
            <VCardTitle class="text-subtitle-1 font-weight-bold">Account history</VCardTitle>
            <VCardSubtitle class="text-caption">Key events on this account</VCardSubtitle>
          </VCardItem>
          <VCardText class="pt-5">
            <VTimeline side="end" density="compact" truncate-line="both" align="start">
              <VTimelineItem
                v-for="event in customer.timeline"
                :key="event.date + event.title"
                :dot-color="event.color"
                :icon="event.icon"
                icon-color="white"
                size="small"
              >
                <div class="text-caption text-disabled">{{ formatDate(event.date) }}</div>
                <div class="text-body-2 font-weight-bold">{{ event.title }}</div>
                <div class="text-caption text-medium-emphasis">{{ event.detail }}</div>
              </VTimelineItem>
            </VTimeline>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VSnackbar v-model="snackbar" :timeout="4000" color="primary" location="bottom right">
      {{ snackbarText }}
    </VSnackbar>
  </div>
</template>

<style scoped>
.acs-usage {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 150px;
}

.acs-usage__col {
  flex: 1 1 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
}

.acs-usage__track {
  display: flex;
  align-items: flex-end;
  height: calc(100% - 20px);
  width: 100%;
}

.acs-usage__bar {
  width: 100%;
  border-radius: 5px 5px 2px 2px;
  opacity: 0.85;
  transition: opacity 0.15s ease;
}

.acs-usage__track:hover .acs-usage__bar {
  opacity: 1;
}
</style>
