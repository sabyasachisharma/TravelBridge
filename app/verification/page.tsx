'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabase'
import { Upload, AlertCircle, CheckCircle, Loader } from 'lucide-react'

export default function VerificationPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [verification, setVerification] = useState<any>(null)
  const [files, setFiles] = useState<File[]>([])
  const [docType, setDocType] = useState('passport')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    const { data: { session } } = await supabaseClient.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }

    setUser(session.user)

    const { data } = await supabaseClient
      .from('verifications')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(1)

    setVerification(data?.[0] || null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (files.length === 0) {
      setError('Please select at least one file')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append('doc_type', docType)
      files.forEach((file) => {
        formData.append('files', file)
      })

      const { data: { session } } = await supabaseClient.auth.getSession()
      const response = await fetch('/api/verifications', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${session?.access_token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Upload failed')
      }

      setSuccess('Documents uploaded! Pending review.')
      setFiles([])
      setTimeout(() => fetchUserData(), 1000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary-600">
            🌍 CarryBridge
          </Link>
          <Link href="/dashboard" className="btn-secondary">
            Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">ID Verification</h1>
        <p className="text-slate-600 mb-8">Upload your identification to get verified and unlock full features</p>

        <div className="card mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Current Status</h2>
          {!verification && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-slate-600">Not yet verified</p>
            </div>
          )}
          {verification?.status === 'pending' && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900">Pending Review</p>
                <p className="text-sm text-amber-700">Your documents are under review by our team</p>
              </div>
            </div>
          )}
          {verification?.status === 'approved' && (
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">Verified ✓</p>
                <p className="text-sm text-green-700">Your account is verified and you have access to all features</p>
              </div>
            </div>
          )}
          {verification?.status === 'rejected' && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Rejected</p>
                <p className="text-sm text-red-700">Reason: {verification?.notes || 'Not specified'}</p>
                <p className="text-sm text-red-700 mt-2">You can resubmit documents below</p>
              </div>
            </div>
          )}
        </div>

        {verification?.status !== 'approved' && (
          <div className="card">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Upload Documents</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Document Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="passport">Passport</option>
                  <option value="driver_license">Driver's License</option>
                  <option value="national_id">National ID Card</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Upload Photos</label>
                <p className="text-sm text-slate-600 mb-4">Upload clear photos of your ID (front and back recommended)</p>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <label className="cursor-pointer">
                    <span className="text-primary-600 font-medium">Click to select</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-slate-500 mt-2">or drag and drop images</p>
                </div>
                {files.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-slate-700 mb-2">Selected files:</p>
                    <ul className="space-y-1">
                      {files.map((file, idx) => (
                        <li key={idx} className="text-sm text-slate-600">✓ {file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading && <Loader className="w-4 h-4 animate-spin" />}
                {loading ? 'Uploading...' : 'Submit for Verification'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
