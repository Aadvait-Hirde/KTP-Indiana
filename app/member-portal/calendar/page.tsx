"use client"

import { ProtectedRoute } from '@/components/auth/protected-route'
import { PageLayout } from '@/components/member-portal/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, ExternalLink } from 'lucide-react'

function CalendarPageContent() {
  const ktpCalendarUrl = "https://calendar.google.com/calendar/embed?src=ktpindiana%40gmail.com&ctz=America%2FLos_Angeles"
  const publicCalendarUrl = "https://calendar.google.com/calendar/embed?src=ktpindiana%40gmail.com&ctz=America%2FLos_Angeles"

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">KTP Calendar</h1>
          <a
            href={publicCalendarUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="w-full sm:w-auto">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in Google Calendar
            </Button>
          </a>
        </div>

        {/* Full Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Full Calendar View</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full h-[600px] md:h-[800px]">
              <iframe
                src={ktpCalendarUrl}
                style={{ 
                  border: 0,
                  width: '100%',
                  height: '100%',
                  borderRadius: '0 0 8px 8px'
                }}
                frameBorder="0"
                scrolling="no"
                title="KTP Indiana Calendar"
                className="rounded-b-lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <Card>
            <CardContent className="p-4 md:p-6 text-center">
              <h3 className="font-semibold mb-2">Rush Events</h3>
              <p className="text-sm text-muted-foreground">
                Info sessions, mixers, and recruitment activities
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 md:p-6 text-center">
              <h3 className="font-semibold mb-2">General Meetings</h3>
              <p className="text-sm text-muted-foreground">
                Monthly meetings and tech talks with guest speakers
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 md:p-6 text-center">
              <h3 className="font-semibold mb-2">Social Events</h3>
              <p className="text-sm text-muted-foreground">
                Networking events, hackathons, and member activities
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function CalendarPage() {
  return (
    <ProtectedRoute>
      <PageLayout>
        <CalendarPageContent />
      </PageLayout>
    </ProtectedRoute>
  )
} 