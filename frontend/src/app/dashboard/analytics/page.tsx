'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import ImpactCard from '@/app/component/analytics/ImpactCard'
import {
  fetchGoal,
  fetchImpact,
  saveGoal,
  type AnalyticsBreakdown,
  type ImpactSummary,
  type GoalSummary,
} from '@/utils/analytics'

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
  </svg>
)

const DocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
)

const CarbonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75L4.5 7.5v6.75c0 4.35 3.2 6.88 7.5 8.25 4.3-1.37 7.5-3.9 7.5-8.25V7.5L12 3.75z" />
  </svg>
)

const TripIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
)

const TreeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v14m-6-3h12M7 19h10" />
  </svg>
)

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25" />
  </svg>
)

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75H3v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25h-4.5V8.625zM16.5 4.125C16.5 3.504 17.004 3 17.625 3h2.25C20.496 3 21 3.504 21 4.125v15.75h-4.5V4.125z" />
  </svg>
)

const TargetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zm0-4.5a4.5 4.5 0 100-9 4.5 4.5 0 000 9zm0-3a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const WarningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3h.007M2.697 16.126l7.354-12.748c.866-1.5 3.032-1.5 3.898 0l7.354 12.748c.866 1.5-.217 3.374-1.948 3.374H4.645c-1.731 0-2.814-1.874-1.948-3.374z" />
  </svg>
)

const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3h.008M12 21a9 9 0 100-18 9 9 0 000 18z" />
  </svg>
)

const emptyImpact: ImpactSummary = {
  actualEmissionsKg: 0,
  baselineEmissionsKg: 0,
  carbonSavedKg: 0,
  treeEquivalent: 0,
  loggedCalculations: 0,
  breakdown: [],
  overTime: [],
  entries: [],
}

function formatKg(value: number): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: 1 })
}

function methodLabel(method: string): string {
  return method === 'unknown' ? 'Unknown' : method.charAt(0).toUpperCase() + method.slice(1)
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(value))
}

function usageStatus(percent: number | null) {
  if (percent === null || percent < 50) {
    return {
      title: 'On Track',
      message: 'Your year-to-date emissions are under 50% of your annual budget.',
      className: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      iconClass: 'text-emerald-600',
      icon: <CheckCircleIcon />,
    }
  }
  if (percent < 80) {
    return {
      title: 'Monitor Usage',
      message: `You have used ${percent.toFixed(0)}% of your annual budget.`,
      className: 'bg-amber-50 border-amber-200 text-amber-900',
      iconClass: 'text-amber-600',
      icon: <WarningIcon />,
    }
  }
  return {
    title: 'Budget Alert',
    message: 'You are at or above 80% of your annual carbon budget.',
    className: 'bg-red-50 border-red-200 text-red-900',
    iconClass: 'text-red-600',
    icon: <AlertIcon />,
  }
}

function TransportBar({ item, maxSaved, index }: { item: AnalyticsBreakdown; maxSaved: number; index: number }) {
  const colors = ['from-primary', 'from-secondary', 'from-cyan-primary', 'from-amber-500', 'from-rose-500']
  const percentage = maxSaved > 0 ? Math.max(4, (item.savedKg / maxSaved) * 100) : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-3 gap-4">
        <span className="font-medium text-text">{methodLabel(item.method)}</span>
        <span className="text-sm font-semibold text-primary">{formatKg(item.savedKg)} kg CO2 saved</span>
      </div>
      <div className="h-3 bg-text/10 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${colors[index % colors.length]} to-secondary rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-text/60">
        {item.count} records · {formatKg(item.actualKg)} kg actual vs {formatKg(item.baselineKg)} kg baseline
      </p>
    </div>
  )
}

