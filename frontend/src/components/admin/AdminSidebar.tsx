'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, signOut } from '@/utils/supabase/auth'

type AdminTab = 'dashboard' | 'users' | 'destinations' | 'analytics'

type AdminSidebarProps = {
  activeTab: AdminTab
  onTabChange: (tab: AdminTab) => void
}

const navItems = [
  {
    id: 'dashboard' as AdminTab,
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    id: 'users' as AdminTab,
    label: 'Users',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    id: 'destinations' as AdminTab,
    label: 'Destinations',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 'analytics' as AdminTab,
    label: 'Analytics',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
]

export default function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
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
    return 'A'
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

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-cyan-primary text-white flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-cyan-primary/30">
        <h1 className="font-sans font-bold text-xl tracking-tight">Terratrace</h1>
        <p className="text-cyan-secondary text-sm mt-1">Admin Dashboard</p>
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
            <p className="font-sans font-medium text-sm text-white truncate">{username || 'Admin'}</p>
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
