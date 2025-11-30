import { supabaseServer, supabaseClient } from '@/lib/supabase'
import { emailTemplates, sendEmailAsync } from '@/lib/email'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const fromCity = searchParams.get('from_city')
    const toCity = searchParams.get('to_city')
    const departDate = searchParams.get('depart_date')

    let query = supabaseClient
      .from('trips')
      .select('*, profiles:traveler_id(name)')
      .order('created_at', { ascending: false })

    if (fromCity) query = query.ilike('from_city', `%${fromCity}%`)
    if (toCity) query = query.ilike('to_city', `%${toCity}%`)
    if (departDate) query = query.gte('depart_date', departDate)

    const { data, error } = await query.limit(50)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ trips: data })
  } catch (error) {
    console.error('Get trips error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
    } = await supabaseServer.auth.getUser(token)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const { data, error } = await supabaseServer.from('trips').insert([
      {
        traveler_id: user.id,
        from_city: body.from_city,
        from_country: body.from_country,
        to_city: body.to_city,
        to_country: body.to_country,
        depart_date: body.depart_date,
        arrive_date: body.arrive_date,
        capacity_weight_kg: body.capacity_weight_kg || 10,
        capacity_volume_l: body.capacity_volume_l || 30,
        carry_types: body.carry_types || ['items', 'documents'],
        notes: body.notes || '',
        show_email: body.show_email !== undefined ? body.show_email : true,
        show_phone: body.show_phone !== undefined ? body.show_phone : false,
      },
    ]).select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Send email notification asynchronously (non-blocking)
    const profile = await supabaseServer.from('profiles').select('name').eq('id', user.id).single()
    const userEmail = user.email!
    const userName = profile.data?.name || user.email
    sendEmailAsync(emailTemplates.tripPostedEmail(
      userEmail,
      userName,
      `${body.from_city}, ${body.from_country}`,
      `${body.to_city}, ${body.to_country}`
    ))
    console.log('📧 Trip posted email queued for:', userEmail)

    return NextResponse.json({ trip: data?.[0] }, { status: 201 })
  } catch (error) {
    console.error('Create trip error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
