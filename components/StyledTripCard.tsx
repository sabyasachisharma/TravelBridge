'use client'

import { Plane, Calendar, Scale, User, MapPin } from 'lucide-react'

interface StyledTripCardProps {
  trip: any
  isSelected?: boolean
  isMatched?: boolean
  onClick?: () => void
  onViewDetails?: (e: React.MouseEvent) => void
  showStatus?: boolean
}

export default function StyledTripCard({
  trip,
  isSelected = false,
  isMatched = false,
  onClick,
  onViewDetails,
  showStatus = false
}: StyledTripCardProps) {
  const today = new Date().toISOString().split('T')[0]
  const isActive = trip.depart_date >= today

  return (
    <div
      onClick={onClick}
      className={`rounded-3xl cursor-pointer transition-all overflow-hidden ${
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
            {isMatched && (
              <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold shadow-md">
                ✓ Match
              </span>
            )}
            {showStatus && (
              <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-md ${
                isActive
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-500 text-white'
              }`}>
                {isActive ? 'Active' : 'Completed'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700'}`}>
              {trip.profiles?.name || 'Anonymous'}
            </span>
            <div className={`w-7 h-7 ${isSelected ? 'bg-white/20' : 'bg-white/60'} rounded-full flex items-center justify-center`}>
              <User className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-700'}`} />
            </div>
          </div>
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
        {onViewDetails && (
          <div className="flex items-center justify-end">
            <button
              onClick={onViewDetails}
              className="px-5 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white text-sm font-semibold rounded-full hover:from-gray-900 hover:to-black transition-all shadow-md"
            >
              View Details
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

