import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

// Helper to generate future dates
const getFutureDate = (daysFromNow: number) => {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date.toISOString().split('T')[0]
}

const dummyTrips = [
  {
    from_country: 'India',
    from_city: 'New Delhi',
    to_country: 'Germany',
    to_city: 'Berlin',
    depart_date: getFutureDate(3),
    arrive_date: getFutureDate(4),
    capacity_weight_kg: 15,
    capacity_volume_l: 50,
    notes: 'Flying to Berlin for a business conference. Happy to carry small packages.',
    carry_types: ['items', 'documents'],
  },
  {
    from_country: 'United Kingdom',
    from_city: 'London',
    to_country: 'France',
    to_city: 'Paris',
    depart_date: getFutureDate(5),
    arrive_date: getFutureDate(5),
    capacity_weight_kg: null, // Capacity not specified - contact traveler
    capacity_volume_l: 30,
    notes: 'Taking the Eurostar to Paris for the weekend. Contact me for capacity details.',
    carry_types: ['items', 'documents'],
  },
  {
    from_country: 'Germany',
    from_city: 'Munich (München)',
    to_country: 'Italy',
    to_city: 'Rome',
    depart_date: getFutureDate(7),
    arrive_date: getFutureDate(8),
    capacity_weight_kg: 20,
    capacity_volume_l: 60,
    notes: 'Road trip to Rome. Plenty of space available in my car.',
    carry_types: ['items', 'space', 'weight'],
  },
  {
    from_country: 'India',
    from_city: 'Mumbai',
    to_country: 'United Kingdom',
    to_city: 'London',
    depart_date: getFutureDate(10),
    arrive_date: getFutureDate(11),
    capacity_weight_kg: 12,
    capacity_volume_l: 40,
    notes: 'Relocating to London. Can carry packages and looking for travel companions!',
    carry_types: ['items', 'documents', 'weight'],
  },
  {
    from_country: 'Spain',
    from_city: 'Madrid',
    to_country: 'Portugal',
    to_city: 'Lisbon',
    depart_date: getFutureDate(4),
    arrive_date: getFutureDate(4),
    capacity_weight_kg: null, // Contact for details
    capacity_volume_l: 25,
    notes: 'Short trip to Lisbon. Happy to help, message me for capacity details.',
    carry_types: ['items', 'documents'],
  },
  {
    from_country: 'Netherlands',
    from_city: 'Amsterdam',
    to_country: 'Germany',
    to_city: 'Berlin',
    depart_date: getFutureDate(6),
    arrive_date: getFutureDate(6),
    capacity_weight_kg: 15,
    capacity_volume_l: 45,
    notes: 'Business trip to Berlin. Happy to help with deliveries.',
    carry_types: ['items', 'documents', 'weight'],
  },
  {
    from_country: 'India',
    from_city: 'Bengaluru (Bangalore)',
    to_country: 'China',
    to_city: 'Shanghai',
    depart_date: getFutureDate(12),
    arrive_date: getFutureDate(13),
    capacity_weight_kg: 18,
    capacity_volume_l: 55,
    notes: 'Tech conference in Shanghai. Can carry tech items and documents.',
    carry_types: ['items', 'documents'],
  },
  {
    from_country: 'France',
    from_city: 'Paris',
    to_country: 'Switzerland',
    to_city: 'Geneva',
    depart_date: getFutureDate(8),
    arrive_date: getFutureDate(8),
    capacity_weight_kg: 10,
    capacity_volume_l: 35,
    notes: 'Day trip to Geneva. Looking for travel companions to share the journey!',
    carry_types: ['items', 'documents'],
  },
  {
    from_country: 'Japan',
    from_city: 'Tokyo',
    to_country: 'South Korea',
    to_city: 'Seoul',
    depart_date: getFutureDate(15),
    arrive_date: getFutureDate(16),
    capacity_weight_kg: null, // Flexible - contact me
    capacity_volume_l: 42,
    notes: 'Vacation to Seoul. Flexible with capacity, happy to help and meet fellow travelers!',
    carry_types: ['items', 'space'],
  },
  {
    from_country: 'India',
    from_city: 'Chennai',
    to_country: 'Nepal',
    to_city: 'Kathmandu',
    depart_date: getFutureDate(9),
    arrive_date: getFutureDate(10),
    capacity_weight_kg: 16,
    capacity_volume_l: 50,
    notes: 'Trekking trip to Nepal. Can carry lightweight items.',
    carry_types: ['items', 'weight'],
  },
  {
    from_country: 'Germany',
    from_city: 'Frankfurt am Main',
    to_country: 'Netherlands',
    to_city: 'Amsterdam',
    depart_date: getFutureDate(2),
    arrive_date: getFutureDate(2),
    capacity_weight_kg: 12,
    capacity_volume_l: 38,
    notes: 'Quick business trip. Can help with urgent deliveries.',
    carry_types: ['items', 'documents'],
  },
  {
    from_country: 'Sweden',
    from_city: 'Stockholm',
    to_country: 'Finland',
    to_city: 'Helsinki',
    depart_date: getFutureDate(11),
    arrive_date: getFutureDate(11),
    capacity_weight_kg: 9,
    capacity_volume_l: 30,
    notes: 'Ferry to Helsinki. Looking for companions to share the journey!',
    carry_types: ['items', 'documents'],
  }
]

