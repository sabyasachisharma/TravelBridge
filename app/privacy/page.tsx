'use client'

import Link from 'next/link'

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Privacy Policy</h1>

        <div className="space-y-6">
          <section className="card">
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Data We Collect</h2>
            <p className="text-slate-600 mb-2">When you use CarryBridge, we collect:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-2">
              <li>Email address & password (via Supabase Auth)</li>
              <li>Profile information (name, bio, location)</li>
              <li>Trip & delivery request details</li>
              <li>ID/verification documents (stored in Supabase)</li>
              <li>Booking confirmations & timestamps</li>
              <li>Ratings & reviews</li>
              <li>IP address & device information (automatic)</li>
            </ul>
          </section>

          <section className="card">
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. How We Use Your Data</h2>
            <p className="text-slate-600 mb-2">We use data to:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-2">
              <li>Provide and improve the Service</li>
              <li>Verify your identity (manual review)</li>
              <li>Send email notifications</li>
              <li>Process booking confirmations</li>
              <li>Detect fraud or abuse</li>
            </ul>
          </section>

          <section className="card">
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Data Storage & Security</h2>
            <p className="text-slate-600 mb-2">Your data is stored on:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-2">
              <li><strong>Supabase (PostgreSQL)</strong> – EU data center</li>
              <li><strong>Supabase Storage</strong> – Verification documents</li>
            </ul>
            <p className="text-slate-600 mt-3">
              We use HTTPS encryption and Supabase's Row Level Security (RLS) to protect data. 
              However, no system is 100% secure. You are responsible for protecting your password.
            </p>
          </section>

          <section className="card">
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Sharing Your Data</h2>
            <p className="text-slate-600 mb-2">We share data with:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-2">
              <li>Trip participants (travelers & senders matched together)</li>
              <li>Email provider (Brevo SMTP) for sending notifications</li>
              <li>Law enforcement (if legally required)</li>
            </ul>
            <p className="text-slate-600 mt-3">
              We do NOT sell, rent, or otherwise trade your data.
            </p>
          </section>

          <section className="card">
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Verification Documents</h2>
            <p className="text-slate-600">
              ID/verification documents are stored in a private bucket and accessed only for manual review. 
              After approval, documents may be retained for record-keeping but are not shared publicly.
            </p>
          </section>

          <section className="card">
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Your Rights</h2>
            <p className="text-slate-600 mb-2">You have the right to:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-2">
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion (within reason)</li>
              <li>Opt-out of emails (via account settings)</li>
            </ul>
            <p className="text-slate-600 mt-3">
              Contact us at support@carrybridge.app to exercise these rights.
            </p>
          </section>

          <section className="card">
            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Cookies & Tracking</h2>
            <p className="text-slate-600">
              We use minimal cookies for authentication (via Supabase). Third-party analytics may be added in the future.
            </p>
          </section>

          <section className="card">
            <h2 className="text-xl font-bold text-slate-900 mb-3">8. Data Retention</h2>
            <p className="text-slate-600">
              We retain user data as long as your account is active. Upon account deletion, most data is anonymized 
              or deleted within 30 days, except where legally required to retain (e.g., bookings, transactions).
            </p>
          </section>

          <section className="card">
            <h2 className="text-xl font-bold text-slate-900 mb-3">9. GDPR Compliance</h2>
            <p className="text-slate-600">
              If you are in the EU, your data is processed under GDPR. We use Supabase (EU servers) and have 
              data processing agreements in place.
            </p>
          </section>

          <section className="card bg-blue-50 border border-blue-200">
            <h2 className="text-xl font-bold text-blue-900 mb-3">Questions?</h2>
            <p className="text-blue-800">
              Contact us at <a href="mailto:support@carrybridge.app" className="font-medium hover:underline">support@carrybridge.app</a>
            </p>
          </section>
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
