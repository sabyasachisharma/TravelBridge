'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabaseClient } from '@/lib/supabase'
import { LogOut, Shield, CheckCircle, AlertCircle, Mail, Plane, Package, Users, TrendingUp, Calendar, MapPin, Star, Activity, ArrowRight, User, Clock, Award, Settings, X, Globe, Loader } from 'lucide-react'
import VerificationModal from '@/components/VerificationModal'
import Logo from '@/components/Logo'
import AppNav from '@/components/AppNav'

// Language mapping
const LANGUAGE_MAP: { [key: string]: string } = {
  'en': 'English',
  'hi': 'Hindi',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'nl': 'Dutch',
  'sv': 'Swedish',
  'pl': 'Polish',
  'ru': 'Russian',
  'zh': 'Chinese',
  'ja': 'Japanese',
  'ko': 'Korean',
  'ar': 'Arabic',
  'ur': 'Urdu',
  'bn': 'Bengali',
  'ta': 'Tamil',
  'te': 'Telugu',
  'mr': 'Marathi',
  'gu': 'Gujarati',
  'kn': 'Kannada',
  'ml': 'Malayalam',
  'pa': 'Punjabi',
  'th': 'Thai',
  'vi': 'Vietnamese',
  'id': 'Indonesian',
  'tr': 'Turkish',
  'el': 'Greek',
  'he': 'Hebrew',
  'fi': 'Finnish',
  'cs': 'Czech',
  'hu': 'Hungarian',
  'ro': 'Romanian',
  'uk': 'Ukrainian',
  'no': 'Norwegian',
  'da': 'Danish',
}

