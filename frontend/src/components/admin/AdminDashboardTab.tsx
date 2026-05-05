'use client'

import StatCard from '@/components/dashboard/StatCard'

const stats = [
  {
    title: 'Total Users',
    value: 1247,
    subtitle: '+89 this month',
    color: 'primary' as const,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    title: 'Total Destinations',
    value: 342,
    subtitle: 'Eco-certified places',
    color: 'secondary' as const,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: 'Trips Planned',
    value: 89,
    subtitle: 'This month',
    color: 'cyan' as const,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Carbon Offset',
    value: '1.2k kg',
    subtitle: 'Platform total',
    color: 'cta' as const,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
]

const recentActivity = [
  { id: 1, text: 'New user registered: Jane Doe', time: '5 minutes ago' },
  { id: 2, text: 'Destination "Eco Resort Bali" approved', time: '1 hour ago' },
  { id: 3, text: '15 new destinations pending review', time: '3 hours ago' },
  { id: 4, text: 'Platform usage increased 23% this week', time: '1 day ago' },
]

export default function AdminDashboardTab() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-sans font-bold text-3xl text-text">Admin Dashboard</h1>
        <p className="font-sans text-text/60 mt-2">Manage your Terratrace platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-sans font-medium hover:bg-primary/90 transition-colors duration-200 cursor-pointer">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Approve Destinations
        </button>
        <button className="flex items-center gap-2 px-6 py-3 bg-white text-text border border-text/20 rounded-xl font-sans font-medium hover:bg-background transition-colors duration-200 cursor-pointer">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          View Reports
        </button>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white/80 backdrop-blur-md rounded-organic p-6 shadow-organic">
          <h2 className="font-sans font-semibold text-xl text-text mb-4">Platform Activity</h2>
          <ul className="space-y-4">
            {recentActivity.map((activity) => (
              <li key={activity.id} className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-cyan-primary" />
                <div>
                  <p className="font-sans text-text">{activity.text}</p>
                  <p className="font-sans text-sm text-text/50">{activity.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Pending Actions */}
        <div className="bg-white/80 backdrop-blur-md rounded-organic p-6 shadow-organic">
          <h2 className="font-sans font-semibold text-xl text-text mb-4">Pending Actions</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-cta mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="font-sans text-text/80">15 destinations awaiting approval</p>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-cta mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="font-sans text-text/80">3 user reports need review</p>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="font-sans text-text/80">System health: All clear</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}