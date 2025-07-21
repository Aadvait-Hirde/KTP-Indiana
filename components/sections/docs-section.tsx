import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, ExternalLink, Users, BookOpen } from "lucide-react"
import Link from "next/link"

export function DocsSection() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg 
          className="absolute inset-0 w-full h-full" 
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern id="docs-grid" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#docs-grid)" className="text-primary" />
        </svg>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter mb-4">
            Documentation & Resources
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Access comprehensive guides, templates, and resources to help new chapters get off the ground
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Description */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">New Chapter & Colony Documentation</h3>
              <p className="text-lg text-muted-foreground">
                A comprehensive resource created by KTP chapters from Indiana, Ohio State, UMich, and Virginia Tech. 
                This living guide covers everything from rush and pledgeship to operations, marketing, and alumni relations.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Rush & Recruitment</h4>
                  <p className="text-sm text-muted-foreground">Complete timeline and strategies</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Constitution & Governance</h4>
                  <p className="text-sm text-muted-foreground">Templates and examples</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Operations Guide</h4>
                  <p className="text-sm text-muted-foreground">Day-to-day chapter management</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <ExternalLink className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Templates & Tools</h4>
                  <p className="text-sm text-muted-foreground">Ready-to-use resources</p>
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-all duration-300">
                <Link href="/docs">
                  <FileText className="w-4 h-4 mr-2" />
                  Access Documentation
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Right side - Visual */}
          <div className="relative">
            <Card className="border-2 border-dashed border-primary/20 bg-muted/30">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Comprehensive Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 px-3 bg-background/50 rounded-lg">
                    <span className="text-sm font-medium">Rush & Recruitment</span>
                    <span className="text-xs text-muted-foreground">12 pages</span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 bg-background/50 rounded-lg">
                    <span className="text-sm font-medium">Constitution Templates</span>
                    <span className="text-xs text-muted-foreground">8 pages</span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 bg-background/50 rounded-lg">
                    <span className="text-sm font-medium">Operations & Management</span>
                    <span className="text-xs text-muted-foreground">15 pages</span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 bg-background/50 rounded-lg">
                    <span className="text-sm font-medium">Marketing & Branding</span>
                    <span className="text-xs text-muted-foreground">10 pages</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground text-center">
                    Updated regularly by active chapters
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
} 