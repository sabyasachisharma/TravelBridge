import { supabaseServer } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    if (!supabaseServer) {
      console.error('❌ Supabase server client not initialized!')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    console.log('🔄 Processing password reset...')

    // Find profile with this reset token
    const { data: profiles, error: searchError } = await supabaseServer
      .from('profiles')
      .select('*')
      .like('verification_token', `reset_${token}_%`)

    if (searchError || !profiles || profiles.length === 0) {
      console.error('❌ Invalid token:', searchError)
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    const profile = profiles[0]

    // Extract expiry time from token
    const tokenParts = profile.verification_token.split('_')
    const expiryTime = parseInt(tokenParts[tokenParts.length - 1])

    // Check if token is expired
    if (Date.now() > expiryTime) {
      console.log('❌ Token expired')
      return NextResponse.json(
        { error: 'Reset link has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Update password in Supabase Auth
    const { error: updateError } = await supabaseServer.auth.admin.updateUserById(
      profile.id,
      { password }
    )

    if (updateError) {
      console.error('❌ Error updating password:', updateError)
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      )
    }

    // Clear reset token
    const { error: clearError } = await supabaseServer
      .from('profiles')
      .update({ verification_token: null })
      .eq('id', profile.id)

    if (clearError) {
      console.warn('⚠️ Error clearing token:', clearError)
      // Don't fail the request
    }

    console.log('✅ Password updated successfully for user:', profile.id)

    return NextResponse.json({
      message: 'Password updated successfully'
    })

  } catch (error: any) {
    console.error('❌ Reset password error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

