<script setup lang="ts">
import type { ChurnAnalysis } from '~/composables/useChurnAnalysis'

const props = defineProps<{
  analysis: ChurnAnalysis
  company: string
  showPlan: boolean
}>()

const levelColor = computed(() => riskLevelColor(props.analysis.riskLevel))

const impactColor: Record<string, string> = {
  High: 'error',
  Medium: 'warning',
  Low: 'success'
}

const generatedAtLabel = computed(() => {
  const date = new Date(props.analysis.generatedAt)
  if (Number.isNaN(date.getTime())) return props.analysis.generatedAt
  return date.toLocaleString()
})

/** Actions sorted by priority — reused by the retention plan. */
const rankedActions = computed(() => {
  const weight = { High: 0, Medium: 1, Low: 2 } as const
  return [...props.analysis.recommendedActions].sort(
    (a, b) => weight[a.priority] - weight[b.priority]
  )
})

const planPhases = ['Next 48 hours', 'This week', 'Next 2 weeks', 'This quarter']
</script>

<template>
  <div class="d-flex flex-column ga-4">
    <VCard class="acs-card" elevation="0">
      <VCardText class="pa-5">
        <VRow align="center">
          <VCol cols="12" sm="auto" class="d-flex justify-center">
            <RiskGauge :score="analysis.churnRiskScore" :color="levelColor" label="Churn risk score" />
          </VCol>

          <VCol cols="12" sm>
            <div class="d-flex align-center ga-2 mb-2 flex-wrap">
              <VChip :color="levelColor" variant="flat" size="small" prepend-icon="mdi-alert-decagram-outline">
                {{ analysis.riskLevel }} risk
              </VChip>
              <VChip
                v-if="analysis.confidence !== null"
                size="small"
                variant="tonal"
                color="primary"
                prepend-icon="mdi-target"
              >
                {{ analysis.confidence }}% confidence
              </VChip>
              <VChip v-if="analysis.model" size="small" variant="tonal" prepend-icon="mdi-chip">
                {{ analysis.model }}
              </VChip>
            </div>

            <div class="text-subtitle-1 font-weight-bold mb-1">AI assessment for {{ company }}</div>
            <p v-if="analysis.explanation" class="text-body-2 text-medium-emphasis" style="white-space: pre-line;">
              {{ analysis.explanation }}
            </p>
            <p v-else class="text-body-2 text-medium-emphasis">
              The backend returned a score without a written explanation.
            </p>
            <div class="text-caption text-disabled mt-3">
              <VIcon icon="mdi-clock-outline" size="14" class="mr-1" />
              Generated {{ generatedAtLabel }}
            </div>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <VRow>
      <VCol cols="12" md="6">
        <VCard class="acs-card h-100" elevation="0">
          <VCardItem class="pb-2">
            <VCardTitle class="text-subtitle-1 font-weight-bold">
              <VIcon icon="mdi-radar" size="18" class="mr-2" color="primary" />
              Key signals
            </VCardTitle>
          </VCardItem>
          <VCardText>
            <VList v-if="analysis.signals.length" density="comfortable" class="bg-transparent pa-0">
              <VListItem
                v-for="(signal, index) in analysis.signals"
                :key="index"
                class="px-0"
              >
                <template #prepend>
                  <VAvatar :color="impactColor[signal.impact]" variant="tonal" size="32" class="mr-3">
                    <VIcon icon="mdi-flag-variant" size="16" />
                  </VAvatar>
                </template>
                <VListItemTitle class="text-body-2 font-weight-medium" style="white-space: normal;">
                  {{ signal.title }}
                </VListItemTitle>
                <VListItemSubtitle v-if="signal.detail" class="text-caption" style="white-space: normal;">
                  {{ signal.detail }}
                </VListItemSubtitle>
                <template #append>
                  <VChip size="x-small" variant="tonal" :color="impactColor[signal.impact]">
                    {{ signal.impact }}
                  </VChip>
                </template>
              </VListItem>
            </VList>
            <div v-else class="text-body-2 text-medium-emphasis">
              No individual signals were returned by the analysis.
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" md="6">
        <VCard class="acs-card h-100" elevation="0">
          <VCardItem class="pb-2">
            <VCardTitle class="text-subtitle-1 font-weight-bold">
              <VIcon icon="mdi-lightbulb-on-outline" size="18" class="mr-2" color="warning" />
              Recommended actions
            </VCardTitle>
          </VCardItem>
          <VCardText>
            <VList v-if="rankedActions.length" density="comfortable" class="bg-transparent pa-0">
              <VListItem v-for="(action, index) in rankedActions" :key="index" class="px-0">
                <template #prepend>
                  <VAvatar color="primary" variant="tonal" size="32" class="mr-3">
                    <span class="text-caption font-weight-bold">{{ index + 1 }}</span>
                  </VAvatar>
                </template>
                <VListItemTitle class="text-body-2 font-weight-medium" style="white-space: normal;">
                  {{ action.title }}
                </VListItemTitle>
                <VListItemSubtitle v-if="action.detail" class="text-caption" style="white-space: normal;">
                  {{ action.detail }}
                </VListItemSubtitle>
                <template #append>
                  <VChip size="x-small" variant="tonal" :color="impactColor[action.priority]">
                    {{ action.priority }}
                  </VChip>
                </template>
              </VListItem>
            </VList>
            <div v-else class="text-body-2 text-medium-emphasis">
              No actions were returned by the analysis.
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <Transition name="acs-fade" appear>
      <VCard v-if="showPlan" class="acs-card" elevation="0" color="surface-variant">
        <VCardItem>
          <VCardTitle class="text-subtitle-1 font-weight-bold">
            <VIcon icon="mdi-clipboard-check-outline" size="18" class="mr-2" color="success" />
            Retention plan for {{ company }}
          </VCardTitle>
          <VCardSubtitle class="text-caption">
            Built from the AI analysis — actions sequenced by priority
          </VCardSubtitle>
        </VCardItem>

        <VCardText>
          <VAlert
            v-if="!rankedActions.length"
            type="info"
            variant="tonal"
            density="comfortable"
            text="The analysis did not return actions, so there is nothing to sequence yet. Run the analysis again to refresh it."
          />

          <VTimeline v-else side="end" density="compact" truncate-line="both">
            <VTimelineItem
              v-for="(action, index) in rankedActions"
              :key="index"
              :dot-color="impactColor[action.priority]"
              size="x-small"
            >
              <div class="d-flex flex-wrap align-center ga-2 mb-1">
                <span class="text-body-2 font-weight-bold">{{ action.title }}</span>
                <VChip size="x-small" variant="flat" :color="impactColor[action.priority]">
                  {{ action.priority }} priority
                </VChip>
              </div>
              <div v-if="action.detail" class="text-caption text-medium-emphasis mb-1">
                {{ action.detail }}
              </div>
              <div class="text-caption text-disabled">
                <VIcon icon="mdi-account-outline" size="13" class="mr-1" />{{ action.owner }}
                <span class="mx-2">·</span>
                <VIcon icon="mdi-calendar-clock" size="13" class="mr-1" />
                {{ planPhases[Math.min(index, planPhases.length - 1)] }}
              </div>
            </VTimelineItem>
          </VTimeline>

          <div class="d-flex flex-wrap ga-2 mt-4">
            <VChip variant="tonal" color="primary" prepend-icon="mdi-target">
              Target: bring churn risk below {{ Math.max(10, analysis.churnRiskScore - 30) }}
            </VChip>
            <VChip variant="tonal" color="secondary" prepend-icon="mdi-account-tie">
              Owner: Customer Success
            </VChip>
          </div>
        </VCardText>
      </VCard>
    </Transition>
  </div>
</template>
