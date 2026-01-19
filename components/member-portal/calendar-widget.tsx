"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ExternalLink } from "lucide-react";
import { GoogleCalendar } from "./google-calendar";

export function CalendarWidget() {
  const publicCalendarUrl =
    "https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=America%2FIndiana%2FIndianapolis&showPrint=0&title=KTP%20Website%20Calendar&src=ktpindiana%40gmail.com&color=%23039be5";

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
              <span>View in Google Calendar</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* <div className="space-y-4"> */}
        {/* Quick Calendar Preview */}
        <GoogleCalendar />

        {/* Quick Info */}
        {/* <div className="space-y-3">
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
        </div> */}
      </CardContent>
    </Card>
  );
}
