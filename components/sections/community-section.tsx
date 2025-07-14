"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Linkedin, Instagram } from "lucide-react"

export function CommunitySection() {
  const activeMembers = [
    // New leadership members - first row
    { name: "Karthik Bangaru", major: "Director of Social Media Strategy", year: "Freshman", initials: "KB", image: "/member-headshots/karthik.jpg" },
    { name: "Lawrence Hermanto", major: "Director of New Member Education", year: "Sophomore", initials: "LH", image: "/member-headshots/lawrence.png" },
    { name: "Alex Spalevic", major: "Director of Community Service and Philanthropy", year: "Sophomore", initials: "AS", image: "/member-headshots/alex_spalevic.png" },
    { name: "Jason Ballinger", major: "Director of Fundraising", year: "Sophomore", initials: "JB", image: "/member-headshots/jason.png" },
    // Regular members
    { name: "Margaret Asho", major: "Political Science", year: "Sophomore", initials: "MA", image: "/member-headshots/margaret.png" },
    { name: "George Mitchell Herzog", major: "Cybersecurity and Global Policy", year: "Freshman", initials: "GH", image: "/member-headshots/george.png" },
    { name: "Tristan Kean", major: "Computer Science", year: "Freshman", initials: "TK", image: "/member-headshots/tristan.png" },
    { name: "Carl Fampo", major: "Computer Science", year: "Sophomore", initials: "CF", image: "/member-headshots/carl.png" },
    { name: "Carolyn Thomas", major: "Finance", year: "Sophomore", initials: "CT", image: "/member-headshots/carolyn.png" },
    { name: "Niva Vadalia", major: "Information Systems, Business Analytics", year: "Sophomore", initials: "NV", image: "/member-headshots/niva.png" },
    { name: "Pratham Taparia", major: "Informatics", year: "Freshman", initials: "PT", image: "/member-headshots/pratham.png" },
    { name: "Alex Daniel Johnson", major: "Computer Science", year: "Freshman", initials: "AJ", image: "/member-headshots/alex_johnson.png" },
    { name: "Yilin Li", major: "Informatics with focus in HCI", year: "Sophomore", initials: "YL", image: "/member-headshots/yilin.png" },
    { name: "Sri Ram Sai Vallabhaneni", major: "Finance", year: "Sophomore", initials: "SV", image: "/member-headshots/sriram.png" },
    { name: "Aaditya Rajvanshi", major: "Information Systems", year: "Freshman", initials: "AR", image: "/member-headshots/aaditya.png" },
    { name: "Adam Thason", major: "B.S. Intelligent Systems Engineering", year: "Freshman", initials: "AT", image: "/member-headshots/adam.png" },
    { name: "Utsavi Gilder", major: "Informatics", year: "Freshman", initials: "UG", image: "/member-headshots/utsavi.png" },
    { name: "Rhea Shah", major: "Computer Science", year: "Freshman", initials: "RS", image: "/member-headshots/rhea.png" },
    { name: "Jorge Sebastian Diaz", major: "Business Management & Analytics", year: "Sophomore", initials: "JD", image: "/member-headshots/jorge.png" },
    { name: "Nithya Mooli", major: "Information Systems and Finance", year: "Sophomore", initials: "NM", image: "/member-headshots/nithya.png" },
    { name: "Rishi Bhuthpur", major: "Information Systems, Informatics", year: "Freshman", initials: "RB", image: "/member-headshots/rishi.png" },
    { name: "Amrutha Balla", major: "Finance and Accounting", year: "Sophomore", initials: "AB", image: "/member-headshots/amrutha.png" },
    { name: "Travis Garcia", major: "Information Systems, Business Analytics", year: "Freshman", initials: "TG", image: "/member-headshots/travis.png" },
    { name: "Srika Sudheer", major: "Marketing & Digital Technology Management", year: "Sophomore", initials: "SS", image: "/member-headshots/srika.png" },
    { name: "Ethan Abilius", major: "Finance", year: "Freshman", initials: "EA", image: "/member-headshots/ethan.png" },
    { name: "Akshay Boddapu", major: "Information Systems, Business Analytics", year: "Sophomore", initials: "AB", image: "/member-headshots/akshay.png" },
    { name: "Arnav Pydimukkala", major: "Finance", year: "Freshman", initials: "AP", image: "/member-headshots/arnav.png" },
    { name: "Dhanali Kantilal", major: "Marketing", year: "Freshman", initials: "DK", image: "/member-headshots/dhanali.png" },
    { name: "Tanya Kalale", major: "Information Systems, Marketing, & Business Analytics", year: "Sophomore", initials: "TK", image: "/member-headshots/tanya.png" },
    { name: "Vini Premkumar", major: "Information Systems, Operations Management, Business Analytics", year: "Freshman", initials: "VP", image: "/member-headshots/vini.png" },
    { name: "Veer Nangia", major: "Finance", year: "Freshman", initials: "VN", image: "/member-headshots/veer.png" },
    { name: "Alexander Balon", major: "Information Systems, Business Analytics", year: "Freshman", initials: "AB", image: "/member-headshots/alex_balon.png" },
    { name: "Benedict Yiga", major: "Computer Science", year: "Sophomore", initials: "BY", image: "/member-headshots/benedict.png" },
    { name: "Sankalpa Hedge", major: "Informatics", year: "Sophomore", initials: "SH", image: "/member-headshots/sankalpa.png" },
  ]



  return (
    <section id="members" className="py-24 bg-muted/50 relative overflow-hidden">
      {/* Wave Pattern Background similar to About section */}
      <div className="absolute inset-0 opacity-5">
        <svg 
          className="absolute inset-0 w-full h-full" 
          viewBox="0 0 1200 400"
          preserveAspectRatio="none"
        >
          <path 
            d="M0,220 C400,160 800,280 1200,220 L1200,400 L0,400 Z" 
            fill="currentColor"
            className="text-primary"
          />
          <path 
            d="M0,260 C300,200 600,320 1200,240 L1200,400 L0,400 Z" 
            fill="currentColor"
            className="text-primary opacity-60"
          />
        </svg>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter mb-4">
            Our Community
          </h2>
          <p className="text-lg text-muted-foreground">
            Connect with active members and alumni
          </p>
        </div>
        
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8 h-12 bg-muted/50">
            <TabsTrigger 
              value="active" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 rounded-md font-medium"
            >
              Active Members
            </TabsTrigger>
            <TabsTrigger 
              value="alumni" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 rounded-md font-medium"
            >
              Alumni
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="mt-8 animate-in fade-in-50 duration-500">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                             {activeMembers.map((member, index) => (
                   <Card key={index} className="group hover:shadow-lg hover:scale-105 transition-all duration-300 border hover:border-primary/30 flex flex-col h-full">
                     <CardHeader className="text-center p-3 flex-none">
                       <Avatar className="h-14 w-14 mx-auto mb-3 ring-2 ring-transparent group-hover:ring-primary/30 transition-all duration-300">
                         <AvatarImage src={member.image} />
                         <AvatarFallback className="text-sm bg-gradient-to-br from-primary/20 to-primary/10">
                           {member.initials}
                         </AvatarFallback>
                       </Avatar>
                       <div className="h-12 flex flex-col justify-center">
                         <CardTitle className="text-sm group-hover:text-primary transition-colors leading-normal mb-1">
                           {member.name}
                         </CardTitle>
                       </div>
                       <div className="h-8 flex items-center justify-center">
                         <CardDescription className="text-xs leading-tight line-clamp-2 text-center">
                           {member.major} • {member.year}
                         </CardDescription>
                       </div>
                     </CardHeader>
                     <CardContent className="text-center pt-0 pb-2 px-3 mt-auto">
                       <div className="flex justify-center items-center space-x-1 h-6">
                         <Button 
                           variant="ghost" 
                           size="icon" 
                           className="h-6 w-6 hover:bg-primary/10 hover:text-primary transition-colors"
                         >
                           <Linkedin className="h-3 w-3" />
                         </Button>
                         <Button 
                           variant="ghost" 
                           size="icon" 
                           className="h-6 w-6 hover:bg-primary/10 hover:text-primary transition-colors"
                         >
                           <Instagram className="h-3 w-3" />
                         </Button>
                       </div>
                     </CardContent>
                   </Card>
               ))}
            </div>
          </TabsContent>
          
          <TabsContent value="alumni" className="mt-8 animate-in fade-in-50 duration-500">
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <h3 className="text-xl font-semibold mb-4">No Alumni Yet</h3>
                <p className="text-muted-foreground">
                  As our first generation of brothers, current members will become our founding alumni. 
                  Check back soon to see where they land!
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
} 