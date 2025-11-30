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
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (!supabaseServer) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Find user by email
    const { data: { users }, error: userError } = await supabaseServer.auth.admin.listUsers()

    if (userError) {
      return NextResponse.json({ error: 'Failed to find user' }, { status: 500 })
    }

    const user = users.find(u => u.email === email)

    if (!user) {
      // Don't reveal if user exists for security
      return NextResponse.json({ 
        message: 'If an account exists with this email, a verification code will be sent.' 
      }, { status: 200 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseServer
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ 
        message: 'If an account exists with this email, a verification code will be sent.' 
      }, { status: 200 })
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
      message: 'Verification code sent successfully! Check your inbox.' 
    }, { status: 200 })
  } catch (error: any) {
    console.error('❌ Resend verification code error:', error)
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 })
  }
}

