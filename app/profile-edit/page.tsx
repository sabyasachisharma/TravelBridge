'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabase'
import { 
  User, Mail, Phone, MapPin, Globe, Save, 
  CheckCircle, AlertCircle, Loader, Shield, X 
} from 'lucide-react'
import Logo from '@/components/Logo'
import PhoneInput from '@/components/PhoneInput'
import LanguageSelector from '@/components/LanguageSelector'
import AppNav from '@/components/AppNav'
import { Country } from 'country-state-city'

export default function ProfileEdit() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Form fields
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneCountryCode, setPhoneCountryCode] = useState('')
  const [bio, setBio] = useState('')
  const [homeCity, setHomeCity] = useState('')
  const [languages, setLanguages] = useState<string[]>([])
  
  // Phone verification
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [showVerifyPhone, setShowVerifyPhone] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [sendingCode, setSendingCode] = useState(false)
  const [verifyingCode, setVerifyingCode] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [devCode, setDevCode] = useState('') // For development testing

  // Define allowed countries (same as used in other pages)
  const allCountries = Country.getAllCountries()
  const europeanCountryCodes = [
    'GB', 'DE', 'NL', 'IT', 'SE', 'FR', 'ES', 'PT', 'PL', 'IE',
    'FI', 'CH', 'GR', 'HR', 'MT', 'AT'
  ]
  const asianCountryCodes = [
    'CN', 'IN', 'JP', 'KR', 'ID', 'QA', 'KW', 'OM', 'IQ', 'LK', 'NP'
  ]
  const allowedCountryCodes = [...europeanCountryCodes, ...asianCountryCodes]

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabaseClient.auth.getSession()
    if (!session) {
      router.push('/auth')
      return
    }

    setUser(session.user)
    await fetchProfile(session.access_token)
  }

  const fetchProfile = async (token: string) => {
    try {
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }

      const data = await response.json()
      const profile = data.profile

      setName(profile.name || '')
      setPhone(profile.phone || '')
      setBio(profile.bio || '')
      setHomeCity(profile.home_city || '')
      setLanguages(profile.languages || [])
      setPhoneVerified(profile.phone_verified || false)
      
      // Store profile for AppNav
      setProfileData(profile)
      setLoading(false)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session) {
        router.push('/auth')
        return
      }

      const languagesArray = languages.filter(lang => lang.length > 0)

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          name,
          phone,
          bio,
          home_city: homeCity,
          languages: languagesArray
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      // Check if phone was changed
      if (data.profile.phone !== phone && phone) {
        setPhoneVerified(false)
        setShowVerifyPhone(true)
      } else {
        setPhoneVerified(data.profile.phone_verified)
      }

      setSuccess('Profile updated successfully!')
      
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleSendVerificationCode = async () => {
    if (!phone) {
      setError('Please enter a phone number first')
      return
    }

    setError('')
    setSendingCode(true)

    try {
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session) {
        router.push('/auth')
        return
      }

      // First, save the phone number to profile if it's not already saved
      const profileResponse = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          phone: phone
        })
      })

      if (!profileResponse.ok) {
        const profileData = await profileResponse.json()
        throw new Error(profileData.error || 'Failed to save phone number')
      }

      // Now send the verification code
      const response = await fetch('/api/verify-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'send'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code')
      }

      setCodeSent(true)
      setShowVerifyPhone(true) // Auto-show verification section after sending
      setDevCode(data.code || '') // For development testing
      setSuccess('Verification code sent to your phone!')
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code')
    } finally {
      setSendingCode(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setError('Please enter the verification code')
      return
    }

    setError('')
    setVerifyingCode(true)

    try {
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session) {
        router.push('/auth')
        return
      }

      const response = await fetch('/api/verify-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'verify',
          code: verificationCode
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify code')
      }

      // Refresh profile to get updated verification status from server
      const { data: { session: refreshSession } } = await supabaseClient.auth.getSession()
      if (refreshSession) {
        await fetchProfile(refreshSession.access_token)
      }

      setPhoneVerified(true)
      setShowVerifyPhone(false)
      setCodeSent(false)
      setVerificationCode('')
      setSuccess('Phone number verified successfully!')
    } catch (err: any) {
      setError(err.message || 'Failed to verify code')
    } finally {
      setVerifyingCode(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
          <p className="text-lg text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <AppNav user={user} profile={profileData} />

      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Edit Your Profile
          </h1>
          <p className="text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Update your personal information and preferences
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-700">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-6">
            {/* Email (Read-only) */}
            <div>
              <label className="text-sm font-medium text-gray-900 mb-2 block" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-full text-gray-500 cursor-not-allowed"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              />
              <p className="text-xs text-gray-500 mt-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Email cannot be changed</p>
            </div>

            {/* Name */}
            <div>
              <label className="text-sm font-medium text-gray-900 mb-2 block" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={saving}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:bg-gray-50"
                style={{ fontFamily: 'Poppins, sans-serif' }}
                placeholder="John Doe"
              />
            </div>

            {/* Phone Number with Verification */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-700" />
                  <span className="text-sm font-semibold text-slate-700">Phone Number</span>
                  {phoneVerified && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
                {phone && !phoneVerified && (
                  <button
                    type="button"
                    onClick={() => setShowVerifyPhone(!showVerifyPhone)}
                    disabled={saving}
                    className="px-3 py-1.5 bg-teal-500 text-white text-xs font-medium rounded-lg hover:bg-teal-600 transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Shield className="w-3 h-3" />
                    Verify
                  </button>
                )}
              </div>
              <PhoneInput
                value={phone}
                onChange={(fullNumber, countryCode, cleanNumber) => {
                  setPhone(fullNumber)
                  setPhoneCountryCode(countryCode)
                  if (phoneVerified) {
                    setPhoneVerified(false)
                    setShowVerifyPhone(false)
                  }
                }}
                disabled={saving}
                showLabel={false}
                allowedCountries={allowedCountryCodes}
                className="mb-2"
              />

              {/* Phone Verification Section */}
              {showVerifyPhone && phone && !phoneVerified && (
                <div className="mt-4 p-4 bg-teal-50 border-2 border-teal-200 rounded-xl">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-teal-900">Verify Your Phone Number</h4>
                    <button
                      type="button"
                      onClick={() => {
                        setShowVerifyPhone(false)
                        setCodeSent(false)
                        setVerificationCode('')
                      }}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {!codeSent ? (
                    <div>
                      <p className="text-sm text-teal-700 mb-3">
                        We'll send a 6-digit verification code to {phone}
                      </p>
                      <button
                        type="button"
                        onClick={handleSendVerificationCode}
                        disabled={sendingCode}
                        className="w-full py-2.5 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {sendingCode && <Loader className="w-4 h-4 animate-spin" />}
                        {sendingCode ? 'Sending...' : 'Send Verification Code'}
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-teal-700 mb-3">
                        Enter the 6-digit code sent to {phone}
                      </p>
                      {devCode && (
                        <div className="mb-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs">
                          <strong>Dev Mode:</strong> Code is {devCode}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                          className="flex-1 px-4 py-2.5 bg-white border-2 border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-center text-lg font-mono tracking-wider"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyCode}
                          disabled={verifyingCode || verificationCode.length !== 6}
                          className="px-6 py-2.5 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                          {verifyingCode && <Loader className="w-4 h-4 animate-spin" />}
                          {verifyingCode ? 'Verifying...' : 'Verify'}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={handleSendVerificationCode}
                        disabled={sendingCode}
                        className="mt-2 text-sm text-teal-600 hover:text-teal-700 font-medium"
                      >
                        Resend code
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Home City */}
            <div>
              <label className="text-sm font-medium text-gray-900 mb-2 block" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Home City (optional)
              </label>
              <input
                type="text"
                value={homeCity}
                onChange={(e) => setHomeCity(e.target.value)}
                disabled={saving}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:bg-gray-50"
                style={{ fontFamily: 'Poppins, sans-serif' }}
                placeholder="e.g., New York, USA"
              />
            </div>

            {/* Languages */}
            <LanguageSelector
              value={languages}
              onChange={setLanguages}
              disabled={saving}
              placeholder="Select languages you speak"
            />

            {/* Bio */}
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={saving}
                rows={4}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 resize-none transition-all hover:border-slate-300"
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving || !name.trim()}
                className="flex-1 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {saving && <Loader className="w-5 h-5 animate-spin" />}
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              
              <Link
                href="/dashboard"
                className="px-8 py-3.5 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

