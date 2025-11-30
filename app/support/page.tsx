'use client'

import Link from 'next/link'
import { HelpCircle, Mail, FileText } from 'lucide-react'

export default function SupportPage() {
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
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Help & Support</h1>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="card hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3 mb-4">
              <HelpCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
              <h2 className="text-lg font-bold text-slate-900">FAQ</h2>
            </div>
            <p className="text-slate-600 mb-4">Common questions about using CarryBridge</p>
            <button className="btn-secondary w-full">Coming Soon</button>
          </div>

          <div className="card hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3 mb-4">
              <Mail className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
              <h2 className="text-lg font-bold text-slate-900">Contact Us</h2>
            </div>
            <p className="text-slate-600 mb-4">Email us for inquiries and support</p>
            <a href="mailto:support@carrybridge.app" className="btn-primary w-full text-center block">
              Email Support
            </a>
          </div>

          <div className="card hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3 mb-4">
              <FileText className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
              <h2 className="text-lg font-bold text-slate-900">Terms of Service</h2>
            </div>
            <p className="text-slate-600 mb-4">Read our terms and conditions</p>
            <Link href="/terms" className="btn-secondary w-full text-center block">
              View Terms
            </Link>
          </div>

          <div className="card hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3 mb-4">
              <FileText className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
              <h2 className="text-lg font-bold text-slate-900">Privacy Policy</h2>
            </div>
            <p className="text-slate-600 mb-4">How we handle your data</p>
            <Link href="/privacy" className="btn-secondary w-full text-center block">
              View Privacy
            </Link>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Popular Topics</h2>
          <ul className="space-y-3 text-slate-600">
            <li>
              <a href="#" className="text-primary-600 hover:underline">
                How do I post a trip?
              </a>
            </li>
            <li>
              <a href="#" className="text-primary-600 hover:underline">
                How do I request a delivery?
              </a>
            </li>
            <li>
              <a href="#" className="text-primary-600 hover:underline">
                What is off-platform payment?
              </a>
            </li>
            <li>
              <a href="#" className="text-primary-600 hover:underline">
                How do I get verified?
              </a>
            </li>
            <li>
              <a href="#" className="text-primary-600 hover:underline">
                What items are prohibited?
              </a>
            </li>
            <li>
              <Link href="/prohibited-items" className="text-primary-600 hover:underline">
                View prohibited items list
              </Link>
            </li>
          </ul>
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
