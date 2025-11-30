import { supabaseServer } from '@/lib/supabase'
import { emailTemplates, sendEmailAsync } from '@/lib/email'
import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
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

    console.log('🔄 Processing password reset request for:', email)

    // Find user by email
    const { data: { users }, error: userError } = await supabaseServer.auth.admin.listUsers()

    if (userError) {
      console.error('❌ Error fetching users:', userError)
      return NextResponse.json(
        { error: 'Failed to process request' },
        { status: 500 }
      )
    }

    const user = users.find((u: { email?: string }) => u.email === email)

    // Always return success even if user doesn't exist (security best practice)
    if (!user) {
      console.log('⚠️ User not found, but returning success for security')
      return NextResponse.json({
        message: 'If an account exists with this email, you will receive a password reset link.'
      })
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    // Get profile
    const { data: profile, error: profileError } = await supabaseServer
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('❌ Profile not found:', profileError)
      return NextResponse.json({
        message: 'If an account exists with this email, you will receive a password reset link.'
      })
    }

    // Store reset token in profile (we'll use verification_token field)
    const { error: updateError } = await supabaseServer
      .from('profiles')
      .update({
        verification_token: `reset_${resetToken}_${expiresAt.getTime()}`
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('❌ Error storing reset token:', updateError)
      return NextResponse.json(
        { error: 'Failed to generate reset link' },
        { status: 500 }
      )
    }

    // Send password reset email asynchronously (non-blocking)
    sendEmailAsync(
      emailTemplates.passwordResetEmail(email, profile.name, resetToken)
    )
    console.log('📧 Password reset email queued for:', email)

    return NextResponse.json({
      message: 'If an account exists with this email, you will receive a password reset link.'
    })

  } catch (error: any) {
    console.error('❌ Forgot password error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

