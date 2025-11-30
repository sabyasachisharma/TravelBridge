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
    const { email, password, name, action } = await request.json()

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    if (action === 'signup') {
      // Check if supabaseServer is initialized
      if (!supabaseServer) {
        console.error('❌ Supabase server client not initialized!')
        console.error('Make sure SUPABASE_SERVICE_ROLE_KEY is set in .env.local')
        return NextResponse.json(
          { error: 'Server configuration error. Please check environment variables.' },
          { status: 500 }
        )
      }

      console.log('🔄 Creating user:', email)

      // Generate 4-digit alphanumeric verification code
      const verificationCode = generateVerificationCode()

      // Create user in Supabase
      const { data, error } = await supabaseServer.auth.admin.createUser({
        email,
        password,
        user_metadata: { name },
        email_confirm: true,
      })

      if (error) {
        console.error('❌ Supabase signup error:', error)
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      console.log('✅ User created successfully:', data.user?.id)

      // Update profile with verification token
      if (data.user) {
        try {
          const { error: profileError } = await supabaseServer
            .from('profiles')
            .update({ 
              verification_token: verificationCode,
              user_verified: false 
            })
            .eq('id', data.user.id)

          if (profileError) {
            console.error('❌ Profile update error:', profileError)
          }

          // Send verification email asynchronously (non-blocking)
          // This won't delay the registration response
          sendEmailAsync(
            emailTemplates.emailVerificationEmail(email, name, verificationCode)
          )
          console.log('📧 Verification email queued for:', email)
        } catch (error) {
          console.error('❌ Error in post-signup process:', error)
        }
      }

      return NextResponse.json({ 
        user: data.user,
        message: 'Account created! Please check your email to verify your account.' 
      }, { status: 201 })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('❌ Auth error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
