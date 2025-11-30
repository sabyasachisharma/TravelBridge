import { supabaseServer } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

/**
 * DELETE ALL USERS - Development/Testing Only!
 * 
 * WARNING: This will delete ALL users from auth.users and profiles tables
 * 
 * Usage:
 *   1. Go to http://localhost:3000/api/admin/delete-users
 *   2. Or use curl: curl -X POST http://localhost:3000/api/admin/delete-users
 */

export async function POST(request: NextRequest) {
  try {
    // Safety check - only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'This endpoint is disabled in production' },
        { status: 403 }
      )
    }

    if (!supabaseServer) {
      return NextResponse.json(
        { error: 'Supabase server not initialized' },
        { status: 500 }
      )
    }

    console.log('🔍 Fetching all users...')

    // Get all users from auth.users
    const { data: { users }, error: listError } = await supabaseServer.auth.admin.listUsers()

    if (listError) {
      console.error('❌ Error listing users:', listError)
      return NextResponse.json(
        { error: listError.message },
        { status: 500 }
      )
    }

    if (!users || users.length === 0) {
      console.log('✅ No users found')
      return NextResponse.json({
        message: 'No users to delete',
        deleted: 0,
        users: []
      })
    }

    console.log(`📋 Found ${users.length} user(s)`)

    const deletedUsers: any[] = []
    const errors: any[] = []

    // Delete each user
    for (const user of users) {
      try {
        const { error } = await supabaseServer.auth.admin.deleteUser(user.id)
        
        if (error) {
          console.error(`❌ Failed to delete ${user.email}:`, error.message)
          errors.push({ email: user.email, error: error.message })
        } else {
          console.log(`✅ Deleted ${user.email}`)
          deletedUsers.push({ email: user.email, id: user.id })
        }
      } catch (err: any) {
        console.error(`❌ Error deleting ${user.email}:`, err.message)
        errors.push({ email: user.email, error: err.message })
      }
    }

    console.log('\n🎉 Cleanup complete!')
    console.log(`✅ Deleted: ${deletedUsers.length}`)
    console.log(`❌ Failed: ${errors.length}`)

    return NextResponse.json({
      message: 'User cleanup complete',
      deleted: deletedUsers.length,
      failed: errors.length,
      users: deletedUsers,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error: any) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// Also support GET for easy browser access
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'User Cleanup Endpoint',
    warning: '⚠️  This will delete ALL users!',
    instructions: [
      '1. Send a POST request to this endpoint',
      '2. Or use curl: curl -X POST http://localhost:3000/api/admin/delete-users',
      '3. Or create a button in your UI to call this endpoint'
    ],
    note: 'This endpoint is only available in development mode'
  })
}

