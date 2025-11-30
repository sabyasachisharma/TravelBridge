'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { supabaseClient } from '@/lib/supabase'
import { LogOut, User, Package, ChevronDown, X, Plane, Search, Settings as SettingsIcon } from 'lucide-react'
import Logo from './Logo'

interface AppNavProps {
  user?: any
  profile?: any
  transparent?: boolean // For use on home page with hero background
}

export default function AppNav({ user, profile, transparent = false }: AppNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [userData, setUserData] = useState<any>(user)
  const [profileData, setProfileData] = useState<any>(profile)
  const menuRef = useRef<HTMLDivElement>(null)
  
  // Check if we're on the post-trip page
  const isPostTripPage = pathname === '/post-trip'

  useEffect(() => {
    if (!userData) {
      fetchUserData()
    }
  }, [])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  const fetchUserData = async () => {
    try {
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (session) {
        setUserData(session.user)
        
        const { data: profileData } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        setProfileData(profileData)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const handleLogout = async () => {
    await supabaseClient.auth.signOut()
    router.push('/')
    window.location.reload()
  }

  if (!userData && !user) {
    return null
  }

  const currentUser = userData || user
  const currentProfile = profileData || profile
  const userName = currentProfile?.name || currentUser?.email?.split('@')[0] || 'User'
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <nav className={`${transparent ? 'bg-white/5 backdrop-blur-md border-b border-white/10' : 'bg-white border-b border-gray-200'} sticky top-0 z-50`} style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Logo size="sm" showText={true} className={transparent ? 'brightness-0 invert' : ''} />
          </Link>

          {/* Right Side - User Menu */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Post Trip Button - Hidden on post-trip page */}
            {!isPostTripPage && (
              <Link
                href="/post-trip"
                className="px-6 py-2.5 bg-indigo-600 text-white text-[15px] font-medium rounded-full hover:bg-indigo-700 transition-all hover:shadow-lg flex items-center gap-2"
              >
                <Plane className="w-4 h-4" />
                <span>Post Trip</span>
              </Link>
            )}

            {/* Sign In Dropdown & User Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center gap-2 px-4 py-2 text-[15px] font-normal rounded-lg transition-colors ${
                  transparent 
                    ? 'text-white/90 hover:bg-white/10' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <User className="w-4 h-4" />
                <span>{userName}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                  {/* User Name */}
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <p className="font-semibold text-gray-900 text-sm">{userName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{currentUser?.email}</p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                      router.push('/dashboard')
                      }}
                      className="w-full text-left px-4 py-2.5 text-[15px] text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
                    >
                      <User className="w-4 h-4" />
                      <span>My Account</span>
                    </button>
                    <div className="border-t border-gray-200 my-2" />
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      router.push('/dashboard?tab=settings')
                    }}
                    className="w-full text-left px-4 py-2.5 text-[15px] text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
                  >
                    <SettingsIcon className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        router.push('/dashboard?tab=trips')
                      }}
                      className="w-full text-left px-4 py-2.5 text-[15px] text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
                    >
                      <Package className="w-4 h-4" />
                      <span>My Trips</span>
                    </button>
                    <div className="border-t border-gray-200 my-2" />
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        handleLogout()
                      }}
                    className="w-full text-left px-4 py-2.5 text-[15px] text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
                    >
                    <LogOut className="w-4 h-4 text-red-600" />
                    <span className="text-red-600">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

