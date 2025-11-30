'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabaseClient } from '@/lib/supabase'
import { AlertCircle, Loader, CheckCircle, Mail, Lock, User } from 'lucide-react'
import Logo from '@/components/Logo'

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check for URL parameters on page load
  useEffect(() => {
    const errorParam = searchParams?.get('error')
    const successParam = searchParams?.get('success')

    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }
    if (successParam) {
      setSuccess(decodeURIComponent(successParam))
      setIsSignUp(false) // Show login form after successful verification
    }
  }, [searchParams])

  const validateForm = () => {
    if (isSignUp && !name.trim()) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (loading) return
    
    setError('')
    setSuccess('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      if (!supabaseClient) {
        throw new Error('Supabase client not initialized. Please check environment variables.')
      }

      if (isSignUp) {
        // Sign Up
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

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Registration failed')
        }

        // Show success message - don't auto login until email is verified
        setSuccess('✅ Account created! Please check your email to verify your account before logging in.')
        setLoading(false)
        
        // Clear form
        setEmail('')
        setPassword('')
        setName('')
        
        // Switch to login form after 3 seconds
        setTimeout(() => {
          setIsSignUp(false)
        }, 3000)
        return
      } else {
        // Sign In
        const { error } = await supabaseClient.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          throw error
        }

        setSuccess('Signed in successfully! Redirecting...')
      }
      
      // Check for redirect parameter
      const redirect = searchParams?.get('redirect') || '/'
      
      setTimeout(() => {
        router.push(redirect)
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setError('')
    setSuccess('')
    setEmail('')
    setPassword('')
    setName('')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden relative">
        
        {/* Sign In Form - Left Side */}
        <div className={`absolute top-0 left-0 w-full md:w-1/2 h-full flex flex-col justify-center p-8 md:p-12 transition-all duration-700 ease-in-out ${
          isSignUp ? 'md:opacity-0 md:pointer-events-none' : 'md:opacity-100'
        }`}>
          {/* Logo */}
          <Logo size="md" showText={true} className="mb-8" />

          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-6">
            Sign in to CarryBridge
          </h1>

          {/* Social Login Button - Google Only */}
          <button 
            type="button" 
            disabled 
            className="w-full mb-4 px-6 py-3 bg-white border-2 border-slate-200 rounded-lg flex items-center justify-center gap-3 hover:border-slate-300 hover:bg-slate-50 transition-all disabled:opacity-50 group"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-medium text-slate-700 group-hover:text-slate-900">Continue with Google</span>
          </button>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500">or use your email</span>
            </div>
          </div>

          {/* Messages */}
          {success && !isSignUp && (
            <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg flex gap-2 items-start">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}
          {error && !isSignUp && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2 items-start">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading || isSignUp}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent disabled:opacity-50 transition-all"
                placeholder="Email"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading || isSignUp}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent disabled:opacity-50 transition-all"
                placeholder="Password"
              />
            </div>

            <div className="text-right">
              <Link href="/forgot-password" className="text-sm text-slate-500 hover:text-teal-600 transition-colors font-medium">
                Forgot your password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password || isSignUp}
              className="w-full max-w-[200px] py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6 shadow-md hover:shadow-lg"
            >
              {loading && !isSignUp && <Loader className="w-4 h-4 animate-spin" />}
              {loading && !isSignUp ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>
        </div>

        {/* Sign Up Form - Right Side */}
        <div className={`absolute top-0 right-0 w-full md:w-1/2 h-full flex flex-col justify-center p-8 md:p-12 transition-all duration-700 ease-in-out ${
          isSignUp ? 'md:opacity-100' : 'md:opacity-0 md:pointer-events-none'
        }`}>
          {/* Logo */}
          <Logo size="md" showText={true} className="mb-8" />

          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-6">
            Create Account
          </h1>

          {/* Social Login Button - Google Only */}
          <button 
            type="button" 
            disabled 
            className="w-full mb-4 px-6 py-3 bg-white border-2 border-slate-200 rounded-lg flex items-center justify-center gap-3 hover:border-slate-300 hover:bg-slate-50 transition-all disabled:opacity-50 group"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-medium text-slate-700 group-hover:text-slate-900">Continue with Google</span>
          </button>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500">or sign up with email</span>
            </div>
          </div>

          {/* Messages */}
          {success && isSignUp && (
            <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg flex gap-2 items-start">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}
          {error && isSignUp && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2 items-start">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading || !isSignUp}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent disabled:opacity-50 transition-all"
                placeholder="Name"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading || !isSignUp}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent disabled:opacity-50 transition-all"
                placeholder="Email"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading || !isSignUp}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent disabled:opacity-50 transition-all"
                placeholder="Password"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim() || !email || !password || !isSignUp}
              className="w-full max-w-[200px] py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6 shadow-md hover:shadow-lg"
            >
              {loading && isSignUp && <Loader className="w-4 h-4 animate-spin" />}
              {loading && isSignUp ? 'SIGNING UP...' : 'SIGN UP'}
            </button>
          </form>
        </div>

        {/* Overlay Panel - Slides Left/Right */}
        <div 
          className={`hidden md:block absolute top-0 w-1/2 h-full bg-gradient-to-br from-teal-500 to-cyan-500 text-white transition-all duration-700 ease-in-out ${
            isSignUp ? 'left-0' : 'left-1/2'
          }`}
          style={{ 
            zIndex: 10,
          }}
        >
          <div className="relative h-full flex flex-col justify-center items-center p-12 overflow-hidden">
            {/* Decorative circles with glow */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full transition-all duration-700 blur-2xl"></div>
            <div className="absolute bottom-20 right-10 w-24 h-24 bg-white/20 rounded-full transition-all duration-700 blur-2xl"></div>
            <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/15 rounded-full transition-all duration-700 blur-xl"></div>
            
            {/* Sharp decorative elements */}
            <div className="absolute top-16 right-16 w-20 h-20 border border-white/30 rounded-full"></div>
            <div className="absolute bottom-32 left-16 w-16 h-16 border border-white/30 rounded-full"></div>

            {/* Content that changes */}
            <div className="relative z-10 text-center transition-all duration-700">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                {isSignUp ? 'Welcome Back!' : 'Hello, Friend!'}
              </h2>
              <p className="text-white/95 mb-8 max-w-xs mx-auto text-lg">
                {isSignUp
                  ? 'To keep connected with us please login with your personal info'
                  : 'Enter your personal details and start journey with us'}
              </p>
              <button
                onClick={toggleMode}
                className="inline-block px-12 py-3 border-2 border-white rounded-full font-semibold hover:bg-white hover:text-teal-600 transition-all"
              >
                {isSignUp ? 'SIGN IN' : 'SIGN UP'}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden absolute bottom-4 left-0 right-0 text-center z-20">
          <button
            onClick={toggleMode}
            className="bg-teal-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-teal-600 transition-all shadow-md"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  )
}
