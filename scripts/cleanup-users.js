#!/usr/bin/env node

/**
 * Script to delete all users from Supabase (for development/testing only!)
 * 
 * Usage:
 *   node scripts/cleanup-users.js
 * 
 * Or with email filter:
 *   node scripts/cleanup-users.js user@example.com
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function deleteAllUsers() {
  try {
    console.log('🔍 Fetching all users...\n')

    // Get all users
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
      console.error('❌ Error fetching users:', listError)
      return
    }

    if (!users || users.length === 0) {
      console.log('✅ No users found. Database is clean!')
      return
    }

    console.log(`📋 Found ${users.length} user(s):\n`)
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.id})`)
    })

    console.log('\n⚠️  WARNING: This will DELETE ALL users!')
    console.log('Press Ctrl+C to cancel...\n')

    // Wait 3 seconds to allow cancellation
    await new Promise(resolve => setTimeout(resolve, 3000))

    console.log('🗑️  Deleting users...\n')

    // Delete each user
    for (const user of users) {
      try {
        const { error } = await supabase.auth.admin.deleteUser(user.id)
        if (error) {
          console.error(`❌ Failed to delete ${user.email}:`, error.message)
        } else {
          console.log(`✅ Deleted ${user.email}`)
        }
      } catch (err) {
        console.error(`❌ Error deleting ${user.email}:`, err.message)
      }
    }

    console.log('\n🎉 Cleanup complete!')
    console.log('All users have been deleted from both auth.users and profiles tables.')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

async function deleteUserByEmail(email) {
  try {
    console.log(`🔍 Searching for user: ${email}\n`)

    // Get all users and find by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
      console.error('❌ Error fetching users:', listError)
      return
    }

    const user = users.find(u => u.email === email)

    if (!user) {
      console.log(`❌ User not found: ${email}`)
      console.log('\nAvailable users:')
      users.forEach(u => console.log(`  - ${u.email}`))
      return
    }

    console.log(`Found user: ${user.email} (${user.id})`)
    console.log('\n⚠️  Deleting user in 2 seconds...')
    await new Promise(resolve => setTimeout(resolve, 2000))

    const { error } = await supabase.auth.admin.deleteUser(user.id)

    if (error) {
      console.error('❌ Failed to delete user:', error)
    } else {
      console.log('✅ User deleted successfully!')
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Main
const emailArg = process.argv[2]

if (emailArg) {
  deleteUserByEmail(emailArg)
} else {
  deleteAllUsers()
}

