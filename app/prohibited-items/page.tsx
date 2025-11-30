'use client'

import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default function ProhibitedItemsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-primary-600">
            🌍 CarryBridge
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Prohibited Items</h1>
        
        <div className="card mb-8 border-l-4 border-red-600">
          <div className="flex gap-3 items-start">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-bold text-slate-900 mb-2">Important</h2>
              <p className="text-slate-600">
                CarryBridge is a community-driven platform. Both travelers and senders are responsible for verifying local customs and import regulations. This is not a legal advisory.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold text-slate-900 mb-3">Strictly Prohibited</h2>
            <ul className="space-y-2 text-slate-600">
              <li>🚫 Weapons (guns, knives, explosives)</li>
              <li>🚫 Drugs (illegal substances)</li>
              <li>🚫 Cash & high-value jewelry</li>
              <li>🚫 Counterfeit goods</li>
              <li>🚫 Hazardous materials (batteries, chemicals)</li>
              <li>🚫 Animal products (endangered species)</li>
              <li>🚫 Tobacco & alcohol (volume-dependent by region)</li>
            </ul>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-slate-900 mb-3">Requires Special Care</h2>
            <ul className="space-y-2 text-slate-600">
              <li>❄️ Perishables (max 4 hours transit unless insulated)</li>
              <li>📦 Fragile items (requires "fragile" marking)</li>
              <li>⚡ Electronics (must be declared & packaged safely)</li>
              <li>📄 Documents (insure & track separately)</li>
            </ul>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-slate-900 mb-3">Traveler Responsibilities</h2>
            <p className="text-slate-600 mb-4">You are liable for:</p>
            <ul className="space-y-2 text-slate-600">
              <li>✓ Checking sender's items match item description</li>
              <li>✓ Not exceeding your declared capacity</li>
              <li>✓ Following local import regulations</li>
              <li>✓ Taking photos at pickup & delivery</li>
              <li>✓ Confirming with one-time codes</li>
            </ul>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-slate-900 mb-3">Sender Responsibilities</h2>
            <p className="text-slate-600 mb-4">You are liable for:</p>
            <ul className="space-y-2 text-slate-600">
              <li>✓ Item value and insurability</li>
              <li>✓ Accurate weight & dimensions</li>
              <li>✓ Proper packaging</li>
              <li>✓ Honest item categorization (no prohibited goods)</li>
              <li>✓ Off-platform payment confirmation</li>
            </ul>
          </div>

          <div className="card bg-blue-50 border border-blue-200">
            <h2 className="text-xl font-bold text-blue-900 mb-3">Disclaimer</h2>
            <p className="text-blue-800 text-sm">
              CarryBridge does NOT process payments or provide insurance. Any off-platform payment between users is at their own risk. CarryBridge is not liable for disputes, damaged goods, lost items, or breaches of local law. Always verify local customs regulations before shipping.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
