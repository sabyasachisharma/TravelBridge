'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabase'
import { AlertCircle, Loader, CheckCircle, Mail } from 'lucide-react'

function VerifyEmailPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams?.get('email') || ''
  const name = searchParams?.get('name') || ''
  
  const [verificationCode, setVerificationCode] = useState(['', '', '', ''])
  const [verifying, setVerifying] = useState(false)
  const [verificationError, setVerificationError] = useState('')
  const [verificationSuccess, setVerificationSuccess] = useState('')
  const [resending, setResending] = useState(false)
  const firstInputRef = useRef<HTMLInputElement>(null)

  // Auto-focus first input when page loads
  useEffect(() => {
    if (firstInputRef.current) {
      setTimeout(() => {
        firstInputRef.current?.focus()
      }, 100)
    }
  }, [])

  const handleVerifyCode = async () => {
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

      // Verification successful - sign in the user (we need password, so we'll redirect to login)
      setVerificationSuccess('Email verified successfully! Redirecting to login...')
      
      // Redirect to login page
      setTimeout(() => {
        router.push(`/login?verified=true&email=${encodeURIComponent(email)}`)
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
      const response = await fetch('/api/resend-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend code')
      }

      setVerificationSuccess(data.message || 'Verification code resent! Please check your email.')
      setTimeout(() => setVerificationSuccess(''), 5000)
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

  if (!email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Access</h2>
          <p className="text-gray-600 mb-6">Please register first to verify your email.</p>
          <button
            onClick={() => router.push('/register')}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
          >
            Go to Registration
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
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
                  borderColor: verificationCode[index] ? '#14b8a6' : (index === 0 ? '#3b82f6' : '#e5e7eb'),
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
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    }>
      <VerifyEmailPageContent />
    </Suspense>
  )
}

