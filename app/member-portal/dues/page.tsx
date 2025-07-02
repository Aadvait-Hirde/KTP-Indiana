"use client"

import { ProtectedRoute } from '@/components/auth/protected-route'
import { PageLayout } from '@/components/member-portal/page-layout'
import { useAuthStore } from '@/lib/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreditCard, ExternalLink } from 'lucide-react'
import Image from 'next/image'

function DuesPageContent() {
  const { user } = useAuthStore()

  const getDuesLink = () => {
    if (user?.role === 'newmember') {
      return 'https://collect.crowded.me/collection/4fac4104-27d2-46ea-8bac-2b22803de573'
    }
    return 'https://collect.crowded.me/collection/3afb7113-1cab-47d1-894d-117c6ed06ec4'
  }

  const getDuesImage = () => {
    if (user?.role === 'newmember') {
      return '/portal-images/new-member-dues/new-member-dues.png'
    }
    return '/portal-images/active-dues/active-dues.png'
  }

  const getDuesTitle = () => {
    if (user?.role === 'newmember') {
      return 'New Member Dues Payment'
    }
    return 'Active Member Dues Payment'
  }

  const getDuesDescription = () => {
    if (user?.role === 'newmember') {
      return 'Welcome to KTP! Please complete your new member dues payment to finalize your membership.'
    }
    return 'Keep your membership active by paying your semester dues.'
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">{getDuesTitle()}</h1>
          <a
            href={getDuesLink()}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="w-full sm:w-auto">
              <ExternalLink className="h-4 w-4 mr-2" />
              Pay Now
            </Button>
          </a>
        </div>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Payment Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {getDuesDescription()}
            </p>
            <div className="space-y-2 text-sm">
              <p>• Secure payment processing through Crowded.me</p>
              <p>• Multiple payment methods accepted</p>
              <p>• Receipt will be sent to your email</p>
              <p>• Contact leadership if you have any questions</p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Card */}
        <Card>
          <CardContent className="p-0">
            <a 
              href={getDuesLink()} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block"
            >
              <Image
                src={getDuesImage()}
                alt={getDuesTitle()}
                width={1200}
                height={800}
                className="w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity rounded-lg"
                style={{ marginBottom: 0 }}
                quality={100}
                priority
              />
            </a>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <Card>
            <CardContent className="p-4 md:p-6">
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                If you&apos;re experiencing issues with payment or have questions about dues:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Contact Aadvait or Shreyas</li>
                <li>• Reach out on Slack</li>
                <li>• Email ktpindiana@gmail.com</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 md:p-6">
              <h3 className="font-semibold mb-2">Payment Schedule</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Dues are collected each semester to support:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Chapter events and activities</li>
                <li>• Professional development</li>
                <li>• National organization fees</li>
                <li>• Social events and networking</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function DuesPage() {
  return (
    <ProtectedRoute>
      <PageLayout>
        <DuesPageContent />
      </PageLayout>
    </ProtectedRoute>
  )
} 