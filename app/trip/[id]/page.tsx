'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabaseClient } from '@/lib/supabase'
import { MapPin, Calendar, Package, User, Mail, Phone, ArrowLeft, Loader, Shield, AlertCircle, LogOut } from 'lucide-react'
import Logo from '@/components/Logo'
import AppNav from '@/components/AppNav'
import RouteMap from '@/components/RouteMap'

export default function TripDetailPage() {
  const router = useRouter()
  const params = useParams()
  const tripId = params?.id as string
  
  const [trip, setTrip] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    checkAuth()
  }, [tripId])

  const checkAuth = async () => {
    const { data: { session } } = await supabaseClient.auth.getSession()
    if (!session) {
      // Redirect to auth if not logged in
      router.push(`/auth?redirect=/trip/${tripId}`)
      return
    }
    setUser(session.user)
    
    // Fetch profile to check verification
    const { data: profileData } = await supabaseClient
      .from('profiles')
      .select('user_verified')
      .eq('id', session.user.id)
      .single()
    
    setProfile(profileData)
    
    if (tripId) {
      fetchTripDetails()
    }
  }

  const handleLogout = async () => {
    await supabaseClient.auth.signOut()
    router.push('/')
  }

  const fetchTripDetails = async () => {
    try {
      const { data, error: fetchError } = await supabaseClient
        .from('trips')
        .select('*, profiles:traveler_id(id, name, phone, user_verified), from_coords, to_coords')
        .eq('id', tripId)
        .single()

      if (fetchError) {
        setError('Trip not found')
        console.error(fetchError)
      } else {
        // Fetch email if show_email is true
        if (data?.show_email && data?.profiles?.id) {
          try {
            const emailResponse = await fetch(`/api/user-email?userId=${data.profiles.id}`)
            if (emailResponse.ok) {
              const { email } = await emailResponse.json()
              data.profiles.email = email
            }
          } catch (emailError) {
            console.error('Error fetching user email:', emailError)
          }
        }
        setTrip(data)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleContactClick = () => {
    if (!user) {
      router.push(`/auth?redirect=/trip/${tripId}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Loader className="w-12 h-12 animate-spin text-teal-600" />
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <nav className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Link href="/">
              <Logo size="sm" showText={true} />
            </Link>
          </div>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Trip Not Found</h1>
          <p className="text-slate-600 mb-8">{error || 'This trip does not exist or has been removed.'}</p>
          <Link href="/trips" className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors">
            Back to Trips
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <AppNav user={user} profile={profile} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/trips" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to Trips
        </Link>

        {/* Trip Header */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 text-2xl font-semibold">
              {(trip.profiles?.name?.[0] || 'T').toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-slate-900 mb-1">{trip.from_city} → {trip.to_city}</h1>
              <p className="text-slate-600">{trip.from_country} to {trip.to_country}</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Trip Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Trip Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Trip Information</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <Calendar className="w-6 h-6 text-slate-700 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-medium">Departure Date</p>
                    <p className="text-base font-semibold text-slate-900">{trip.depart_date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <Calendar className="w-6 h-6 text-slate-700 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-medium">Arrival Date</p>
                    <p className="text-base font-semibold text-slate-900">{trip.arrive_date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <Package className="w-6 h-6 text-slate-700 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-medium">Available Capacity</p>
                    <p className="text-base font-semibold text-slate-900">
                      {trip.capacity_weight_kg ? `${trip.capacity_weight_kg} kg` : 'Contact traveler'}
                    </p>
                  </div>
                </div>

                {trip.carry_types && trip.carry_types.length > 0 && (
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-500 uppercase font-medium mb-2">Carry Types</p>
                    <div className="flex flex-wrap gap-2">
                      {trip.carry_types.map((type: string) => (
                        <span key={type} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium capitalize">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Route Map */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Route Map</h2>
              <RouteMap
                fromCity={trip.from_city}
                fromCountry={trip.from_country}
                toCity={trip.to_city}
                toCountry={trip.to_country}
                fromCoords={trip.from_coords}
                toCoords={trip.to_coords}
              />
            </div>

            {/* Notes Card */}
            {trip.notes && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Traveler Notes</h2>
                <p className="text-slate-700 leading-relaxed">{trip.notes}</p>
              </div>
            )}
          </div>

          {/* Right Column - Traveler Info */}
          <div className="space-y-6">
            {/* Traveler Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Traveler</h2>
              
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-slate-700" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">
                  {trip.profiles?.name || 'Anonymous'}
                </h3>
                {trip.profiles?.user_verified && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                    <Shield className="w-4 h-4" />
                    Verified
                  </div>
                )}
              </div>

              {/* Contact Information - Only for logged in users */}
              {user ? (
                <div className="space-y-3">
                  {trip.show_email && trip.profiles?.email && (
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <Mail className="w-5 h-5 text-slate-700 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <p className="text-xs text-slate-500 mb-1">Email</p>
                        <p className="font-medium text-slate-900 break-all word-break-break-all text-sm leading-tight">{trip.profiles.email}</p>
                      </div>
                    </div>
                  )}

                  {trip.show_phone && trip.profiles?.phone && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <Phone className="w-5 h-5 text-slate-700 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-500">Phone</p>
                        <p className="font-medium text-slate-900 break-words">{trip.profiles.phone}</p>
                      </div>
                    </div>
                  )}

                  {(!trip.show_email && !trip.show_phone) || (!trip.profiles?.email && !trip.profiles?.phone) ? (
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-xs text-slate-500 text-center">
                        Contact information not available
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="text-center">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded mb-4 text-left">
                    <p className="text-sm text-amber-800">
                      <strong>Sign in</strong> to view contact details and send messages
                    </p>
                  </div>
                  <button
                    onClick={handleContactClick}
                    className="w-full py-2.5 border border-gray-300 bg-white text-gray-800 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Sign In to Contact
                  </button>
                </div>
              )}
            </div>

            {/* Safety Tips Card */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Safety Tips</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-slate-500 font-bold">•</span>
                  <span>Always meet in public places</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-500 font-bold">•</span>
                  <span>Verify items before handover</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-500 font-bold">•</span>
                  <span>Never share sensitive information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-500 font-bold">•</span>
                  <span>Check prohibited items list</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