// Diverse traveler names for dummy users
const dummyTravelers = [
  { name: 'Priya Sharma', email: 'priya.sharma@carrybridge.com' },
  { name: 'James Anderson', email: 'james.anderson@carrybridge.com' },
  { name: 'Maria Garcia', email: 'maria.garcia@carrybridge.com' },
  { name: 'Raj Patel', email: 'raj.patel@carrybridge.com' },
  { name: 'Emma Wilson', email: 'emma.wilson@carrybridge.com' },
  { name: 'Chen Wei', email: 'chen.wei@carrybridge.com' },
  { name: 'Sophie Martin', email: 'sophie.martin@carrybridge.com' },
  { name: 'Ahmed Hassan', email: 'ahmed.hassan@carrybridge.com' },
  { name: 'Isabella Silva', email: 'isabella.silva@carrybridge.com' },
  { name: 'Hiroshi Tanaka', email: 'hiroshi.tanaka@carrybridge.com' },
  { name: 'Anna Kowalski', email: 'anna.kowalski@carrybridge.com' },
  { name: 'David Kim', email: 'david.kim@carrybridge.com' }
]

export async function GET(request: NextRequest) {
  try {
    if (!supabaseServer) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Optional: Add authentication/authorization here
    // For production, you should verify this is coming from a cron job or admin user

    console.log('🌱 Starting to seed trips via API...')

    // Get all existing users to assign as travelers
    let { data: profiles, error: profilesError } = await supabaseServer
      .from('profiles')
      .select('id, name')

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError)
      return NextResponse.json(
        { error: 'Failed to fetch profiles', details: profilesError.message },
        { status: 500 }
      )
    }

    // Create dummy users if we don't have enough
    if (!profiles || profiles.length < 12) {
      console.log(`⚠️  Only ${profiles?.length || 0} users found. Creating dummy travelers...`)
      
      const neededUsers = 12 - (profiles?.length || 0)
      const createdProfiles: any[] = []
      
      for (let i = 0; i < neededUsers && i < dummyTravelers.length; i++) {
        const traveler = dummyTravelers[i]
        
        // Check if user already exists
        const { data: existingUser } = await supabaseServer.auth.admin.listUsers()
        const userExists = existingUser?.users.some(u => u.email === traveler.email)
        
        if (!userExists) {
          const { data: authData, error: authError } = await supabaseServer.auth.admin.createUser({
            email: traveler.email,
            password: 'TravelerDemo123!',
            email_confirm: true,
            user_metadata: {
              name: traveler.name
            }
          })

          if (authError) {
            console.error(`❌ Error creating user ${traveler.name}:`, authError.message)
            continue
          }

          createdProfiles.push({
            id: authData.user.id,
            name: traveler.name
          })
          
          console.log(`✅ Created traveler: ${traveler.name}`)
        }
      }
      
      profiles = [...(profiles || []), ...createdProfiles]
    }

    console.log(`📊 Found ${profiles.length} users to assign as travelers`)

    // Delete old seed trips (keeps data fresh)
    const { error: deleteError } = await supabaseServer
      .from('trips')
      .delete()
      .lt('depart_date', getFutureDate(0)) // Delete trips with past departure dates

    if (deleteError) {
      console.log('⚠️  Could not delete old trips:', deleteError.message)
    } else {
      console.log('🗑️  Cleaned up old trips')
    }

    // Insert new trips
    let successCount = 0
    const insertedTrips = []

    for (let i = 0; i < dummyTrips.length; i++) {
      const trip = dummyTrips[i]
      const randomProfile = profiles[i % profiles.length]

      const { data: insertedTrip, error: insertError } = await supabaseServer
        .from('trips')
        .insert({
          ...trip,
          traveler_id: randomProfile.id
        })
        .select()
        .single()

      if (insertError) {
        console.error(`❌ Error inserting trip ${i + 1}:`, insertError.message)
      } else {
        successCount++
        insertedTrips.push(insertedTrip)
        console.log(`✅ Trip ${i + 1}/${dummyTrips.length}: ${trip.from_city} → ${trip.to_city}`)
      }
    }

    console.log('\n🎉 Seeding complete!')
    console.log(`✅ Successfully added ${successCount}/${dummyTrips.length} trips`)

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${successCount} trips`,
      trips: insertedTrips,
      stats: {
        total: dummyTrips.length,
        successful: successCount,
        failed: dummyTrips.length - successCount,
        dateRange: {
          from: getFutureDate(2),
          to: getFutureDate(15)
        }
      }
    })
  } catch (error: any) {
    console.error('❌ Fatal error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

