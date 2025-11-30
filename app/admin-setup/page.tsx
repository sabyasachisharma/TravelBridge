'use client'

import { useState } from 'react'
import { CheckCircle, Copy, AlertTriangle } from 'lucide-react'

export default function AdminSetupPage() {
  const [copied, setCopied] = useState(false)

  const migrationSQL = `-- Add email verification columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS user_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_token text;

-- Add index for verification token lookup
CREATE INDEX IF NOT EXISTS idx_profiles_verification_token ON public.profiles(verification_token);

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.user_verified IS 'Email verification status - true if email is verified, false otherwise';
COMMENT ON COLUMN public.profiles.verification_token IS 'Token used for email verification link';

-- Verify columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('user_verified', 'verification_token');`

  const handleCopy = () => {
    navigator.clipboard.writeText(migrationSQL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Database Setup Required</h1>
              <p className="text-slate-600">Add email verification columns to your database</p>
            </div>
          </div>
          
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
            <p className="text-amber-800 font-medium">
              ⚠️ You need to run this migration to enable email verification
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">📋 Setup Instructions</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-2">Open Supabase Dashboard</h3>
                <p className="text-slate-600">Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">https://supabase.com/dashboard</a></p>
                <p className="text-slate-600">Select your <strong>CarryBridge</strong> project</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-2">Open SQL Editor</h3>
                <p className="text-slate-600">Click <strong>"SQL Editor"</strong> in the left sidebar</p>
                <p className="text-slate-600">Click <strong>"+ New Query"</strong></p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-2">Copy & Run SQL</h3>
                <p className="text-slate-600">Click the "Copy SQL" button below</p>
                <p className="text-slate-600">Paste into the SQL Editor</p>
                <p className="text-slate-600">Click <strong>"Run"</strong> or press <kbd className="px-2 py-1 bg-slate-100 rounded text-sm">Cmd+Enter</kbd></p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-2">Verify & Continue</h3>
                <p className="text-slate-600">You should see: "Success. No rows returned"</p>
                <p className="text-slate-600">Scroll down to see the verification results</p>
                <p className="text-slate-600">Return here and refresh this page</p>
              </div>
            </div>
          </div>
        </div>

        {/* SQL Code */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-800">📝 Migration SQL</h2>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy SQL
                </>
              )}
            </button>
          </div>

          <pre className="bg-slate-900 text-green-400 p-6 rounded-lg overflow-x-auto text-sm font-mono">
            <code>{migrationSQL}</code>
          </pre>

          <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <p className="text-blue-800 text-sm">
              <strong>💡 Tip:</strong> After running this SQL, the last SELECT statement will show you the newly created columns to verify everything worked correctly.
            </p>
          </div>
        </div>

        {/* What This Does */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">🔧 What This Migration Does</h2>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Adds <code className="bg-slate-100 px-2 py-1 rounded">user_verified</code> column</p>
                <p className="text-slate-600 text-sm">Boolean field (default: false) to track email verification status</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Adds <code className="bg-slate-100 px-2 py-1 rounded">verification_token</code> column</p>
                <p className="text-slate-600 text-sm">Text field to store unique verification tokens for email links</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Creates database index</p>
                <p className="text-slate-600 text-sm">Speeds up verification token lookups</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Adds documentation</p>
                <p className="text-slate-600 text-sm">Column comments for future reference</p>
              </div>
            </div>
          </div>
        </div>

        {/* After Setup */}
        <div className="bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <CheckCircle className="w-7 h-7 text-green-600" />
            After Running the Migration
          </h2>
          
          <div className="space-y-3 mb-6">
            <p className="text-slate-700">✅ Email verification system will be enabled</p>
            <p className="text-slate-700">✅ Users will receive verification emails after signup</p>
            <p className="text-slate-700">✅ Unverified users will see a banner to verify their email</p>
            <p className="text-slate-700">✅ Certain features will be locked until email is verified</p>
          </div>

          <div className="flex gap-3">
            <a
              href="/auth"
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all"
            >
              Go to Sign Up
            </a>
            <a
              href="/"
              className="px-6 py-3 bg-white text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-all border-2 border-slate-200"
            >
              Back to Home
            </a>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4">🐛 Troubleshooting</h2>
          
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-slate-800 mb-1">Error: "column already exists"</h3>
              <p className="text-slate-600">This means the migration was already applied. You're good to go! Try signing up.</p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 mb-1">Error: "relation profiles does not exist"</h3>
              <p className="text-slate-600">Run the initial migration first: <code className="bg-slate-100 px-2 py-1 rounded">supabase/migrations/001_init.sql</code></p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 mb-1">Still getting errors?</h3>
              <p className="text-slate-600">Check the console logs in your terminal or contact support. See <code className="bg-slate-100 px-2 py-1 rounded">FIX_USER_EXISTS_ERROR.md</code> for more help.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

