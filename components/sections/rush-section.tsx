import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MapPin, Clock, Shirt } from "lucide-react"

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
            Fall 2025 Rush Schedule
          </h2>
          <p className="text-lg text-muted-foreground">
            Join us for rush events and discover what KTP has to offer
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Professional Fraternity Night */}
            <Card className="hover:shadow-lg transition-shadow duration-300 p-6">
              <CardHeader className="pb-0">
                <div className="flex items-center mb-2">
                  <div className="h-14 w-14 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                    <Calendar className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold mb-1">
                      Professional Fraternity Night
                    </CardTitle>
                    <p className="text-lg font-semibold text-primary">September 5, 2025</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-center text-base font-medium">
                  <Clock className="h-5 w-5 mr-3 text-primary" />
                  6:00 PM - 8:00 PM
                </div>
                <div className="flex items-center text-base font-medium">
                  <MapPin className="h-5 w-5 mr-3 text-primary" />
                  HH 2083, HH 2075, HH 1055, HH 1006
                </div>
                <div className="flex items-center text-base font-medium">
                  <Shirt className="h-5 w-5 mr-3 text-primary" />
                  Casual
                </div>
              </CardContent>
            </Card>

            {/* Meet the Chapter */}
            <Card className="hover:shadow-lg transition-shadow duration-300 p-6">
              <CardHeader className="pb-0">
                <div className="flex items-center mb-2">
                  <div className="h-14 w-14 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                    <Calendar className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold mb-1">
                      Meet the Chapter
                    </CardTitle>
                    <p className="text-lg font-semibold text-primary">September 7, 2025</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-center text-base font-medium">
                  <Clock className="h-5 w-5 mr-3 text-primary" />
                  8:00 PM - 10:00 PM
                </div>
                <div className="flex items-center text-base font-medium">
                  <MapPin className="h-5 w-5 mr-3 text-primary" />
                  HH 2046, HH 2047, HH 2049, HH 2050
                </div>
                <div className="flex items-center text-base font-medium">
                  <Shirt className="h-5 w-5 mr-3 text-primary" />
                  Business Professional
                </div>
              </CardContent>
            </Card>

            {/* Just Dance with KTP */}
            <Card className="hover:shadow-lg transition-shadow duration-300 p-6">
              <CardHeader className="pb-0">
                <div className="flex items-center mb-2">
                  <div className="h-14 w-14 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                    <Calendar className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold mb-1">
                      Just Dance with KTP!
                    </CardTitle>
                    <p className="text-lg font-semibold text-primary">September 9, 2025</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-center text-base font-medium">
                  <Clock className="h-5 w-5 mr-3 text-primary" />
                  8:00 PM - 10:00 PM
                </div>
                <div className="flex items-center text-base font-medium">
                  <MapPin className="h-5 w-5 mr-3 text-primary" />
                  FA 015
                </div>
                <div className="flex items-center text-base font-medium">
                  <Shirt className="h-5 w-5 mr-3 text-primary" />
                  Casual
                </div>
              </CardContent>
            </Card>

            {/* KTP's Noche de Baile */}
            <Card className="hover:shadow-lg transition-shadow duration-300 p-6">
              <CardHeader className="pb-0">
                <div className="flex items-center mb-2">
                  <div className="h-14 w-14 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                    <Calendar className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold mb-1">
                      KTP&apos;s Noche de Baile
                    </CardTitle>
                    <p className="text-lg font-semibold text-primary">September 11, 2025</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-center text-base font-medium">
                  <Clock className="h-5 w-5 mr-3 text-primary" />
                  5:30 PM - 8:30 PM
                </div>
                <div className="flex items-center text-base font-medium">
                  <MapPin className="h-5 w-5 mr-3 text-primary" />
                  IMU Whittenberger Auditorium
                </div>
                <div className="flex items-center text-base font-medium">
                  <Shirt className="h-5 w-5 mr-3 text-primary" />
                  Business Professional
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          <div className="mt-12 text-center space-y-2">
            <p className="text-lg text-muted-foreground">
              Ready to rush KTP? Don&apos;t miss out on these exciting rush events!
            </p>
            <p className="text-muted-foreground">
              Have questions? Feel free to reach out to us on social media or via email. See you soon!
            </p>
          </div>
        </div>
      </div>
    </section>
  )
} 