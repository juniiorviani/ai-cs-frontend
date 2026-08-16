import type { Customer } from './useCustomers'

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical'

export interface ChurnSignal {
  title: string
  detail: string
  impact: 'Low' | 'Medium' | 'High'
}

export interface RecommendedAction {
  title: string
  detail: string
  priority: 'Low' | 'Medium' | 'High'
  owner: string
}

export interface ChurnAnalysis {
  churnRiskScore: number
  riskLevel: RiskLevel
  signals: ChurnSignal[]
  explanation: string
  recommendedActions: RecommendedAction[]
  confidence: number | null
  model: string | null
  generatedAt: string
  /** Whatever the API actually returned, kept for inspection. */
  raw: unknown
}

function pick(source: Record<string, any>, keys: string[]) {
  for (const key of keys) {
    const value = source?.[key]
    if (value !== undefined && value !== null && value !== '') return value
  }
  return undefined
}

function toScore(value: unknown): number {
  const num = typeof value === 'string' ? Number.parseFloat(value) : Number(value)
  if (!Number.isFinite(num)) return 0
  // Accept both 0..1 and 0..100 scales.
  const scaled = num > 0 && num <= 1 ? num * 100 : num
  return Math.max(0, Math.min(100, Math.round(scaled)))
}

export function levelFromScore(score: number): RiskLevel {
  if (score >= 80) return 'Critical'
  if (score >= 60) return 'High'
  if (score >= 35) return 'Medium'
  return 'Low'
}

export function riskLevelColor(level: RiskLevel): string {
  if (level === 'Critical') return 'error'
  if (level === 'High') return 'error'
  if (level === 'Medium') return 'warning'
  return 'success'
}

function normalizeLevel(value: unknown, score: number): RiskLevel {
  const text = String(value ?? '').trim().toLowerCase()
  if (['critical', 'severe', 'very high', 'very_high'].includes(text)) return 'Critical'
  if (['high', 'alto', 'elevated'].includes(text)) return 'High'
  if (['medium', 'moderate', 'medio', 'médio'].includes(text)) return 'Medium'
  if (['low', 'baixo', 'minimal'].includes(text)) return 'Low'
  return levelFromScore(score)
}

function normalizeImpact(value: unknown): 'Low' | 'Medium' | 'High' {
  const text = String(value ?? '').trim().toLowerCase()
  if (['high', 'critical', 'urgent', 'alto', 'severe'].includes(text)) return 'High'
  if (['low', 'minor', 'baixo'].includes(text)) return 'Low'
  return 'Medium'
}

function normalizeSignal(item: unknown): ChurnSignal {
  if (typeof item === 'string') {
    return { title: item, detail: '', impact: 'Medium' }
  }
  const obj = (item ?? {}) as Record<string, any>
  const title = pick(obj, ['title', 'signal', 'name', 'label', 'factor', 'summary']) ?? 'Signal'
  const detail = pick(obj, ['detail', 'description', 'explanation', 'evidence', 'reason', 'details']) ?? ''
  return {
    title: String(title),
    detail: String(detail),
    impact: normalizeImpact(pick(obj, ['impact', 'severity', 'weight', 'level']))
  }
}

function normalizeAction(item: unknown): RecommendedAction {
  if (typeof item === 'string') {
    return { title: item, detail: '', priority: 'Medium', owner: 'Customer Success' }
  }
  const obj = (item ?? {}) as Record<string, any>
  const title = pick(obj, ['title', 'action', 'name', 'recommendation', 'step', 'summary']) ?? 'Recommended action'
  const detail = pick(obj, ['detail', 'description', 'details', 'rationale', 'why', 'explanation']) ?? ''
  return {
    title: String(title),
    detail: String(detail),
    priority: normalizeImpact(pick(obj, ['priority', 'impact', 'severity', 'urgency'])),
    owner: String(pick(obj, ['owner', 'team', 'assignee', 'role']) ?? 'Customer Success')
  }
}

function toArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    return value
      .split(/\n+|(?:^|\s)[-•*]\s+/)
      .map(part => part.trim())
      .filter(Boolean)
  }
  if (value && typeof value === 'object') return Object.values(value as Record<string, unknown>)
  return []
}

/**
 * The backend contract may vary (camelCase, snake_case, nested envelope,
 * strings vs. objects), so everything is normalized into one shape the UI
 * can render safely.
 */
