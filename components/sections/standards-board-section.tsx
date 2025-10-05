import React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Linkedin, Instagram } from "lucide-react"

export function StandardsBoardSection() {
  const boardMembers = [
    {
        name: "Yilin Li",
        position: "Informatics with focus in HCI",
        year: "Junior",
        initials: "YL",
        image: "/member-headshots/yilin.png" 
    },
    { 
        name: "Utsavi Gilder",
        major: "Informatics",
        year: "Sophomore",
        initials: "UG",
        image: "/member-headshots/utsavi.png"
    },
    { 
        name: "George Mitchell Herzog",
        major: "Cybersecurity and Global Policy", 
        year: "Sophomore", 
        initials: "GH", 
        image: "/member-headshots/george.png" 
    },
    { 
        name: "Tristan Kean", 
        major: "Computer Science", 
        year: "Sophomore", 
        initials: "TK", 
        image: "/member-headshots/tristan.png" 
    },
    { 
        name: "Alex Daniel Johnson", 
        major: "Computer Science", 
        year: "Sophomore", 
        initials: "AJ", 
        image: "/member-headshots/alex_johnson.png" 
    },
  ]

  const renderCard = (member: typeof boardMembers[0], index: number) => (
    <Card key={index} className="group hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 hover:border-primary/20 w-full">
      <CardHeader className="text-center pb-2">
        <Avatar className="h-24 w-24 mx-auto mb-3 ring-4 ring-transparent group-hover:ring-primary/20 transition-all duration-300">
          <AvatarImage src={member.image} className="group-hover:scale-110 transition-transform duration-300" />
          <AvatarFallback className="text-lg bg-gradient-to-br from-primary/20 to-primary/10">
            {member.initials}
          </AvatarFallback>
        </Avatar>
      </CardHeader>
      <CardContent className="text-center space-y-2 pb-4">
        <h3 className="text-lg font-bold group-hover:text-primary transition-colors duration-300">
          {member.name}
        </h3>
        <p className="text-sm font-medium text-muted-foreground">
          {member.major} • {member.year}
        </p>
        <div className="flex justify-center space-x-2 pt-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <Linkedin className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <Instagram className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <section className="py-24 bg-muted/50 relative overflow-hidden">
      {/* Updated Triangle Background */}
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
            Standards Board
          </h2>
        </div>
        
        {/* First row - 5 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 justify-items-center">
          {boardMembers.slice(0, 5).map((member, index) => renderCard(member, index))}
        </div>
      </div>
    </section>
  )
} 