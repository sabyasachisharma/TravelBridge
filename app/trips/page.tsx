'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader, MapPin, Package, Calendar, Scale, Plane, User, Users, ArrowRight, Search, Filter, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import Logo from '@/components/Logo'
import AppNav from '@/components/AppNav'
import PublicNav from '@/components/PublicNav'
// TripDetails now opens as a dedicated page
import { supabaseClient } from '@/lib/supabase'

// Dynamically import map to avoid SSR issues
const RouteMap = dynamic(() => import('@/components/RouteMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center">
      <Loader className="w-8 h-8 animate-spin text-teal-600" />
    </div>
  )
})

export default function TripsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [allTrips, setAllTrips] = useState<any[]>([])
  const [userTrips, setUserTrips] = useState<any[]>([])
  const [matchedTrips, setMatchedTrips] = useState<any[]>([])
  const [otherTrips, setOtherTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  // Removed modal state in favor of dedicated page
  const [selectedTrip, setSelectedTrip] = useState<any | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const tripsPerPage = 10
  const tripListRef = useRef<HTMLDivElement>(null)
  
  // Get search params
  const fromCountry = searchParams?.get('fromCountry') || ''
  const fromCity = searchParams?.get('fromCity') || ''
  const toCountry = searchParams?.get('toCountry') || ''
  const toCity = searchParams?.get('toCity') || ''

  useEffect(() => {
    checkAuth()
    fetchTrips()
  }, [])

  useEffect(() => {
    filterTrips()
  }, [allTrips, fromCity, toCity, fromCountry, toCountry])

  // Scroll to top when page changes
  useEffect(() => {
    if (tripListRef.current) {
      tripListRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentPage])

  const checkAuth = async () => {
    const { data: { session } } = await supabaseClient.auth.getSession()
    if (session) {
      setUser(session.user)
      
      // Fetch profile to check verification
      const { data: profileData } = await supabaseClient
        .from('profiles')
        .select('user_verified')
        .eq('id', session.user.id)
        .single()
      
      setProfile(profileData)
    }
  }

  const handleLogout = async () => {
    await supabaseClient.auth.signOut()
    router.push('/')
  }

  const fetchTrips = async () => {
    try {
      const response = await fetch('/api/trips')
      const data = await response.json()
      setAllTrips(data.trips || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filterTrips = () => {
    const myTrips: any[] = []
    const matched: any[] = []
    const others: any[] = []
    const today = new Date().toISOString().split('T')[0]

    allTrips.forEach(trip => {
      // Skip past-departure trips entirely on the public trips page
      if (trip.depart_date && trip.depart_date < today) {
        return
      }

      // Check if this is user's trip
      const isMyTrip = user && trip.traveler_id === user.id

      if (isMyTrip) {
        myTrips.push(trip)
      } else {
        // Only check matching for non-user trips
        if (!fromCity && !toCity) {
          // No search criteria
          matched.push(trip)
        } else {
          const matchesFrom = !fromCity || (trip.from_city === fromCity && trip.from_country === fromCountry)
          const matchesTo = !toCity || (trip.to_city === toCity && trip.to_country === toCountry)

          if (matchesFrom && matchesTo) {
            matched.push(trip)
          } else {
            others.push(trip)
          }
        }
      }
    })

    setUserTrips(myTrips)
    setMatchedTrips(matched)
    setOtherTrips(others)
  }

  // Get trips to display (user's trips first, then matched, then others)
  const displayTrips = useMemo(() => {
    return [...userTrips, ...matchedTrips, ...otherTrips]
  }, [userTrips, matchedTrips, otherTrips])

  // Pagination
  const totalPages = Math.ceil(displayTrips.length / tripsPerPage)
  const startIndex = (currentPage - 1) * tripsPerPage
  const endIndex = startIndex + tripsPerPage
  const paginatedTrips = displayTrips.slice(startIndex, endIndex)

  // Reset to page 1 when trips change
  useEffect(() => {
    setCurrentPage(1)
  }, [displayTrips.length])

  const handleTripClick = (trip: any) => {
    setSelectedTrip(trip)
  }

  const handleViewDetails = (e: React.MouseEvent, tripId: string) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/trip/${tripId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      {user ? (
        <AppNav user={user} profile={profile} />
      ) : (
        <PublicNav />
      )}

      {/* Simple Header with Search Info */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {(fromCity || toCity) ? (
            <div>
              <div className="flex items-center gap-2 text-2xl font-semibold text-gray-900 mb-2">
                {fromCity && fromCountry && <span>{fromCity}</span>}
                {fromCity && toCity && <ArrowRight className="w-5 h-5 text-gray-400" />}
                {toCity && toCountry && <span>{toCity}</span>}
              </div>
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin text-blue-600" />
                  <p className="text-sm text-blue-600 font-medium">
                    Searching for your trip...
                  </p>
                </div>
              ) : matchedTrips.length > 0 || userTrips.length > 0 ? (
                <p className="text-sm text-gray-600">
                  {userTrips.length > 0 && `${userTrips.length} ${userTrips.length === 1 ? 'trip' : 'trips'} by you`}
                  {userTrips.length > 0 && matchedTrips.length > 0 && ' • '}
                  {matchedTrips.length > 0 && `${matchedTrips.length} exact ${matchedTrips.length === 1 ? 'match' : 'matches'}`}
                  {otherTrips.length > 0 && ` • ${otherTrips.length} other ${otherTrips.length === 1 ? 'trip' : 'trips'}`}
                </p>
              ) : displayTrips.length > 0 ? (
                <div>
                  <p className="text-sm text-amber-600 mb-1">
                    No exact matches found for this route
                  </p>
                  <p className="text-sm text-gray-600">
                    Showing {displayTrips.length} other available {displayTrips.length === 1 ? 'trip' : 'trips'}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-red-600">
                  No trips found for this route
                </p>
              )}
            </div>
          ) : (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>All Trips</h1>
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader className="w-5 h-5 animate-spin text-green-600" />
                  <p className="text-sm text-green-600 font-medium">
                    Loading trips...
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  {displayTrips.length} {displayTrips.length === 1 ? 'trip' : 'trips'} available
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <div className="max-w-[1920px] mx-auto px-0 py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 h-[calc(100vh-160px)]">
          {/* Left Side - Trips List */}
          <div className="bg-gray-50 flex flex-col overflow-hidden border-r border-gray-200">

            {/* Trips List - Scrollable */}
            <div ref={tripListRef} className="flex-1 overflow-y-auto">
              {/* Loading State */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader className="w-8 h-8 animate-spin text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600">Loading trips...</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="mx-4 my-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-medium text-red-900 mb-1">Error Loading Trips</h3>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Empty State - No trips at all */}
              {!loading && allTrips.length === 0 && (
                <div className="text-center py-20 px-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No trips available yet</h3>
                  <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                    It looks like there are no trips posted yet. Be the first traveler to post your journey and help others send their packages!
                  </p>
                  <Link 
                    href="/auth?redirect=/post-trip"
                    className="inline-block px-6 py-3 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-all shadow-md"
                  >
                    Post Your First Trip
                  </Link>
                </div>
              )}

              {/* Empty State - No results for search */}
              {!loading && allTrips.length > 0 && displayTrips.length === 0 && (fromCity || toCity) && (
                <div className="text-center py-20 px-4">
                  <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-10 h-10 text-amber-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No trips match your search</h3>
                  <p className="text-sm text-gray-600 mb-2 max-w-md mx-auto">
                    We couldn't find any trips from {fromCity && fromCountry ? `${fromCity}, ${fromCountry}` : 'this location'}
                    {toCity && toCountry && ` to ${toCity}, ${toCountry}`}
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    Try adjusting your search or browse all available trips
                  </p>
                  <Link 
                    href="/trips"
                    className="inline-block px-6 py-3 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-all shadow-md"
                  >
                    View All Trips
                  </Link>
                </div>
              )}

              {/* Trips List */}
              {!loading && paginatedTrips.length > 0 && (
                <div>
                  {paginatedTrips.map((trip, index) => {
                    const isMyTrip = user && trip.traveler_id === user.id
                    const isMatched = matchedTrips.some(m => m.id === trip.id)
                    const isSelected = selectedTrip?.id === trip.id
                    const prevTrip = index > 0 ? paginatedTrips[index - 1] : null
                    const prevIsMyTrip = prevTrip && user ? prevTrip.traveler_id === user.id : false
                    const prevIsMatched = prevTrip ? matchedTrips.some(m => m.id === prevTrip.id) : false
                    
                    // Show section headers
                    const showMyTripsHeader = isMyTrip && index === 0 && userTrips.length > 0
                    const showMatchedTripsHeader = isMatched && !isMyTrip && (index === 0 || (prevIsMyTrip && !prevIsMatched)) && matchedTrips.length > 0
                    const showOtherTripsHeader = !isMatched && !isMyTrip && (index === 0 || (prevIsMatched || prevIsMyTrip))
                    
                    return (
                      <div key={trip.id}>
                        {showMyTripsHeader && (
                          <div className="px-6 py-3 pt-4">
                            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                              👤 Your Trips
                            </p>
                          </div>
                        )}
                        {showMatchedTripsHeader && (
                          <div className="px-6 py-3 pt-6">
                            <p className="text-xs font-semibold text-green-700 uppercase tracking-wider">
                              ✓ Exact Matches
                            </p>
                          </div>
                        )}
                        {showOtherTripsHeader && otherTrips.length > 0 && (
                          <div className="px-6 py-3 pt-6">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Other Available Trips
                            </p>
                          </div>
                        )}
                        <div
                          onClick={() => handleTripClick(trip)}
                          className={`mx-4 my-3 rounded-3xl cursor-pointer transition-all overflow-hidden ${
                            isSelected
                              ? 'shadow-xl scale-[1.02]'
                              : 'shadow-lg hover:shadow-xl hover:scale-[1.01]'
                          }`}
                          style={{
                            background: isSelected 
                              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                              : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                          }}
                        >
                          {/* Header Section */}
                          <div className={`px-5 py-3 ${isSelected ? 'bg-white/10' : 'bg-white/40'} backdrop-blur-sm`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {isMyTrip && (
                                  <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-semibold shadow-md">
                                    👤 Your Trip
                                  </span>
                                )}
                                {isMatched && !isMyTrip && (
                                  <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold shadow-md">
                                    ✓ Match
                                  </span>
                                )}
                              </div>
                              {user && (
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                                    {trip.profiles?.name || 'Anonymous'}
                                  </span>
                                  <div className={`w-7 h-7 ${isSelected ? 'bg-white/20' : 'bg-white/60'} rounded-full flex items-center justify-center`}>
                                    <User className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-700'}`} />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Main Content - White Card */}
                          <div className="bg-white p-5">
                            {/* Route Display */}
                            <div className="flex items-center justify-between mb-5">
                              <div className="flex-1">
                                <div className="text-4xl font-bold text-gray-900 mb-1">
                                  {trip.from_city}
                                </div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                                  {trip.from_country}
                                </div>
                              </div>
                              
                              <div className="flex-shrink-0 mx-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                                  <Plane className="w-6 h-6 text-white transform rotate-90" />
                                </div>
                              </div>
                              
                              <div className="flex-1 text-right">
                                <div className="text-4xl font-bold text-gray-900 mb-1">
                                  {trip.to_city}
                                </div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                                  {trip.to_country}
                                </div>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-5">
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-orange-500 rounded-full" style={{ width: '0%' }}></div>
                              </div>
                            </div>

                            {/* Info Section */}
                            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                              <div>
                                <div className="text-xs text-gray-500 mb-1 font-medium">Departure</div>
                                <div className="text-sm font-bold text-gray-900">{trip.depart_date}</div>
                              </div>
                              {trip.capacity_weight_kg && (
                                <div className="text-right">
                                  <div className="text-xs text-gray-500 mb-1 font-medium">Capacity</div>
                                  <div className="text-sm font-bold text-gray-900">{trip.capacity_weight_kg} kg</div>
                                </div>
                              )}
                            </div>

                          {/* View Details Button */}
                          <div className="flex items-center justify-end">
                            <button
                              onClick={(e) => handleViewDetails(e, trip.id)}
                              className="px-5 py-2 bg-green-600 text-white text-sm font-semibold rounded-full hover:bg-green-700 transition-all shadow-md"
                            >
                              View Details
                            </button>
                          </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {startIndex + 1}–{Math.min(endIndex, displayTrips.length)} of {displayTrips.length}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="px-4 py-2 bg-white rounded-lg border border-gray-300 text-sm font-medium text-gray-700">
                    {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Map */}
          <div className="bg-white overflow-hidden p-6 flex items-stretch">
            {selectedTrip ? (
              <div className="w-full h-full">
                <RouteMap
                  fromCity={selectedTrip.from_city}
                  fromCountry={selectedTrip.from_country}
                  toCity={selectedTrip.to_city}
                  toCountry={selectedTrip.to_country}
                  fromCoords={selectedTrip.from_coords}
                  toCoords={selectedTrip.to_coords}
                />
              </div>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Select a trip to view the route</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal removed: details open on dedicated page */}
    </div>
  )
}
