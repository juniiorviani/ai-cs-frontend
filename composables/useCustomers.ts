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

const CUSTOMERS: Customer[] = [
  {
    id: 'northwind-logistics',
    company: 'Northwind Logistics',
    domain: 'northwind-logistics.com',
    industry: 'Logistics & Supply Chain',
    plan: 'Enterprise',
    mrr: 12400,
    healthScore: 88,
    usage30d: 8420,
    usageChangePct: 12.4,
    usageTrend: [1580, 1640, 1720, 1690, 1810, 1870, 1920, 1960, 2010, 2080, 2140, 2190],
    seats: 120,
    activeSeats: 108,
    openTickets: 1,
    tickets: [
      { id: 'NWL-2214', subject: 'Bulk export timing out on 50k rows', priority: 'Medium', status: 'Open', openedAt: '2026-08-11', sentiment: 'Neutral' },
      { id: 'NWL-2190', subject: 'SSO group mapping question', priority: 'Low', status: 'Resolved', openedAt: '2026-07-28', sentiment: 'Positive' },
      { id: 'NWL-2151', subject: 'Request: webhook retries dashboard', priority: 'Low', status: 'Resolved', openedAt: '2026-07-09', sentiment: 'Positive' }
    ],
    featureAdoption: [
      { name: 'Automations', adoption: 92 },
      { name: 'Reporting', adoption: 84 },
      { name: 'API', adoption: 78 },
      { name: 'Integrations', adoption: 71 }
    ],
    timeline: [
      { date: '2026-08-08', title: 'QBR completed', detail: 'Expansion to the EU warehouse team agreed for Q4.', icon: 'mdi-presentation', color: 'success' },
      { date: '2026-07-15', title: 'Seat expansion', detail: 'Added 20 seats for the dispatch team.', icon: 'mdi-account-multiple-plus', color: 'primary' },
      { date: '2026-06-02', title: 'NPS survey', detail: 'Scored 9 — cited automation reliability.', icon: 'mdi-emoticon-happy-outline', color: 'success' }
    ],
    csm: 'Priya Raman',
    contactName: 'Dana Whitfield',
    contactEmail: 'dana.whitfield@northwind-logistics.com',
    customerSince: '2023-02-14',
    renewalDate: '2027-02-14',
    lastLogin: '2026-08-16',
    nps: 9
  },
  {
    id: 'vertex-analytics',
    company: 'Vertex Analytics',
    domain: 'vertexanalytics.io',
    industry: 'Data & BI',
    plan: 'Business',
    mrr: 8900,
    healthScore: 41,
    usage30d: 1180,
    usageChangePct: -38.6,
    usageTrend: [640, 620, 590, 560, 520, 470, 430, 380, 340, 300, 280, 260],
    seats: 60,
    activeSeats: 19,
    openTickets: 5,
    tickets: [
      { id: 'VTX-8871', subject: 'Dashboards loading blank after last release', priority: 'Urgent', status: 'Open', openedAt: '2026-08-13', sentiment: 'Negative' },
      { id: 'VTX-8860', subject: 'Scheduled reports arriving hours late', priority: 'High', status: 'Open', openedAt: '2026-08-10', sentiment: 'Negative' },
      { id: 'VTX-8842', subject: 'Data warehouse sync failing nightly', priority: 'High', status: 'Open', openedAt: '2026-08-04', sentiment: 'Negative' },
      { id: 'VTX-8830', subject: 'How do we export raw events?', priority: 'Medium', status: 'Pending', openedAt: '2026-07-30', sentiment: 'Neutral' },
      { id: 'VTX-8811', subject: 'Invoice discrepancy for July', priority: 'Medium', status: 'Open', openedAt: '2026-07-22', sentiment: 'Negative' }
    ],
    featureAdoption: [
      { name: 'Automations', adoption: 18 },
      { name: 'Reporting', adoption: 34 },
      { name: 'API', adoption: 12 },
      { name: 'Integrations', adoption: 9 }
    ],
    timeline: [
      { date: '2026-08-12', title: 'Champion left the account', detail: 'Head of Data moved to another company; no replacement introduced.', icon: 'mdi-account-off', color: 'error' },
      { date: '2026-07-25', title: 'Escalation opened', detail: 'Sync reliability escalated to engineering.', icon: 'mdi-alert-octagon', color: 'error' },
      { date: '2026-06-18', title: 'Renewal conversation postponed', detail: 'Customer asked to revisit in September.', icon: 'mdi-calendar-remove', color: 'warning' }
    ],
    csm: 'Marcus Bell',
    contactName: 'Ivan Petrov',
    contactEmail: 'ivan.petrov@vertexanalytics.io',
    customerSince: '2024-05-06',
    renewalDate: '2026-11-06',
    lastLogin: '2026-08-05',
    nps: 4
  },
  {
    id: 'lumina-health',
    company: 'Lumina Health',
    domain: 'luminahealth.org',
    industry: 'Healthcare',
    plan: 'Enterprise',
    mrr: 21500,
    healthScore: 72,
    usage30d: 6240,
    usageChangePct: -6.1,
    usageTrend: [1720, 1690, 1660, 1640, 1610, 1580, 1560, 1540, 1520, 1500, 1480, 1460],
    seats: 210,
    activeSeats: 154,
    openTickets: 3,
    tickets: [
      { id: 'LUM-4402', subject: 'Audit log retention needs to reach 7 years', priority: 'High', status: 'Open', openedAt: '2026-08-09', sentiment: 'Neutral' },
      { id: 'LUM-4388', subject: 'Role permissions too coarse for nursing staff', priority: 'Medium', status: 'Open', openedAt: '2026-08-01', sentiment: 'Negative' },
      { id: 'LUM-4361', subject: 'Training session for the new clinic', priority: 'Low', status: 'Pending', openedAt: '2026-07-19', sentiment: 'Positive' }
    ],
    featureAdoption: [
      { name: 'Automations', adoption: 61 },
      { name: 'Reporting', adoption: 88 },
      { name: 'API', adoption: 44 },
      { name: 'Integrations', adoption: 57 }
    ],
    timeline: [
      { date: '2026-08-06', title: 'Security review passed', detail: 'Annual vendor assessment approved for another year.', icon: 'mdi-shield-check', color: 'success' },
      { date: '2026-07-11', title: 'Adoption dip flagged', detail: 'Two clinics stopped logging in after a staffing change.', icon: 'mdi-trending-down', color: 'warning' },
      { date: '2026-05-29', title: 'Contract amendment', detail: 'Added HIPAA BAA addendum.', icon: 'mdi-file-document-edit', color: 'primary' }
    ],
    csm: 'Priya Raman',
    contactName: 'Dr. Alice Moreau',
    contactEmail: 'a.moreau@luminahealth.org',
    customerSince: '2022-09-30',
    renewalDate: '2026-09-30',
    lastLogin: '2026-08-15',
    nps: 7
  },
  {
    id: 'bluepeak-retail',
    company: 'Bluepeak Retail',
    domain: 'bluepeakretail.com',
    industry: 'Retail',
    plan: 'Growth',
    mrr: 5400,
    healthScore: 91,
    usage30d: 5310,
    usageChangePct: 21.8,
    usageTrend: [820, 880, 940, 1010, 1060, 1120, 1180, 1240, 1290, 1340, 1400, 1460],
    seats: 45,
    activeSeats: 43,
    openTickets: 0,
    tickets: [
      { id: 'BPR-1902', subject: 'Shopify integration mapping', priority: 'Low', status: 'Resolved', openedAt: '2026-07-24', sentiment: 'Positive' },
      { id: 'BPR-1875', subject: 'Add second store to workspace', priority: 'Low', status: 'Resolved', openedAt: '2026-06-30', sentiment: 'Positive' }
    ],
    featureAdoption: [
      { name: 'Automations', adoption: 88 },
      { name: 'Reporting', adoption: 79 },
      { name: 'API', adoption: 65 },
      { name: 'Integrations', adoption: 94 }
    ],
    timeline: [
      { date: '2026-08-10', title: 'Case study agreed', detail: 'Marketing approved a public reference story.', icon: 'mdi-star-outline', color: 'success' },
      { date: '2026-07-02', title: 'Upsell closed', detail: 'Upgraded from Starter to Growth.', icon: 'mdi-arrow-up-bold-circle', color: 'primary' }
    ],
    csm: 'Elena Duarte',
    contactName: 'Tom Halvorsen',
    contactEmail: 'tom@bluepeakretail.com',
    customerSince: '2024-01-18',
    renewalDate: '2027-01-18',
    lastLogin: '2026-08-16',
    nps: 10
  },
  {
    id: 'orbit-fintech',
    company: 'Orbit Fintech',
    domain: 'orbitfintech.com',
    industry: 'Financial Services',
    plan: 'Enterprise',
    mrr: 16800,
    healthScore: 34,
    usage30d: 940,
    usageChangePct: -52.3,
    usageTrend: [900, 860, 800, 740, 660, 580, 500, 430, 360, 300, 250, 210],
    seats: 140,
    activeSeats: 22,
    openTickets: 6,
    tickets: [
      { id: 'ORB-7731', subject: 'Latency spikes during EOD reconciliation', priority: 'Urgent', status: 'Open', openedAt: '2026-08-14', sentiment: 'Negative' },
      { id: 'ORB-7720', subject: 'Missing transactions in export', priority: 'Urgent', status: 'Open', openedAt: '2026-08-12', sentiment: 'Negative' },
      { id: 'ORB-7702', subject: 'SOC 2 evidence request overdue', priority: 'High', status: 'Open', openedAt: '2026-08-06', sentiment: 'Negative' },
      { id: 'ORB-7688', subject: 'Onboarding for the risk team never finished', priority: 'High', status: 'Pending', openedAt: '2026-07-27', sentiment: 'Negative' },
      { id: 'ORB-7671', subject: 'Contract terms clarification', priority: 'Medium', status: 'Open', openedAt: '2026-07-18', sentiment: 'Neutral' },
      { id: 'ORB-7650', subject: 'Requesting downgrade options', priority: 'High', status: 'Open', openedAt: '2026-07-09', sentiment: 'Negative' }
    ],
    featureAdoption: [
      { name: 'Automations', adoption: 11 },
      { name: 'Reporting', adoption: 22 },
      { name: 'API', adoption: 31 },
      { name: 'Integrations', adoption: 8 }
    ],
    timeline: [
      { date: '2026-08-13', title: 'Downgrade requested', detail: 'Procurement asked for pricing on a smaller plan.', icon: 'mdi-arrow-down-bold-circle', color: 'error' },
      { date: '2026-07-31', title: 'Executive sponsor unresponsive', detail: 'Three outreach attempts with no reply.', icon: 'mdi-email-alert', color: 'error' },
      { date: '2026-06-20', title: 'Competitor evaluation', detail: 'Customer mentioned an ongoing vendor review.', icon: 'mdi-compare', color: 'warning' }
    ],
    csm: 'Marcus Bell',
    contactName: 'Rebecca Lyons',
    contactEmail: 'r.lyons@orbitfintech.com',
    customerSince: '2023-10-01',
    renewalDate: '2026-10-01',
    lastLogin: '2026-07-29',
    nps: 3
  },
  {
    id: 'corewave-systems',
    company: 'Corewave Systems',
    domain: 'corewave.dev',
    industry: 'Software',
    plan: 'Business',
    mrr: 9700,
    healthScore: 79,
    usage30d: 4980,
    usageChangePct: 4.9,
    usageTrend: [1120, 1140, 1130, 1160, 1180, 1170, 1200, 1210, 1220, 1240, 1250, 1270],
    seats: 80,
    activeSeats: 67,
    openTickets: 2,
    tickets: [
      { id: 'CWS-5510', subject: 'Rate limit headers missing on v2 API', priority: 'Medium', status: 'Open', openedAt: '2026-08-12', sentiment: 'Neutral' },
      { id: 'CWS-5488', subject: 'Sandbox environment for CI', priority: 'Medium', status: 'Open', openedAt: '2026-08-03', sentiment: 'Neutral' },
      { id: 'CWS-5451', subject: 'Terraform provider docs feedback', priority: 'Low', status: 'Resolved', openedAt: '2026-07-14', sentiment: 'Positive' }
    ],
    featureAdoption: [
      { name: 'Automations', adoption: 74 },
      { name: 'Reporting', adoption: 58 },
      { name: 'API', adoption: 96 },
      { name: 'Integrations', adoption: 69 }
    ],
    timeline: [
      { date: '2026-08-04', title: 'API usage milestone', detail: 'Crossed 1M monthly API calls.', icon: 'mdi-api', color: 'success' },
      { date: '2026-06-25', title: 'New workspace admin', detail: 'Platform team took ownership from engineering.', icon: 'mdi-account-switch', color: 'primary' }
    ],
    csm: 'Elena Duarte',
    contactName: 'Sofia Nakamura',
    contactEmail: 'sofia@corewave.dev',
    customerSince: '2023-06-12',
    renewalDate: '2026-12-12',
    lastLogin: '2026-08-16',
    nps: 8
  },
  {
    id: 'sunset-media',
    company: 'Sunset Media',
    domain: 'sunsetmedia.tv',
    industry: 'Media & Entertainment',
    plan: 'Starter',
    mrr: 3200,
    healthScore: 57,
    usage30d: 1620,
    usageChangePct: -14.2,
    usageTrend: [520, 505, 490, 470, 460, 445, 430, 420, 405, 395, 385, 375],
    seats: 25,
    activeSeats: 13,
    openTickets: 2,
    tickets: [
      { id: 'SNM-3320', subject: 'Video asset uploads failing over 2GB', priority: 'High', status: 'Open', openedAt: '2026-08-08', sentiment: 'Negative' },
      { id: 'SNM-3301', subject: 'Need more granular publishing roles', priority: 'Medium', status: 'Pending', openedAt: '2026-07-21', sentiment: 'Neutral' }
    ],
    featureAdoption: [
      { name: 'Automations', adoption: 32 },
      { name: 'Reporting', adoption: 47 },
      { name: 'API', adoption: 19 },
      { name: 'Integrations', adoption: 38 }
    ],
    timeline: [
      { date: '2026-07-30', title: 'Budget freeze announced', detail: 'Customer signalled tighter tooling budget for 2027.', icon: 'mdi-cash-remove', color: 'warning' },
      { date: '2026-06-14', title: 'Onboarding refresh', detail: 'Re-trained the editorial team on workflows.', icon: 'mdi-school', color: 'primary' }
    ],
    csm: 'Elena Duarte',
    contactName: 'Marco Silveira',
    contactEmail: 'marco@sunsetmedia.tv',
    customerSince: '2025-03-05',
    renewalDate: '2027-03-05',
    lastLogin: '2026-08-13',
    nps: 6
  },
  {
    id: 'atlas-manufacturing',
    company: 'Atlas Manufacturing',
    domain: 'atlasmfg.com',
    industry: 'Manufacturing',
    plan: 'Business',
    mrr: 14300,
    healthScore: 66,
    usage30d: 3870,
    usageChangePct: -9.7,
    usageTrend: [1080, 1060, 1040, 1020, 1000, 980, 965, 950, 935, 920, 905, 890],
    seats: 95,
    activeSeats: 58,
    openTickets: 3,
    tickets: [
      { id: 'ATL-6612', subject: 'ERP connector drops records overnight', priority: 'High', status: 'Open', openedAt: '2026-08-10', sentiment: 'Negative' },
      { id: 'ATL-6590', subject: 'Plant floor tablets logged out repeatedly', priority: 'Medium', status: 'Open', openedAt: '2026-08-02', sentiment: 'Negative' },
      { id: 'ATL-6544', subject: 'Quarterly usage report request', priority: 'Low', status: 'Resolved', openedAt: '2026-07-08', sentiment: 'Neutral' }
    ],
    featureAdoption: [
      { name: 'Automations', adoption: 49 },
      { name: 'Reporting', adoption: 63 },
      { name: 'API', adoption: 41 },
      { name: 'Integrations', adoption: 52 }
    ],
    timeline: [
      { date: '2026-08-05', title: 'Second plant paused rollout', detail: 'Rollout to the Monterrey plant put on hold.', icon: 'mdi-pause-circle', color: 'warning' },
      { date: '2026-06-28', title: 'Integration project kicked off', detail: 'ERP connector project started with IT.', icon: 'mdi-rocket-launch', color: 'primary' }
    ],
    csm: 'Priya Raman',
    contactName: 'Grace Okoye',
    contactEmail: 'g.okoye@atlasmfg.com',
    customerSince: '2022-11-22',
    renewalDate: '2026-11-22',
    lastLogin: '2026-08-14',
    nps: 6
  },
  {
    id: 'pixelforge-studio',
    company: 'Pixelforge Studio',
    domain: 'pixelforge.studio',
    industry: 'Design Agency',
    plan: 'Starter',
    mrr: 2600,
    healthScore: 28,
    usage30d: 310,
    usageChangePct: -61.5,
    usageTrend: [310, 290, 260, 230, 200, 170, 140, 120, 100, 85, 70, 55],
    seats: 18,
    activeSeats: 4,
    openTickets: 4,
    tickets: [
      { id: 'PXF-2210', subject: 'Cancel auto-renew before the next cycle', priority: 'Urgent', status: 'Open', openedAt: '2026-08-15', sentiment: 'Negative' },
      { id: 'PXF-2201', subject: 'Two failed payments on the company card', priority: 'High', status: 'Open', openedAt: '2026-08-09', sentiment: 'Negative' },
      { id: 'PXF-2188', subject: 'Cannot find exported brand assets', priority: 'Medium', status: 'Open', openedAt: '2026-07-26', sentiment: 'Negative' },
      { id: 'PXF-2170', subject: 'Team seats unused since June', priority: 'Medium', status: 'Pending', openedAt: '2026-07-12', sentiment: 'Neutral' }
    ],
    featureAdoption: [
      { name: 'Automations', adoption: 6 },
      { name: 'Reporting', adoption: 14 },
      { name: 'API', adoption: 2 },
      { name: 'Integrations', adoption: 11 }
    ],
    timeline: [
      { date: '2026-08-15', title: 'Cancellation request', detail: 'Asked support how to stop the renewal.', icon: 'mdi-exit-run', color: 'error' },
      { date: '2026-08-09', title: 'Payment failed twice', detail: 'Card declined on both retry attempts.', icon: 'mdi-credit-card-off', color: 'error' },
      { date: '2026-06-05', title: 'Team downsized', detail: 'Agency reduced headcount by 40%.', icon: 'mdi-account-minus', color: 'warning' }
    ],
    csm: 'Marcus Bell',
    contactName: 'Lena Fischer',
    contactEmail: 'lena@pixelforge.studio',
    customerSince: '2025-01-09',
    renewalDate: '2026-09-09',
    lastLogin: '2026-07-21',
    nps: 2
  },
  {
    id: 'everline-energy',
    company: 'Everline Energy',
    domain: 'everline-energy.com',
    industry: 'Energy & Utilities',
    plan: 'Enterprise',
    mrr: 11200,
    healthScore: 84,
    usage30d: 7150,
    usageChangePct: 8.3,
    usageTrend: [1480, 1520, 1560, 1590, 1610, 1650, 1680, 1710, 1740, 1780, 1810, 1850],
    seats: 105,
    activeSeats: 91,
    openTickets: 1,
    tickets: [
      { id: 'EVL-9910', subject: 'Add SAML attribute for regional access', priority: 'Medium', status: 'Open', openedAt: '2026-08-07', sentiment: 'Neutral' },
      { id: 'EVL-9885', subject: 'Feedback on the new alerting UI', priority: 'Low', status: 'Resolved', openedAt: '2026-07-16', sentiment: 'Positive' }
    ],
    featureAdoption: [
      { name: 'Automations', adoption: 81 },
      { name: 'Reporting', adoption: 90 },
      { name: 'API', adoption: 62 },
      { name: 'Integrations', adoption: 73 }
    ],
    timeline: [
      { date: '2026-08-01', title: 'Renewal signed early', detail: 'Committed to a 24-month term.', icon: 'mdi-file-sign', color: 'success' },
      { date: '2026-07-04', title: 'New region onboarded', detail: 'Nordics operations team went live.', icon: 'mdi-earth', color: 'primary' }
    ],
    csm: 'Priya Raman',
    contactName: 'Henrik Solberg',
    contactEmail: 'h.solberg@everline-energy.com',
    customerSince: '2021-08-19',
    renewalDate: '2028-08-19',
    lastLogin: '2026-08-16',
    nps: 9
  }
]

export function useCustomers() {
  const customers = useState<Customer[]>('customers', () => CUSTOMERS)

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
    Math.round(customers.value.reduce((sum, c) => sum + c.healthScore, 0) / customers.value.length)
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
