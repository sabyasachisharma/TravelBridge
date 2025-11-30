import { supabaseServer } from '@/lib/supabase'
import { emailTemplates, sendEmailAsync } from '@/lib/email'
import { NextRequest, NextResponse } from 'next/server'

// Generate 4-digit alphanumeric verification code
function generateVerificationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function POST(request: NextRequest) {
  try {
    // Get user from authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify the token and get user
    const { data: { user }, error: userError } = await supabaseServer.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseServer
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Check if already verified
    if (profile.user_verified) {
      return NextResponse.json({ 
        message: 'Email is already verified' 
      }, { status: 200 })
    }

    // Generate new 4-digit alphanumeric verification code
    const verificationCode = generateVerificationCode()

    // Update profile with new code
    const { error: updateError } = await supabaseServer
      .from('profiles')
      .update({ verification_token: verificationCode })
      .eq('id', user.id)

    if (updateError) {
      console.error('❌ Error updating verification code:', updateError)
      return NextResponse.json({ 
        error: 'Failed to generate verification code' 
      }, { status: 500 })
    }

    // Send verification email asynchronously (non-blocking)
    sendEmailAsync(
      emailTemplates.emailVerificationEmail(
        user.email || '',
        profile.name,
        verificationCode
      )
    )
    
    console.log('📧 Verification email queued for:', user.email)
    
    // Return immediately - don't wait for email to send
    return NextResponse.json({ 
      message: 'Verification email sent successfully! Check your inbox.' 
    }, { status: 200 })
  } catch (error: any) {
    console.error('❌ Resend verification error:', error)
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 })
  }
}

