'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { CarbonFootprint } from '@/app/carbonFootprint/CarbonFootprintView'
import { getCurrentUser } from '@/utils/supabase/auth'
import { fetchSummary, type CarbonSummary, type CarbonEntry } from '@/utils/carbon'


type StatsCardProps = {
  title: string
  value: number
  unit: string
  icon: React.ReactNode
  iconBgClass: string
}

export function StatsCard({ title, value, unit, icon, iconBgClass }: StatsCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })
  const [displayValue, setDisplayValue] = useState(0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!isInView || hasAnimated.current) return
    hasAnimated.current = true

    const duration = 1500
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.floor(value * easeOut))

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setDisplayValue(value)
      }
    }

    requestAnimationFrame(animate)
  }, [isInView, value])

  return (
    <div ref={ref} className="bg-white/80 backdrop-blur-md rounded-organic p-6 shadow-organic">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-sans text-sm font-medium text-text/60">{title}</p>
          <p className="font-sans font-bold text-4xl text-text mt-2">
            {displayValue.toLocaleString()} <span className="text-lg font-normal text-text/60">{unit}</span>
          </p>
        </div>
        <div className={`w-14 h-14 rounded-full ${iconBgClass} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
function groupByPeriod(entries: CarbonEntry[], period: 'week' | 'month' | 'year') {
  const now = new Date()
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const filtered = entries.filter((entry) => {
    const entryDate = new Date(entry.created_at)
    if (period === 'week')
      return (now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24) <= 7
    if (period === 'month')
      return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear()
    return entryDate.getFullYear() === now.getFullYear()

  })

  const grouped: Record<string, number> = {}
  filtered.forEach((entry) => {
    const entryDate = new Date(entry.created_at)
    const key = period === 'year' ? months[entryDate.getMonth()] : `${entryDate.getDate()} ${months[entryDate.getMonth()]}`
    grouped[key] = (grouped[key] || 0) + entry.total_emissions
  })

  return Object.entries(grouped).map(([label, footprint]) => ({ label, footprint }))

}

export default function CarbonTab() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month')
  const [summary, setSummary] = useState<CarbonSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await getCurrentUser()
        if (!user) return
        const data = await fetchSummary()
        setSummary(data)
      } catch (error) {
        console.error('Error fetching carbon summary:', error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [refreshKey])

  const chartData = summary ? groupByPeriod(summary.entries, selectedPeriod) : []
  const maxFootprint = Math.max(...chartData.map((d) => d.footprint), 1)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-sans font-bold text-3xl text-text">Carbon Footprint</h1>
        <p className="font-sans text-text/60 mt-2">Track and reduce your environmental impact</p>
      </div>

      <div className="flex gap-2">
        {(['week', 'month', 'year'] as const).map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-4 py-2 rounded-lg font-sans text-sm font-medium transition-all duration-200 cursor-pointer ${selectedPeriod === period
              ? 'bg-primary text-white'
              : 'bg-white/80 text-text/60 hover:text-text'
              }`}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="col-span-3 text-center py-8">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Total Footprint"
            value={summary?.totalEmissions ?? 0}
            unit="kg CO₂"
            iconBgClass="bg-red-100"
            icon={
              <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            }
          />

          <StatsCard
            title="Total Calculation"
            value={summary?.totalCalculations ?? 0}
            unit=""
            iconBgClass="bg-primary/10"
            icon={
              <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            }
          />

          <StatsCard
            title="Avg Per Calculation"
            value={summary?.avgPerTrip ?? 0}
            unit="kg CO₂"
            iconBgClass="bg-secondary/10"
            icon={
              <svg className="w-7 h-7 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            }
          />
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-md rounded-organic p-6 shadow-organic">
        <h2 className="font-sans font-semibold text-xl text-text mb-6">
          {selectedPeriod === 'week' && 'Weekly Comparison'}
          {selectedPeriod === 'month' && 'Monthly Comparison'}
          {selectedPeriod === 'year' && 'Yearly Comparison'}
        </h2>
        <div className="h-48 flex items-end justify-around gap-4">
          {chartData.length === 0 ? (
            <div className="col-span-3 text-center py-8">No data for this period. Calculate a trip to see your chart</div>
          ) : (
            chartData.map((data, index) => (
              <motion.div
                key={data.label}
                className="flex flex-col items-center gap-2 flex-1"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
              >
                <div className="w-full flex flex-col-reverse gap-1">
                  <motion.div
                    className="bg-red-400 rounded-t-md"
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
                    style={{ height: `${(data.footprint / maxFootprint) * 120}px`, originY: 1 }}
                  />
                </div>
                <span className="font-sans text-xs text-text/60">{data.label}</span>
              </motion.div>
            ))
          )}

        </div>

        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-400" />
            <span className="font-sans text-sm text-text/60">Footprint</span>
          </div>
        </div>

      </div>

      <div className="flex justify-end">
        <a href="/dashboard/carbonHistory" className="text-sm text-primary font-medium hover:underline flex gap-1 me-2">
          View Full History
        </a>
      </div>

      <div>
        <CarbonFootprint onCalculated={() => setRefreshKey(prev => prev + 1)}/>
      </div>


    </div>
  )
}
