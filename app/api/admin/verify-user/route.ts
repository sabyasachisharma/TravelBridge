import { supabaseServer } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Manually Verify User - For Testing Without Email
 * 
 * This endpoint manually verifies a user when email service is not configured
 * 
 * Usage:
 *   GET /api/admin/verify-user?email=user@example.com
 *   Or verify latest user: GET /api/admin/verify-user?latest=true
 */

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')
    const latest = searchParams.get('latest') === 'true'

    let profile

    if (latest) {
      // Verify the most recently created user
      const { data, error } = await supabaseServer
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error || !data) {
        return NextResponse.json(
          { error: 'No users found' },
          { status: 404 }
        )
      }

      profile = data
    } else if (email) {
      // Find user by email (need to join with auth.users)
      const { data: { users }, error: authError } = await supabaseServer.auth.admin.listUsers()

      if (authError) {
        return NextResponse.json(
          { error: 'Failed to fetch users' },
          { status: 500 }
        )
      }

      const user = users.find(u => u.email === email)

      if (!user) {
        return NextResponse.json(
          { error: `User not found with email: ${email}` },
          { status: 404 }
        )
      }

      const { data, error } = await supabaseServer
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error || !data) {
        return NextResponse.json(
          { error: 'Profile not found' },
          { status: 404 }
        )
      }

      profile = data
    } else {
      return NextResponse.json(
        { 
          error: 'Missing parameter',
          usage: 'Add ?email=user@example.com or ?latest=true'
        },
        { status: 400 }
      )
    }

    // Check if already verified
    if (profile.user_verified) {
      console.log('✅ User already verified:', profile.name)
      return NextResponse.json({
        message: 'User already verified',
        user: {
          id: profile.id,
          name: profile.name,
          verified: true
        }
      })
    }

    // Verify the user
    const { error: updateError } = await supabaseServer
      .from('profiles')
      .update({
        user_verified: true,
        verification_token: null
      })
      .eq('id', profile.id)

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    console.log('✅ User manually verified:', profile.name)

    return NextResponse.json({
      success: true,
      message: '✅ User verified successfully!',
      user: {
        id: profile.id,
        name: profile.name,
        verified: true
      },
      next_steps: [
        'User can now login at http://localhost:3000/auth',
        'User can post trips and access all features',
        'No email verification banner will show'
      ]
    })

  } catch (error: any) {
    console.error('❌ Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

