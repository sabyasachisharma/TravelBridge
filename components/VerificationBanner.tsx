'use client'

import { useState, useEffect } from 'react'
import { supabaseClient, Profile } from '@/lib/supabase'
import { Mail, X, AlertTriangle, CheckCircle } from 'lucide-react'
import OTPVerificationModal from './OTPVerificationModal'

export default function VerificationBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')

  useEffect(() => {
    checkVerificationStatus()
  }, [])

  const checkVerificationStatus = async () => {
    try {
      if (!supabaseClient) {
        setShowBanner(false)
        return
      }

      const { data: { user } } = await supabaseClient.auth.getUser()
      
      // If no user, definitely don't show banner
      if (!user) {
        setShowBanner(false)
        return
      }

      // User exists, fetch their profile
      const { data: profileData, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error || !profileData) {
        console.error('Error fetching profile:', error)
        setShowBanner(false)
        return
      }

      setProfile(profileData)

      // Only show banner if email is NOT verified
      if (!profileData.user_verified) {
        setShowBanner(true)
      } else {
        setShowBanner(false)
      }
    } catch (error) {
      console.error('Error checking verification:', error)
      setShowBanner(false)
    }
  }

  const handleResendEmail = async () => {
    try {
      if (!supabaseClient) {
        console.error('Supabase client not initialized')
        return
      }

      // Get auth token
      const { data: { session } } = await supabaseClient.auth.getSession()
      
      if (!session || !session.user.email) {
        console.error('No session or email found')
        return
      }

      const email = session.user.email
      const name = profile?.name || ''

      // Resend verification code
      const response = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        // Set email and name, then show OTP modal
        console.log('Resend successful, opening OTP modal for:', email)
        setUserEmail(email)
        setUserName(name)
        // Use setTimeout to ensure state updates properly
        setTimeout(() => {
          setShowOTPModal(true)
        }, 0)
      } else {
        console.error('Failed to resend:', data.error)
      }
    } catch (error) {
      console.error('Failed to resend verification:', error)
    }
  }

  const handleVerificationSuccess = () => {
    // Banner will be hidden automatically when user is verified after page navigation
  }

  return (
    <>
    {/* Only show banner if explicitly set to true AND not dismissed */}
    {(showBanner && !dismissed) && (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm md:text-base">
                📧 Please verify your email address
              </p>
              <p className="text-xs md:text-sm text-white/90 mt-1">
                We sent a verification link to your email. Click it to access all features.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleResendEmail}
              className="px-4 py-2 bg-white text-amber-600 rounded-lg font-semibold text-sm hover:bg-amber-50 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <Mail className="w-4 h-4" />
              Resend Verification Email
            </button>
            
            <button
              onClick={() => setDismissed(true)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
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
        onSuccess={handleVerificationSuccess}
      />
    </>
  )
}