export function normalizeAnalysis(payload: any): ChurnAnalysis {
  const root = (payload ?? {}) as Record<string, any>
  const body = (pick(root, ['analysis', 'data', 'result', 'output']) ?? root) as Record<string, any>

  const score = toScore(
    pick(body, [
      'churnRiskScore',
      'churn_risk_score',
      'churnRisk',
      'riskScore',
      'risk_score',
      'score',
      'probability'
    ])
  )

  const signals = toArray(
    pick(body, ['signals', 'keySignals', 'key_signals', 'riskSignals', 'risk_signals', 'indicators', 'factors', 'reasons'])
  ).map(normalizeSignal)

  const actions = toArray(
    pick(body, [
      'recommendedActions',
      'recommended_actions',
      'actions',
      'recommendations',
      'nextSteps',
      'next_steps',
      'playbook'
    ])
  ).map(normalizeAction)

  const confidenceRaw = pick(body, ['confidence', 'confidenceScore', 'confidence_score'])
  const confidence = confidenceRaw === undefined ? null : toScore(confidenceRaw)

  return {
    churnRiskScore: score,
    riskLevel: normalizeLevel(pick(body, ['riskLevel', 'risk_level', 'level', 'risk', 'severity']), score),
    signals,
    explanation: String(
      pick(body, ['explanation', 'reasoning', 'aiExplanation', 'ai_explanation', 'summary', 'analysisText', 'rationale', 'message']) ?? ''
    ),
    recommendedActions: actions,
    confidence,
    model: (pick(body, ['model', 'modelName', 'model_name', 'engine']) as string) ?? null,
    generatedAt: String(pick(body, ['generatedAt', 'generated_at', 'createdAt', 'timestamp']) ?? new Date().toISOString()),
    raw: payload
  }
}

const LOADING_STAGES = [
  'Collecting product usage signals…',
  'Reading support tickets and sentiment…',
  'Comparing against similar accounts…',
  'Scoring churn risk…',
  'Drafting recommended actions…'
]

export function useChurnAnalysis() {
  const cache = useState<Record<string, ChurnAnalysis>>('churn-analysis-cache', () => ({}))
  const loadingId = useState<string | null>('churn-analysis-loading', () => null)
  const errors = useState<Record<string, string>>('churn-analysis-errors', () => ({}))
  const stage = useState<string>('churn-analysis-stage', () => LOADING_STAGES[0]!)

  let stageTimer: ReturnType<typeof setInterval> | null = null

  function startStages() {
    let index = 0
    stage.value = LOADING_STAGES[0]!
    stageTimer = setInterval(() => {
      index = (index + 1) % LOADING_STAGES.length
      stage.value = LOADING_STAGES[index]!
    }, 1600)
  }

  function stopStages() {
    if (stageTimer) {
      clearInterval(stageTimer)
      stageTimer = null
    }
  }

  async function analyze(customer: Customer) {
    loadingId.value = customer.id
    errors.value = { ...errors.value, [customer.id]: '' }
    startStages()

    // The backend can score from its own data; the snapshot is sent so it can
    // also work statelessly against this front end's mock catalogue.
    const payload = {
      customerId: customer.id,
      company: customer.company,
      plan: customer.plan,
      mrr: customer.mrr,
      healthScore: customer.healthScore,
      usage30d: customer.usage30d,
      usageChangePct: customer.usageChangePct,
      usageTrend: customer.usageTrend,
      seats: customer.seats,
      activeSeats: customer.activeSeats,
      openTickets: customer.openTickets,
      nps: customer.nps,
      lastLogin: customer.lastLogin,
      renewalDate: customer.renewalDate,
      tickets: customer.tickets.map(t => ({
        subject: t.subject,
        priority: t.priority,
        status: t.status,
        sentiment: t.sentiment,
        openedAt: t.openedAt
      }))
    }

    try {
      const response = await $fetch<any>(`/api/customers/${customer.id}/analyze`, {
        method: 'POST',
        body: payload
      })
      const analysis = normalizeAnalysis(response)
      cache.value = { ...cache.value, [customer.id]: analysis }
      return analysis
    } catch (error: any) {
      const message =
        error?.statusMessage ||
        error?.data?.statusMessage ||
        error?.data?.message ||
        error?.message ||
        'Could not reach the analysis backend.'
      errors.value = { ...errors.value, [customer.id]: message }
      return null
    } finally {
      stopStages()
      loadingId.value = null
    }
  }

  function clear(customerId: string) {
    const next = { ...cache.value }
    delete next[customerId]
    cache.value = next
    errors.value = { ...errors.value, [customerId]: '' }
  }

  return { cache, loadingId, errors, stage, analyze, clear }
}
