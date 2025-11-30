'use client'

import { useState, useEffect } from 'react'
import { supabaseClient, Profile } from '@/lib/supabase'

export function useVerification() {
  const [isVerified, setIsVerified] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    checkVerification()
  }, [])

  const checkVerification = async () => {
    try {
      if (!supabaseClient) {
        setLoading(false)
        return
      }

      const { data: { user } } = await supabaseClient.auth.getUser()
      
      if (!user) {
        setIsVerified(false)
        setLoading(false)
        return
      }

      const { data: profileData, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        setIsVerified(false)
        setLoading(false)
        return
      }

      setProfile(profileData)
      setIsVerified(profileData?.user_verified || false)
      setLoading(false)
    } catch (error) {
      console.error('Error checking verification:', error)
      setIsVerified(false)
      setLoading(false)
    }
  }

  const refresh = () => {
    setLoading(true)
    checkVerification()
  }

  return { isVerified, loading, profile, refresh }
}

