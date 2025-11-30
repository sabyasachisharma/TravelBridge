'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { X, MapPin, Calendar, Scale, Package, User, Mail, Shield } from 'lucide-react'
import { supabaseClient } from '@/lib/supabase'

// Import TripMap dynamically (client-side only)
const TripMap = dynamic(
  () => import('@/components/TripMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[400px] bg-gray-100 rounded-2xl">
        <div className="text-gray-500">Loading map...</div>
      </div>
    )
  }
)

interface TripDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  tripId: string
}

export default function TripDetailsModal({ isOpen, onClose, tripId }: TripDetailsModalProps) {
  const [trip, setTrip] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && tripId) {
      fetchTripDetails()
    } else {
      setTrip(null)
      setError('')
      setLoading(true)
    }
  }, [isOpen, tripId])

  const fetchTripDetails = async () => {
    try {
      setLoading(true)
      const { data, error: fetchError } = await supabaseClient
        .from('trips')
        .select('*, profiles:traveler_id(id, name, phone, user_verified, bio, home_city), from_coords, to_coords')
        .eq('id', tripId)
        .single()

      if (fetchError) {
        setError('Trip not found')
        console.error(fetchError)
      } else {
        // Fetch the user's email from the API
        if (data?.profiles?.id) {
          try {
            const emailResponse = await fetch(`/api/user-email?userId=${data.profiles.id}`)
            if (emailResponse.ok) {
              const { email } = await emailResponse.json()
              data.profiles.email = email
            }
          } catch (emailError) {
            console.error('Error fetching user email:', emailError)
            // Continue without email if fetch fails
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-white text-gray-400 hover:text-gray-600 rounded-full transition-all shadow-lg hover:shadow-xl z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-600 font-semibold">{error}</p>
            </div>
          ) : trip ? (
            <div className="p-6">
              {/* Trip Route Header Card */}
              <div className="rounded-2xl bg-gray-50 border border-gray-200 mb-6 p-6">
                {/* Route Display */}
                <div className="flex items-center justify-between text-gray-900">
                  <div className="flex-1">
                    <div className="text-2xl font-semibold mb-1">{trip.from_city}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">{trip.from_country}</div>
                  </div>
                  <div className="flex-shrink-0 mx-4">
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-gray-700" />
                    </div>
                  </div>
                  <div className="flex-1 text-right">
                    <div className="text-2xl font-semibold mb-1">{trip.to_city}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">{trip.to_country}</div>
                  </div>
                </div>
              </div>

              {/* Map View Section */}
              <div className="mb-6">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                  <div className="h-[400px] w-full">
                    <TripMap selectedTrip={trip} trips={[]} />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column - Trip Details */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Trip Details</h3>
                  
                  {/* Departure Date Card */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-gray-700" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1 font-medium">Departure</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(trip.depart_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Arrival Date Card */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-gray-700" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1 font-medium">Arrival</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(trip.arrive_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Capacity Card */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Scale className="w-5 h-5 text-gray-700" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 mb-1 font-medium">Capacity</p>
                        <p className="font-semibold text-gray-900">
                          {trip.capacity_weight_kg ? `${trip.capacity_weight_kg} kg` : 'Contact traveler'}
                        </p>
                        {trip.capacity_volume_l && (
                          <p className="text-xs text-gray-500 mt-1">
                            {trip.capacity_volume_l} L
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Notes Card */}
                  {trip.notes && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 text-gray-700" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-600 mb-2 font-medium">Notes</p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{trip.notes}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Traveler Info */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Traveler Information</h3>
                  
                  {/* Traveler Profile Card */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 p-5 text-center">
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                        <User className="w-8 h-8 text-slate-700" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">
                        {trip.profiles?.name || 'Anonymous'}
                      </h4>
                      {trip.profiles?.user_verified && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 text-slate-800 rounded-full text-xs font-semibold mb-2">
                          <Shield className="w-3.5 h-3.5 text-slate-700" />
                          <span>Verified</span>
                        </div>
                      )}
                      {trip.profiles?.home_city && (
                        <p className="text-sm text-gray-600 flex items-center justify-center gap-1 mt-2">
                          <MapPin className="w-4 h-4" />
                          {trip.profiles.home_city}
                        </p>
                      )}
                    </div>

                    {/* Bio Section */}
                    {trip.profiles?.bio && (
                      <div className="px-5 py-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-semibold">About</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{trip.profiles.bio}</p>
                      </div>
                    )}

                    {/* Contact Section */}
                    <div className="px-5 py-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-3 font-semibold">CONTACT</p>
                      
                      {/* Phone */}
                      {trip.profiles?.phone && (
                        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg mb-3 border border-gray-200">
                          <Mail className="w-5 h-5 text-gray-700" />
                          <div>
                            <p className="text-xs text-gray-500">Phone</p>
                            <p className="font-semibold text-sm text-gray-900">{trip.profiles.phone}</p>
                          </div>
                        </div>
                      )}

                      {/* Email */}
                      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                        <Mail className="w-5 h-5 text-gray-700" />
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="font-semibold text-sm text-gray-900">
                            {trip.profiles?.email || 'No email present'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 bg-white text-gray-800 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

