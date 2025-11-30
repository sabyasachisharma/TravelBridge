'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Loader, XCircle } from 'lucide-react'

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [message, setMessage] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const token = searchParams?.get('token')
    
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link')
      return
    }

    verifyEmail(token)
  }, [searchParams])

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(`/api/verify-email?token=${token}`)
      const data = await response.json()
      
      if (response.ok && data.success) {
        setStatus('success')
        setMessage(data.message || 'Email verified successfully!')
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/auth?success=Email verified! You can now login.')
        }, 3000)
      } else {
        setStatus('error')
        setMessage(data.message || 'Verification failed. Link may be expired or invalid.')
      }
    } catch (error) {
      console.error('Verification error:', error)
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* Verifying */}
        {status === 'verifying' && (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center">
              <Loader className="w-8 h-8 text-teal-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-3">
              Verifying Your Email...
            </h1>
            <p className="text-slate-600">
              Please wait while we verify your email address.
            </p>
          </div>
        )}

        {/* Success */}
        {status === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-3">
              🎉 Email Verified!
            </h1>
            <p className="text-slate-600 mb-6">
              {message}
            </p>
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-6">
              <p className="text-green-800 text-sm">
                Redirecting to login page in 3 seconds...
              </p>
            </div>
            <button
              onClick={() => router.push('/auth')}
              className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all"
            >
              Go to Login Now
            </button>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-3">
              Verification Failed
            </h1>
            <p className="text-slate-600 mb-6">
              {message}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/auth')}
                className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all"
              >
                Back to Login
              </button>
              <p className="text-sm text-slate-500">
                Need help? Contact support
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

