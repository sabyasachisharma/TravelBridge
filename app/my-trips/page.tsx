'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabase'
import { Plane, Loader } from 'lucide-react'
import AppNav from '@/components/AppNav'

export default function MyTripsPage() {
  const router = useRouter()
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [subTab, setSubTab] = useState<'upcoming' | 'past'>('upcoming')
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabaseClient.auth.getSession()
    if (!session) {
      router.push('/auth?redirect=/my-trips')
      return
    }

    setUser(session.user)
    
    const { data: profileData } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
    
    setProfile(profileData)
    fetchUserTrips(session.user.id)
  }

  const fetchUserTrips = async (userId: string) => {
    try {
      const { data: tripsData, error } = await supabaseClient
        .from('trips')
        .select('*')
        .eq('traveler_id', userId)
        .order('depart_date', { ascending: false })

      if (error) {
        console.error('Error fetching trips:', error)
      } else {
        setTrips(tripsData || [])
        calculateStats(tripsData || [])
      }
    } catch (err: any) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (tripsList: any[]) => {
    const today = new Date().toISOString().split('T')[0]
    const activeTrips = tripsList.filter((trip) => trip.depart_date >= today && trip.status === 'published')
    const completedTrips = tripsList.filter((trip) => trip.depart_date < today || trip.status === 'closed')
    
    setStats({
      total: tripsList.length,
      active: activeTrips.length,
      completed: completedTrips.length
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppNav user={user} profile={profile} />
        <div className="flex items-center justify-center min-h-screen">
          <Loader className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav user={user} profile={profile} />

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <Link
              href="/dashboard"
              className="px-4 py-4 text-sm font-medium text-gray-700 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300 transition-colors"
            >
              Profile
            </Link>
            <Link
              href="/my-trips"
              className="px-4 py-4 text-sm font-medium text-gray-700 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300 transition-colors"
            >
              My trips
            </Link>
            <Link
              href="/dashboard?tab=settings"
              className="px-4 py-4 text-sm font-medium text-gray-700 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300 transition-colors"
            >
              Settings
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My trips</h1>
        </div>

        {/* Sub Tabs: Upcoming / Past */}
        <div className="mb-6">
          <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1">
            <button
              onClick={() => setSubTab('upcoming')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${subTab === 'upcoming' ? 'bg-purple-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              Upcoming ({stats.active})
            </button>
            <button
              onClick={() => setSubTab('past')}
              className={`ml-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${subTab === 'past' ? 'bg-purple-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              Past ({stats.completed})
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <p className="text-sm font-medium text-gray-600 mb-2">Total trips</p>
            <p className="text-4xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <p className="text-sm font-medium text-gray-600 mb-2">Active trips</p>
            <p className="text-4xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <p className="text-sm font-medium text-gray-600 mb-2">Completed</p>
            <p className="text-4xl font-bold text-blue-600">{stats.completed}</p>
          </div>
        </div>

        {/* Trips List or Empty State */}
        {trips.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-16 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                <Plane className="w-12 h-12 text-gray-400" />
              </div>
            </div>
            <p className="text-gray-500 text-lg">No trips posted yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(() => {
              const today = new Date().toISOString().split('T')[0]
              const upcomingTrips = trips.filter((trip) => trip.depart_date >= today && trip.status === 'published')
              const pastTrips = trips.filter((trip) => trip.depart_date < today || trip.status === 'closed')
              const list = subTab === 'upcoming' ? upcomingTrips : pastTrips
              return list
            })().map((trip) => {
              const today = new Date().toISOString().split('T')[0]
              const isActive = trip.depart_date >= today && trip.status === 'published'
              const isCompleted = trip.depart_date < today || trip.status === 'closed'

              return (
                <Link
                  key={trip.id}
                  href={`/trip/${trip.id}`}
                  className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {trip.from_city}, {trip.from_country}
                        </h3>
                        <span className="text-gray-400">→</span>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {trip.to_city}, {trip.to_country}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        Departure: {new Date(trip.depart_date).toLocaleDateString()}
                      </p>
                      {trip.capacity_weight_kg && (
                        <p className="text-sm text-gray-600 mt-1">
                          Capacity: {trip.capacity_weight_kg} kg
                        </p>
                      )}
                    </div>
                    <div className="ml-4">
                      {isActive && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                          Active
                        </span>
                      )}
                      {isCompleted && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                          Completed
                        </span>
                      )}
                      {trip.status === 'draft' && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">
                          Draft
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

