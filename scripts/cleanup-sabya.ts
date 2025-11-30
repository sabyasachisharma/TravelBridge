import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function cleanupSabya() {
  console.log('🧹 Starting cleanup of sabya user...')

  try {
    // Find the sabya user
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, name')
      .ilike('name', '%sabya%')

    if (profileError) {
      console.error('❌ Error fetching profiles:', profileError)
      return
    }

    if (!profiles || profiles.length === 0) {
      console.log('✅ No "sabya" user found. Nothing to clean up.')
      return
    }

    console.log(`📊 Found ${profiles.length} profile(s) matching "sabya"`)

    for (const profile of profiles) {
      console.log(`\n🔍 Processing user: ${profile.name} (${profile.id})`)

      // Delete trips by this user
      const { data: trips, error: tripsError } = await supabase
        .from('trips')
        .delete()
        .eq('traveler_id', profile.id)
        .select()

      if (tripsError) {
        console.error(`❌ Error deleting trips for ${profile.name}:`, tripsError.message)
      } else {
        console.log(`✅ Deleted ${trips?.length || 0} trip(s) for ${profile.name}`)
      }

      // Delete the profile
      const { error: deleteProfileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profile.id)

      if (deleteProfileError) {
        console.error(`❌ Error deleting profile ${profile.name}:`, deleteProfileError.message)
      } else {
        console.log(`✅ Deleted profile: ${profile.name}`)
      }

      // Delete from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(profile.id)

      if (authError) {
        console.error(`❌ Error deleting auth user ${profile.name}:`, authError.message)
      } else {
        console.log(`✅ Deleted auth user: ${profile.name}`)
      }
    }

    console.log('\n🎉 Cleanup complete!')
    console.log('✅ All "sabya" users and their trips have been removed')
  } catch (error) {
    console.error('❌ Fatal error:', error)
  }
}

// Run the cleanup
cleanupSabya()

