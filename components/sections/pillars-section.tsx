import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, BookOpen, Users, GraduationCap, Code } from "lucide-react"

export function PillarsSection() {
  const pillars = [
    {
      icon: Briefcase,
      title: "Professional Development",
      description: "Workshops, mentorship and networking opportunities to accelerate your career growth."
    },
    {
      icon: BookOpen,
      title: "Academic Support",
      description: "Study groups, tutoring, and academic resources to help you excel in your coursework and beyond."
    },
    {
      icon: Users,
      title: "Social Growth",
      description: "Events, retreats, and community building that create lifelong bonds and lasting friendships."
    },
    {
      icon: GraduationCap,
      title: "Alumni Connections",
      description: "Access to a powerful network of graduates working at top companies across the technology industry."
    },
    {
      icon: Code,
      title: "Technical Advancement",
      description: "Hackathons, product teams, tech talks, and hands-on projects to sharpen your technical skills."
    }
  ]

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Dots Pattern in Top Right */}
      <div className="absolute top-0 right-0 w-80 h-80 opacity-10">
        <svg 
          className="w-full h-full" 
          viewBox="0 0 200 200"
        >
          {Array.from({ length: 144 }).map((_, i) => {
            const row = Math.floor(i / 12)
            const col = i % 12
            // Use deterministic opacity based on position
            const opacity = 0.2 + (0.6 * ((i * 7) % 100)) / 100
            return (
              <circle
                key={i}
                cx={col * 16 + 8}
                cy={row * 16 + 8}
                r="1.5"
                fill="currentColor"
                className="text-primary"
                opacity={opacity}
              />
            )
          })}
        </svg>
      </div>

      {/* Dots Pattern in Bottom Left */}
      <div className="absolute bottom-0 left-0 w-80 h-80 opacity-10">
        <svg 
          className="w-full h-full" 
          viewBox="0 0 200 200"
        >
          {Array.from({ length: 144 }).map((_, i) => {
            const row = Math.floor(i / 12)
            const col = i % 12
            // Use deterministic opacity based on position
            const opacity = 0.2 + (0.6 * ((i * 11) % 100)) / 100
            return (
              <circle
                key={`bottom-${i}`}
                cx={col * 16 + 8}
                cy={row * 16 + 8}
                r="1.5"
                fill="currentColor"
                className="text-primary"
                opacity={opacity}
              />
            )
          })}
        </svg>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter mb-4">
            Our Five Pillars
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything we do is built on these foundational principles
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {pillars.map((pillar, index) => {
            const IconComponent = pillar.icon
            return (
              <Card key={index} className="text-center h-full flex flex-col group shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
                <CardHeader className="flex-none">
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="h-6 w-6 text-black dark:text-white transition-colors duration-300" />
                  </div>
                  <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors duration-300">{pillar.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center">
                  <CardDescription className="text-sm leading-relaxed text-center">
                    {pillar.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
} 