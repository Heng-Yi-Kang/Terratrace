'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import PasswordField from '@/components/shared/PasswordField'

interface AuthFormProps {
  mode: 'login' | 'signup'
  onSubmit: (email: string, password: string, username?: string) => Promise<void>
}

const fadeInUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

export default function AuthForm({ mode, onSubmit }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      await onSubmit(email, password, username)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="w-full max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {mode === 'signup' && (
          <motion.div variants={fadeInUp}>
            <label htmlFor="username" className="block text-sm font-medium text-text mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-text/20 bg-white/80 text-text placeholder-text/40 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
              placeholder="johndoe"
              required
            />
          </motion.div>
        )}

        <motion.div variants={fadeInUp}>
          <label htmlFor="email" className="block text-sm font-medium text-text mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-text/20 bg-white/80 text-text placeholder-text/40 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
            placeholder="you@example.com"
            required
          />
        </motion.div>

        <motion.div variants={fadeInUp}>
          <PasswordField
            id="password"
            label="Password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            required
          />
        </motion.div>

        {mode === 'signup' && (
          <>
            <motion.div variants={fadeInUp}>
              <PasswordField
                id="confirmPassword"
                label="Confirm Password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="••••••••"
                required
              />
            </motion.div>

          </>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-4 bg-red-50 border border-red-200 rounded-xl"
          >
            <p className="text-sm text-red-600">{error}</p>
          </motion.div>
        )}

        <motion.div variants={fadeInUp}>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 px-6 rounded-xl font-semibold hover:bg-secondary transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </>
            ) : mode === 'login' ? (
              'Log In'
            ) : (
              'Sign Up'
            )}
          </button>
        </motion.div>
      </form>
    </motion.div>
  )
}
