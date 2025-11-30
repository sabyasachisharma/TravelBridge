'use client'

import { useState, useEffect, useRef } from 'react'
import { AlertCircle, Loader, CheckCircle, Mail, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface OTPVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  email: string
  name?: string
  onSuccess?: () => void
}

export default function OTPVerificationModal({ 
  isOpen, 
  onClose, 
  email, 
  name = '',
  onSuccess 
}: OTPVerificationModalProps) {
  const router = useRouter()
  const [verificationCode, setVerificationCode] = useState(['', '', '', ''])
  const [verifying, setVerifying] = useState(false)
  const [verificationError, setVerificationError] = useState('')
  const [verificationSuccess, setVerificationSuccess] = useState('')
  const [resending, setResending] = useState(false)
  const firstInputRef = useRef<HTMLInputElement>(null)

  // Auto-focus first input when modal opens
  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      setTimeout(() => {
        firstInputRef.current?.focus()
      }, 150)
    }
  }, [isOpen])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setVerificationCode(['', '', '', ''])
      setVerificationError('')
      setVerificationSuccess('')
      setVerifying(false)
      setResending(false)
    }
  }, [isOpen])

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

      setVerificationSuccess('Email verified successfully! Redirecting to homepage...')
      
      // Redirect to homepage after successful verification
      setTimeout(() => {
        router.push('/')
        if (onSuccess) {
          onSuccess()
        }
        onClose()
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

      setVerificationSuccess('Verification code resent! Please check your email.')
      setTimeout(() => setVerificationSuccess(''), 5000)
      
      // Focus first input after resend
      setTimeout(() => {
        firstInputRef.current?.focus()
      }, 300)
    } catch (err: any) {
      setVerificationError(err.message || 'Failed to resend code. Please try again.')
    } finally {
      setResending(false)
    }
  }

  const handleCodeInput = (index: number, value: string) => {
    const sanitizedValue = value.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 1)
    
    const newCode = [...verificationCode]
    newCode[index] = sanitizedValue
    setVerificationCode(newCode)
    setVerificationError('')

    if (sanitizedValue && index < 3) {
      const nextInput = document.getElementById(`otp-code-input-${index + 1}`) as HTMLInputElement
      nextInput?.focus()
    }

    if (newCode.every(digit => digit !== '') && newCode.join('').length === 4) {
      setTimeout(() => handleVerifyCode(), 300)
    }
  }

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-code-input-${index - 1}`) as HTMLInputElement
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
      const lastInput = document.getElementById('otp-code-input-3') as HTMLInputElement
      lastInput?.focus()
      setTimeout(() => handleVerifyCode(), 300)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 md:p-10 relative animate-in fade-in zoom-in duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Header with Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 via-cyan-100 to-teal-100 mb-4 shadow-lg">
            <Mail className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
          <p className="text-gray-600 text-sm">
            Enter the verification code sent to
          </p>
          <p className="text-blue-600 font-semibold mt-1 text-sm">{email}</p>
        </div>

        {/* Error Message */}
        {verificationError && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex gap-3 items-start animate-in slide-in-from-top duration-200">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm flex-1">{verificationError}</p>
          </div>
        )}

        {/* Success Message */}
        {verificationSuccess && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg flex gap-3 items-start animate-in slide-in-from-top duration-200">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-700 text-sm flex-1">{verificationSuccess}</p>
          </div>
        )}

        {/* Code Input Fields */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-4 text-center">
            Enter Verification Code
          </label>
          <div 
            className="flex gap-4 justify-center items-center mb-2" 
            onPaste={handleCodePaste}
          >
            {[0, 1, 2, 3].map((index) => (
              <input
                key={index}
                id={`otp-code-input-${index}`}
                ref={index === 0 ? firstInputRef : null}
                type="text"
                inputMode="text"
                value={verificationCode[index]}
                onChange={(e) => handleCodeInput(index, e.target.value)}
                onKeyDown={(e) => handleCodeKeyDown(index, e)}
                disabled={verifying || resending}
                maxLength={1}
                className="w-16 h-16 md:w-20 md:h-20 text-center text-3xl font-bold border-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                style={{
                  borderColor: verificationCode[index] 
                    ? '#14b8a6' 
                    : index === 0 
                      ? '#3b82f6' 
                      : '#d1d5db',
                  backgroundColor: verificationCode[index] 
                    ? '#ecfdf5' 
                    : '#ffffff',
                }}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 text-center mt-3">
            Paste or type the 4-digit code from your email
          </p>
        </div>

        {/* Resend Code Section */}
        <div className="text-center mb-6">
          <p className="text-gray-600 text-sm mb-3">Didn't receive the code?</p>
          <button
            type="button"
            onClick={handleResendCode}
            disabled={resending || verifying}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-8 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
          >
            {resending && <Loader className="w-4 h-4 animate-spin" />}
            {resending ? 'Sending...' : 'Resend code'}
          </button>
        </div>

        {/* Verify Button */}
        {verificationCode.every(digit => digit !== '') && (
          <button
            type="button"
            onClick={() => handleVerifyCode()}
            disabled={verifying}
            className="w-full py-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none text-lg"
          >
            {verifying && <Loader className="w-5 h-5 animate-spin" />}
            {verifying ? 'Verifying...' : 'Verify Email'}
          </button>
        )}
      </div>
    </div>
  )
}

