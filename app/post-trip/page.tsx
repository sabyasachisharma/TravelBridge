'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabase'
import { MapPin, Calendar, Package, Plane, ChevronDown, AlertCircle, CheckCircle, Loader, LogOut, Sparkles, MousePointerClick, Phone, Mail } from 'lucide-react'
import Logo from '@/components/Logo'
import AppNav from '@/components/AppNav'
import { Country } from 'country-state-city'
import VerificationModal from '@/components/VerificationModal'

export default function PostTrip() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showVerificationModal, setShowVerificationModal] = useState(false)

  // Get all countries and filter to Europe + specific Asian countries
  const allCountries = Country.getAllCountries()
  
  // European country codes (ISO 2-letter codes) - Top 16 by Indian diaspora
  const europeanCountryCodes = [
    'GB', // United Kingdom
    'DE', // Germany
    'NL', // Netherlands
    'IT', // Italy
    'SE', // Sweden
    'FR', // France
    'ES', // Spain
    'PT', // Portugal
    'PL', // Poland
    'IE', // Ireland
    'FI', // Finland
    'CH', // Switzerland
    'GR', // Greece
    'HR', // Croatia
    'MT', // Malta
    'AT'  // Austria
  ]
  
  // Specific Asian countries (ISO codes)
  const asianCountryCodes = [
    'CN', // China
    'IN', // India
    'JP', // Japan
    'KR', // South Korea
    'ID', // Indonesia
    'QA', // Qatar
    'KW', // Kuwait
    'OM', // Oman
    'IQ', // Iraq
    'LK', // Sri Lanka
    'NP'  // Nepal
  ]
  
  // Filter countries: Europe + specific Asian countries
  const countries = allCountries.filter(country => {
    const isEuropean = europeanCountryCodes.includes(country.isoCode)
    const isAllowedAsian = asianCountryCodes.includes(country.isoCode)
    return isEuropean || isAllowedAsian
  })
  
  // Predefined major cities for each country
  const countryCities: { [key: string]: string[] } = {
    // Europe
    'GB': ['London', 'Manchester', 'Birmingham'],
    'DE': ['Berlin', 'Munich (München)', 'Hamburg', 'Frankfurt am Main'],
    'NL': ['Amsterdam', 'Rotterdam', 'The Hague (Den Haag)'],
    'IT': ['Rome', 'Milan', 'Naples'],
    'SE': ['Stockholm', 'Gothenburg', 'Malmö'],
    'FR': ['Paris', 'Marseille', 'Lyon'],
    'ES': ['Madrid', 'Barcelona', 'Valencia'],
    'PT': ['Lisbon', 'Porto', 'Braga'],
    'PL': ['Warsaw', 'Kraków', 'Wrocław'],
    'IE': ['Dublin', 'Cork', 'Limerick'],
    'FI': ['Helsinki', 'Espoo', 'Tampere'],
    'CH': ['Zurich', 'Geneva', 'Basel'],
    'GR': ['Athens', 'Thessaloniki', 'Patras'],
    'HR': ['Zagreb', 'Split', 'Dubrovnik'],
    'MT': ['Valletta', 'Sliema', 'Birkirkara'],
    'AT': ['Vienna', 'Graz', 'Salzburg'],
    
    // Asia
    'CN': ['Beijing', 'Shanghai', 'Guangzhou'],
    'IN': ['New Delhi', 'Mumbai', 'Bengaluru (Bangalore)', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat'],
    'JP': ['Tokyo', 'Osaka', 'Yokohama'],
    'KR': ['Seoul', 'Busan', 'Incheon'],
    'ID': ['Jakarta', 'Surabaya', 'Bandung'],
    'QA': ['Doha', 'Al Wakrah', 'Al Rayyan'],
    'KW': ['Kuwait City', 'Al Ahmadi', 'Hawalli'],
    'OM': ['Muscat', 'Salalah', 'Sohar'],
    'IQ': ['Baghdad', 'Basra', 'Erbil'],
    'LK': ['Colombo', 'Kandy', 'Galle'],
    'NP': ['Kathmandu', 'Pokhara', 'Biratnagar']
  }
  
  // Get cities for selected country
  const getAvailableCities = (countryCode: string): string[] => {
    return countryCities[countryCode] || []
  }

  // Form state
  const [fromCountryCode, setFromCountryCode] = useState('IN') // Default: India
  const [fromCity, setFromCity] = useState('')
  const [toCountryCode, setToCountryCode] = useState('DE') // Default: Germany
  const [toCity, setToCity] = useState('')
  const [departDate, setDepartDate] = useState('')
  const [arriveDate, setArriveDate] = useState('')
  const [capacityWeight, setCapacityWeight] = useState('10')
  const [carryTypes, setCarryTypes] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [showEmail, setShowEmail] = useState(true)
  const [showPhone, setShowPhone] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabaseClient.auth.getSession()
    if (!session) {
      // Redirect to auth page with return URL
      router.push('/auth')
      return
    }

    setUser(session.user)

    // Fetch profile to check verification
    const { data: profileData } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    setProfile(profileData)
    
    // Show verification modal if not verified
    if (profileData && !profileData.user_verified) {
      setShowVerificationModal(true)
    }
    
    setLoading(false)
  }

  const handleCarryTypeToggle = (type: string) => {
    // Toggle the actual UI type in the array
    if (carryTypes.includes(type)) {
      setCarryTypes(carryTypes.filter(t => t !== type))
    } else {
      setCarryTypes([...carryTypes, type])
    }
  }
  
  // Helper to check if a UI button should be highlighted
  const isCarryTypeSelected = (uiType: string) => {
    return carryTypes.includes(uiType)
  }
  
  // Helper to convert UI types to enum values for submission
  const getEnumCarryTypes = () => {
    const enumTypeMap: { [key: string]: string } = {
      'food': 'items',
      'clothing': 'items',
      'electronics': 'items',
      'medicines': 'items',
      'gifts': 'items',
      'books': 'items',
      'cosmetics': 'items',
      'jewelry': 'items',
      'sports': 'items',
      'toys': 'items',
      'miscellaneous': 'items',
      'documents': 'documents'
    }
    
    // Convert UI types to enum values and remove duplicates
    const enumTypes = carryTypes.map(type => enumTypeMap[type] || 'items')
    return [...new Set(enumTypes)] // Remove duplicates
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      // Get auth token
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session) {
        router.push('/auth')
        return
      }

      const fromCountryName = countries.find(c => c.isoCode === fromCountryCode)?.name || ''
      const toCountryName = countries.find(c => c.isoCode === toCountryCode)?.name || ''

      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          from_city: fromCity,
          from_country: fromCountryName,
          to_city: toCity,
          to_country: toCountryName,
          depart_date: departDate,
          arrive_date: arriveDate,
          capacity_weight_kg: parseFloat(capacityWeight),
          capacity_volume_l: 0,
          carry_types: getEnumCarryTypes(), // Convert UI types to enum values
          notes: notes,
          show_email: showEmail,
          show_phone: showPhone
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create trip')
      }

      setSuccess(true)
      
      // Redirect to dashboard My Trips tab after 2 seconds
      setTimeout(() => {
        router.push('/dashboard?tab=trips')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to create trip')
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await supabaseClient.auth.signOut()
    router.push('/')
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600 mb-4"></div>
          <p className="text-lg text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="relative">
            <div className="absolute inset-0 bg-green-600/20 blur-3xl rounded-full"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-600/30 animate-bounce">
              <CheckCircle className="w-14 h-14 text-white" strokeWidth={3} />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Trip Posted Successfully! 🎉</h2>
          <p className="text-lg text-gray-600 mb-6">Your trip has been published and is now visible to travelers worldwide.</p>
          <div className="flex items-center justify-center gap-2 text-green-600">
            <Loader className="w-5 h-5 animate-spin" />
            <span className="font-medium">Redirecting to your trips...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <AppNav user={user} profile={profile} />

      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Post Your Trip
          </h1>
          <p className="text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Share your travel details to connect with people who need delivery services
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
          {/* Verification Warning - Only show if modal is closed */}
          {profile && !profile.user_verified && !showVerificationModal && (
            <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded cursor-pointer hover:bg-amber-100 transition-colors" onClick={() => setShowVerificationModal(true)}>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900">Email Not Verified</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Click here to verify your email and gain full access to all features.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Route Section */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Route Details
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* FROM */}
                <div>
                  <label className="text-sm font-medium text-gray-900 mb-2 block" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    From Country <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    <div className="relative">
                      <select
                        value={fromCountryCode}
                        onChange={(e) => {
                          setFromCountryCode(e.target.value)
                          setFromCity('') // Reset city when country changes
                        }}
                        required
                        className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer transition-all text-sm"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        {countries.map((country) => (
                          <option key={country.isoCode} value={country.isoCode}>
                            {country.flag} {country.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>

                    <div className="relative">
                      <select
                        value={fromCity}
                        onChange={(e) => setFromCity(e.target.value)}
                        required
                        className="w-full h-12 px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none cursor-pointer transition-all hover:border-green-400 text-sm"
                      >
                        <option value="">Select City</option>
                        {getAvailableCities(fromCountryCode).map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* TO */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">To</label>
                  <div className="space-y-3">
                    <div className="relative">
                      <select
                        value={toCountryCode}
                        onChange={(e) => {
                          setToCountryCode(e.target.value)
                          setToCity('') // Reset city when country changes
                        }}
                        required
                        className="w-full h-12 px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none cursor-pointer transition-all hover:border-green-400 text-sm"
                      >
                        {countries.map((country) => (
                          <option key={country.isoCode} value={country.isoCode}>
                            {country.flag} {country.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>

                    <div className="relative">
                      <select
                        value={toCity}
                        onChange={(e) => setToCity(e.target.value)}
                        required
                        className="w-full h-12 px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none cursor-pointer transition-all hover:border-green-400 text-sm"
                      >
                        <option value="">Select City</option>
                        {getAvailableCities(toCountryCode).map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Same location warning */}
              {fromCity && toCity && fromCity === toCity && fromCountryCode === toCountryCode && (
                <div className="mt-4 bg-amber-50 border-l-4 border-amber-500 p-3 rounded">
                  <p className="text-sm text-amber-800">
                    ⚠️ <strong>Same location:</strong> FROM and TO cities cannot be the same. Please select different cities.
                  </p>
                </div>
              )}
            </div>

            {/* Travel Dates */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-200 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Travel Dates</h3>
                  <p className="text-sm text-gray-600">When is your trip?</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Departure Date</label>
                  <input
                    type="date"
                    value={departDate}
                    onChange={(e) => setDepartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full h-12 px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-green-400 text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Arrival Date</label>
                  <input
                    type="date"
                    value={arriveDate}
                    onChange={(e) => setArriveDate(e.target.value)}
                    min={departDate || new Date().toISOString().split('T')[0]}
                    required
                    className="w-full h-12 px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-green-400 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Capacity */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-200 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                  <Package className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Carrying Capacity</h3>
                  <p className="text-sm text-gray-600">How much can you carry?</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Weight Capacity (kg)</label>
                <input
                  type="number"
                  value={capacityWeight}
                  onChange={(e) => setCapacityWeight(e.target.value)}
                  min="1"
                  max="50"
                  required
                  className="w-full h-12 px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-green-400 text-sm"
                />
                <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-gray-400 rounded-full"></span>
                  Maximum weight you can carry (1-50 kg)
                </p>
              </div>
            </div>

            {/* Carry Types - Enhanced */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-200 shadow-sm">
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">What Can You Carry?</h3>
                  <p className="text-sm text-gray-600">Select all item types you're willing to carry</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-6 ml-[72px]">Choose at least one item type</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleCarryTypeToggle('documents')}
                  className={`px-4 py-4 rounded-xl font-medium transition-all border-2 text-sm flex items-center justify-center gap-2 ${
                    isCarryTypeSelected('documents')
                      ? 'bg-green-100 text-green-700 border-green-500 shadow-md ring-2 ring-green-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:bg-green-50 shadow-sm'
                  }`}
                >
                  <span className="text-lg">📄</span>
                  <span>Documents</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCarryTypeToggle('food')}
                  className={`px-4 py-4 rounded-xl font-medium transition-all border-2 text-sm flex items-center justify-center gap-2 ${
                    isCarryTypeSelected('food')
                      ? 'bg-green-100 text-green-700 border-green-500 shadow-md ring-2 ring-green-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:bg-green-50 shadow-sm'
                  }`}
                >
                  <span className="text-lg">🍫</span>
                  <span>Food Items</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCarryTypeToggle('clothing')}
                  className={`px-4 py-4 rounded-xl font-medium transition-all border-2 text-sm flex items-center justify-center gap-2 ${
                    isCarryTypeSelected('clothing')
                      ? 'bg-green-100 text-green-700 border-green-500 shadow-md ring-2 ring-green-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:bg-green-50 shadow-sm'
                  }`}
                >
                  <span className="text-lg">👕</span>
                  <span>Clothing</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCarryTypeToggle('electronics')}
                  className={`px-4 py-4 rounded-xl font-medium transition-all border-2 text-sm flex items-center justify-center gap-2 ${
                    isCarryTypeSelected('electronics')
                      ? 'bg-green-100 text-green-700 border-green-500 shadow-md ring-2 ring-green-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:bg-green-50 shadow-sm'
                  }`}
                >
                  <span className="text-lg">💻</span>
                  <span>Electronics</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCarryTypeToggle('medicines')}
                  className={`px-4 py-4 rounded-xl font-medium transition-all border-2 text-sm flex items-center justify-center gap-2 ${
                    isCarryTypeSelected('medicines')
                      ? 'bg-green-100 text-green-700 border-green-500 shadow-md ring-2 ring-green-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:bg-green-50 shadow-sm'
                  }`}
                >
                  <span className="text-lg">💊</span>
                  <span>Medicines</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCarryTypeToggle('gifts')}
                  className={`px-4 py-4 rounded-xl font-medium transition-all border-2 text-sm flex items-center justify-center gap-2 ${
                    isCarryTypeSelected('gifts')
                      ? 'bg-green-100 text-green-700 border-green-500 shadow-md ring-2 ring-green-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:bg-green-50 shadow-sm'
                  }`}
                >
                  <span className="text-lg">🎁</span>
                  <span>Gifts</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCarryTypeToggle('books')}
                  className={`px-4 py-4 rounded-xl font-medium transition-all border-2 text-sm flex items-center justify-center gap-2 ${
                    isCarryTypeSelected('books')
                      ? 'bg-green-100 text-green-700 border-green-500 shadow-md ring-2 ring-green-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:bg-green-50 shadow-sm'
                  }`}
                >
                  <span className="text-lg">📚</span>
                  <span>Books</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCarryTypeToggle('cosmetics')}
                  className={`px-4 py-4 rounded-xl font-medium transition-all border-2 text-sm flex items-center justify-center gap-2 ${
                    isCarryTypeSelected('cosmetics')
                      ? 'bg-green-100 text-green-700 border-green-500 shadow-md ring-2 ring-green-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:bg-green-50 shadow-sm'
                  }`}
                >
                  <span className="text-lg">💄</span>
                  <span>Cosmetics</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCarryTypeToggle('jewelry')}
                  className={`px-4 py-4 rounded-xl font-medium transition-all border-2 text-sm flex items-center justify-center gap-2 ${
                    isCarryTypeSelected('jewelry')
                      ? 'bg-green-100 text-green-700 border-green-500 shadow-md ring-2 ring-green-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:bg-green-50 shadow-sm'
                  }`}
                >
                  <span className="text-lg">💍</span>
                  <span>Jewelry</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCarryTypeToggle('sports')}
                  className={`px-4 py-4 rounded-xl font-medium transition-all border-2 text-sm flex items-center justify-center gap-2 ${
                    isCarryTypeSelected('sports')
                      ? 'bg-green-100 text-green-700 border-green-500 shadow-md ring-2 ring-green-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:bg-green-50 shadow-sm'
                  }`}
                >
                  <span className="text-lg">⚽</span>
                  <span>Sports Items</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCarryTypeToggle('toys')}
                  className={`px-4 py-4 rounded-xl font-medium transition-all border-2 text-sm flex items-center justify-center gap-2 ${
                    isCarryTypeSelected('toys')
                      ? 'bg-green-100 text-green-700 border-green-500 shadow-md ring-2 ring-green-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:bg-green-50 shadow-sm'
                  }`}
                >
                  <span className="text-lg">🧸</span>
                  <span>Toys</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCarryTypeToggle('miscellaneous')}
                  className={`px-4 py-4 rounded-xl font-medium transition-all border-2 text-sm flex items-center justify-center gap-2 ${
                    isCarryTypeSelected('miscellaneous')
                      ? 'bg-green-100 text-green-700 border-green-500 shadow-md ring-2 ring-green-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:bg-green-50 shadow-sm'
                  }`}
                >
                  <span className="text-lg">📦</span>
                  <span>Miscellaneous</span>
                </button>
              </div>
              {carryTypes.length === 0 && (
                <p className="text-xs text-amber-600 mt-2">⚠️ Please select at least one item type</p>
              )}
            </div>

            {/* Contact Preference */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Contact Preference</h3>
              <p className="text-sm text-gray-600 mb-6">Choose how travelers can contact you</p>
              
              <div className="space-y-4">
                <label className="toggle flex items-center justify-between cursor-pointer">
                  <span className="flex items-center gap-2 text-gray-700 font-medium">
                    <Mail className="w-5 h-5" />
                    Show Email
                  </span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={showEmail}
                      onChange={(e) => setShowEmail(e.target.checked)}
                      className="sr-only"
                    />
                    <span className={`slider block w-11 h-6 rounded-full transition-colors ${
                      showEmail ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      <span className={`slider-thumb absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        showEmail ? 'translate-x-5' : 'translate-x-0'
                      }`}></span>
                    </span>
                  </div>
                </label>

                <label className="toggle flex items-center justify-between cursor-pointer">
                  <span className="flex items-center gap-2 text-gray-700 font-medium">
                    <Phone className="w-5 h-5" />
                    Show Phone
                  </span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={showPhone}
                      onChange={(e) => setShowPhone(e.target.checked)}
                      className="sr-only"
                    />
                    <span className={`slider block w-11 h-6 rounded-full transition-colors ${
                      showPhone ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      <span className={`slider-thumb absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        showPhone ? 'translate-x-5' : 'translate-x-0'
                      }`}></span>
                    </span>
                  </div>
                </label>
              </div>

              {!showEmail && !showPhone && (
                <p className="text-xs text-amber-600 mt-3">⚠️ Please select at least one contact method</p>
              )}
            </div>

            {/* Additional Notes */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-200 shadow-sm">
              <label className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span>Additional Notes</span>
                <span className="text-gray-500 font-normal text-sm">(Optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
                placeholder="Any meeting points, conditions, or extra details…"
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-green-400 resize-none text-sm shadow-sm"
              />
              <p className="text-xs text-gray-600 mt-3 flex items-start gap-2">
                <span className="text-green-600">💡</span>
                <span>Share any special requirements or instructions for potential senders</span>
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              <button
                type="submit"
                disabled={submitting || !fromCity || !toCity || (fromCity === toCity && fromCountryCode === toCountryCode) || carryTypes.length === 0 || (!showEmail && !showPhone)}
                className="flex-1 py-5 px-8 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white font-bold text-lg rounded-2xl hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 transition-all shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-xl flex items-center justify-center gap-3 group relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                {submitting ? (
                  <>
                    <Loader className="w-6 h-6 animate-spin relative z-10" />
                    <span className="relative z-10">Posting Trip...</span>
                  </>
                ) : (
                  <>
                    <Plane className="w-6 h-6 transition-transform group-hover:translate-x-1 group-hover:-rotate-12 relative z-10" />
                    <span className="relative z-10">Post Your Trip</span>
                  </>
                )}
              </button>
              
              <Link
                href="/dashboard"
                className="px-8 py-5 border-2 border-gray-300 text-gray-700 font-semibold text-lg rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Verification Modal */}
      <VerificationModal 
        isOpen={showVerificationModal} 
        onClose={() => setShowVerificationModal(false)} 
      />
    </div>
  )
}