function generatePDF(type: 'monthly' | 'annual', impact: ImpactSummary, goal: GoalSummary | null) {
  const doc = new jsPDF()
  const today = new Date().toLocaleDateString()
  const title = type === 'monthly' ? 'Monthly Sustainability Report' : 'Annual Sustainability Summary'

  doc.setFillColor(5, 150, 105)
  doc.rect(0, 0, 210, 35, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.text('TerraTrace', 14, 18)
  doc.setFontSize(12)
  doc.text('Eco-Friendly Travel Planner', 14, 26)
  doc.setFontSize(14)
  doc.text(title, 122, 20)

  doc.setTextColor(100, 100, 100)
  doc.setFontSize(10)
  doc.text(`Generated Date: ${today}`, 14, 50)

  doc.setTextColor(0, 77, 64)
  doc.setFontSize(16)
  doc.text('Impact Summary', 14, 68)

  autoTable(doc, {
    startY: 78,
    head: [['Metric', 'Value']],
    body: [
      ['Logged Records', impact.loggedCalculations.toString()],
      ['Actual Emissions', `${formatKg(impact.actualEmissionsKg)} kg CO2`],
      ['Traditional Baseline', `${formatKg(impact.baselineEmissionsKg)} kg CO2`],
      ['Carbon Saved', `${formatKg(impact.carbonSavedKg)} kg CO2`],
      ['Tree Equivalent', `${impact.treeEquivalent} trees/year`],
      ['Annual Budget', goal?.goal ? `${formatKg(goal.goal.annualBudgetKg)} kg CO2` : 'No goal set'],
      ['Year-to-Date Used', goal ? `${formatKg(goal.usedKg)} kg CO2` : 'Not available'],
    ],
    headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [245, 252, 249] },
  })

  const finalY = (doc as any).lastAutoTable?.finalY || 116
  doc.setTextColor(0, 77, 64)
  doc.setFontSize(15)
  doc.text('Detailed Calculation Log', 14, finalY + 18)

  autoTable(doc, {
    startY: finalY + 26,
    head: [['Date', 'Method', 'Actual', 'Baseline', 'Saved']],
    body: impact.entries.map((entry) => [
      formatDate(entry.date),
      methodLabel(entry.method),
      `${formatKg(entry.actualKg)} kg`,
      `${formatKg(entry.baselineKg)} kg`,
      `${formatKg(entry.savedKg)} kg`,
    ]),
    headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [245, 252, 249] },
    styles: { fontSize: 9, cellPadding: 3 },
  })

  doc.save(type === 'monthly' ? 'TerraTrace_Monthly_Report.pdf' : 'TerraTrace_Annual_Summary.pdf')
}

