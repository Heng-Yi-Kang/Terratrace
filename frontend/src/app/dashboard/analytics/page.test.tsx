import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DashboardPage from './page'

const pdfMocks = vi.hoisted(() => ({
  save: vi.fn(),
}))

vi.mock('jspdf', () => ({
  default: vi.fn().mockImplementation(function MockJsPDF(this: any) {
    this.setFillColor = vi.fn()
    this.rect = vi.fn()
    this.setTextColor = vi.fn()
    this.setFontSize = vi.fn()
    this.text = vi.fn()
    this.save = pdfMocks.save
  }),
}))

vi.mock('jspdf-autotable', () => ({
  default: vi.fn(),
}))

vi.mock('@/app/component/analytics/ImpactCard', () => ({
  default: ({ title, value, unit }: { title: string; value: string; unit: string }) => (
    <div>
      <p>{title}</p>
      <p>
        {value} {unit}
      </p>
    </div>
  ),
}))

const emptyImpact = {
  actualEmissionsKg: 0,
  baselineEmissionsKg: 0,
  carbonSavedKg: 0,
  treeEquivalent: 0,
  loggedCalculations: 0,
  breakdown: [],
  overTime: [],
  entries: [],
}

const impact = {
  actualEmissionsKg: 24.3,
  baselineEmissionsKg: 66.3,
  carbonSavedKg: 42,
  treeEquivalent: 2,
  loggedCalculations: 1,
  breakdown: [
    { method: 'rail', actualKg: 3.5, baselineKg: 16.3, savedKg: 12.7, count: 1 },
  ],
  overTime: [{ period: '2026-06', actualKg: 24.3, baselineKg: 66.3, savedKg: 42, count: 1 }],
  entries: [
    {
      id: 'entry-1',
      date: '2026-06-05T00:00:00.000Z',
      method: 'rail',
      actualKg: 24.3,
      baselineKg: 66.3,
      savedKg: 42,
    },
  ],
}

const noGoal = {
  goal: null,
  year: new Date().getFullYear(),
  usedKg: 24.3,
  remainingKg: null,
  percentUsed: null,
}

const savedGoal = {
  goal: {
    id: 'goal-1',
    year: new Date().getFullYear(),
    annualBudgetKg: 100,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  year: new Date().getFullYear(),
  usedKg: 82,
  remainingKg: 18,
  percentUsed: 82,
}

function mockAnalyticsFetch({
  all = emptyImpact,
  month = emptyImpact,
  year = emptyImpact,
  goal = noGoal,
}: {
  all?: any
  month?: any
  year?: any
  goal?: any
} = {}) {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = input.toString()

    if (url.includes('/api/analytics/impact?period=month')) {
      return Response.json(month)
    }
    if (url.includes('/api/analytics/impact?period=year')) {
      return Response.json(year)
    }
    if (url.includes('/api/analytics/impact?period=all')) {
      return Response.json(all)
    }
    if (url.includes('/api/analytics/goal') && init?.method === 'PUT') {
      return Response.json({ goal: savedGoal.goal })
    }
    if (url.includes('/api/analytics/goal')) {
      return Response.json(goal)
    }

    return new Response(null, { status: 404 })
  })
}

describe('analytics dashboard page', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    pdfMocks.save.mockClear()
  })

  it('renders empty states and disables report buttons when there are no records', async () => {
    mockAnalyticsFetch()

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getAllByText(/no saved carbon calculator records yet/i).length).toBeGreaterThan(0)
    })
    expect(screen.getByText(/no annual goal set/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /generate report/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /download pdf/i })).toBeDisabled()
  })

  it('renders real impact metrics, breakdown rows, and detailed entries', async () => {
    mockAnalyticsFetch({ all: impact, month: impact, year: impact, goal: savedGoal })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('42 kg CO2')).toBeInTheDocument()
    })
    expect(screen.getByText('1 records')).toBeInTheDocument()
    expect(screen.getByText('2 trees/year')).toBeInTheDocument()
    expect(screen.getByText(/12.7 kg CO2 saved/i)).toBeInTheDocument()
    expect(screen.getByText('+42 kg')).toBeInTheDocument()
  })

  it('generates a monthly PDF from current-month data when records exist', async () => {
    mockAnalyticsFetch({ all: impact, month: impact, year: emptyImpact, goal: noGoal })

    render(<DashboardPage />)

    const button = await screen.findByRole('button', { name: /generate report/i })
    expect(button).toBeEnabled()

    await userEvent.click(button)

    expect(pdfMocks.save).toHaveBeenCalledWith('TerraTrace_Monthly_Report.pdf')
  })

  it('shows the no-goal setup form and saves a new annual goal', async () => {
    mockAnalyticsFetch({ all: impact, month: impact, year: impact, goal: noGoal })

    render(<DashboardPage />)

    await screen.findByText(/set an annual budget to track remaining emissions/i)
    await userEvent.type(screen.getByLabelText(/set annual budget/i), '250')
    await userEvent.click(screen.getByRole('button', { name: /save goal/i }))

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/analytics/goal'),
        expect.objectContaining({ method: 'PUT' }),
      )
    })
  })

  it('renders saved-goal progress and alert state', async () => {
    mockAnalyticsFetch({ all: impact, month: impact, year: impact, goal: savedGoal })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('100 kg')).toBeInTheDocument()
    })
    expect(screen.getByText('82 kg')).toBeInTheDocument()
    expect(screen.getByText('18 kg')).toBeInTheDocument()
    expect(screen.getByText('82.0%')).toBeInTheDocument()
    expect(screen.getByText(/budget alert/i)).toBeInTheDocument()
  })
})
