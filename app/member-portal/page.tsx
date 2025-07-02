"use client"

import { useEffect, useState } from 'react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useAuthStore } from '@/lib/auth-store'
import { ThemeToggle } from '@/components/theme-toggle'
import { RoleSwitcher } from '@/components/member-portal/role-switcher'
import { Sidebar } from '@/components/member-portal/sidebar'
import { AnnouncementsSection } from '@/components/member-portal/announcements'
import { CalendarWidget } from '@/components/member-portal/calendar-widget'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingBag, CreditCard } from 'lucide-react'
import Image from 'next/image'

function MemberPortalContent() {
  const { user } = useAuthStore()
  const [greeting, setGreeting] = useState('')
  const [viewingAsRole, setViewingAsRole] = useState<string | null>(null)

  // Use the viewing role or actual user role
  const effectiveRole = viewingAsRole || user?.role

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) {
      setGreeting('Good Morning')
    } else if (hour < 17) {
      setGreeting('Good Afternoon')
    } else {
      setGreeting('Good Evening')
    }
  }, [])

  const getDuesLink = () => {
    // Different payment links based on effective role
    if (effectiveRole === 'newmember') {
      return 'https://collect.crowded.me/collection/4fac4104-27d2-46ea-8bac-2b22803de573'
    }
    return 'https://collect.crowded.me/collection/3afb7113-1cab-47d1-894d-117c6ed06ec4'
  }

  const getDuesImage = () => {
    if (effectiveRole === 'newmember') {
      return '/portal-images/new-member-dues/new-member-dues.png'
    }
    return '/portal-images/active-dues/active-dues.png'
  }

  const getDisplayRole = (role: string) => {
    switch (role) {
      case 'newmember':
        return 'New Member'
      case 'admin':
        return 'Admin'
      case 'exec':
        return 'Exec'
      case 'director':
        return 'Director'
      default:
        return 'Member'
    }
  }

  const getRoleColor = () => {
    // Use zinc-600 in light mode, zinc-300 in dark mode for better legibility
    return 'text-zinc-600 dark:text-zinc-300'
  }

  const handleRoleChange = (newRole: string) => {
    setViewingAsRole(newRole === user?.role ? null : newRole)
  }

  // Create effective user object for child components
  const effectiveUser = user ? {
    ...user,
    role: effectiveRole || user.role
  } : null

  return (
    <div className="flex h-screen bg-muted/30 relative overflow-hidden">
      {/* Wave Background - behind everything */}
      <div className="absolute inset-0 opacity-5 pointer-events-none z-0">
        <svg 
          className="absolute inset-0 w-full h-full" 
          viewBox="0 0 1200 400"
          preserveAspectRatio="none"
        >
          <path 
            d="M0,160 C400,100 800,220 1200,160 L1200,400 L0,400 Z" 
            fill="currentColor"
            className="text-primary"
          />
          <path 
            d="M0,200 C300,140 600,260 1200,180 L1200,400 L0,400 Z" 
            fill="currentColor"
            className="text-primary opacity-60"
          />
        </svg>
      </div>

      {/* Sidebar */}
      <div className="relative z-20">
        <Sidebar />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Header Content (transparent, not sticky) */}
        <div className="bg-transparent px-4 md:px-6 py-4 pt-20 md:pt-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left side - Greeting - Updated */}
            <div className="flex items-center">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {greeting}, {user?.name?.split(' ')[0]}!
              </h1>
            </div>

            {/* Right side - User info and controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              {/* Role Switcher for Admins */}
              {user?.role === 'admin' && (
                <RoleSwitcher onRoleChange={handleRoleChange} />
              )}

              {/* Full name with colored role */}
              <p className="font-medium text-base md:text-lg">
                {user?.name} • <span className={getRoleColor()}>{getDisplayRole(effectiveRole || '')}</span>
              </p>
              
              {/* Theme toggle */}
              <ThemeToggle />
            </div>
          </div>
        </div>
        
        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Welcome Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Announcements with effective user */}
            <AnnouncementsSection user={effectiveUser} />
            
            {/* Calendar */}
            <CalendarWidget />
          </div>
          
          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-start">
            {/* Pay Dues */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Pay Dues</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 m-0">
                <a href={getDuesLink()} target="_blank" rel="noopener noreferrer" className="block">
                  <Image
                    src={getDuesImage()}
                    alt={effectiveRole === 'newmember' ? 'New Member Dues' : 'Active Member Dues'}
                    width={800}
                    height={600}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity rounded-b-lg !mb-0 !margin-bottom-0"
                    style={{ marginBottom: 0 }}
                    quality={100}
                    priority
                  />
                </a>
              </CardContent>
            </Card>

            {/* Merch Store */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingBag className="h-5 w-5" />
                  <span>KTP Merch Store</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Get the latest KTP merchandise including hoodies, t-shirts, stickers, and more!
                </p>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <ShoppingBag className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">
                    Merch store coming soon!
                  </p>
                  <Button disabled className="w-full">
                    Shop Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
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