import { supabaseServer } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, email } = body

    if (!code) {
      return NextResponse.json(
        { success: false, message: 'Verification code is required' },
        { status: 400 }
      )
    }

    // Validate code format (4 alphanumeric characters)
    if (!/^[A-Z0-9]{4}$/.test(code.toUpperCase())) {
      return NextResponse.json(
        { success: false, message: 'Invalid verification code format' },
        { status: 400 }
      )
    }

    console.log('🔄 Verifying email with code...')

    if (!supabaseServer) {
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Normalize code to uppercase for comparison
    const normalizedCode = code.toUpperCase()

    // Find profile by verification code
    const { data: profile, error: profileError } = await supabaseServer
      .from('profiles')
      .select('*')
      .eq('verification_token', normalizedCode)
      .single()

    if (profileError || !profile) {
      console.error('❌ Invalid or expired verification code')
      return NextResponse.json(
        { success: false, message: 'Invalid or expired verification code' },
        { status: 400 }
      )
    }

    // If email is provided, verify it matches the profile's user
    if (email) {
      const { data: { user }, error: userError } = await supabaseServer.auth.admin.getUserById(profile.id)
      if (userError || !user || user.email !== email) {
        return NextResponse.json(
          { success: false, message: 'Verification code does not match the provided email' },
          { status: 400 }
        )
      }
    }

    // Check if already verified
    if (profile.user_verified) {
      console.log('✅ Email already verified')
      return NextResponse.json(
        { success: true, message: 'Email already verified. Please login.' },
        { status: 200 }
      )
    }

    // Update profile to mark as verified and clear code
    const { error: updateError } = await supabaseServer
      .from('profiles')
      .update({
        user_verified: true,
        verification_token: null,
      })
      .eq('id', profile.id)

    if (updateError) {
      console.error('❌ Error updating profile:', updateError)
      return NextResponse.json(
        { success: false, message: 'Verification failed. Please try again.' },
        { status: 500 }
      )
    }

    console.log('✅ Email verified successfully for user:', profile.id)

    return NextResponse.json(
      { success: true, message: 'Email verified successfully!' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('❌ Email verification error:', error)
    return NextResponse.json(
      { success: false, message: 'Verification failed' },
      { status: 500 }
    )
  }
}

// Keep GET method for backward compatibility (old token-based verification)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Invalid verification link' },
        { status: 400 }
      )
    }

    console.log('🔄 Verifying email with token (legacy)...')

    if (!supabaseServer) {
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Find user by verification token
    const { data: profile, error: profileError } = await supabaseServer
      .from('profiles')
      .select('*')
      .eq('verification_token', token)
      .single()

    if (profileError || !profile) {
      console.error('❌ Invalid or expired verification token')
      return NextResponse.json(
        { success: false, message: 'Invalid or expired verification link' },
        { status: 400 }
      )
    }

    // Check if already verified
    if (profile.user_verified) {
      console.log('✅ Email already verified')
      return NextResponse.json(
        { success: true, message: 'Email already verified. Please login.' },
        { status: 200 }
      )
    }

    // Update profile to mark as verified and clear token
    const { error: updateError } = await supabaseServer
      .from('profiles')
      .update({
        user_verified: true,
        verification_token: null,
      })
      .eq('id', profile.id)

    if (updateError) {
      console.error('❌ Error updating profile:', updateError)
      return NextResponse.json(
        { success: false, message: 'Verification failed. Please try again.' },
        { status: 500 }
      )
    }

    console.log('✅ Email verified successfully for user:', profile.id)

    return NextResponse.json(
      { success: true, message: 'Email verified successfully!' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('❌ Email verification error:', error)
    return NextResponse.json(
      { success: false, message: 'Verification failed' },
      { status: 500 }
    )
  }
}

