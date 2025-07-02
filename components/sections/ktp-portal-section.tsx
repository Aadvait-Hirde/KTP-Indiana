"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function KTPPortalSection() {
  const portalImages = [
    { src: "/ktp-portal-section/dashboard.png", alt: "KTP Portal Dashboard" },
    { src: "/ktp-portal-section/announcements.png", alt: "Announcements" },
    { src: "/ktp-portal-section/calendar.png", alt: "Calendar" },
    { src: "/ktp-portal-section/dues.png", alt: "Dues Management" },
    { src: "/ktp-portal-section/login.png", alt: "Portal Login" },
  ]

  // Duplicate images for seamless loop
  const duplicatedImages = [...portalImages, ...portalImages, ...portalImages]

  return (
    <section id="portal" className="py-24 bg-muted/50 relative overflow-hidden">
      {/* Wave Pattern Background */}
      <div className="absolute inset-0 opacity-5">
        <svg 
          className="absolute inset-0 w-full h-full" 
          viewBox="0 0 1200 400"
          preserveAspectRatio="none"
        >
          <path 
            d="M0,180 C400,120 800,240 1200,180 L1200,400 L0,400 Z" 
            fill="currentColor"
            className="text-primary"
          />
          <path 
            d="M0,220 C300,160 600,280 1200,200 L1200,400 L0,400 Z" 
            fill="currentColor"
            className="text-primary opacity-60"
          />
        </svg>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter mb-4">
            KTP Portal
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            The most powerful fraternity member portal you&apos;ll ever use
          </p>
          <Button asChild size="lg" className="mb-8">
            <Link href="/member-portal">
              <ExternalLink className="w-4 h-4 mr-2" />
              Access Portal
            </Link>
          </Button>
        </div>
        
        
                {/* Moving Images Row - Full Width */}
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] h-[432px] overflow-hidden">
          <div className="flex gap-6 animate-scroll-right">
            {duplicatedImages.map((image, index) => (
              <div key={`flow-${index}`} className="flex-shrink-0 w-[768px] h-[432px] bg-white shadow-lg">
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={1920}
                  height={1080}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          
          {/* Gradient Overlays */}
          <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-muted/50 to-transparent z-10" />
          <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-muted/50 to-transparent z-10" />
        </div>
      </div>
    </section>
  )
} 