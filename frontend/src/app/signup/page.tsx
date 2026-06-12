'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'
import AuthForm from '@/components/auth/AuthForm'
import { signUp, getRedirectPath } from '@/utils/supabase/auth'

export default function SignupPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const handleSignup = async (email: string, password: string, username?: string) => {
    const { data, error } = await signUp(email, password, username)
    if (error) {
      throw new Error(error.message)
    }
    queryClient.clear()
    if (data?.user) {
      queryClient.setQueryData(['user'], data.user)
    }
    const redirectPath = await getRedirectPath()
    router.push(redirectPath)
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6 shadow-organic">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9A9 9 0 0012 3a9 9 0 00-4.5 9c0 4.97 2.015 9 4.5 9z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-text">Terratrace</span>
          </div>
          <h1 className="font-heading font-bold text-3xl text-text mb-2">Create Account</h1>
          <p className="text-text/70">Join the eco-friendly travel movement</p>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-organic-lg p-8 shadow-organic">
          <AuthForm mode="signup" onSubmit={handleSignup} />

          <div className="mt-6 text-center">
            <p className="text-text/70 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-primary font-medium hover:text-secondary transition-colors">
                Log in
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-text/60 text-sm hover:text-primary transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  )
}
