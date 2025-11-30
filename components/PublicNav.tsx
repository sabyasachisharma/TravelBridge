'use client'

import Link from 'next/link'
import { User } from 'lucide-react'
import Logo from './Logo'

interface PublicNavProps {
  transparent?: boolean
  showPostCTA?: boolean
}

export default function PublicNav({ transparent = false, showPostCTA = false }: PublicNavProps) {
  return (
    <nav className={`${transparent ? 'bg-gradient-to-b from-black/30 to-transparent backdrop-blur-sm' : 'bg-white border-b border-gray-200'} sticky top-0 z-50`} style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Logo size="sm" showText={true} className={transparent ? 'brightness-0 invert' : ''} />
        </Link>

        <div className="flex items-center gap-4">
          {showPostCTA && (
            <Link
              href="/auth?redirect=/post-trip"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-[15px] font-medium border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors"
            >
              Post a Trip
            </Link>
          )}
          <Link
            href="/login"
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-[15px] transition-colors ${transparent ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <User className="w-4 h-4" />
            <span>Sign In</span>
          </Link>

          <Link
            href="/register"
            className="px-6 py-2.5 rounded-full text-white font-semibold text-[15px] bg-gradient-to-r from-indigo-500 to-indigo-800 hover:shadow-lg transition-all"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  )
}


