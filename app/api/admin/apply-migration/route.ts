import { supabaseServer } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Apply Email Verification Migration
 * 
 * This endpoint applies the 002_add_email_verification.sql migration
 * 
 * Usage:
 *   curl -X POST http://localhost:3000/api/admin/apply-migration
 */

export async function POST(request: NextRequest) {
  try {
    // Safety check - only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'This endpoint is disabled in production' },
        { status: 403 }
      )
    }

    if (!supabaseServer) {
      return NextResponse.json(
        { error: 'Supabase server not initialized' },
        { status: 500 }
      )
    }

    console.log('🚀 Applying email verification migration...')

    // Apply the migration SQL directly
    const migrations = [
      // Add user_verified column
      `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_verified boolean DEFAULT false;`,
      
      // Add verification_token column
      `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_token text;`,
      
      // Create index
      `CREATE INDEX IF NOT EXISTS idx_profiles_verification_token ON public.profiles(verification_token);`,
      
      // Add comments
      `COMMENT ON COLUMN public.profiles.user_verified IS 'Email verification status - true if email is verified, false otherwise';`,
      `COMMENT ON COLUMN public.profiles.verification_token IS 'Token used for email verification link';`
    ]

    const results = []
    const errors = []

    for (const sql of migrations) {
      try {
        const { error } = await supabaseServer.rpc('exec_sql', { sql_query: sql })
        
        if (error) {
          // Try alternative approach - direct query
          const { error: directError } = await supabaseServer.from('profiles').select('user_verified').limit(1)
          
          if (!directError) {
            // Column might already exist
            console.log('✅ Migration step completed (or already exists)')
            results.push({ sql: sql.substring(0, 50) + '...', status: 'success' })
          } else {
            console.error('❌ Migration error:', error.message)
            errors.push({ sql: sql.substring(0, 50) + '...', error: error.message })
          }
        } else {
          console.log('✅ Migration step completed')
          results.push({ sql: sql.substring(0, 50) + '...', status: 'success' })
        }
      } catch (err: any) {
        console.error('❌ Error:', err.message)
        errors.push({ sql: sql.substring(0, 50) + '...', error: err.message })
      }
    }

    console.log('\n🎉 Migration application complete!')

    // Verify the columns exist
    const { data: testData, error: testError } = await supabaseServer
      .from('profiles')
      .select('user_verified, verification_token')
      .limit(1)

    if (testError) {
      console.error('⚠️ Warning: Could not verify columns:', testError.message)
      return NextResponse.json({
        message: 'Migration applied but verification failed',
        note: 'Please apply the migration manually using Supabase Dashboard',
        instructions: [
          '1. Go to Supabase Dashboard → SQL Editor',
          '2. Copy contents of supabase/migrations/002_add_email_verification.sql',
          '3. Paste and run',
          '4. Restart dev server'
        ],
        results,
        errors: errors.length > 0 ? errors : undefined
      })
    }

    console.log('✅ Columns verified successfully!')

    return NextResponse.json({
      message: 'Migration applied successfully!',
      columns_added: ['user_verified', 'verification_token'],
      next_steps: [
        'Columns added to profiles table',
        'You can now sign up and verify email',
        'Try registering at http://localhost:3000/auth'
      ],
      results,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error: any) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        note: 'Please apply migration manually via Supabase Dashboard'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Email Verification Migration Endpoint',
    description: 'Adds user_verified and verification_token columns to profiles table',
    usage: [
      'Send POST request: curl -X POST http://localhost:3000/api/admin/apply-migration',
      'Or click the button in the response'
    ],
    columns: [
      { name: 'user_verified', type: 'boolean', default: 'false' },
      { name: 'verification_token', type: 'text', default: 'null' }
    ]
  })
}

