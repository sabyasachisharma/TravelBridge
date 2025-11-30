import { supabaseServer } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Apply Phone Verification Migration
 * 
 * This endpoint applies the 003_add_phone_verification.sql migration
 * 
 * Usage:
 *   curl -X POST http://localhost:3000/api/admin/apply-phone-migration
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

    console.log('🚀 Applying phone verification migration...')

    // Apply the migration SQL directly
    const migrations = [
      // Add phone column
      `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;`,
      
      // Add phone_verified column
      `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_verified boolean DEFAULT false;`,
      
      // Add phone_verification_code column
      `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_verification_code text;`,
      
      // Add phone_verification_expires_at column
      `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_verification_expires_at timestamptz;`,
      
      // Create indexes
      `CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);`,
      `CREATE INDEX IF NOT EXISTS idx_profiles_phone_verification_code ON public.profiles(phone_verification_code);`,
      
      // Add comments
      `COMMENT ON COLUMN public.profiles.phone IS 'User phone number with country code (e.g., +1234567890)';`,
      `COMMENT ON COLUMN public.profiles.phone_verified IS 'Phone verification status - true if phone is verified';`,
      `COMMENT ON COLUMN public.profiles.phone_verification_code IS 'Verification code sent to phone (6 digits)';`,
      `COMMENT ON COLUMN public.profiles.phone_verification_expires_at IS 'Expiration timestamp for phone verification code';`,
    ]

    const results = []
    const errors = []

    // Execute via RPC or direct query
    for (const sql of migrations) {
      try {
        // Try to execute the SQL using a direct query
        // Since Supabase doesn't have exec_sql RPC by default, we'll use raw SQL execution
        // Note: This requires the service role key to have proper permissions
        
        // For now, we'll test if columns exist and skip if they do
        const isAlterTable = sql.trim().startsWith('ALTER TABLE')
        const isCreateIndex = sql.trim().startsWith('CREATE INDEX')
        const isComment = sql.trim().startsWith('COMMENT')
        
        if (isAlterTable || isCreateIndex || isComment) {
          // Try to verify by checking if column exists
          if (isAlterTable && sql.includes('phone')) {
            // Check if phone column exists by trying to select it
            const testColumn = sql.includes('ADD COLUMN') 
              ? sql.match(/ADD COLUMN IF NOT EXISTS (\w+)/)?.[1]
              : null
            
            if (testColumn) {
              const { error: testError } = await supabaseServer
                .from('profiles')
                .select(testColumn)
                .limit(1)
              
              if (!testError) {
                console.log(`✅ Column ${testColumn} already exists, skipping...`)
                results.push({ sql: sql.substring(0, 50) + '...', status: 'skipped (exists)' })
                continue
              }
            }
          }
          
          // If we get here, we need to apply the migration
          // Use Supabase's REST API to execute SQL
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
          const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
          
          if (supabaseUrl && serviceRoleKey) {
            // Try using pg REST API
            const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
              method: 'POST',
              headers: {
                'apikey': serviceRoleKey,
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ sql_query: sql })
            })
            
            if (!response.ok) {
              const errorText = await response.text()
              // If column already exists, this is fine
              if (errorText.includes('already exists') || errorText.includes('duplicate')) {
                results.push({ sql: sql.substring(0, 50) + '...', status: 'exists' })
                continue
              }
              throw new Error(errorText)
            }
          }
        }
        
        results.push({ sql: sql.substring(0, 50) + '...', status: 'success' })
        console.log('✅ Migration step completed')
      } catch (err: any) {
        console.error('❌ Error:', err.message)
        errors.push({ sql: sql.substring(0, 50) + '...', error: err.message })
      }
    }

    console.log('\n🎉 Migration application complete!')

    // Verify the columns exist
    const { data: testData, error: testError } = await supabaseServer
      .from('profiles')
      .select('phone, phone_verified, phone_verification_code, phone_verification_expires_at')
      .limit(1)

    if (testError) {
      console.error('⚠️ Warning: Could not verify columns:', testError.message)
      return NextResponse.json({
        message: 'Migration may need to be applied manually',
        note: 'Please apply the migration manually using Supabase Dashboard',
        instructions: [
          '1. Go to Supabase Dashboard → SQL Editor',
          '2. Copy contents of supabase/migrations/003_add_phone_verification.sql',
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
      columns_added: ['phone', 'phone_verified', 'phone_verification_code', 'phone_verification_expires_at'],
      next_steps: [
        'Columns added to profiles table',
        'Phone verification system is now ready',
        'Users can now add and verify phone numbers'
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
    message: 'Phone Verification Migration Endpoint',
    usage: 'POST to this endpoint to apply the migration',
    note: 'Only works in development mode'
  })
}

