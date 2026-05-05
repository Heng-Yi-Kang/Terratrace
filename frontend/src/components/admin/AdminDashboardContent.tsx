'use client'

import { useState } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminDashboardTab from '@/components/admin/AdminDashboardTab'
import UsersTab from '@/components/admin/UsersTab'
import DestinationsTab from '@/components/admin/DestinationsTab'
import AnalyticsTab from '@/components/admin/AnalyticsTab'

type AdminTab = 'dashboard' | 'users' | 'destinations' | 'analytics'

export default function AdminDashboardContent() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboardTab />
      case 'users':
        return <UsersTab />
      case 'destinations':
        return <DestinationsTab />
      case 'analytics':
        return <AnalyticsTab />
      default:
        return <AdminDashboardTab />
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
        <AdminSidebar activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); setSidebarOpen(false); }} />
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