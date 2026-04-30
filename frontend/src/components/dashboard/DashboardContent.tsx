'use client'

import { useState } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import OverviewTab from '@/components/dashboard/OverviewTab'
import TripsTab from '@/components/dashboard/TripsTab'
import CarbonTab from '@/components/dashboard/CarbonTab'
import SavedTab from '@/components/dashboard/SavedTab'

type Tab = 'overview' | 'trips' | 'carbon' | 'saved'

export default function DashboardContent() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />
      case 'trips':
        return <TripsTab />
      case 'carbon':
        return <CarbonTab />
      case 'saved':
        return <SavedTab />
      default:
        return <OverviewTab />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-cyan-primary text-white rounded-xl cursor-pointer"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {sidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <div className={`fixed inset-0 z-40 lg:relative lg:inset-auto lg:z-auto transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300`}>
        <Sidebar activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); setSidebarOpen(false); }} />
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="lg:ml-64 p-4 sm:p-8 pt-16 lg:pt-8">
        <div className="max-w-6xl mx-auto">
          {renderTab()}
        </div>
      </main>
    </div>
  )
}