export type CustomerStatus = 'Healthy' | 'Attention' | 'At Risk'

export interface Ticket {
  id: string
  subject: string
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  status: 'Open' | 'Pending' | 'Resolved'
  openedAt: string
  sentiment: 'Positive' | 'Neutral' | 'Negative'
}

export interface TimelineEvent {
  date: string
  title: string
  detail: string
  icon: string
  color: string
}

export interface FeatureAdoption {
  name: string
  adoption: number
}

export interface Customer {
  id: string
  company: string
  domain: string
  industry: string
  plan: 'Starter' | 'Growth' | 'Business' | 'Enterprise'
  mrr: number
  healthScore: number
  /** Sessions in the last 30 days. */
  usage30d: number
  /** Percentage change of usage vs. the previous 30 days. */
  usageChangePct: number
  /** Weekly sessions, oldest first (12 weeks). */
  usageTrend: number[]
  seats: number
  activeSeats: number
  openTickets: number
  tickets: Ticket[]
  featureAdoption: FeatureAdoption[]
  timeline: TimelineEvent[]
  csm: string
  contactName: string
  contactEmail: string
  customerSince: string
  renewalDate: string
  lastLogin: string
  nps: number | null
}

export function statusFromHealth(score: number): CustomerStatus {
  if (score >= 75) return 'Healthy'
  if (score >= 50) return 'Attention'
  return 'At Risk'
}

export function statusColor(status: CustomerStatus): string {
  if (status === 'Healthy') return 'success'
  if (status === 'Attention') return 'warning'
  return 'error'
}

export function healthColor(score: number): string {
  return statusColor(statusFromHealth(score))
}

/**
 * Fetched once from the real backend (GET /customers, proxied through
 * server/api/customers) and shared across every component via useState.
 * The fetch is registered with useAsyncData so Nuxt awaits it during SSR
 * and during client-side navigation (Suspense), keeping synchronous reads
 * like `getCustomer(id)` safe right after `useCustomers()` is called.
 */
export function useCustomers() {
  const { data: customers } = useAsyncData<Customer[]>(
    'customers-list',
    () => $fetch<Customer[]>('/api/customers'),
    { default: () => [] }
  )

  const totalMrr = computed(() => customers.value.reduce((sum, c) => sum + c.mrr, 0))

  const activeCustomers = computed(() => customers.value.length)

  const atRisk = computed(() =>
    customers.value.filter(c => statusFromHealth(c.healthScore) === 'At Risk')
  )

  const needsAttention = computed(() =>
    customers.value
      .filter(c => statusFromHealth(c.healthScore) !== 'Healthy')
      .sort((a, b) => a.healthScore - b.healthScore)
  )

  const churnRiskMrr = computed(() => atRisk.value.reduce((sum, c) => sum + c.mrr, 0))

  const averageHealth = computed(() =>
    customers.value.length
      ? Math.round(customers.value.reduce((sum, c) => sum + c.healthScore, 0) / customers.value.length)
      : 0
  )

  const healthDistribution = computed(() => {
    const buckets: Record<CustomerStatus, number> = { Healthy: 0, Attention: 0, 'At Risk': 0 }
    for (const c of customers.value) buckets[statusFromHealth(c.healthScore)]++
    return buckets
  })

  function getCustomer(id: string) {
    return customers.value.find(c => c.id === id)
  }

  return {
    customers,
    totalMrr,
    activeCustomers,
    atRisk,
    needsAttention,
    churnRiskMrr,
    averageHealth,
    healthDistribution,
    getCustomer
  }
}

export function formatCurrency(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits
  }).format(value)
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

export function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(date)
}
