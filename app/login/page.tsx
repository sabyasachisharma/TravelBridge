'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabase'
import { AlertCircle, Loader, Mail, Lock } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      router.push('/')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center p-4 page-content">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        <div className="grid md:grid-cols-2 min-h-[650px]">
          {/* Left Side - Login Form */}
          <div className="flex flex-col justify-center p-8 md:p-12 animate-fade-in">
            {/* Logo */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                  <span className="text-white text-xl font-bold">🌍</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">CarryBridge</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-3">
              Welcome Back!
            </h1>
            <p className="text-slate-600 mb-8">Sign in to continue your journey</p>

            {/* Social Login Buttons */}
            <div className="flex gap-3 mb-6">
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

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500">or use your email</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
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
                  placeholder="Password"
                />
              </div>

              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading && <Loader className="w-5 h-5 animate-spin" />}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>

          {/* Right Side - Overlay Panel */}
          <div className="relative bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-600 text-white flex flex-col justify-center items-center p-8 md:p-12 overflow-hidden">
            {/* Animated Decorative circles */}
            <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute bottom-20 left-10 w-24 h-24 bg-white/10 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
            
            {/* Additional decorative elements */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl"></div>

            <div className="relative z-10 text-center animate-fade-in">
              <div className="mb-6 inline-block p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                <span className="text-6xl">👋</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">Hello, Friend!</h2>
              <p className="text-white/95 mb-8 max-w-xs mx-auto text-lg leading-relaxed">
                Join our community and start your journey with us today
              </p>
              <Link
                href="/register"
                className="inline-block px-10 py-3.5 border-2 border-white rounded-xl font-bold hover:bg-white hover:text-teal-600 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
