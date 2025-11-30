'use client'

import { useState } from 'react'
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import Link from 'next/link'
import Logo from '@/components/Logo'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Password reset link sent! Check your email inbox.')
        setEmail('')
      } else {
        setError(data.error || 'Failed to send reset email')
      }
    } catch (err: any) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size="lg" showText={true} />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Back Link */}
          <Link 
            href="/auth" 
            className="inline-flex items-center gap-2 text-slate-600 hover:text-teal-600 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>

          {/* Title */}
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-3">
            Forgot Password?
          </h1>
          <p className="text-slate-600 mb-6">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg flex gap-3 items-start">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-800 font-medium">{success}</p>
                <p className="text-green-700 text-sm mt-1">
                  If you don't see the email, check your spam folder.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                disabled={loading}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send Reset Link
                </>
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-600 text-center">
              Remember your password?{' '}
              <Link href="/auth" className="text-teal-600 hover:text-teal-700 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-white/80 backdrop-blur rounded-lg p-4 border border-teal-100">
          <p className="text-sm text-slate-600 text-center">
            <strong className="text-slate-800">Note:</strong> The reset link will expire in 1 hour for security reasons.
          </p>
        </div>
      </div>
    </div>
  )
}

