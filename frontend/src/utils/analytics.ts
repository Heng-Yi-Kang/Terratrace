const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

export type AnalyticsPeriod = 'month' | 'year' | 'all'

export type AnalyticsBreakdown = {
  method: string
  actualKg: number
  baselineKg: number
  savedKg: number
  count: number
}

export type AnalyticsEntry = {
  id: string
  date: string
  method: string
  actualKg: number
  baselineKg: number
  savedKg: number
}

export type ImpactSummary = {
  actualEmissionsKg: number
  baselineEmissionsKg: number
  carbonSavedKg: number
  treeEquivalent: number
  loggedCalculations: number
  breakdown: AnalyticsBreakdown[]
  overTime: {
    period: string
    actualKg: number
    baselineKg: number
    savedKg: number
    count: number
  }[]
  entries: AnalyticsEntry[]
}

export type GoalSummary = {
  goal: null | {
    id: string
    year: number
    annualBudgetKg: number
    createdAt: string
    updatedAt: string
  }
  year: number
  usedKg: number
  remainingKg: number | null
  percentUsed: number | null
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
      ...(init?.headers || {}),
    },
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response.json()
}

export function fetchImpact(period: AnalyticsPeriod): Promise<ImpactSummary> {
  return request(`/api/analytics/impact?period=${period}`)
}

export function fetchGoal(year: number): Promise<GoalSummary> {
  return request(`/api/analytics/goal?year=${year}`)
}

export async function saveGoal(year: number, annualBudgetKg: number): Promise<void> {
  await request('/api/analytics/goal', {
    method: 'PUT',
    body: JSON.stringify({ year, annualBudgetKg }),
  })
}

