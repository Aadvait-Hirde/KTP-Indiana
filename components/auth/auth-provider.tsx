"use client"

import { useUser } from '@clerk/nextjs'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/auth-store'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user: clerkUser, isLoaded } = useUser()
  const { setUser, setAuthorized, setLoading, reset } = useAuthStore()

  useEffect(() => {
    async function checkUserAuthorization() {
      if (!isLoaded) return
      
      setLoading(true)

      if (!clerkUser?.emailAddresses?.[0]?.emailAddress) {
        reset()
        return
      }

      const email = clerkUser.emailAddresses[0].emailAddress

      try {
        // Add timeout to prevent long delays
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), 5000) // 5 second timeout
        })

        // Check if user exists in Supabase with timeout
        const supabasePromise = supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single()

        const { data, error } = await Promise.race([
          supabasePromise,
          timeoutPromise
        ]) as Awaited<typeof supabasePromise>

        if (error || !data) {
          console.log('User not found in database or timeout:', email)
          setAuthorized(false)
          setUser(null)
        } else {
          console.log('User found in database:', data)
          setAuthorized(true)
          setUser(data)
        }
      } catch (error) {
        console.error('Error checking user authorization:', error)
        // On timeout or error, assume unauthorized but don't block the UI
        setAuthorized(false)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkUserAuthorization()
  }, [clerkUser, isLoaded, setUser, setAuthorized, setLoading, reset])

  return <>{children}</>
} 