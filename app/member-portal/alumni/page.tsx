"use client"

import { ProtectedRoute } from '@/components/auth/protected-route'
import { PageLayout } from '@/components/member-portal/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Clock, Building, Briefcase } from 'lucide-react'

function AlumniPageContent() {
  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <h1 className="text-2xl md:text-3xl font-bold">Alumni Directory</h1>

        {/* Coming Soon Card */}
        <Card>
          <CardContent className="text-center py-12 md:py-16">
            <Users className="h-12 md:h-16 w-12 md:w-16 text-muted-foreground mx-auto mb-4 md:mb-6" />
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Directory Coming Soon</h2>
            <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6 max-w-2xl mx-auto px-4">
              We&apos;re currently curating a comprehensive list of our amazing KTP alumni. 
              Check back soon for networking opportunities and career insights!
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Expected launch: Fall 2025</span>
            </div>
          </CardContent>
        </Card>

        {/* Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Top Companies</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Our alumni work at leading tech companies:
              </p>
              <ul className="text-sm space-y-1">
                <li>• Google, Microsoft, Meta</li>
                <li>• Amazon, Apple, Netflix</li>
                <li>• Startups and Fortune 500s</li>
                <li>• And many more!</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5" />
                <span>Career Paths</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Diverse career opportunities:
              </p>
              <ul className="text-sm space-y-1">
                <li>• Software Engineering</li>
                <li>• Product Management</li>
                <li>• Data Science & Analytics</li>
                <li>• Consulting & Finance</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Networking</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Connect with alumni for:
              </p>
              <ul className="text-sm space-y-1">
                <li>• Career advice & mentorship</li>
                <li>• Job referrals & opportunities</li>
                <li>• Industry insights</li>
                <li>• Professional development</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function AlumniPage() {
  return (
    <ProtectedRoute>
      <PageLayout>
        <AlumniPageContent />
      </PageLayout>
    </ProtectedRoute>
  )
} 