export default function DashboardPage() {
  const currentYear = new Date().getFullYear()
  const [impact, setImpact] = useState<ImpactSummary>(emptyImpact)
  const [monthlyImpact, setMonthlyImpact] = useState<ImpactSummary>(emptyImpact)
  const [annualImpact, setAnnualImpact] = useState<ImpactSummary>(emptyImpact)
  const [goal, setGoal] = useState<GoalSummary | null>(null)
  const [goalInput, setGoalInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingGoal, setSavingGoal] = useState(false)
  const [error, setError] = useState('')

  const loadAnalytics = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [allData, monthData, yearData, goalData] = await Promise.all([
        fetchImpact('all'),
        fetchImpact('month'),
        fetchImpact('year'),
        fetchGoal(currentYear),
      ])
      setImpact(allData)
      setMonthlyImpact(monthData)
      setAnnualImpact(yearData)
      setGoal(goalData)
      setGoalInput(goalData.goal ? String(goalData.goal.annualBudgetKg) : '')
    } catch {
      setError('Unable to load analytics. Please try again later.')
    } finally {
      setLoading(false)
    }
  }, [currentYear])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  const maxSaved = useMemo(
    () => impact.breakdown.reduce((max, item) => Math.max(max, item.savedKg), 0),
    [impact.breakdown],
  )
  const goalStatus = usageStatus(goal?.percentUsed ?? null)
  const progressPercent = Math.min(goal?.percentUsed ?? 0, 100)

  async function handleGoalSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const annualBudgetKg = Number(goalInput)
    if (!Number.isFinite(annualBudgetKg) || annualBudgetKg <= 0) {
      setError('Enter a positive annual budget.')
      return
    }

    setSavingGoal(true)
    setError('')
    try {
      await saveGoal(currentYear, annualBudgetKg)
      const goalData = await fetchGoal(currentYear)
      setGoal(goalData)
      setGoalInput(String(goalData.goal?.annualBudgetKg || annualBudgetKg))
    } catch {
      setError('Unable to save your budget goal.')
    } finally {
      setSavingGoal(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-white to-cyan-secondary/10">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="mb-12">
          <h1 className="font-sans font-bold text-3xl text-text">Analytics</h1>
          <p className="font-sans text-text/60 mt-2">Track Your Impact</p>
        </div>

        {loading && (
          <div className="bg-white/80 rounded-organic border border-white/20 shadow-organic p-8 text-text/70">
            Loading analytics...
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-organic p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        {!loading && (
          <>
            <section className="mb-16">
              <div className="mb-8">
                <h2 className="text-2xl font-heading font-bold text-text mb-2">Personal Impact Dashboard</h2>
                <p className="text-text/60">A visual summary of your carbon savings compared to traditional travel</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <ImpactCard title="Carbon Saved" value={formatKg(impact.carbonSavedKg)} unit="kg CO2" icon={<CarbonIcon />} />
                <ImpactCard title="Records Logged" value={impact.loggedCalculations.toString()} unit="records" icon={<TripIcon />} />
                <ImpactCard title="Tree Equivalent" value={impact.treeEquivalent.toString()} unit="trees/year" icon={<TreeIcon />} />
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-organic border border-white/20 shadow-organic p-8">
                <h3 className="text-lg font-heading font-semibold text-text mb-6">Category Comparison</h3>
                {impact.breakdown.length === 0 ? (
                  <p className="text-text/60">No saved carbon calculator records yet. Saved calculations will appear here.</p>
                ) : (
                  <div className="space-y-6">
                    {impact.breakdown.map((item, index) => (
                      <TransportBar key={item.method} item={item} maxSaved={maxSaved} index={index} />
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="mb-16">
              <div className="mb-8">
                <h2 className="text-2xl font-heading font-bold text-text mb-2">Sustainability Reports</h2>
                <p className="text-text/60">Generate downloadable PDF summaries from your saved carbon calculations</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {([
                  {
                    title: 'Monthly Report',
                    description: 'Detailed breakdown of your saved calculations this month',
                    icon: <CalendarIcon />,
                    action: 'Generate Report',
                    type: 'monthly' as const,
                    data: monthlyImpact,
                  },
                  {
                    title: 'Annual Summary',
                    description: 'Year-to-date sustainability overview',
                    icon: <ChartIcon />,
                    action: 'Download PDF',
                    type: 'annual' as const,
                    data: annualImpact,
                  },
                ]).map((report) => {
                  const disabled = report.data.loggedCalculations === 0
                  return (
                    <div key={report.title} className="bg-white/80 backdrop-blur-sm rounded-organic border border-white/20 shadow-organic p-8">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white">{report.icon}</div>
                        <DocumentIcon />
                      </div>
                      <h3 className="text-xl font-heading font-semibold text-text mb-2">{report.title}</h3>
                      <p className="text-text/60 mb-4">{report.description}</p>
                      {disabled && <p className="text-sm text-text/50 mb-4">No records available for this period.</p>}
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => generatePDF(report.type, report.data, goal)}
                        className="w-full bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-organic font-heading font-semibold hover:shadow-organic-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <DownloadIcon />
                        {report.action}
                      </button>
                    </div>
                  )
                })}
              </div>

              <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-organic border border-white/20 shadow-organic overflow-hidden">
                <div className="p-6 border-b border-white/20">
                  <h3 className="font-heading font-semibold text-lg text-text">Detailed Calculation Log</h3>
                </div>
                {impact.entries.length === 0 ? (
                  <div className="p-6 text-text/60">No saved carbon calculator records yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gradient-to-r from-primary/10 to-secondary/10 text-text/70">
                        <tr>
                          <th className="px-6 py-4 text-left font-semibold">Date</th>
                          <th className="px-6 py-4 text-left font-semibold">Method</th>
                          <th className="px-6 py-4 text-right font-semibold">Actual CO2</th>
                          <th className="px-6 py-4 text-right font-semibold">Baseline CO2</th>
                          <th className="px-6 py-4 text-right font-semibold">CO2 Saved</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/20">
                        {impact.entries.map((entry) => (
                          <tr key={entry.id} className="hover:bg-primary/5 transition-colors duration-200">
                            <td className="px-6 py-4 text-text/80">{formatDate(entry.date)}</td>
                            <td className="px-6 py-4 capitalize text-text/70">{methodLabel(entry.method)}</td>
                            <td className="px-6 py-4 text-right text-text/80">{formatKg(entry.actualKg)} kg</td>
                            <td className="px-6 py-4 text-right text-text/80">{formatKg(entry.baselineKg)} kg</td>
                            <td className="px-6 py-4 text-right font-heading font-semibold text-secondary">
                              +{formatKg(entry.savedKg)} kg
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>

            <section>
              <div className="mb-8">
                <h2 className="text-2xl font-heading font-bold text-text mb-2">Carbon Budget Goals</h2>
                <p className="text-text/60">Set annual carbon budgets and compare them against year-to-date emissions</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-organic border border-primary/20 shadow-organic p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-primary rounded-organic flex items-center justify-center">
                      <TargetIcon />
                    </div>
                    <h3 className="font-heading font-semibold text-text">Annual Carbon Budget</h3>
                  </div>

                  {goal?.goal ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-text/70 mb-1">Total Budget</p>
                        <p className="text-3xl font-heading font-bold text-primary">{formatKg(goal.goal.annualBudgetKg)} kg</p>
                      </div>
                      <div className="pt-4 border-t border-primary/20">
                        <p className="text-sm text-text/70 mb-1">Used Year to Date</p>
                        <p className="text-2xl font-heading font-bold text-secondary">{formatKg(goal.usedKg)} kg</p>
                      </div>
                      <div className="pt-4 border-t border-primary/20">
                        <p className="text-sm text-text/70 mb-1">Remaining</p>
                        <p className="text-2xl font-heading font-bold text-text">{formatKg(goal.remainingKg || 0)} kg</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-text/70 mb-1">Used Year to Date</p>
                      <p className="text-3xl font-heading font-bold text-secondary mb-4">{formatKg(goal?.usedKg || 0)} kg</p>
                      <p className="text-sm text-text/60">Set an annual budget to track remaining emissions for {currentYear}.</p>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-organic border border-white/20 shadow-organic p-8">
                  <h3 className="font-heading font-semibold text-lg text-text mb-6">Budget Usage</h3>

                  {goal?.goal ? (
                    <>
                      <div className="mb-8">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-text/70 font-medium">Annual Usage</span>
                          <span className="text-lg font-heading font-bold text-primary">{(goal.percentUsed || 0).toFixed(1)}%</span>
                        </div>
                        <div className="h-4 bg-text/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${(goal.percentUsed || 0) >= 80 ? 'from-red-500 to-red-600' : 'from-primary to-secondary'} rounded-full`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>

                      <div className={`${goalStatus.className} border rounded-organic p-4 flex items-start gap-3`}>
                        <div className={`${goalStatus.iconClass} mt-0.5`}>{goalStatus.icon}</div>
                        <div>
                          <p className="font-heading font-semibold">{goalStatus.title}</p>
                          <p className="text-sm opacity-90">{goalStatus.message}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="mb-8 bg-primary/5 border border-primary/10 rounded-organic p-4 text-text/70">
                      No annual goal set for {currentYear}. Create one to enable budget progress and alerts.
                    </div>
                  )}

                  <form onSubmit={handleGoalSubmit} className="mt-8 pt-8 border-t border-white/20">
                    <label htmlFor="annual-budget" className="block font-heading font-semibold text-text mb-3">
                      {goal?.goal ? 'Update Annual Budget' : 'Set Annual Budget'}
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        id="annual-budget"
                        type="number"
                        min="1"
                        step="0.1"
                        value={goalInput}
                        onChange={(event) => setGoalInput(event.target.value)}
                        placeholder="kg CO2 per year"
                        className="flex-1 rounded-organic border border-text/15 px-4 py-3 bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                      <button
                        type="submit"
                        disabled={savingGoal}
                        className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-organic font-heading font-semibold disabled:opacity-50"
                      >
                        {savingGoal ? 'Saving...' : 'Save Goal'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  )
}
