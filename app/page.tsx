'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabase'
import { MapPin, Package, Users, CheckCircle, Search, FileCheck, Plane, ChevronDown, ChevronUp, LogOut, AlertCircle, X, Shield, Calendar, Lock, DollarSign, HeadphonesIcon, Clock, UserCircle } from 'lucide-react'
import Logo from '@/components/Logo'
import AppNav from '@/components/AppNav'
import PublicNav from '@/components/PublicNav'
import { Country } from 'country-state-city'
import VerificationModal from '@/components/VerificationModal'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabaseClient.auth.getSession()
    if (session) {
      setUser(session.user)
      
      // Fetch profile to check verification
      const { data: profileData } = await supabaseClient
        .from('profiles')
        .select('user_verified, phone, phone_verified')
        .eq('id', session.user.id)
        .single()
      
      setProfile(profileData)
    }
  }

  const handleLogout = async () => {
    await supabaseClient.auth.signOut()
    router.push('/')
    window.location.reload()
  }
  
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
  
  // Search form state
  const [fromCountryCode, setFromCountryCode] = useState('IN')
  const [fromCity, setFromCity] = useState('')
  const [toCountryCode, setToCountryCode] = useState('DE')
  const [toCity, setToCity] = useState('')
  const [weight, setWeight] = useState('')

  const handleSearch = () => {
    const fromCountryName = countries.find(c => c.isoCode === fromCountryCode)?.name || ''
    const toCountryName = countries.find(c => c.isoCode === toCountryCode)?.name || ''
    
    router.push(`/trips?fromCountry=${fromCountryName}&fromCity=${fromCity}&toCountry=${toCountryName}&toCity=${toCity}`)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      {user ? (
        <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/30 to-transparent backdrop-blur-sm">
          <AppNav user={user} profile={profile} transparent={true} />
        </div>
      ) : (
        <div className="absolute top-0 left-0 right-0 z-50">
          <PublicNav transparent showPostCTA />
        </div>
      )}

      {/* Hero Section with Overlay Form */}
      <section className="relative min-h-[650px] py-20 bg-cover bg-center" style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=80')",
        backgroundBlendMode: 'overlay',
        backgroundColor: 'rgba(0,0,0,0.5)'
      }}>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-gray-900/85"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="grid md:grid-cols-2 gap-12 items-center w-full">
            {/* Left Side - Heading */}
            <div className="text-white space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-600/20 border border-green-500/30 rounded-full backdrop-blur-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-sm font-semibold text-green-400">Trusted by 100+ travelers</span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Travel & <span className="text-green-400">Deliver</span>
              </h1>
              <p className="text-xl text-gray-200 max-w-lg leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Connect with travelers and send packages across borders affordably and securely. Earn money while you travel!
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-10 h-10 rounded-full bg-green-600/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <span className="text-sm font-medium">Verified Travelers</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-10 h-10 rounded-full bg-green-600/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Secure Payments</span>
                    <span className="text-xs text-gray-400">(Coming Soon)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Search Form */}
            <div id="search-form" className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              {/* Title */}
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <Search className="w-6 h-6 text-gray-700" />
                  Search Trips
                </h2>
              </div>

              {/* Search Form */}
              <div className="space-y-4">
                  {/* Verification Banner for Search */}
                  {user && profile && !profile.user_verified && (
                    <div className="p-3 bg-amber-50 border-l-4 border-amber-500 rounded cursor-pointer hover:bg-amber-100 transition-colors" onClick={() => setShowVerificationModal(true)}>
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-amber-900 text-sm">Email Not Verified</p>
                          <p className="text-xs text-amber-700 mt-0.5">
                            Click here to verify your email for full access.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* FROM */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase mb-2 block">From</label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Country Dropdown */}
                      <div className="relative">
                        <select
                          value={fromCountryCode}
                          onChange={(e) => {
                            setFromCountryCode(e.target.value)
                            setFromCity('') // Reset city when country changes
                          }}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer"
                        >
                          {countries.map((country) => (
                            <option key={country.isoCode} value={country.isoCode}>
                              {country.flag} {country.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>

                      {/* City Dropdown */}
                      <div className="relative">
                        <select
                          value={fromCity}
                          onChange={(e) => setFromCity(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer"
                        >
                          <option value="">Select City</option>
                          {getAvailableCities(fromCountryCode).map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* TO */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase mb-2 block">To</label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Country Dropdown */}
                      <div className="relative">
                        <select
                          value={toCountryCode}
                          onChange={(e) => {
                            setToCountryCode(e.target.value)
                            setToCity('') // Reset city when country changes
                          }}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer"
                        >
                          {countries.map((country) => (
                            <option key={country.isoCode} value={country.isoCode}>
                              {country.flag} {country.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>

                      {/* City Dropdown */}
                      <div className="relative">
                        <select
                          value={toCity}
                          onChange={(e) => setToCity(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer"
                        >
                          <option value="">Select City</option>
                          {getAvailableCities(toCountryCode).map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* PARCEL Weight Only */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase mb-2 block">Parcel Weight (Optional)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="Weight"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">kg</span>
                    </div>
                  </div>

                  {/* Warning if same city */}
                  {fromCity && toCity && fromCity === toCity && fromCountryCode === toCountryCode && (
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded">
                      <p className="text-xs text-amber-800">
                        ⚠️ <strong>Same location:</strong> FROM and TO cities cannot be the same. Please select different cities.
                      </p>
                    </div>
                  )}

                  {/* Search Button */}
                  <button
                    onClick={handleSearch}
                    disabled={!fromCity || !toCity || (fromCity === toCity && fromCountryCode === toCountryCode)}
                    className="w-full py-4 bg-green-600 text-white font-bold text-lg rounded-lg hover:bg-green-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Search Trips
                  </button>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Two simple flows - whether you're traveling or sending
            </p>
          </div>

          {/* For Travelers */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-indigo-900 mb-8 text-center">
              For Travelers
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Step 1 */}
              <div className="bg-white rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
                <div className="mb-6">
                  <div className="w-full h-40 flex items-center justify-center">
                    <UserCircle className="w-20 h-20 text-indigo-600" />
                  </div>
                </div>
                <div className="inline-block px-4 py-1 bg-indigo-600 text-white text-sm font-semibold rounded-full mb-4">
                  Step 1
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Sign Up
                </h3>
                <p className="text-gray-600">
                  Create your account and verify your email & phone number
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
                <div className="mb-6">
                  <div className="w-full h-40 flex items-center justify-center">
                    <Plane className="w-20 h-20 text-indigo-600" />
                  </div>
                </div>
                <div className="inline-block px-4 py-1 bg-indigo-600 text-white text-sm font-semibold rounded-full mb-4">
                  Step 2
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Post Your Trip
                </h3>
                <p className="text-gray-600">
                  Share your travel route, dates, and available capacity
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
                <div className="mb-6">
                  <div className="w-full h-40 flex items-center justify-center">
                    <Users className="w-20 h-20 text-indigo-600" />
                  </div>
                </div>
                <div className="inline-block px-4 py-1 bg-indigo-600 text-white text-sm font-semibold rounded-full mb-4">
                  Step 3
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Get Connected
                </h3>
                <p className="text-gray-600">
                  Senders will reach out to you for package or document delivery
                </p>
              </div>

              {/* Step 4 */}
              <div className="bg-white rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
                <div className="mb-6">
                  <div className="w-full h-40 flex items-center justify-center">
                    <Package className="w-20 h-20 text-indigo-600" />
                  </div>
                </div>
                <div className="inline-block px-4 py-1 bg-indigo-600 text-white text-sm font-semibold rounded-full mb-4">
                  Step 4
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Deliver & Earn
                </h3>
                <p className="text-gray-600">
                  Meet, discuss charges, deliver the package and earn money
                </p>
              </div>
            </div>
          </div>

          {/* For Senders */}
          <div>
            <h3 className="text-2xl font-bold text-indigo-900 mb-8 text-center">
              For Senders
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Step 1 */}
              <div className="bg-white rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
                <div className="mb-6">
                  <div className="w-full h-40 flex items-center justify-center">
                    <UserCircle className="w-20 h-20 text-emerald-600" />
                  </div>
                </div>
                <div className="inline-block px-4 py-1 bg-emerald-600 text-white text-sm font-semibold rounded-full mb-4">
                  Step 1
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Sign Up
                </h3>
                <p className="text-gray-600">
                  Create your account and verify your email & phone number
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
                <div className="mb-6">
                  <div className="w-full h-40 flex items-center justify-center">
                    <Search className="w-20 h-20 text-emerald-600" />
                  </div>
                </div>
                <div className="inline-block px-4 py-1 bg-emerald-600 text-white text-sm font-semibold rounded-full mb-4">
                  Step 2
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Search Travelers
                </h3>
                <p className="text-gray-600">
                  Find travelers going to your desired destination
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
                <div className="mb-6">
                  <div className="w-full h-40 flex items-center justify-center">
                    <Users className="w-20 h-20 text-emerald-600" />
                  </div>
                </div>
                <div className="inline-block px-4 py-1 bg-emerald-600 text-white text-sm font-semibold rounded-full mb-4">
                  Step 3
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Connect & Agree
                </h3>
                <p className="text-gray-600">
                  Contact travelers and discuss delivery details & charges
                </p>
              </div>

              {/* Step 4 */}
              <div className="bg-white rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
                <div className="mb-6">
                  <div className="w-full h-40 flex items-center justify-center">
                    <CheckCircle className="w-20 h-20 text-emerald-600" />
                  </div>
                </div>
                <div className="inline-block px-4 py-1 bg-emerald-600 text-white text-sm font-semibold rounded-full mb-4">
                  Step 4
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Send & Track
                </h3>
                <p className="text-gray-600">
                  Hand over your package and track its delivery
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose CarryBridge Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Why Choose CarryBridge?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: 'Poppins, sans-serif' }}>
              We make finding and working with travelers simple, secure, and stress-free
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Verified Travelers */}
            <div className="bg-gray-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto mb-6 bg-indigo-100 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Verified Travelers
              </h3>
              <p className="text-gray-600">
                All travelers verify their email and phone number for trusted connections
              </p>
            </div>

            {/* Easy Booking */}
            <div className="bg-gray-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto mb-6 bg-indigo-100 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Easy Booking
              </h3>
              <p className="text-gray-600">
                Request connections with just a few clicks. No phone calls, no complicated forms
              </p>
            </div>

            {/* Secure & Private */}
            <div className="bg-gray-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto mb-6 bg-indigo-100 rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Secure & Private
              </h3>
              <p className="text-gray-600">
                Your data is protected with bank-level encryption. We take your privacy seriously
              </p>
            </div>

            {/* Save Time */}
            <div className="bg-gray-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto mb-6 bg-indigo-100 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Save Time
              </h3>
              <p className="text-gray-600">
                Manage everything in one place - bookings, documents, and communication
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold text-indigo-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {/* FAQ 1 */}
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === 0 ? null : 0)}
                className="w-full flex items-center justify-between p-6 text-left transition-colors"
              >
                <h3 className="text-[23.2px] leading-[27.84px] font-normal text-[rgb(33,37,41)] pr-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  What is CarryBridge?
                </h3>
                {openFaq === 0 ? (
                  <ChevronUp className="w-6 h-6 text-indigo-900 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-indigo-900 flex-shrink-0" />
                )}
              </button>
              {openFaq === 0 && (
                <div className="px-6 pb-6 bg-white">
                  <p className="text-gray-600 leading-relaxed">
                    CarryBridge is a leading online marketplace connecting individuals and businesses with verified travelers. We simplify the process of finding qualified travelers who understand your specific needs, whether you're sending a package, document, or looking for a travel companion.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ 2 */}
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
                className="w-full flex items-center justify-between p-6 text-left transition-colors"
              >
                <h3 className="text-[23.2px] leading-[27.84px] font-normal text-[rgb(33,37,41)] pr-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  How much does it cost to use CarryBridge?
                </h3>
                {openFaq === 1 ? (
                  <ChevronUp className="w-6 h-6 text-indigo-900 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-indigo-900 flex-shrink-0" />
                )}
              </button>
              {openFaq === 1 && (
                <div className="px-6 pb-6 bg-white">
                  <p className="text-gray-600 leading-relaxed">
                    <strong>It's totally free!</strong> Creating an account, posting trips, browsing, and connecting with travelers costs nothing. You only negotiate and agree on delivery prices directly with travelers. There are no platform fees, hidden charges, or subscription costs.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ 3 */}
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
                className="w-full flex items-center justify-between p-6 text-left transition-colors"
              >
                <h3 className="text-[23.2px] leading-[27.84px] font-normal text-[rgb(33,37,41)] pr-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Are the travelers on CarryBridge verified?
                </h3>
                {openFaq === 2 ? (
                  <ChevronUp className="w-6 h-6 text-indigo-900 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-indigo-900 flex-shrink-0" />
                )}
              </button>
              {openFaq === 2 && (
                <div className="px-6 pb-6 bg-white">
                  <p className="text-gray-600 leading-relaxed">
                    Yes! All travelers must verify their email address and phone number to build trust in our community. This two-step verification ensures that you're connecting with real, trusted individuals.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ 4 */}
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === 3 ? null : 3)}
                className="w-full flex items-center justify-between p-6 text-left transition-colors"
              >
                <h3 className="text-[23.2px] leading-[27.84px] font-normal text-[rgb(33,37,41)] pr-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  How quickly can I find a traveler?
                </h3>
                {openFaq === 3 ? (
                  <ChevronUp className="w-6 h-6 text-indigo-900 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-indigo-900 flex-shrink-0" />
                )}
              </button>
              {openFaq === 3 && (
                <div className="px-6 pb-6 bg-white">
                  <p className="text-gray-600 leading-relaxed">
                    You can browse available trips immediately after creating an account. Many users find suitable travelers within minutes using our smart search filters for routes, dates, and capacity.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ 5 */}
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === 4 ? null : 4)}
                className="w-full flex items-center justify-between p-6 text-left transition-colors"
              >
                <h3 className="text-[23.2px] leading-[27.84px] font-normal text-[rgb(33,37,41)] pr-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  What types of items can be carried?
                </h3>
                {openFaq === 4 ? (
                  <ChevronUp className="w-6 h-6 text-indigo-900 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-indigo-900 flex-shrink-0" />
                )}
              </button>
              {openFaq === 4 && (
                <div className="px-6 pb-6 bg-white">
                  <p className="text-gray-600 leading-relaxed">
                    Our platform supports various item types including documents, packages, food items, electronics, clothing, and more. However, prohibited items like weapons, illegal substances, and hazardous materials are strictly forbidden.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ 6 */}
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === 5 ? null : 5)}
                className="w-full flex items-center justify-between p-6 text-left transition-colors"
              >
                <h3 className="text-[23.2px] leading-[27.84px] font-normal text-[rgb(33,37,41)] pr-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Is my data secure on CarryBridge?
                </h3>
                {openFaq === 5 ? (
                  <ChevronUp className="w-6 h-6 text-indigo-900 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-indigo-900 flex-shrink-0" />
                )}
              </button>
              {openFaq === 5 && (
                <div className="px-6 pb-6 bg-white">
                  <p className="text-gray-600 leading-relaxed">
                    Absolutely! We use bank-level encryption to protect all your personal information and communications. Your data privacy is our top priority, and we never share your information with third parties without your consent.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="mb-4">
                <Logo size="sm" showText={true} className="brightness-0 invert" />
              </div>
              <p className="text-slate-400 text-sm">
                Connecting travelers and senders for affordable, sustainable shipping.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/trips" className="hover:text-white transition-colors">Browse Trips</Link></li>
                <li><Link href="/auth" className="hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/prohibited-items" className="hover:text-white transition-colors">Prohibited Items</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Contact</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>Email: support@carrybridge.com</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2025 CarryBridge. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Verification Modal */}
      <VerificationModal 
        isOpen={showVerificationModal} 
        onClose={() => setShowVerificationModal(false)} 
      />
    </div>
  )
}
