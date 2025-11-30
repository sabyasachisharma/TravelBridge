'use client'

import { useState } from 'react'
import { Copy, CheckCircle, ExternalLink } from 'lucide-react'

export default function FixNowPage() {
  const [copied, setCopied] = useState(false)

  const SQL = `ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS user_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_token text;

CREATE INDEX IF NOT EXISTS idx_profiles_verification_token 
ON public.profiles(verification_token);

-- Verify it worked (you should see 2 rows)
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('user_verified', 'verification_token');`

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* URGENT Header */}
        <div className="bg-red-600 text-white rounded-2xl shadow-2xl p-8 mb-8 animate-pulse">
          <h1 className="text-4xl font-black mb-3">🚨 ACTION REQUIRED</h1>
          <p className="text-2xl font-bold">
            Your database is missing 2 columns!
          </p>
          <p className="text-lg mt-2 opacity-90">
            Follow these 3 simple steps to fix it in 30 seconds ⏱️
          </p>
        </div>

        {/* Step 1 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border-4 border-teal-500">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 text-white rounded-full flex items-center justify-center text-3xl font-black">
              1
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-800">Open Supabase Dashboard</h2>
              <p className="text-slate-600 text-lg">Click the button below to open in new tab</p>
            </div>
          </div>

          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-3 px-8 py-6 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-bold text-xl hover:from-teal-600 hover:to-cyan-600 transition-all shadow-lg"
          >
            <ExternalLink className="w-6 h-6" />
            Open Supabase Dashboard
          </a>

          <div className="mt-6 bg-teal-50 border-l-4 border-teal-500 p-4 rounded">
            <p className="text-teal-900 font-medium">
              ✅ Then: Select your <strong>CarryBridge</strong> project
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border-4 border-purple-500">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center text-3xl font-black">
              2
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-800">Open SQL Editor</h2>
              <p className="text-slate-600 text-lg">In left sidebar, click "SQL Editor"</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
              <div className="text-3xl">👈</div>
              <div>
                <p className="font-bold text-purple-900 text-lg">Look at the LEFT sidebar</p>
                <p className="text-purple-700">Click on <strong>"SQL Editor"</strong></p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
              <div className="text-3xl">➕</div>
              <div>
                <p className="font-bold text-purple-900 text-lg">Click "+ New Query"</p>
                <p className="text-purple-700">This opens a blank SQL editor</p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border-4 border-green-500">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-full flex items-center justify-center text-3xl font-black">
              3
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-800">Copy & Run This SQL</h2>
              <p className="text-slate-600 text-lg">Click "Copy SQL" → Paste → Click "Run"</p>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-3 px-8 py-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg mb-6"
          >
            {copied ? (
              <>
                <CheckCircle className="w-6 h-6" />
                Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy className="w-6 h-6" />
                📋 Copy SQL Code
              </>
            )}
          </button>

          <div className="bg-slate-900 rounded-xl p-6 overflow-x-auto">
            <pre className="text-green-400 font-mono text-sm leading-relaxed">
              <code>{SQL}</code>
            </pre>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border-2 border-green-200">
              <div className="text-2xl">1️⃣</div>
              <p className="text-green-900 font-medium">Click the green button above to copy SQL</p>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border-2 border-green-200">
              <div className="text-2xl">2️⃣</div>
              <p className="text-green-900 font-medium">Paste it into the SQL Editor</p>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border-2 border-green-200">
              <div className="text-2xl">3️⃣</div>
              <p className="text-green-900 font-medium">Click "Run" or press <kbd className="px-2 py-1 bg-slate-200 rounded">Cmd+Enter</kbd></p>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border-2 border-green-200">
              <div className="text-2xl">4️⃣</div>
              <p className="text-green-900 font-medium">Scroll down to see 2 rows showing the new columns</p>
            </div>
          </div>
        </div>

        {/* Success */}
        <div className="bg-gradient-to-br from-green-500 to-teal-500 text-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold mb-4">🎉 After Running SQL</h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6" />
              <p className="text-lg">You should see 2 rows in the results</p>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6" />
              <p className="text-lg">Columns <code className="bg-white/20 px-2 py-1 rounded">user_verified</code> and <code className="bg-white/20 px-2 py-1 rounded">verification_token</code> added</p>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6" />
              <p className="text-lg">Error will be GONE!</p>
            </div>
          </div>

          <a
            href="/auth"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-teal-600 rounded-xl font-bold text-xl hover:bg-slate-50 transition-all shadow-lg"
          >
            ✨ Go Try Signing Up Now!
          </a>
        </div>

        {/* Troubleshooting */}
        <div className="mt-8 bg-slate-800 text-white rounded-xl p-6">
          <h3 className="text-xl font-bold mb-3">❓ Troubleshooting</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Error: "column already exists"</strong> → Perfect! Columns are already there. Just try signing up.</p>
            <p><strong>Error: "relation profiles does not exist"</strong> → Run the first migration: <code className="bg-slate-700 px-2 py-1 rounded">001_init.sql</code></p>
            <p><strong>Still stuck?</strong> → Take a screenshot and let me know!</p>
          </div>
        </div>

      </div>
    </div>
  )
}

