import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    if (!supabaseServer) {
      return NextResponse.json({ error: 'Supabase server not initialized' }, { status: 500 })
    }

    // Fetch user from auth.users
    const { data: { user }, error } = await supabaseServer.auth.admin.getUserById(userId)

    if (error) {
      console.error('Error fetching user email:', error)
      return NextResponse.json({ email: null })
    }

    return NextResponse.json({ email: user?.email || null })
  } catch (error) {
    console.error('Error in user-email API:', error)
    return NextResponse.json({ email: null })
  }
}

