'use client'

import { useEffect, Fragment } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Add custom styles for plane icons
if (typeof window !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    .plane-icon {
      background: transparent !important;
      border: none !important;
    }
  `
  if (!document.querySelector('style[data-plane-icon]')) {
    style.setAttribute('data-plane-icon', 'true')
    document.head.appendChild(style)
  }
}

// Custom red pin marker icon
const redPinIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C9.477 0 5 4.477 5 10c0 7.5 10 20 10 20s10-12.5 10-20c0-5.523-4.477-10-10-10z" fill="#EF4444" stroke="#B91C1C" stroke-width="2"/>
      <circle cx="15" cy="10" r="4" fill="white"/>
    </svg>
  `),
  iconSize: [30, 40],
  iconAnchor: [15, 40],
  popupAnchor: [0, -40],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  shadowSize: [41, 41],
  shadowAnchor: [12, 41]
})

// Airplane icon for route
const planeIcon = L.divIcon({
  html: `
    <div style="font-size: 20px; transform: rotate(-45deg); filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
      ✈️
    </div>
  `,
  className: 'plane-icon',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

// Function to calculate intermediate points along a route
function getIntermediatePoints(from: [number, number], to: [number, number], numPoints: number = 3): [number, number][] {
  const points: [number, number][] = []
  for (let i = 1; i <= numPoints; i++) {
    const ratio = i / (numPoints + 1)
    const lat = from[0] + (to[0] - from[0]) * ratio
    const lng = from[1] + (to[1] - from[1]) * ratio
    points.push([lat, lng])
  }
  return points
}

// Function to calculate rotation angle for plane icon
function getRotationAngle(from: [number, number], to: [number, number]): number {
  const dy = to[0] - from[0]
  const dx = to[1] - from[1]
  return Math.atan2(dx, dy) * (180 / Math.PI)
}

interface TripMapProps {
  selectedTrip: any | null
  trips: any[]
}

// Component to update map view when trip changes
function MapUpdater({ selectedTrip }: { selectedTrip: any | null }) {
  const map = useMap()

  useEffect(() => {
    if (selectedTrip && selectedTrip.from_coords && selectedTrip.to_coords) {
      const fromCoords = selectedTrip.from_coords.coordinates || selectedTrip.from_coords
      const toCoords = selectedTrip.to_coords.coordinates || selectedTrip.to_coords
      
      if (fromCoords && toCoords && fromCoords.length === 2 && toCoords.length === 2) {
        // Create bounds to fit both markers
        const bounds = L.latLngBounds(
          [fromCoords[1], fromCoords[0]],
          [toCoords[1], toCoords[0]]
        )
        map.fitBounds(bounds, { padding: [50, 50] })
      }
    }
  }, [selectedTrip, map])

  return null
}

export default function TripMap({ selectedTrip, trips }: TripMapProps) {
  // Get coordinates for selected trip
  const getCoords = (trip: any) => {
    if (!trip) return { from: null, to: null }
    
    const fromCoords = trip.from_coords?.coordinates || trip.from_coords
    const toCoords = trip.to_coords?.coordinates || trip.to_coords
    
    return {
      from: fromCoords && fromCoords.length === 2 ? [fromCoords[1], fromCoords[0]] : null,
      to: toCoords && toCoords.length === 2 ? [toCoords[1], toCoords[0]] : null
    }
  }

  const selectedCoords = selectedTrip ? getCoords(selectedTrip) : null
  const defaultCenter: [number, number] = [51.505, -0.09] // Default to London

  // If no trip selected, try to show all trips or default center
  let mapCenter = defaultCenter
  if (selectedCoords?.from) {
    mapCenter = selectedCoords.from as [number, number]
  } else if (trips.length > 0 && trips[0].from_coords) {
    const firstCoords = trips[0].from_coords.coordinates || trips[0].from_coords
    if (firstCoords && firstCoords.length === 2) {
      mapCenter = [firstCoords[1], firstCoords[0]]
    }
  }

  return (
    <div className="h-full w-full overflow-hidden">
      <MapContainer
        center={mapCenter}
        zoom={selectedTrip ? 6 : 3}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater selectedTrip={selectedTrip} />
        
        {/* Show selected trip route */}
        {selectedTrip && selectedCoords?.from && selectedCoords?.to && (
          <>
            {/* From marker with red pin */}
            <Marker position={selectedCoords.from as [number, number]} icon={redPinIcon}>
              <Popup>
                <div className="text-center">
                  <p className="font-bold text-teal-600">{selectedTrip.from_city}</p>
                  <p className="text-sm text-slate-600">{selectedTrip.from_country}</p>
                </div>
              </Popup>
            </Marker>
            
            {/* To marker with red pin */}
            <Marker position={selectedCoords.to as [number, number]} icon={redPinIcon}>
              <Popup>
                <div className="text-center">
                  <p className="font-bold text-cyan-600">{selectedTrip.to_city}</p>
                  <p className="text-sm text-slate-600">{selectedTrip.to_country}</p>
                </div>
              </Popup>
            </Marker>
            
            {/* Dotted line route */}
            <Polyline
              positions={[selectedCoords.from, selectedCoords.to] as [number, number][]}
              color="#6B7280"
              weight={2}
              opacity={0.6}
              dashArray="8, 12"
            />
            
            {/* Airplane icons along the route */}
            {getIntermediatePoints(
              selectedCoords.from as [number, number], 
              selectedCoords.to as [number, number], 
              2
            ).map((point, index) => {
              const angle = getRotationAngle(
                selectedCoords.from as [number, number],
                selectedCoords.to as [number, number]
              )
              const rotatedPlaneIcon = L.divIcon({
                html: `
                  <div style="font-size: 20px; transform: rotate(${angle}deg); filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
                    ✈️
                  </div>
                `,
                className: 'plane-icon',
                iconSize: [20, 20],
                iconAnchor: [10, 10],
              })
              return (
                <Marker 
                  key={`plane-${index}`} 
                  position={point} 
                  icon={rotatedPlaneIcon}
                />
              )
            })}
          </>
        )}
        
        {/* Show all trips if no trip selected */}
        {!selectedTrip && trips.length > 0 && trips.map((trip) => {
          const coords = getCoords(trip)
          if (!coords.from || !coords.to) return null
          
          return (
            <Fragment key={trip.id}>
              {/* From marker */}
              <Marker position={coords.from as [number, number]} icon={redPinIcon}>
                <Popup>
                  <div className="text-center">
                    <p className="font-bold">{trip.from_city}</p>
                    <p className="text-sm text-slate-600">{trip.from_country}</p>
                  </div>
                </Popup>
              </Marker>
              
              {/* To marker */}
              <Marker position={coords.to as [number, number]} icon={redPinIcon}>
                <Popup>
                  <div className="text-center">
                    <p className="font-bold">{trip.to_city}</p>
                    <p className="text-sm text-slate-600">{trip.to_country}</p>
                  </div>
                </Popup>
              </Marker>
              
              {/* Dotted line route */}
              <Polyline
                positions={[coords.from, coords.to] as [number, number][]}
                color="#9CA3AF"
                weight={2}
                opacity={0.4}
                dashArray="6, 10"
              />
              
              {/* Single airplane icon in middle of route */}
              <Marker 
                position={[
                  (coords.from[0] + coords.to[0]) / 2,
                  (coords.from[1] + coords.to[1]) / 2
                ]} 
                icon={L.divIcon({
                  html: `
                    <div style="font-size: 16px; transform: rotate(${getRotationAngle(coords.from as [number, number], coords.to as [number, number])}deg); filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));">
                      ✈️
                    </div>
                  `,
                  className: 'plane-icon',
                  iconSize: [16, 16],
                  iconAnchor: [8, 8],
                })}
              />
            </Fragment>
          )
        })}
      </MapContainer>
    </div>
  )
}

