'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import {
  LayoutDashboard,
  Plane,
  Leaf,
  Bookmark,
  User,
  LogOut,
  Award,
  BarChart3,
  Users
} from 'lucide-react'
import { signOut } from '@/utils/supabase/auth'
import { useUser } from '@/hooks/useUser'
import { useImportLocalTrips, useTrips } from '@/hooks/useTrips'

type DashboardTab = 'overview' | 'trips' | 'carbon' | 'saved' | 'profile' | 'analytics' | 'community'

function calculateCarbonSaved(trips: { ecoScore: number }[]): number {
  const avgEcoScore = trips.length > 0
    ? trips.reduce((sum, t) => sum + t.ecoScore, 0) / trips.length
    : 75
  const baselineScore = 50
  const carbonPerTrip = 50
  return Math.round(trips.length * carbonPerTrip * ((avgEcoScore - baselineScore) / 50))
}

function useCountUp(end: number, enabled: boolean, duration: number = 1000, start: number = 0) {
  const [count, setCount] = useState(start)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!enabled || hasAnimated.current) return
    hasAnimated.current = true

    const startTime = performance.now()
    const diff = end - start

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setCount(start + diff * easeOut)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [end, enabled, duration, start])

  return Math.floor(count).toLocaleString()
}

const navItems = [
  { id: 'overview' as DashboardTab, label: 'Overview', icon: LayoutDashboard },
  { id: 'trips' as DashboardTab, label: 'My Trips', icon: Plane },
  { id: 'carbon' as DashboardTab, label: 'Carbon Footprint', icon: Leaf },
  { id: 'analytics' as DashboardTab, label: 'Analytics', icon: BarChart3 },
  { id: 'community' as DashboardTab, label: 'Community', icon: Users },
  { id: 'saved' as DashboardTab, label: 'Saved Places', icon: Bookmark },
  { id: 'profile' as DashboardTab, label: 'Profile', icon: User },
]

export default function UserSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const { data: user } = useUser()
  const { data: savedTrips = [] } = useTrips()
  useImportLocalTrips()

  const userEmail = user?.email || ''
  const username = user?.user_metadata?.username || ''
  const totalTrips = savedTrips.length
  const carbonSaved = calculateCarbonSaved(savedTrips)

  const getActiveTab = (): DashboardTab => {
    const match = pathname.match(/\/dashboard\/(\w+)/)
    if (match && match[1]) {
      const tab = match[1]

      if (tab === 'carbonHistory') 
        return 'carbon'

      if (['overview', 'trips', 'carbon', 'saved', 'profile', 'analytics', 'community'].includes(tab)) {
        return tab as DashboardTab
      }
    }
    return 'overview'
  }

  const activeTab = getActiveTab()

  const handleTabChange = (tab: DashboardTab) => {
    router.push(`/dashboard/${tab}`)
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    const { error } = await signOut()
    if (error) {
      console.error('Sign out error:', error)
    }
    queryClient.clear()
    router.push('/login')
    router.refresh()
  }

  const getInitial = () => {
    if (username) return username.charAt(0).toUpperCase()
    if (userEmail) return userEmail.charAt(0).toUpperCase()
    return 'U'
  }

  const animatedCarbon = useCountUp(carbonSaved, carbonSaved > 0)
  const animatedTrips = useCountUp(totalTrips, totalTrips > 0)

  return (
    <aside className="w-72 min-h-screen flex flex-col bg-cyan-900 text-white">
      {/* Logo */}
      <div className="p-6 border-b border-cyan-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="font-sans font-bold text-xl tracking-tight">Terratrace</h1>
            <p className="text-cyan-300 text-sm">Eco Travel Dashboard</p>
          </div>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="mx-4 mt-4 p-4 bg-cyan-800/50 backdrop-blur-sm rounded-2xl border border-cyan-700/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <span className="font-sans font-bold text-lg text-emerald-400">{getInitial()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-sans font-semibold text-sm truncate text-white">{username || 'Eco Traveler'}</p>
            <p className="text-cyan-300 text-xs truncate">{userEmail}</p>
          </div>
          <div className="flex items-center gap-1 bg-emerald-500/20 px-2 py-1 rounded-full border border-emerald-500/30">
            <Award className="w-3 h-3 text-emerald-400" />
            <span className="text-xs font-mono text-emerald-400">Eco</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mx-4 mt-3 flex gap-2">
        <div className="flex-1 bg-cyan-800/50 backdrop-blur-sm rounded-xl p-3 text-center border border-cyan-700/30">
          <p className="font-mono text-lg font-bold text-white">{animatedCarbon}</p>
          <p className="text-cyan-300 text-xs font-medium">Carbon Saved (kg)</p>
        </div>
        <div className="flex-1 bg-cyan-800/50 backdrop-blur-sm rounded-xl p-3 text-center border border-cyan-700/30">
          <p className="font-mono text-lg font-bold text-white">{animatedTrips}</p>
          <p className="text-cyan-300 text-xs font-medium">Trips</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3" role="navigation" aria-label="Main navigation">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleTabChange(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-cyan-900 ${
                    isActive
                      ? 'bg-cyan-800 border-l-4 border-emerald-500'
                      : 'hover:bg-cyan-800/50 border-l-4 border-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-cyan-300'}`} />
                  <span className={`font-sans font-medium text-sm ${isActive ? 'text-white' : 'text-cyan-200'}`}>
                    {item.label}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-cyan-700/50 mt-auto">
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-cyan-800/50 hover:bg-cyan-700 text-cyan-200 hover:text-white transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-cyan-900"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-sans font-medium">
            {isSigningOut ? 'Signing out...' : 'Sign Out'}
          </span>
        </button>
      </div>
    </aside>
  )
}
