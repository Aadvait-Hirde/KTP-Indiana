"use client"

import { useEffect, useState } from 'react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useAuthStore } from '@/lib/auth-store'
import { ThemeToggle } from '@/components/theme-toggle'
import { SignOutButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Construction } from 'lucide-react'

function MemberPortalContent() {
  const { user } = useAuthStore()
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const now = new Date()
    const hour = now.getHours()
    
    if (hour >= 5 && hour < 12) {
      setGreeting('Good morning')
    } else if (hour >= 12 && hour < 17) {
      setGreeting('Good afternoon')
    } else if (hour >= 17 && hour < 22) {
      setGreeting('Good evening')
    } else {
      setGreeting('Good night')
    }
  }, [])

  const firstName = user?.name?.split(' ')[0] || 'there'

  return (
    <div className="min-h-screen bg-background dark:bg-zinc-900 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Header with theme toggle */}
        <div className="flex justify-between items-center mb-8">
          <div></div>
          <ThemeToggle />
        </div>

        {/* Main content */}
        <Card className="text-center dark:bg-zinc-800 dark:border-zinc-700">
          <CardContent className="pt-8 pb-8 space-y-6">
            {/* Greeting */}
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {greeting}, {firstName}!
              </h1>
            </div>

            {/* Construction message */}
            <div className="space-y-4">
              <Construction className="w-12 h-12 mx-auto text-muted-foreground" />
              <div>
                                 <p className="text-lg text-muted-foreground mb-2">
                   We&apos;re building the member portal
                 </p>
                <p className="text-sm text-muted-foreground">
                  Check back soon for exciting new features!
                </p>
              </div>
            </div>

            {/* Sign out button */}
            <div className="pt-4">
              <SignOutButton>
                <Button variant="outline" className="w-full">
                  Sign Out
                </Button>
              </SignOutButton>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function MemberPortalPage() {
  return (
    <ProtectedRoute>
      <MemberPortalContent />
    </ProtectedRoute>
  )
} 