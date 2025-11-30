import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// GET - Fetch user profile
export async function GET(request: NextRequest) {
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

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ profile })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
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
    const { name, bio, home_city, languages, phone } = body

    // Build update object - only include fields that are provided
    const updates: any = {
      updated_at: new Date().toISOString()
    }

    if (name !== undefined) updates.name = name
    if (bio !== undefined) updates.bio = bio
    if (home_city !== undefined) updates.home_city = home_city
    if (languages !== undefined) updates.languages = languages
    
    // If phone is being updated and it's different from current, reset verification
    if (phone !== undefined) {
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', user.id)
        .single()

      if (currentProfile && currentProfile.phone !== phone) {
        updates.phone = phone
        updates.phone_verified = false
        updates.phone_verification_code = null
        updates.phone_verification_expires_at = null
      } else if (!currentProfile?.phone) {
        updates.phone = phone
        updates.phone_verified = false
      }
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      profile: data 
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

