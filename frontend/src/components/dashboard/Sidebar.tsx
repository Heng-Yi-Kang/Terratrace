'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, signOut } from '@/utils/supabase/auth'

type Tab = 'overview' | 'trips' | 'carbon' | 'saved'

type SidebarProps = {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

const navItems = [
  {
    id: 'overview' as Tab,
    label: 'Overview',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    id: 'trips' as Tab,
    label: 'My Trips',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'carbon' as Tab,
    label: 'Carbon Footprint',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'saved' as Tab,
    label: 'Saved Places',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
  },
]

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [userEmail, setUserEmail] = useState('')
  const [username, setUsername] = useState('')
  const [isSigningOut, setIsSigningOut] = useState(false)
  const router = useRouter()

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

  const getInitial = () => {
    if (username) return username.charAt(0).toUpperCase()
    if (userEmail) return userEmail.charAt(0).toUpperCase()
    return 'U'
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    await signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-cyan-primary text-white flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-cyan-primary/30">
        <h1 className="font-sans font-bold text-xl tracking-tight">Terratrace</h1>
        <p className="text-cyan-secondary text-sm mt-1">Eco Travel Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-white/20 border-l-4 border-cta'
                    : 'hover:bg-white/10 border-l-4 border-transparent'
                }`}
              >
                <span className={activeTab === item.id ? 'text-cta' : 'text-white/80'}>{item.icon}</span>
                <span className={`font-sans font-medium ${activeTab === item.id ? 'text-white' : 'text-white/70'}`}>
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile / Sign Out */}
      <div className="p-4 border-t border-cyan-primary/30">
        <div className="flex items-center gap-3 px-3 py-3">
          <div className="w-10 h-10 rounded-full bg-cta flex items-center justify-center">
            <span className="font-sans font-semibold text-cyan-primary">{getInitial()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-sans font-medium text-sm text-white truncate">{username || 'User'}</p>
            <p className="font-sans text-xs text-white/60 truncate">{userEmail}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="font-sans font-medium text-sm">{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
        </button>
      </div>
    </aside>
  )
}