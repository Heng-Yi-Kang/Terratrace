'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Plane,
  Leaf,
  Bookmark,
  User,
  LogOut,
  Award,
  BarChart3
} from 'lucide-react'
import { getCurrentUser, signOut } from '@/utils/supabase/auth'

type DashboardTab = 'overview' | 'trips' | 'carbon' | 'saved' | 'profile' | 'analytics'

const navItems = [
  { id: 'overview' as DashboardTab, label: 'Overview', icon: LayoutDashboard },
  { id: 'trips' as DashboardTab, label: 'My Trips', icon: Plane },
  { id: 'carbon' as DashboardTab, label: 'Carbon Footprint', icon: Leaf },
  { id: 'analytics' as DashboardTab, label: 'Analytics', icon: BarChart3 },
  { id: 'saved' as DashboardTab, label: 'Saved Places', icon: Bookmark },
  { id: 'profile' as DashboardTab, label: 'Profile', icon: User },
]

export default function UserSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [username, setUsername] = useState('')

  useEffect(() => {
    async function fetchUser() {
      const { data } = await getCurrentUser()
      if (data?.user) {
        setUserEmail(data.user.email || '')
        setUsername(data.user.user_metadata?.username || '')
      }
    }
    fetchUser()
  }, [])

  const getActiveTab = (): DashboardTab => {
    const match = pathname.match(/\/dashboard\/(\w+)/)
    if (match && match[1]) {
      const tab = match[1] as DashboardTab
      if (['overview', 'trips', 'carbon', 'saved', 'profile', 'analytics'].includes(tab)) {
        return tab
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
    router.push('/login')
    router.refresh()
  }

  const getInitial = () => {
    if (username) return username.charAt(0).toUpperCase()
    if (userEmail) return userEmail.charAt(0).toUpperCase()
    return 'U'
  }

  return (
    <aside className="w-72 min-h-screen flex flex-col bg-[#0891B2] text-white">
      {/* Logo */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#22C55E]/20 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-[#22C55E]" />
          </div>
          <div>
            <h1 className="font-sans font-bold text-xl tracking-tight">Terratrace</h1>
            <p className="text-white/80 text-sm">Eco Travel Dashboard</p>
          </div>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="mx-4 mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#22C55E]/20 flex items-center justify-center">
            <span className="font-sans font-bold text-lg text-[#22C55E]">{getInitial()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-sans font-semibold text-sm truncate text-white">{username || 'Eco Traveler'}</p>
            <p className="text-white/80 text-xs truncate">{userEmail}</p>
          </div>
          <div className="flex items-center gap-1 bg-[#22C55E]/20 px-2 py-1 rounded-full">
            <Award className="w-3 h-3 text-white" />
            <span className="text-xs font-mono text-white">Eco</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mx-4 mt-3 flex gap-2">
        <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
          <p className="font-mono text-lg font-bold text-white">0</p>
          <p className="text-white/90 text-xs font-medium">Carbon Saved (kg)</p>
        </div>
        <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
          <p className="font-mono text-lg font-bold text-white">0</p>
          <p className="text-white/90 text-xs font-medium">Trips</p>
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:ring-offset-2 focus:ring-offset-[#0891B2] ${
                    isActive
                      ? 'bg-white/20 border-l-4 border-[#22C55E]'
                      : 'hover:bg-white/10 border-l-4 border-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white/80'}`} />
                  <span className={`font-sans font-medium text-sm ${isActive ? 'text-white' : 'text-white/90'}`}>
                    {item.label}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-white/20 mt-auto">
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:ring-offset-2 focus:ring-offset-[#0891B2]"
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