"use client"

import { ProtectedRoute } from '@/components/auth/protected-route'
import { useAuthStore } from '@/lib/auth-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserCheck, Crown, Shield, Users } from 'lucide-react'
import { SignOutButton } from '@clerk/nextjs'
import Link from 'next/link'

function MemberPortalContent() {
  const { user } = useAuthStore()

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-5 h-5" />
      case 'exec':
        return <Shield className="w-5 h-5" />
      case 'director':
        return <UserCheck className="w-5 h-5" />
      default:
        return <Users className="w-5 h-5" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500'
      case 'exec':
        return 'bg-purple-500'
      case 'director':
        return 'bg-blue-500'
      default:
        return 'bg-green-500'
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold">
                KTP
              </Link>
              <Badge variant="outline">Member Portal</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-medium">{user?.name}</p>
                <div className="flex items-center space-x-2">
                  {getRoleIcon(user?.role || '')}
                  <span className="text-sm text-muted-foreground capitalize">
                    {user?.role}
                  </span>
                </div>
              </div>
              <SignOutButton>
                <Button variant="outline" size="sm">
                  Sign Out
                </Button>
              </SignOutButton>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground">
            Access your KTP resources and tools below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5" />
                <span>Your Profile</span>
              </CardTitle>
              <CardDescription>
                View and manage your KTP profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <span className="text-sm">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Role:</span>
                  <Badge className={getRoleColor(user?.role || '')}>
                    {user?.role}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Member Since:</span>
                  <span className="text-sm">
                    {user?.created_at ? new Date(user.created_at).getFullYear() : 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Directory */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Member Directory</span>
              </CardTitle>
              <CardDescription>
                Connect with other KTP members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          {/* Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
              <CardDescription>
                Access important documents and links
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          {/* Admin Panel (only for admins) */}
          {user?.role === 'admin' && (
            <Card className="md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-600">
                  <Crown className="w-5 h-5" />
                  <span>Admin Panel</span>
                </CardTitle>
                <CardDescription>
                  Administrative tools and controls
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" disabled>
                    Manage Users
                  </Button>
                  <Button variant="outline" disabled>
                    System Settings
                  </Button>
                  <Button variant="outline" disabled>
                    Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Exec Tools (for exec and admin) */}
          {(user?.role === 'exec' || user?.role === 'admin') && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-purple-600">
                  <Shield className="w-5 h-5" />
                  <span>Executive Tools</span>
                </CardTitle>
                <CardDescription>
                  Tools for executive board members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" disabled>
                    Event Management
                  </Button>
                  <Button variant="outline" disabled>
                    Member Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
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