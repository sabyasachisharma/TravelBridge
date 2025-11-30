'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })
}

// Custom marker icons
const createMarkerIcon = (color: string) => {
  return L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0C9.477 0 5 4.477 5 10c0 7.5 10 20 10 20s10-12.5 10-20c0-5.523-4.477-10-10-10z" fill="${color}" stroke="#fff" stroke-width="2"/>
        <circle cx="15" cy="10" r="4" fill="white"/>
      </svg>
    `)}`,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -40],
  })
}

// Component to update map bounds
function MapBoundsUpdater({ from, to }: { from: [number, number] | null, to: [number, number] | null }) {
  const map = useMap()

  useEffect(() => {
    if (from && to) {
      const bounds = L.latLngBounds([from, to])
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [from, to, map])

  return null
}

interface RouteMapProps {
  fromCity: string
  fromCountry: string
  toCity: string
  toCountry: string
  fromCoords?: { coordinates: number[] } | number[] | null
  toCoords?: { coordinates: number[] } | number[] | null
}

export default function RouteMap({ 
  fromCity, 
  fromCountry, 
  toCity, 
  toCountry,
  fromCoords,
  toCoords 
}: RouteMapProps) {
  const [geocodedFrom, setGeocodedFrom] = useState<[number, number] | null>(null)
  const [geocodedTo, setGeocodedTo] = useState<[number, number] | null>(null)
  const [geocoding, setGeocoding] = useState(true)

  // Get coordinates from database
  const getCoords = (coords: any): [number, number] | null => {
    if (!coords) return null
    
    const coordinates = coords.coordinates || coords
    if (coordinates && coordinates.length === 2) {
      // Leaflet uses [lat, lng] format
      return [coordinates[1], coordinates[0]]
    }
    return null
  }

  const fromPos = getCoords(fromCoords)
  const toPos = getCoords(toCoords)

  // Geocode city/country names if coordinates not available
  useEffect(() => {
    const geocodeLocation = async (city: string, country: string): Promise<[number, number] | null> => {
      try {
        const query = `${city}, ${country}`
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
          {
            headers: {
              'User-Agent': 'TravelBridge/1.0'
            }
          }
        )
        const data = await response.json()
        if (data && data.length > 0) {
          return [parseFloat(data[0].lat), parseFloat(data[0].lon)]
        }
      } catch (error) {
        console.error('Geocoding error:', error)
      }
      return null
    }

    const fetchCoordinates = async () => {
      setGeocoding(true)
      
      let finalFromPos = fromPos
      let finalToPos = toPos

      // Geocode from location if not available
      if (!finalFromPos) {
        finalFromPos = await geocodeLocation(fromCity, fromCountry)
        if (finalFromPos) {
          setGeocodedFrom(finalFromPos)
        }
      }

      // Geocode to location if not available
      if (!finalToPos) {
        finalToPos = await geocodeLocation(toCity, toCountry)
        if (finalToPos) {
          setGeocodedTo(finalToPos)
        }
      }

      setGeocoding(false)
    }

    if ((!fromPos || !toPos) && fromCity && fromCountry && toCity && toCountry) {
      fetchCoordinates()
    } else {
      setGeocoding(false)
    }
  }, [fromPos, toPos, fromCity, fromCountry, toCity, toCountry])

  // Use geocoded coordinates if database coordinates not available
  const finalFromPos = fromPos || geocodedFrom
  const finalToPos = toPos || geocodedTo

  // Default center (middle of Europe)
  const defaultCenter: [number, number] = [50, 10]
  
  // Calculate center between points if both exist, otherwise use default
  const center: [number, number] = finalFromPos && finalToPos
    ? [(finalFromPos[0] + finalToPos[0]) / 2, (finalFromPos[1] + finalToPos[1]) / 2]
    : finalFromPos || finalToPos || defaultCenter

  const zoom = finalFromPos && finalToPos ? 5 : 4

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '400px', position: 'relative' }} className="rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBoundsUpdater from={finalFromPos} to={finalToPos} />

        {/* From marker */}
        {finalFromPos && (
          <Marker position={finalFromPos} icon={createMarkerIcon('#EF4444')}>
            <Popup>
              <div className="text-center">
                <p className="font-bold text-red-600">{fromCity}</p>
                <p className="text-sm text-gray-600">{fromCountry}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* To marker */}
        {finalToPos && (
          <Marker position={finalToPos} icon={createMarkerIcon('#3B82F6')}>
            <Popup>
              <div className="text-center">
                <p className="font-bold text-blue-600">{toCity}</p>
                <p className="text-sm text-gray-600">{toCountry}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route line */}
        {finalFromPos && finalToPos && (
          <Polyline
            positions={[finalFromPos, finalToPos]}
            color="#3B82F6"
            weight={4}
            opacity={0.8}
          />
        )}
        
      </MapContainer>
      
      {/* Loading indicator while geocoding */}
      {geocoding && (
        <div className="absolute top-4 left-4 bg-blue-50 border border-blue-200 rounded-lg p-3 z-[1000]">
          <p className="text-sm text-blue-800">Loading map...</p>
        </div>
      )}
    </div>
  )
}

