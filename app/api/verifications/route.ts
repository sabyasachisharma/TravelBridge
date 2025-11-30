import { supabaseServer, supabaseClient } from '@/lib/supabase'
import { emailTemplates, sendEmailAsync } from '@/lib/email'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
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

    const { data, error } = await supabaseClient
      .from('verifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ verification: data?.[0] || null })
  } catch (error) {
    console.error('Get verification error:', error)
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

    const formData = await request.formData()
    const docType = formData.get('doc_type') as string
    const files = formData.getAll('files') as File[]

    if (!docType || files.length === 0) {
      return NextResponse.json(
        { error: 'doc_type and files are required' },
        { status: 400 }
      )
    }

    // Upload files to Supabase Storage
    const docUrls: string[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileName = `${user.id}-${docType}-${i}-${Date.now()}`
      
      const { data, error } = await supabaseServer.storage
        .from('verifications')
        .upload(fileName, file)

      if (error) {
        console.error('Upload error:', error)
        continue
      }

      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/verifications/${data.path}`
      docUrls.push(url)
    }

    if (docUrls.length === 0) {
      return NextResponse.json({ error: 'File upload failed' }, { status: 500 })
    }

    // Create or update verification record
    const { data: existing } = await supabaseServer
      .from('verifications')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'rejected')
      .limit(1)

    let verificationData
    if (existing && existing.length > 0) {
      const { data, error } = await supabaseServer
        .from('verifications')
        .update({
          doc_type: docType,
          doc_urls: docUrls,
          status: 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing[0].id)
        .select()

      verificationData = data?.[0]
    } else {
      const { data, error } = await supabaseServer
        .from('verifications')
        .insert([
          {
            user_id: user.id,
            doc_type: docType,
            doc_urls: docUrls,
            status: 'pending',
          },
        ])
        .select()

      verificationData = data?.[0]
    }

    // Send pending email asynchronously (non-blocking)
    const profile = await supabaseClient.from('profiles').select('name').eq('id', user.id).single()
    const userName = profile.data?.name || user.email
    sendEmailAsync(emailTemplates.verificationPendingEmail(user.email!, userName))
    console.log('📧 Verification pending email queued for:', user.email)

    return NextResponse.json({ verification: verificationData }, { status: 201 })
  } catch (error) {
    console.error('Create verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
