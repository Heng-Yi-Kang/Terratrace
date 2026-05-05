'use client'

import StatCard from '@/components/dashboard/StatCard'

const metrics = [
  {
    title: 'Active Users',
    value: '847',
    subtitle: 'This month',
    color: 'primary' as const,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    title: 'Page Views',
    value: '24.5k',
    subtitle: '+12% vs last month',
    color: 'secondary' as const,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    title: 'Avg. Session',
    value: '4.2m',
    subtitle: 'Per user',
    color: 'cyan' as const,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Conversion Rate',
    value: '3.8%',
    subtitle: 'Trips booked',
    color: 'cta' as const,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
]

const topDestinations = [
  { name: 'Green Valley Hotel', bookings: 234, growth: '+15%' },
  { name: 'Eco Resort Bali', bookings: 189, growth: '+22%' },
  { name: 'Sustainable Stay Oslo', bookings: 156, growth: '+8%' },
  { name: 'Forest Retreat Canada', bookings: 98, growth: '+31%' },
]

export default function AnalyticsTab() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-sans font-bold text-3xl text-text">Analytics</h1>
        <p className="font-sans text-text/60 mt-2">View platform usage statistics</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <StatCard key={metric.title} {...metric} />
        ))}
      </div>

      {/* Charts placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Growth Chart placeholder */}
        <div className="bg-white/80 backdrop-blur-md rounded-organic p-6 shadow-organic">
          <h2 className="font-sans font-semibold text-xl text-text mb-4">User Growth</h2>
          <div className="h-48 flex items-center justify-center text-text/30">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="font-sans text-sm">Chart visualization coming soon</p>
            </div>
          </div>
        </div>

        {/* Top Destinations */}
        <div className="bg-white/80 backdrop-blur-md rounded-organic p-6 shadow-organic">
          <h2 className="font-sans font-semibold text-xl text-text mb-4">Top Destinations</h2>
          <ul className="space-y-4">
            {topDestinations.map((dest, index) => (
              <li key={dest.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-cyan-primary/10 flex items-center justify-center font-sans font-semibold text-cyan-primary text-sm">
                    {index + 1}
                  </span>
                  <span className="font-sans text-text">{dest.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-sans text-text/50 text-sm">{dest.bookings} bookings</span>
                  <span className="font-sans text-sm font-medium text-secondary">{dest.growth}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-sans font-medium hover:bg-primary/90 transition-colors duration-200 cursor-pointer">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Report
        </button>
      </div>
    </div>
  )
}