'use client'

import { useState } from 'react'
import { signOut } from '@/utils/supabase/auth'
import { useUser, useUpdateUser, useDeleteAccount, useChangePassword } from '@/hooks/useUser'

export default function ProfileTab() {
  const { data: user } = useUser()
  const updateUser = useUpdateUser()
  const changePassword = useChangePassword()
  const deleteAccountMutation = useDeleteAccount()

  const [isEditing, setIsEditing] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleteMessage, setDeleteMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const username = user?.user_metadata?.username || ''
  const email = user?.email || ''
  const role = user?.user_metadata?.role || 'user'

  // Sync newUsername when user data loads
  if (!isEditing && newUsername !== username && username) {
    setNewUsername(username)
  }

  const handleUpdate = async () => {
    if (!newUsername.trim()) {
      setMessage({ type: 'error', text: 'Username cannot be empty' })
      return
    }

    if (newUsername === username) {
      setIsEditing(false)
      return
    }

    setMessage(null)

    try {
      await updateUser.mutateAsync({ username: newUsername.trim() })
      setIsEditing(false)
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message })
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

    setPasswordMessage(null)

    try {
      await changePassword.mutateAsync({ email, currentPassword, newPassword })
      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowPasswordForm(false)
    } catch (err) {
      setPasswordMessage({ type: 'error', text: (err as Error).message })
    }
  }

  const handleCancelPassword = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setShowPasswordForm(false)
    setPasswordMessage(null)
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return

    setDeleteMessage(null)

    try {
      await deleteAccountMutation.mutateAsync()
      await signOut()
      window.location.href = '/?deleted=true'
    } catch (err) {
      setDeleteMessage({ type: 'error', text: (err as Error).message })
    }
  }

  const openDeleteModal = () => {
    setDeleteConfirmText('')
    setDeleteMessage(null)
    setShowDeleteModal(true)
  }

  const closeDeleteModal = () => {
    setDeleteConfirmText('')
    setDeleteMessage(null)
    setShowDeleteModal(false)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-sans font-bold text-3xl text-text">Profile</h1>
        <p className="font-sans text-text/60 mt-2">Manage your account information</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white/80 backdrop-blur-md rounded-organic p-6 shadow-organic max-w-2xl">
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
                  disabled={updateUser.isPending}
                  className="px-6 py-3 bg-cta text-white rounded-xl font-sans font-medium hover:bg-cta/90 transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateUser.isPending ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={updateUser.isPending}
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
                    disabled={changePassword.isPending}
                    className="px-6 py-3 bg-cta text-white rounded-xl font-sans font-medium hover:bg-cta/90 transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {changePassword.isPending ? 'Updating...' : 'Update Password'}
                  </button>
                  <button
                    onClick={handleCancelPassword}
                    disabled={changePassword.isPending}
                    className="px-6 py-3 bg-text/10 text-text rounded-xl font-sans font-medium hover:bg-text/20 transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete Account Section */}
        <div className="border-t border-text/10 pt-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-sans font-semibold text-lg text-red-600">Delete Account</h3>
              <p className="font-sans text-sm text-text/60 mt-1">Permanently delete your account and all associated data</p>
            </div>
            <button
              onClick={openDeleteModal}
              className="px-4 py-2 bg-red-600 text-white rounded-xl font-sans font-medium hover:bg-red-700 transition-colors duration-200 cursor-pointer"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-organic p-6 max-w-md w-full mx-4 shadow-organic-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-sans font-bold text-xl text-text">Delete Account</h3>
                <p className="font-sans text-sm text-text/60">This action cannot be undone</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="font-sans text-text mb-4">
                You are about to permanently delete your account. This will remove:
              </p>
              <ul className="list-disc list-inside font-sans text-sm text-text/70 space-y-1 mb-4">
                <li>Your profile information</li>
                <li>All your saved destinations</li>
                <li>Trip history and carbon footprint data</li>
              </ul>
              <p className="font-sans text-sm text-text/70">
                Account: <span className="font-medium text-text">{email}</span>
              </p>
            </div>

            {deleteMessage && (
              <div
                className={`mb-4 p-3 rounded-xl ${
                  deleteMessage.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                <p className="font-sans text-sm">{deleteMessage.text}</p>
              </div>
            )}

            <div className="mb-6">
              <label className="block font-sans font-medium text-text mb-2">
                Type <span className="font-bold text-red-600">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-text/20 font-sans text-text focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
                placeholder="DELETE"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || deleteAccountMutation.isPending}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-sans font-medium hover:bg-red-700 transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteAccountMutation.isPending ? 'Deleting...' : 'Delete Account'}
              </button>
              <button
                onClick={closeDeleteModal}
                disabled={deleteAccountMutation.isPending}
                className="px-6 py-3 bg-text/10 text-text rounded-xl font-sans font-medium hover:bg-text/20 transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}