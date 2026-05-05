'use client'

import { useState, useEffect } from 'react'
import { getCurrentUser } from '@/utils/supabase/auth'
import { supabase } from '@/utils/supabase/client'

export default function ProfilePage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    async function fetchUser() {
      const { data } = await getCurrentUser()
      if (data?.user) {
        setUsername(data.user.user_metadata?.username || '')
        setNewUsername(data.user.user_metadata?.username || '')
        setEmail(data.user.email || '')
        setRole(data.user.user_metadata?.role || 'user')
      }
    }
    fetchUser()
  }, [])

  const handleUpdate = async () => {
    if (!newUsername.trim()) {
      setMessage({ type: 'error', text: 'Username cannot be empty' })
      return
    }

    if (newUsername === username) {
      setIsEditing(false)
      return
    }

    setIsUpdating(true)
    setMessage(null)

    const { data, error } = await supabase.auth.updateUser({
      data: { username: newUsername.trim() }
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
      setIsUpdating(false)
    } else {
      setUsername(newUsername.trim())
      setIsEditing(false)
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setIsUpdating(false)
    }
  }

  const handleCancel = () => {
    setNewUsername(username)
    setIsEditing(false)
    setMessage(null)
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'All password fields are required' })
      return
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters' })
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    setIsChangingPassword(true)
    setPasswordMessage(null)

    // Re-authenticate user to verify current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    })

    if (signInError) {
      setPasswordMessage({ type: 'error', text: 'Current password is incorrect' })
      setIsChangingPassword(false)
      return
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      setPasswordMessage({ type: 'error', text: updateError.message })
      setIsChangingPassword(false)
    } else {
      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowPasswordForm(false)
      setIsChangingPassword(false)
    }
  }

  const handleCancelPassword = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setShowPasswordForm(false)
    setPasswordMessage(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-4 left-4 right-4 z-50">
        <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-md rounded-organic shadow-organic">
          <div className="flex items-center justify-between px-6 py-4">
            <a href="/dashboard" className="flex items-center gap-2 cursor-pointer group">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9A9 9 0 0012 3a9 9 0 00-4.5 9c0 4.97 2.015 9 4.5 9z" />
                </svg>
              </div>
              <span className="font-heading font-semibold text-xl text-text">Terratrace</span>
            </a>
            <div className="flex items-center gap-4">
              <a href="/dashboard" className="text-text/70 hover:text-primary transition-colors duration-200 cursor-pointer font-medium">
                Dashboard
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-28 px-4 pb-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-sans font-bold text-3xl text-text">Profile</h1>
            <p className="font-sans text-text/60 mt-2">Manage your account information</p>
          </div>

          {/* Profile Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-organic p-6 shadow-organic">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 rounded-full bg-cyan-primary flex items-center justify-center">
                <span className="font-sans font-bold text-3xl text-white">
                  {username ? username.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              <div>
                <h2 className="font-sans font-semibold text-xl text-text">{username || 'User'}</h2>
                <p className="font-sans text-text/60">{role === 'admin' ? 'Administrator' : 'Eco Traveler'}</p>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div
                className={`mb-6 p-4 rounded-xl ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                <p className="font-sans text-sm">{message.text}</p>
              </div>
            )}

            {/* Profile Fields */}
            <div className="space-y-6">
              {/* Username */}
              <div>
                <label className="block font-sans font-medium text-text mb-2">Username</label>
                {isEditing ? (
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-xl border border-text/20 font-sans text-text focus:outline-none focus:border-cyan-primary focus:ring-2 focus:ring-cyan-primary/20 transition-all duration-200"
                      placeholder="Enter username"
                    />
                    <button
                      onClick={handleUpdate}
                      disabled={isUpdating}
                      className="px-6 py-3 bg-cta text-white rounded-xl font-sans font-medium hover:bg-cta/90 transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={isUpdating}
                      className="px-6 py-3 bg-text/10 text-text rounded-xl font-sans font-medium hover:bg-text/20 transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={username}
                      readOnly
                      className="flex-1 px-4 py-3 rounded-xl border border-text/20 font-sans text-text bg-text/5 cursor-not-allowed"
                    />
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-3 bg-primary text-white rounded-xl font-sans font-medium hover:bg-primary/90 transition-colors duration-200 cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block font-sans font-medium text-text mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full px-4 py-3 rounded-xl border border-text/20 font-sans text-text bg-text/5 cursor-not-allowed"
                />
                <p className="font-sans text-sm text-text/50 mt-1">Email cannot be changed</p>
              </div>

              {/* Role (read-only) */}
              <div>
                <label className="block font-sans font-medium text-text mb-2">Account Type</label>
                <input
                  type="text"
                  value={role === 'admin' ? 'Administrator' : 'Eco Traveler'}
                  readOnly
                  className="w-full px-4 py-3 rounded-xl border border-text/20 font-sans text-text bg-text/5 cursor-not-allowed"
                />
              </div>

              {/* Password Change Section */}
              <div className="border-t border-text/10 pt-6 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-sans font-semibold text-lg text-text">Change Password</h3>
                    <p className="font-sans text-sm text-text/60 mt-1">Update your account password</p>
                  </div>
                  {!showPasswordForm && (
                    <button
                      onClick={() => setShowPasswordForm(true)}
                      className="px-4 py-2 bg-primary text-white rounded-xl font-sans font-medium hover:bg-primary/90 transition-colors duration-200 cursor-pointer"
                    >
                      Change Password
                    </button>
                  )}
                </div>

                {showPasswordForm && (
                  <div className="space-y-4">
                    {passwordMessage && (
                      <div
                        className={`p-3 rounded-xl ${
                          passwordMessage.type === 'success'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        <p className="font-sans text-sm">{passwordMessage.text}</p>
                      </div>
                    )}

                    <div>
                      <label className="block font-sans font-medium text-text mb-2">Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-text/20 font-sans text-text focus:outline-none focus:border-cyan-primary focus:ring-2 focus:ring-cyan-primary/20 transition-all duration-200"
                        placeholder="Enter current password"
                      />
                    </div>

                    <div>
                      <label className="block font-sans font-medium text-text mb-2">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-text/20 font-sans text-text focus:outline-none focus:border-cyan-primary focus:ring-2 focus:ring-cyan-primary/20 transition-all duration-200"
                        placeholder="Enter new password (min 6 characters)"
                      />
                    </div>

                    <div>
                      <label className="block font-sans font-medium text-text mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-text/20 font-sans text-text focus:outline-none focus:border-cyan-primary focus:ring-2 focus:ring-cyan-primary/20 transition-all duration-200"
                        placeholder="Confirm new password"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleChangePassword}
                        disabled={isChangingPassword}
                        className="px-6 py-3 bg-cta text-white rounded-xl font-sans font-medium hover:bg-cta/90 transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isChangingPassword ? 'Updating...' : 'Update Password'}
                      </button>
                      <button
                        onClick={handleCancelPassword}
                        disabled={isChangingPassword}
                        className="px-6 py-3 bg-text/10 text-text rounded-xl font-sans font-medium hover:bg-text/20 transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}