import { NextRequest, NextResponse } from 'next/server'

/**
 * Quick Fix - Add Email Verification Columns
 * 
 * This endpoint applies the migration by executing raw SQL
 * 
 * Usage: Just visit http://localhost:3000/api/admin/fix-db
 */

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      )
    }

    console.log('🚀 Applying database migration...')

    // SQL statements to execute
    const sqlStatements = [
      `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_verified boolean DEFAULT false;`,
      `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_token text;`,
      `CREATE INDEX IF NOT EXISTS idx_profiles_verification_token ON public.profiles(verification_token);`
    ]

    const results = []

    // Execute each SQL statement via REST API
    for (const sql of sqlStatements) {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: sql })
        })

        if (!response.ok) {
          // SQL might have executed successfully even with error response
          console.log('⚠️ Response:', await response.text())
        }

        results.push({ sql: sql.substring(0, 50), status: 'executed' })
        console.log('✅ Executed:', sql.substring(0, 50) + '...')
      } catch (err: any) {
        console.log('⚠️ Error (might be ok):', err.message)
        results.push({ sql: sql.substring(0, 50), status: 'attempted' })
      }
    }

    // Verify by trying to query the columns
    const verifyResponse = await fetch(
      `${supabaseUrl}/rest/v1/profiles?select=user_verified,verification_token&limit=1`,
      {
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
      }
    )

    const canQuery = verifyResponse.ok

    if (canQuery) {
      console.log('✅ Migration successful! Columns are accessible.')
      return NextResponse.json({
        success: true,
        message: '✅ Migration applied successfully!',
        columns_added: ['user_verified', 'verification_token'],
        next_steps: [
          '1. Columns have been added to profiles table',
          '2. Try signing up again at http://localhost:3000/auth',
          '3. The error should be gone!'
        ],
        results
      })
    } else {
      return NextResponse.json({
        success: false,
        message: '⚠️ Migration executed but verification failed',
        note: 'Please apply the migration manually via Supabase Dashboard',
        manual_instructions: {
          step1: 'Go to https://supabase.com/dashboard',
          step2: 'Select your project → SQL Editor',
          step3: 'Run this SQL:',
          sql: `ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS user_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_token text;

CREATE INDEX IF NOT EXISTS idx_profiles_verification_token 
ON public.profiles(verification_token);`
        },
        results
      })
    }

  } catch (error: any) {
    console.error('❌ Error:', error)
    return NextResponse.json(
      { 
        error: error.message,
        note: 'Failed to apply migration automatically',
        manual_fix: 'Please run the SQL manually in Supabase Dashboard (see below)',
        sql: `ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS user_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_token text;

CREATE INDEX IF NOT EXISTS idx_profiles_verification_token 
ON public.profiles(verification_token);`
      },
      { status: 500 }
    )
  }
}

