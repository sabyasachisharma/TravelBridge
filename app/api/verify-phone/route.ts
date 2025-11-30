import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendOTPAsync } from '@/lib/sms'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// POST - Send phone verification code or verify code
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, code } = body

    if (action === 'send') {
      // Check that phone number exists for this user
      const { data: profileData, error: profileCheckError } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', user.id)
        .single()

      if (profileCheckError) {
        return NextResponse.json({ error: profileCheckError.message }, { status: 500 })
      }

      if (!profileData?.phone) {
        return NextResponse.json({ error: 'No phone number found. Please add a phone number first.' }, { status: 400 })
      }

      // Generate 6-digit verification code (ensures exactly 6 digits)
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

      // Update profile with verification code and reset verified status
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          phone_verification_code: verificationCode,
          phone_verification_expires_at: expiresAt.toISOString(),
          phone_verified: false, // Reset verification when new code is sent
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      // Send OTP via SMS asynchronously (non-blocking)
      // Make sure phone number is in correct format
      const phoneNumber = profileData.phone.trim()
      if (!phoneNumber.startsWith('+')) {
        console.error('❌ Phone number must be in E.164 format:', phoneNumber)
        return NextResponse.json({ 
          error: 'Invalid phone number format. Phone number must include country code (e.g., +1234567890)',
          code: process.env.NODE_ENV === 'development' ? verificationCode : undefined
        }, { status: 400 })
      }

      sendOTPAsync(phoneNumber, verificationCode)

      // Log for development/testing (remove in production or use proper logging)
      if (process.env.NODE_ENV === 'development') {
        console.log(`📱 Phone verification code for user ${user.id} (${phoneNumber}): ${verificationCode}`)
        console.log(`📱 SMS will be sent to: ${phoneNumber}`)
      }

      return NextResponse.json({ 
        message: 'Verification code sent successfully to your phone',
        // Only return code in development for testing
        code: process.env.NODE_ENV === 'development' ? verificationCode : undefined
      })
    } 
    
    else if (action === 'verify') {
      if (!code) {
        return NextResponse.json({ error: 'Verification code required' }, { status: 400 })
      }

      // Normalize and validate code format (must be exactly 6 digits)
      const normalizedCode = code.toString().trim().replace(/\D/g, '')
      if (normalizedCode.length !== 6) {
        return NextResponse.json({ error: 'Verification code must be exactly 6 digits' }, { status: 400 })
      }

      // Check that phone number exists for this user
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('phone, phone_verification_code, phone_verification_expires_at')
        .eq('id', user.id)
        .single()

      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 500 })
      }

      if (!profileData?.phone) {
        return NextResponse.json({ error: 'No phone number found. Please add a phone number first.' }, { status: 400 })
      }

      if (!profileData?.phone_verification_code) {
        return NextResponse.json({ error: 'No verification code found. Please request a new code.' }, { status: 400 })
      }

      // Check if code has expired
      if (profileData.phone_verification_expires_at) {
        const expiresAt = new Date(profileData.phone_verification_expires_at)
        if (expiresAt < new Date()) {
          return NextResponse.json({ error: 'Verification code has expired. Please request a new code.' }, { status: 400 })
        }
      }

      // Verify code (case-sensitive string comparison for security)
      if (profileData.phone_verification_code !== normalizedCode) {
        return NextResponse.json({ error: 'Invalid verification code. Please check and try again.' }, { status: 400 })
      }

      // Mark phone as verified and clear verification code
      const { error: verifyError } = await supabase
        .from('profiles')
        .update({
          phone_verified: true,
          phone_verification_code: null,
          phone_verification_expires_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (verifyError) {
        return NextResponse.json({ error: verifyError.message }, { status: 500 })
      }

      return NextResponse.json({ 
        message: 'Phone number verified successfully',
        verified: true
      })
    }

    else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

