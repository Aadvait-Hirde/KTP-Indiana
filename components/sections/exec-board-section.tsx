import React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Linkedin, Instagram } from "lucide-react"

export function ExecBoardSection() {
  const boardMembers = [
    { 
      name: "Atmikha Jeeju", 
      position: "VP of Professional Development", 
      image: "/exec-headshots/atmikha.png",
      initials: "AJ"
    },
    { 
      name: "Aman Khatri", 
      position: "VP of Membership", 
      image: "/exec-headshots/aman.png",
      initials: "AK"
    },
    { 
      name: "Aadvait Hirde", 
      position: "President", 
      image: "/exec-headshots/aadvait.png",
      initials: "AH"
    },
    { 
      name: "Pranav Vangari", 
      position: "VP of External Affairs", 
      image: "/exec-headshots/pranav.png",
      initials: "PV"
    },
    { 
      name: "Trisha Konkimalla", 
      position: "VP of Social Engagement", 
      image: "/exec-headshots/trisha.png",
      initials: "TK"
    },
    { 
      name: "Saisree Kathi", 
      position: "VP of Marketing", 
      image: "/exec-headshots/saisree.png",
      initials: "SK"
    },
    { 
      name: "Shivani Kamineni", 
      position: "VP of Internal Affairs", 
      image: "/exec-headshots/shivani.png",
      initials: "SK"
    },
    { 
      name: "Sankalpa Hedge", 
      position: "VP of Operations", 
      image: "/exec-headshots/sankalpa.png",
      initials: "SH"
    },
    { 
      name: "Shreyas Sunke", 
      position: "VP of Finance", 
      image: "/exec-headshots/shreyas.JPG",
      initials: "SS"
    },
    { 
      name: "Jake Cole", 
      position: "VP of Tech Development", 
      image: "/exec-headshots/jake.png",
      initials: "JC"
    },    
    { 
      name: "Babara David", 
      position: "VP of DEI", 
      image: "/exec-headshots/babara.png",
      initials: "BD"
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
          {member.position}
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
      <div className="absolute bottom-0 left-0 w-full h-full pointer-events-none">
        <svg 
          viewBox="0 0 100 100" 
          className="absolute bottom-0 left-0 w-full h-full opacity-10"
          preserveAspectRatio="none"
        >
          <path 
            d="M -10 100 L 20 10 Q 21 9 22 10 L 100 70 L 100 100 Z"
            fill="currentColor"
            className="text-primary"
          />
        </svg>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter mb-4">
            Executive Board
          </h2>
          <p className="text-lg text-muted-foreground">
            Meet the leaders driving our chapter forward
          </p>
        </div>
        
        {/* First row - 5 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 justify-items-center">
          {boardMembers.slice(0, 5).map((member, index) => renderCard(member, index))}
        </div>
        
        {/* Second row - 6 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 justify-items-center">
          {boardMembers.slice(5).map((member, index) => renderCard(member, index + 5))}
        </div>
      </div>
    </section>
  )
} 