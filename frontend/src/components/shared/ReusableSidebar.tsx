'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, signOut } from '@/utils/supabase/auth'

export type NavItem = {
  id: string
  label: string
  icon: ReactNode
}

type ReusableSidebarProps<T extends string = string> = {
  navItems: NavItem[]
  logoSubtitle: string
  activeTab: T
  onTabChange: (tab: T) => void
}

export default function ReusableSidebar<T extends string>({ navItems, logoSubtitle, activeTab, onTabChange }: ReusableSidebarProps<T>) {
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
    const { error } = await signOut()
    if (error) {
      console.error('Sign out error:', error)
    }
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 text-white flex flex-col z-50 bg-cyan-primary">
      {/* Logo */}
      <div className="p-6 border-b border-white/20">
        <h1 className="font-sans font-bold text-xl tracking-tight">Terratrace</h1>
        <p className="text-white/70 text-sm mt-1">{logoSubtitle}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onTabChange(item.id as T)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-white/20 border-l-4 border-white'
                    : 'hover:bg-white/10 border-l-4 border-transparent'
                }`}
              >
                <span className={activeTab === item.id ? 'text-white' : 'text-white/80'}>{item.icon}</span>
                <span className={`font-sans font-medium ${activeTab === item.id ? 'text-white' : 'text-white/70'}`}>
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile / Sign Out */}
      <div className="p-4 border-t border-white/20 mt-auto">
        <div className="flex items-center gap-3 px-3 py-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <span className="font-sans font-semibold text-white">{getInitial()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-sans font-medium text-sm text-white truncate">{username || 'User'}</p>
            <p className="font-sans text-xs text-white/60 truncate">{userEmail}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
