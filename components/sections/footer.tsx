"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Instagram, Linkedin, Mail } from "lucide-react"
import { useTheme } from "next-themes"
import Image from "next/image"

interface FooterProps {
  scrollToSection: (href: string) => void
}

export function Footer({ scrollToSection }: FooterProps) {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const logoSrc = mounted && theme === "dark" 
    ? "/ktp-logos/KTP Logo Dark Plain No BG.png" 
    : "/ktp-logos/KTP Logo Plain Text.png"

  return (
    <footer className="bg-muted/50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <Image
                src={logoSrc}
                alt="KTP Logo"
                width={120}
                height={60}
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="text-muted-foreground mb-4">
              The premier technology fraternity at Indiana University, building the future one student at a time.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <a href="https://instagram.com/ktp.iu" target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="https://www.linkedin.com/company/kappa-theta-pi-indiana-university" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="mailto:ktpindiana@gmail.com">
                  <Mail className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <button 
                onClick={() => scrollToSection('#home')}
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('#rush')}
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Rush
              </button>
              <button 
                onClick={() => scrollToSection('#members')}
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Members
              </button>
              <button 
                onClick={() => scrollToSection('#partnerships')}
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Partnerships
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>ktpindiana@gmail.com</p>
              <p>Indiana University</p>
              <p>Bloomington, IN 47405</p>
            </div>
          </div>
        </div>
        
        <Separator className="my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
                      <p className="text-sm text-muted-foreground">
              © 2025 Kappa Theta Pi - Indiana University. All rights reserved.
            </p>
          <p className="text-sm text-muted-foreground mt-2 md:mt-0">
            Designed by Aadvait Hirde
          </p>
        </div>
      </div>
    </footer>
  )
}