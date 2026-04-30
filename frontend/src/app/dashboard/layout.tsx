'use client'

import { useState } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import OverviewTab from '@/components/dashboard/OverviewTab'
import TripsTab from '@/components/dashboard/TripsTab'
import CarbonTab from '@/components/dashboard/CarbonTab'
import SavedTab from '@/components/dashboard/SavedTab'

type Tab = 'overview' | 'trips' | 'carbon' | 'saved'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')

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
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {renderTab()}
        </div>
      </main>
    </div>
  )
}