import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Bell } from "lucide-react"

export function RushSection() {
  return (
    <section id="rush" className="py-24 bg-muted/50 relative overflow-hidden">
      {/* Dots Pattern Background */}
      <div className="absolute inset-0 opacity-10">
        {/* Dots Pattern in Top Right */}
        <div className="absolute top-0 right-0 w-60 h-60">
          <svg 
            className="w-full h-full" 
            viewBox="0 0 200 200"
          >
            {Array.from({ length: 100 }).map((_, i) => {
              const row = Math.floor(i / 10)
              const col = i % 10
              const opacity = 0.2 + (0.6 * ((i * 7) % 100)) / 100
              return (
                <circle
                  key={i}
                  cx={col * 20 + 10}
                  cy={row * 20 + 10}
                  r="2"
                  fill="currentColor"
                  className="text-primary"
                  opacity={opacity}
                />
              )
            })}
          </svg>
        </div>

        {/* Dots Pattern in Bottom Left */}
        <div className="absolute bottom-0 left-0 w-60 h-60">
          <svg 
            className="w-full h-full" 
            viewBox="0 0 200 200"
          >
            {Array.from({ length: 100 }).map((_, i) => {
              const row = Math.floor(i / 10)
              const col = i % 10
              const opacity = 0.2 + (0.6 * ((i * 11) % 100)) / 100
              return (
                <circle
                  key={`bottom-${i}`}
                  cx={col * 20 + 10}
                  cy={row * 20 + 10}
                  r="2"
                  fill="currentColor"
                  className="text-primary"
                  opacity={opacity}
                />
              )
            })}
          </svg>
        </div>

        {/* Dots Pattern in Center */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40">
          <svg 
            className="w-full h-full" 
            viewBox="0 0 200 200"
          >
            {Array.from({ length: 64 }).map((_, i) => {
              const row = Math.floor(i / 8)
              const col = i % 8
              const opacity = 0.1 + (0.4 * ((i * 13) % 100)) / 100
              return (
                <circle
                  key={`center-${i}`}
                  cx={col * 25 + 12.5}
                  cy={row * 25 + 12.5}
                  r="1.5"
                  fill="currentColor"
                  className="text-primary"
                  opacity={opacity}
                />
              )
            })}
          </svg>
        </div>
        
        {/* Wave pattern */}
        
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter mb-4">
            Rush Schedule
          </h2>
          <p className="text-lg text-muted-foreground">
            Join us for rush events and discover what KTP has to offer
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <Card className="text-center p-8">
            <CardHeader>
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl mb-4">
                Spring 2025 Rush Complete
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg text-muted-foreground">
                This semester&apos;s rush has concluded. Stay tuned for our Fall 2025 rush calendar!
              </p>
              <p className="text-muted-foreground">
                In the meantime, feel free to reach out to us on social media or via email if you have any questions about KTP.
              </p>
              <Button variant="outline" size="lg" className="mt-6">
                <Bell className="mr-2 h-4 w-4" />
                Get Notified for Fall Rush
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
} 