function DashboardContent() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [verification, setVerification] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [trips, setTrips] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'profile' | 'trips' | 'settings'>('profile')
  const [stats, setStats] = useState({
    totalTrips: 0,
    activeTrips: 0,
    completedTrips: 0,
    totalEarnings: 0
  })

  const getLanguageName = (code: string) => {
    return LANGUAGE_MAP[code] || code
  }

  const searchParams = useSearchParams()
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'trips' || tab === 'settings' || tab === 'profile') {
      setActiveTab(tab as any)
    }
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      setUser(session.user)

      const { data: profileData } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      setProfile(profileData)

      // Fetch user's trips
      const { data: tripsData } = await supabaseClient
        .from('trips')
        .select('*')
        .eq('traveler_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      setTrips(tripsData || [])

      // Calculate stats
      const { data: allTrips } = await supabaseClient
        .from('trips')
        .select('*')
        .eq('traveler_id', session.user.id)

      if (allTrips) {
        const today = new Date().toISOString().split('T')[0]
        const activeTrips = allTrips.filter((t: any) => t.depart_date >= today)
        const completedTrips = allTrips.filter((t: any) => t.depart_date < today)
        
        setStats({
          totalTrips: allTrips.length,
          activeTrips: activeTrips.length,
          completedTrips: completedTrips.length,
          totalEarnings: 0
        })
      }

      setVerification(null)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabaseClient.auth.signOut()
    router.push('/')
  }

  const handleDeleteProfile = async () => {
    const confirmDelete = window.confirm('Delete your profile data? This cannot be undone.')
    if (!confirmDelete || !user) return
    try {
      await supabaseClient.from('profiles').delete().eq('id', user.id)
      await supabaseClient.auth.signOut()
      router.push('/')
    } catch (e) {
      console.error('Delete profile failed', e)
    }
  }

  const getProfileCompletion = () => {
    // Completion considers email verification only
    return profile?.user_verified ? 100 : 0
  }

  const getMissingItemsCount = () => {
    // Only check email verification
    return !profile?.user_verified ? 1 : 0
  }

  const getMissingItemsList = () => {
    const missing = []
    if (!profile?.user_verified) missing.push({ label: 'Email Verification', icon: '✉️', action: 'Verify your email address' })
    return missing
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600 mb-4"></div>
          <p className="text-lg text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const profileCompletion = getProfileCompletion()
  const missingItems = getMissingItemsCount()
  const missingItemsList = getMissingItemsList()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/20 scroll-smooth">
      {/* Navigation */}
      <AppNav user={user} profile={profile} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">My Account</h1>
          <p className="text-gray-600">Manage your profile, trips, and settings</p>
        </div>

        {/* Progress Banner */}
        {missingItems > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 mb-8 border border-amber-200 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative w-16 h-16 flex-shrink-0">
                <svg className="transform -rotate-90 w-16 h-16">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    className="text-amber-200"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - profileCompletion / 100)}`}
                    className="text-green-600 transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-800">{profileCompletion}%</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-lg mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  Complete Your Profile
                </p>
                <p className="text-sm text-gray-700 mb-3">
                  {missingItems} {missingItems === 1 ? 'item' : 'items'} remaining to unlock all features and build trust with travelers.
                </p>
                
                {/* Missing Items List */}
                <div className="space-y-2">
                  {missingItemsList.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-semibold text-amber-900">{item.label}:</span>
                      <span className="text-gray-700">{item.action}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <Link
                    href="/profile-edit"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all text-sm"
                  >
                    <Settings className="w-4 h-4" />
                    Complete Profile
                  </Link>
                  {!profile?.user_verified && (
                    <button
                      onClick={() => setShowVerificationModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-amber-600 text-amber-700 font-semibold rounded-xl hover:bg-amber-50 transition-all text-sm"
                    >
                      <Mail className="w-4 h-4" />
                      Verify Email
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 p-2 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className="px-6 py-3 font-medium transition-all rounded-xl whitespace-nowrap flex items-center gap-2 text-gray-700 hover:bg-gray-50"
          >
            <User className="w-4 h-4" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('trips')}
            className="px-6 py-3 font-medium transition-all rounded-xl whitespace-nowrap flex items-center gap-2 text-gray-700 hover:bg-gray-50"
          >
            <Plane className="w-4 h-4" />
            My Trips
            {stats.activeTrips > 0 && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                {stats.activeTrips}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className="px-6 py-3 font-medium transition-all rounded-xl whitespace-nowrap flex items-center gap-2 text-gray-700 hover:bg-gray-50"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 sm:px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Profile Information</h2>
                  <p className="text-gray-600 text-sm">Your personal details and verification status</p>
                </div>
                <Link
                  href="/profile-edit"
                  className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  aria-label="Edit Profile"
                >
                  <Settings className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-8">
              <div>
                <h3 className="font-bold text-gray-900 mb-4 text-lg">
                  General Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full name</label>
                    <input
                      type="text"
                      value={profile?.name || ''}
                      disabled
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 cursor-not-allowed focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 cursor-not-allowed focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone number</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={profile?.phone || ''}
                        disabled
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 cursor-not-allowed focus:outline-none"
                        placeholder="Not set"
                      />
                      {profile?.phone_verified && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-3 py-2 rounded-xl border border-green-200">
                          <CheckCircle className="w-4 h-4" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Home city</label>
                    <input
                      type="text"
                      value={profile?.home_city || ''}
                      disabled
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 cursor-not-allowed focus:outline-none"
                      placeholder="Not set"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Languages
                    </label>
                    {profile?.languages && profile.languages.length > 0 ? (
                      <div className="flex flex-wrap gap-2 p-4 bg-gray-50 border border-gray-300 rounded-lg">
                        {profile.languages.map((langCode: string) => (
                          <span
                            key={langCode}
                            className="inline-flex items-center px-3 py-1 bg-gray-200 text-gray-700 text-sm font-medium rounded"
                          >
                            {getLanguageName(langCode)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 italic">
                        No languages set
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-4 text-lg">
                  About You
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    value={profile?.bio || ''}
                    disabled
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 cursor-not-allowed resize-none focus:outline-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-4 text-lg">
                  Verification Status
                </h3>
                <div className="space-y-3">
                  <div className={`flex items-center justify-between p-4 rounded-lg border ${
                    profile?.user_verified 
                      ? 'bg-gray-50 border-gray-300' 
                      : 'bg-gray-50 border-gray-300'
                  }`}>
                    <div className="flex items-center gap-3">
                      {profile?.user_verified ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-gray-400" />
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">
                          Email {profile?.user_verified ? 'Verified' : 'Not Verified'}
                        </p>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {profile?.user_verified 
                            ? 'Your email has been verified' 
                            : 'Verify your email to access all features'}
                        </p>
                      </div>
                    </div>
                    {!profile?.user_verified && (
                      <button
                        onClick={() => setShowVerificationModal(true)}
                        className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-sm whitespace-nowrap"
                      >
                        Verify
                      </button>
                    )}
                  </div>

                  {/* Phone verification section removed per request */}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trips' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 sm:px-8 py-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-1">My Trips</h2>
                    <p className="text-gray-600 text-sm">Manage and track all your posted trips</p>
                  </div>
                  <button
                    onClick={() => {
                      if (!profile?.user_verified) {
                        setShowVerificationModal(true)
                        return
                      }
                      router.push('/post-trip')
                    }}
                    className="border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 font-semibold px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow whitespace-nowrap"
                  >
                    <Plane className="w-4 h-4" />
                    Post a Trip
                  </button>
                </div>
              </div>

              {/* Trips List */}
              <div className="p-6 sm:p-8">
                {trips.length > 0 ? (
                  <div className="space-y-4">
                    {trips.map((trip) => {
                      const today = new Date().toISOString().split('T')[0]
                      const isActive = trip.depart_date >= today
                      return (
                        <div 
                          key={trip.id} 
                          className="rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all bg-white border border-gray-200"
                        >
                          {/* Header */}
                          <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                isActive 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-gray-200 text-gray-700'
                              }`}>
                                {isActive ? 'Active' : 'Completed'}
                              </span>
                              <span className="text-xs text-gray-600 font-medium">
                                {trip.carry_types?.length || 0} item type{trip.carry_types?.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>

                          {/* Main Content */}
                          <div className="p-6">
                            {/* Route Display */}
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex-1">
                                <div className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">
                                  {trip.from_city}
                                </div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                                  {trip.from_country}
                                </div>
                              </div>
                              
                              <div className="flex-shrink-0 mx-4">
                                <div className="relative">
                                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shadow-sm">
                                    <Plane className="w-5 h-5 text-slate-700 transform rotate-90" />
                                  </div>
                                  <div className="absolute -right-2 -bottom-1 w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center">
                                    <ArrowRight className="w-3 h-3 text-slate-700" />
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex-1 text-right">
                                <div className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">
                                  {trip.to_city}
                                </div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                                  {trip.to_country}
                                </div>
                              </div>
                            </div>

                            {/* Info Section */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <Calendar className="w-4 h-4 text-slate-700" />
                                  <div className="text-xs text-slate-700 font-semibold">Departure</div>
                                </div>
                                <div className="text-base font-bold text-slate-800">
                                  {new Date(trip.depart_date).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </div>
                              </div>
                              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <Package className="w-4 h-4 text-slate-700" />
                                  <div className="text-xs text-slate-700 font-semibold">Capacity</div>
                                </div>
                                <div className="text-base font-bold text-slate-800">
                                  {trip.capacity_weight_kg || 'N/A'} kg
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="inline-block p-6 bg-gray-100 rounded-full mb-6">
                      <Plane className="w-16 h-16 text-gray-700" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Trips Yet</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Start your journey by posting your first trip and help travelers carry their essentials!
                    </p>
                    <button
                      onClick={() => {
                        if (!profile?.user_verified) {
                          setShowVerificationModal(true)
                          return
                        }
                        router.push('/post-trip')
                      }}
                      className="px-8 py-3 border border-gray-300 bg-white text-gray-800 font-semibold rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 mx-auto"
                    >
                      <Plane className="w-5 h-5" />
                      Post Your First Trip
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-white px-6 sm:px-8 py-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-1">Settings</h2>
                <p className="text-gray-600 text-sm">Manage your account preferences</p>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                    <Settings className="w-5 h-5 text-gray-700" />
                    Account
                  </h3>
                  <div className="space-y-3">
                    <Link
                      href="/profile-edit"
                      className="flex items-center justify-between p-5 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors">
                          <User className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Edit Profile</p>
                          <p className="text-sm text-gray-600">Update your personal information</p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                    </Link>
                    
                    <div className="flex items-center justify-between p-5 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                          <Award className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 flex items-center gap-2">
                            Member Since
                            {profile?.user_verified && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </p>
                          <p className="text-sm text-gray-700 font-medium">
                            {new Date(profile?.created_at).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <button
                        onClick={handleDeleteProfile}
                        className="w-full flex items-center justify-center gap-3 p-5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all group text-gray-700 font-semibold"
                      >
                        <X className="w-5 h-5 text-red-600" />
                        Delete Profile Data
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 p-5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all group text-gray-700 font-semibold"
                      >
                        <LogOut className="w-5 h-5 text-red-600" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Verification Modal */}
      <VerificationModal 
        isOpen={showVerificationModal} 
        onClose={() => setShowVerificationModal(false)} 
      />
    </div>
  )
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
