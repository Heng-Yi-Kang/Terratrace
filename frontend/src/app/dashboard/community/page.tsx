'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CommunityPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to community page at app level
    router.replace('/community')
  }, [router])

  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-pulse text-cyan-primary">Loading community...</div>
    </div>
  )
}