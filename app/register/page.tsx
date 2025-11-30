'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabase'
import { AlertCircle, Loader, CheckCircle, Mail, Lock, User } from 'lucide-react'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [verificationCode, setVerificationCode] = useState(['', '', '', ''])
  const [verifying, setVerifying] = useState(false)
  const [verificationError, setVerificationError] = useState('')
  const [verificationSuccess, setVerificationSuccess] = useState('')
  const [resending, setResending] = useState(false)
  const router = useRouter()
  const firstInputRef = useRef<HTMLInputElement>(null)

  // Auto-focus first input when modal opens
  useEffect(() => {
    if (showVerificationModal && firstInputRef.current) {
      setTimeout(() => {
        firstInputRef.current?.focus()
      }, 100)
    }
  }, [showVerificationModal])

  const validateForm = () => {
    if (!name.trim()) {
      setError('Full name is required')
      return false
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      return false
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }
    return true
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Prevent multiple submissions
    if (loading) return
    
    setError('')
    setSuccess('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Check if Supabase client is initialized
      if (!supabaseClient) {
        throw new Error('Supabase client not initialized. Please check environment variables.')
      }

      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name,
          action: 'signup',
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Registration failed')
      }

      // Account created successfully - redirect to verification page
      setError('')
      setSuccess('')
      setLoading(false)
      
      // Redirect to verification page with email as query parameter
      router.push(`/verify-email?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`)
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration')
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    const codeString = verificationCode.join('').toUpperCase()
    
    if (codeString.length !== 4) {
      setVerificationError('Please enter a valid 4-digit verification code')
      return
    }

    setVerificationError('')
    setVerifying(true)

    try {
      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: codeString,
          email: email,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Verification failed')
      }

      // Verification successful - sign in the user
      const { error: signInError } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        throw signInError
      }

      setVerificationSuccess('Email verified successfully! Redirecting...')
      setVerificationError('')
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } catch (err: any) {
      setVerificationError(err.message || 'Failed to verify code. Please try again.')
      setVerifying(false)
    }
  }

  const handleResendCode = async () => {
    setResending(true)
    setVerificationError('')
    setVerificationCode(['', '', '', ''])
    
    try {
      // Get auth token - we need to sign in first or use a different approach
      // Since user isn't signed in yet, we'll call the signup endpoint again to resend
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name,
          action: 'signup',
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to resend code')
      }

      // Code resent successfully
      setVerificationSuccess('Verification code resent! Please check your email.')
      setTimeout(() => setVerificationSuccess(''), 3000)
    } catch (err: any) {
      setVerificationError(err.message || 'Failed to resend code. Please try again.')
    } finally {
      setResending(false)
    }
  }

  const handleCodeInput = (index: number, value: string) => {
    // Only allow alphanumeric, single character
    const sanitizedValue = value.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 1)
    
    const newCode = [...verificationCode]
    newCode[index] = sanitizedValue
    setVerificationCode(newCode)
    setVerificationError('')

    // Auto-advance to next field if character entered
    if (sanitizedValue && index < 3) {
      const nextInput = document.getElementById(`code-input-${index + 1}`) as HTMLInputElement
      nextInput?.focus()
    }

    // Auto-submit when all 4 digits are entered
    if (newCode.every(digit => digit !== '') && newCode.join('').length === 4) {
      setTimeout(() => handleVerifyCode(), 300)
    }
  }

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace to move to previous field
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-input-${index - 1}`) as HTMLInputElement
      prevInput?.focus()
    }
  }

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 4)
    if (pastedData.length === 4) {
      const newCode = pastedData.split('')
      setVerificationCode(newCode)
      setVerificationError('')
      // Focus last input
      const lastInput = document.getElementById('code-input-3') as HTMLInputElement
      lastInput?.focus()
      // Auto-submit after paste
      setTimeout(() => handleVerifyCode(), 300)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center p-4 page-content">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        <div className="grid md:grid-cols-2 min-h-[650px]">
          {/* Left Side - Overlay Panel */}
          <div className="relative bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-600 text-white flex flex-col justify-center items-center p-8 md:p-12 order-2 md:order-1 overflow-hidden">
            {/* Animated Decorative circles */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-24 h-24 bg-white/10 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/10 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
            
            {/* Additional decorative elements */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl"></div>

            <div className="relative z-10 text-center animate-fade-in">
              <div className="mb-6 inline-block p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                <span className="text-6xl">✨</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">Welcome Back!</h2>
              <p className="text-white/95 mb-8 max-w-xs mx-auto text-lg leading-relaxed">
                Already have an account? Sign in to continue your journey
              </p>
              <Link
                href="/login"
                className="inline-block px-10 py-3.5 border-2 border-white rounded-xl font-bold hover:bg-white hover:text-teal-600 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Right Side - Register Form */}
          <div className="flex flex-col justify-center p-8 md:p-12 order-1 md:order-2 animate-fade-in">
            {/* Logo */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                  <span className="text-white text-xl font-bold">🌍</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">CarryBridge</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              Create Account
            </h1>
            <p className="text-slate-600 mb-6">Join us and start your journey</p>

            {/* Social Login Buttons */}
            <div className="flex gap-3 mb-4">
              <button
                type="button"
                disabled
                className="w-12 h-12 rounded-xl border-2 border-slate-200 flex items-center justify-center hover:border-teal-500 hover:bg-teal-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                title="Facebook login (Coming soon)"
              >
                <svg className="w-5 h-5 text-slate-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              <button
                type="button"
                disabled
                className="w-12 h-12 rounded-xl border-2 border-slate-200 flex items-center justify-center hover:border-teal-500 hover:bg-teal-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                title="Google login (Coming soon)"
              >
                <svg className="w-5 h-5 text-slate-700" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </button>
              <button
                type="button"
                disabled
                className="w-12 h-12 rounded-xl border-2 border-slate-200 flex items-center justify-center hover:border-teal-500 hover:bg-teal-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                title="LinkedIn login (Coming soon)"
              >
                <svg className="w-5 h-5 text-slate-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </button>
            </div>

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500">or use your email</span>
              </div>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg flex gap-2 items-start">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2 items-start">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Register Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 transition-all hover:border-slate-300"
                  placeholder="Full name"
                />
              </div>

              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 transition-all hover:border-slate-300"
                  placeholder="Email address"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 transition-all hover:border-slate-300"
                  placeholder="Password (min. 6 characters)"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !name.trim() || !email || !password}
                className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading && <Loader className="w-5 h-5 animate-spin" />}
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
              {(!name.trim() || !email || !password) && (
                <p className="text-xs text-slate-500 mt-2 text-center">Please fill in all fields to continue</p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Verification Code Modal */}
      {showVerificationModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              // Clicked outside modal - don't close, just keep it open
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in relative z-[10000]">
            <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">Verify Your Email</h2>
            <p className="text-gray-600 mb-6 text-center">
              Enter the verification code sent to your email:
            </p>

            {/* Error Message */}
            {verificationError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2 items-start">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{verificationError}</p>
              </div>
            )}

            {/* Success Message */}
            {verificationSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex gap-2 items-start">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-green-700 text-sm">{verificationSuccess}</p>
              </div>
            )}

            {/* Code Input Fields */}
            <div className="mb-6">
              <div className="flex gap-3 justify-center mb-4" onPaste={handleCodePaste}>
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={index}
                    id={`code-input-${index}`}
                    ref={index === 0 ? firstInputRef : null}
                    type="text"
                    inputMode="text"
                    value={verificationCode[index]}
                    onChange={(e) => handleCodeInput(index, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                    disabled={verifying}
                    maxLength={1}
                    className="w-14 h-14 text-center text-2xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 transition-all"
                    style={{
                      borderColor: verificationCode[index] ? '#14b8a6' : (index === 0 && showVerificationModal ? '#3b82f6' : '#e5e7eb'),
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Resend Code Section */}
            <div className="text-center mb-4">
              <p className="text-gray-600 text-sm mb-3">Didn't receive the code?</p>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resending}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
              >
                {resending && <Loader className="w-4 h-4 animate-spin" />}
                {resending ? 'Sending...' : 'Resend code'}
              </button>
            </div>

            {/* Verify Button (optional, auto-submits when all fields filled) */}
            {verificationCode.every(digit => digit !== '') && (
              <button
                type="button"
                onClick={() => handleVerifyCode()}
                disabled={verifying}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {verifying && <Loader className="w-5 h-5 animate-spin" />}
                {verifying ? 'Verifying...' : 'Verify Email'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
