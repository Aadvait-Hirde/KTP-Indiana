"use client"

import { useUser } from '@clerk/nextjs'
import { useAuthStore } from '@/lib/auth-store'
import { Unauthorized } from './unauthorized'
import { Loader2 } from 'lucide-react'
import { RedirectToSignIn } from '@clerk/nextjs'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isSignedIn, isLoaded: clerkLoaded } = useUser()
  const { isAuthorized, isLoading } = useAuthStore()

  // Show loading while Clerk loads
  if (!clerkLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to sign in if not authenticated
  if (!isSignedIn) {
    return <RedirectToSignIn />
  }

  // Show unauthorized if not in whitelist
  if (!isAuthorized) {
    return <Unauthorized />
  }

  // User is authenticated and authorized
  return <>{children}</>
} 