'use client'

import Link from 'next/link'

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Terms of Service</h1>

        <div className="prose prose-sm max-w-none space-y-6">
          <section className="card">
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Acceptance of Terms</h2>
            <p className="text-slate-600">
              By using CarryBridge ("Service"), you agree to these Terms. If you don't agree, don't use the Service.
            </p>
          </section>

          <section className="card">
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. User Accounts</h2>
            <p className="text-slate-600 mb-2">You are responsible for:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-2">
              <li>Maintaining confidentiality of your password</li>
              <li>All activity under your account</li>
              <li>Providing accurate information during registration</li>
            </ul>
          </section>

          <section className="card">
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Prohibited Conduct</h2>
            <p className="text-slate-600 mb-2">You may not:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-2">
              <li>Violate any laws or regulations</li>
              <li>Send prohibited items (weapons, drugs, etc.)</li>
              <li>Harass or defraud other users</li>
              <li>Misrepresent identity or credentials</li>
            </ul>
          </section>

          <section className="card">
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Payment</h2>
            <p className="text-slate-600">
              CarryBridge does NOT process payments. Any payment between users is off-platform and at their own risk. 
              CarryBridge is not liable for payment disputes, non-payment, or fraud.
            </p>
          </section>

          <section className="card">
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Verification & ID</h2>
            <p className="text-slate-600">
              ID verification is manual and not a guarantee of trustworthiness. CarryBridge does not endorse or assume 
              liability for verified users' conduct.
            </p>
          </section>

          <section className="card">
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Disclaimers</h2>
            <p className="text-slate-600 mb-2">
              The Service is provided "as is." We disclaim all warranties, express or implied, including:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-2">
              <li>Warranty of merchantability or fitness</li>
              <li>Insurance or liability for damages/loss</li>
              <li>Customs/import law compliance</li>
            </ul>
          </section>

          <section className="card">
            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Limitation of Liability</h2>
            <p className="text-slate-600">
              To the extent permitted by law, CarryBridge is not liable for indirect, incidental, or consequential 
              damages, including lost profits or data.
            </p>
          </section>

          <section className="card">
            <h2 className="text-xl font-bold text-slate-900 mb-3">8. Indemnification</h2>
            <p className="text-slate-600">
              You agree to indemnify and hold harmless CarryBridge from claims arising from your use of the Service 
              or violation of these Terms.
            </p>
          </section>

          <section className="card">
            <h2 className="text-xl font-bold text-slate-900 mb-3">9. Termination</h2>
            <p className="text-slate-600">
              We may terminate your account at any time for violation of these Terms or for any reason.
            </p>
          </section>

          <section className="card">
            <h2 className="text-xl font-bold text-slate-900 mb-3">10. Changes to Terms</h2>
            <p className="text-slate-600">
              We may update these Terms at any time. Continued use of the Service constitutes acceptance.
            </p>
          </section>

          <section className="card bg-blue-50 border border-blue-200">
            <h2 className="text-xl font-bold text-blue-900 mb-3">Contact</h2>
            <p className="text-blue-800">
              For questions about these Terms, contact <a href="mailto:support@carrybridge.app" className="font-medium hover:underline">support@carrybridge.app</a>
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
