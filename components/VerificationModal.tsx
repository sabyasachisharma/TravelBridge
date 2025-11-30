'use client'

import { Mail, CheckCircle, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import OTPVerificationModal from './OTPVerificationModal'

interface VerificationModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function VerificationModal({ isOpen, onClose }: VerificationModalProps) {
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [resending, setResending] = useState(false)
  const [message, setMessage] = useState('')

  // Render OTP modal even when parent modal is closed
  if (!isOpen && !showOTPModal) return null

  const handleResend = async () => {
    setResending(true)
    setMessage('')

    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      )

      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setMessage('❌ Please login first')
        setResending(false)
        return
      }

      const response = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        // Get user email and profile name, then show OTP modal
        const email = session.user.email
        
        // Get profile name if available
        const { data: profileData } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', session.user.id)
          .single()
        
        const name = profileData?.name || ''
        
        if (email) {
          // Show OTP modal first, then close current modal
          setUserEmail(email)
          setUserName(name)
          setShowOTPModal(true)
          // Close the current modal after a brief delay to allow OTP modal to render
          setTimeout(() => {
            onClose()
          }, 100)
          return
        } else {
          setMessage('✅ Verification email sent! Check your inbox.')
        }
      } else {
        setMessage('❌ ' + (data.error || 'Failed to send email'))
      }
    } catch (error) {
      setMessage('❌ Failed to send email')
    } finally {
      setResending(false)
    }
  }

  return (
    <>
    {isOpen && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-200">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-amber-600" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-3">
          Email Verification Required
        </h2>

        {/* Description */}
        <p className="text-center text-slate-600 mb-6">
          To access this feature, you need to verify your email address. We sent a verification link to your email when you signed up.
        </p>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${
            message.startsWith('✅') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Steps */}
        <div className="bg-slate-50 rounded-lg p-4 mb-6 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
              1
            </div>
            <p className="text-sm text-slate-700">
              Check your email inbox for the verification link
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
              2
            </div>
            <p className="text-sm text-slate-700">
              Click the "Verify My Email" button in the email
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
              3
            </div>
            <p className="text-sm text-slate-700">
              Return here and refresh the page
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleResend}
            disabled={resending}
            className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {resending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-5 h-5" />
                Resend Verification Email
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>

        {/* Help text */}
        <p className="text-xs text-center text-slate-500 mt-4">
          Didn't receive the email? Check your spam folder or click "Resend" above.
        </p>
      </div>
    </div>
    )}

      {/* OTP Verification Modal - render outside conditional to ensure it shows */}
      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={() => {
          setShowOTPModal(false)
          setUserEmail('')
          setUserName('')
        }}
        email={userEmail}
        name={userName}
        onSuccess={() => {
          setShowOTPModal(false)
          setUserEmail('')
          setUserName('')
        }}
      />
    </>
  )
}

