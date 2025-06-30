"use client"

import React, { useEffect, useRef, useState } from "react"
import Image from "next/image"

export function AboutSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="py-24 bg-muted/50 relative overflow-hidden">
      {/* Background Wave Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg 
          className="absolute inset-0 w-full h-full" 
          viewBox="0 0 1200 400"
          preserveAspectRatio="none"
        >
          <path 
            d="M0,120 C400,60 800,180 1200,120 L1200,400 L0,400 Z" 
            fill="currentColor"
            className="text-primary"
          />
          <path 
            d="M0,160 C300,100 600,220 1200,140 L1200,400 L0,400 Z" 
            fill="currentColor"
            className="text-primary opacity-60"
          />
        </svg>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className={`space-y-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter">
              About KTP
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p className="text-lg leading-relaxed tracking-tight">
                Founded in 2012, Kappa Theta Pi has grown to become one of the most prestigious 
                technology fraternities in the nation, with chapters at top universities across 
                the country.
              </p>
              <p className="text-lg leading-relaxed tracking-tight">
                Our mission is to foster a community of passionate technologists who support 
                each other&apos;s growth both professionally and personally. We believe in the power 
                of technology to create positive change in the world.
              </p>
              <blockquote className="italic border-l-4 border-primary pl-4 py-2">
                &ldquo;Being in KTP has absolutely changed my college experience, I&apos;ve learnt incredible things, formed deep bonds with my brothers, and gained experience that I never would&apos;ve gotten from class alone.&rdquo;
                <cite className="block mt-2 text-sm font-medium">
                  — Adam Thason, Alpha Class
                </cite>
              </blockquote>
            </div>
          </div>
          <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden">
              <Image
                src="/about-section-images/pledge_class.jpeg"
                alt="KTP Pledge Class"
                fill
                className="object-cover rounded-sm hover:scale-110 transition-transform duration-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 