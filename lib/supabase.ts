import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.error('Please check your .env.local file has:')
  console.error('  - NEXT_PUBLIC_SUPABASE_URL')
  console.error('  - NEXT_PUBLIC_SUPABASE_ANON_KEY')
  console.error('\nRestart your dev server after adding them: npm run dev')
}

// Client for browser use
export const supabaseClient = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any

// Server-side client (with service role key for elevated permissions)
export const supabaseServer = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null as any

// Types for database tables
export type Profile = {
  id: string
  name: string
  avatar_url: string | null
  bio: string | null
  home_city: string | null
  languages: string[] | null
  user_verified: boolean
  verification_token: string | null
  phone: string | null
  phone_verified: boolean
  phone_verification_code: string | null
  phone_verification_expires_at: string | null
  created_at: string
  updated_at: string
}

export type Trip = {
  id: string
  traveler_id: string
  from_city: string
  from_country: string
  from_coords: { type: string; coordinates: [number, number] } | null
  to_city: string
  to_country: string
  to_coords: { type: string; coordinates: [number, number] } | null
  depart_date: string
  arrive_date: string
  capacity_kg_total: number
  capacity_kg_available: number
  price_type: 'per_kg' | 'flat'
  price_amount: number
  rules_text: string | null
  status: 'draft' | 'published' | 'closed'
  created_at: string
  updated_at: string
}

export type DeliveryRequest = {
  id: string
  trip_id: string
  sender_id: string
  item_title: string
  item_category: string | null
  item_description: string | null
  item_weight_kg: number
  item_dimensions: string | null
  item_value_eur: number | null
  photos: string[] | null
  requires_care: 'fragile' | 'perishable' | 'none'
  proposed_price_eur: number
  status: 'pending' | 'countered' | 'accepted' | 'declined' | 'canceled'
  negotiation_log: any[]
  created_at: string
  updated_at: string
}

export type Booking = {
  id: string
  trip_id: string
  delivery_request_id: string
  status: 'awaiting_confirmation' | 'in_transit' | 'delivered' | 'completed' | 'disputed' | 'canceled'
  payment_status: 'off_platform' | 'not_applicable'
  pickup_code: string | null
  dropoff_code: string | null
  pickup_photo_url: string | null
  dropoff_photo_url: string | null
  pickup_time: string | null
  dropoff_time: string | null
  created_at: string
  updated_at: string
}

export type Review = {
  id: string
  booking_id: string
  reviewer_id: string
  reviewee_id: string
  rating: number
  text: string | null
  created_at: string
}

export type Verification = {
  id: string
  user_id: string
  doc_type: string
  doc_urls: string[] | null
  status: 'pending' | 'approved' | 'rejected'
  notes: string | null
  checked_at: string | null
  created_at: string
  updated_at: string
}

export type Notification = {
  id: string
  user_id: string
  type: string
  payload: any
  read_at: string | null
  created_at: string
}
