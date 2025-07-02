"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, ExternalLink, Maximize2, Minimize2 } from 'lucide-react'

export function CalendarWidget() {
  // KTP Indiana Calendar Integration
  const [isExpanded, setIsExpanded] = useState(false)

  const ktpCalendarUrl = "https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=America%2FIndiana%2FIndianapolis&showPrint=0&title=KTP%20Website%20Calendar&src=ktpindiana%40gmail.com&color=%23039be5"
  const publicCalendarUrl = "https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=America%2FIndiana%2FIndianapolis&showPrint=0&title=KTP%20Website%20Calendar&src=ktpindiana%40gmail.com&color=%23039be5"

  if (isExpanded) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>KTP Indiana Calendar</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <a
                href={publicCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center space-x-1"
              >
                <span>Open in Google</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="flex items-center space-x-1"
              >
                <Minimize2 className="h-3 w-3" />
                <span>Minimize</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full h-[600px]">
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
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>KTP Calendar</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <a
              href={publicCalendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center space-x-1"
            >
              <span>View Full</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Quick Calendar Preview */}
          <div className="border rounded-lg overflow-hidden">
            <iframe
              src={`${ktpCalendarUrl}&showTitle=0&showPrint=0&showTabs=0&showCalendars=0&mode=AGENDA&height=300`}
              style={{ 
                border: 0,
                width: '100%',
                height: '300px'
              }}
              frameBorder="0"
              scrolling="no"
              title="KTP Indiana Calendar Preview"
            />
          </div>

          {/* Expand Button */}
          <Button
            variant="outline"
            onClick={() => setIsExpanded(true)}
            className="w-full flex items-center space-x-2"
          >
            <Maximize2 className="h-4 w-4" />
            <span>View Full Calendar</span>
          </Button>

          {/* Quick Info */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Badge variant="outline" className="text-xs">
                Live Calendar
              </Badge>
              <span>Updates automatically from KTP Indiana</span>
            </div>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Rush events and info sessions</p>
              <p>• General meetings and tech talks</p>
              <p>• Social events and networking</p>
              <p>• Assignment deadlines and important dates</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 