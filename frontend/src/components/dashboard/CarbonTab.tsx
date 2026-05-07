'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'

const carbonData = {
  totalCarbon: 892,
  carbonSaved: 248,
  offset: 512,
  monthlyData: [
    { month: 'Jan', footprint: 120, saved: 45 },
    { month: 'Feb', footprint: 95, saved: 38 },
    { month: 'Mar', footprint: 110, saved: 52 },
    { month: 'Apr', footprint: 88, saved: 41 },
  ],
}

type StatsCardProps = {
  title: string
  value: number
  unit: string
  icon: React.ReactNode
  iconBgClass: string
}

function StatsCard({ title, value, unit, icon, iconBgClass }: StatsCardProps) {
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

const tips = [
  {
    title: 'Choose Rail Over Air',
    impact: 'Save up to 90% CO₂',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
      </svg>
    ),
  },
  {
    title: 'Stay at Eco-Certified Hotels',
    impact: 'Reduce 40% energy use',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    title: 'Eat Local & Plant-Based',
    impact: 'Cut food emissions by 50%',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
]

export default function CarbonTab() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month')

  const maxFootprint = Math.max(...carbonData.monthlyData.map((d) => d.footprint))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-sans font-bold text-3xl text-text">Carbon Footprint</h1>
        <p className="font-sans text-text/60 mt-2">Track and reduce your environmental impact</p>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        {(['week', 'month', 'year'] as const).map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-4 py-2 rounded-lg font-sans text-sm font-medium transition-all duration-200 cursor-pointer ${
              selectedPeriod === period
                ? 'bg-cyan-primary text-white'
                : 'bg-white/80 text-text/60 hover:text-text'
            }`}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </button>
        ))}
      </div>

      {/* Carbon Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Footprint"
          value={carbonData.totalCarbon}
          unit="kg CO₂"
          iconBgClass="bg-red-100"
          icon={
            <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          }
        />

        <StatsCard
          title="Carbon Saved"
          value={carbonData.carbonSaved}
          unit="kg CO₂"
          iconBgClass="bg-primary/10"
          icon={
            <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          }
        />

        <StatsCard
          title="CO₂ Offset"
          value={carbonData.offset}
          unit="kg CO₂"
          iconBgClass="bg-secondary/10"
          icon={
            <svg className="w-7 h-7 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          }
        />
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white/80 backdrop-blur-md rounded-organic p-6 shadow-organic">
        <h2 className="font-sans font-semibold text-xl text-text mb-6">Monthly Comparison</h2>
        <div className="h-48 flex items-end justify-around gap-4">
          {carbonData.monthlyData.map((data, index) => (
            <motion.div
              key={data.month}
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
                <motion.div
                  className="bg-primary rounded-t-md"
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.05, ease: 'easeOut' }}
                  style={{ height: `${(data.saved / maxFootprint) * 120}px`, originY: 1 }}
                />
              </div>
              <span className="font-sans text-xs text-text/60">{data.month}</span>
            </motion.div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-400" />
            <span className="font-sans text-sm text-text/60">Footprint</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary" />
            <span className="font-sans text-sm text-text/60">Saved</span>
          </div>
        </div>
      </div>

      {/* Tips for Reducing */}
      <div>
        <h2 className="font-sans font-semibold text-xl text-text mb-4">Tips for Reducing Your Footprint</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tips.map((tip) => (
            <div
              key={tip.title}
              className="bg-white/80 backdrop-blur-md rounded-organic p-5 shadow-organic hover:shadow-organic-lg transition-all duration-200 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                {tip.icon}
              </div>
              <h3 className="font-sans font-semibold text-text">{tip.title}</h3>
              <p className="font-sans text-sm text-primary mt-1">{tip.impact}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}