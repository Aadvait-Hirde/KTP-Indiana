"use client"

import React, { useEffect, useRef, useState } from "react"
import Image from "next/image"

export function TestimonialsSection() {
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

  const testimonials = [
    {
      quote: "In the abyss, I found voices. One of them whispered, 'rush KTP.' So I did.",
      author: "Nietzsche",
      context: "probably hallucinating, definitely committed",
      image: "/testimonial-images/nietzsche.png"
    },
    {
      quote: "I rush, therefore I am. Everything else is uncertain, but that moment was real.",
      author: "René Descartes",
      context: "briefly at peace",
      image: "/testimonial-images/rene.png"
    },
    {
      quote: "I didn't know what I was looking for until I found people who cared deeply, laughed loudly, and questioned everything. That's when I knew KTP was the right place.",
      author: "Steve Jobs",
      context: "seeker of the real",
      image: "/testimonial-images/steve.png"
    },
    {
      quote: "I was always shifting, adapting, performing. Then KTP asked nothing of me but presence. For once, I wasn't switching positions, I was just still.",
      author: "Ariana Grande",
      context: "momentarily unmoved",
      image: "/testimonial-images/ariana.png"
    }
  ]

  return (
    <section ref={sectionRef} id="testimonials" className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Wave Pattern Background */}
      

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter mb-4">
            Testimonials
          </h2>
          <p className="text-lg text-muted-foreground">
            Profound insights from great people (probably)
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className={`transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="bg-muted/50 rounded-lg p-6 h-full group hover:shadow-xl hover:scale-105 hover:bg-muted/70 transition-all duration-300 cursor-pointer">
                {/* Image and Quote in one line */}
                <div className="flex items-start gap-4">
                  {/* Author image */}
                  <div className="flex-shrink-0">
                    <Image 
                      src={testimonial.image}
                      alt={testimonial.author}
                      width={48}
                      height={48}
                      className="rounded-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  
                  {/* Quote content and attribution */}
                  <div className="flex-1 space-y-3">
                    <blockquote className="text-base tracking-tight text-foreground leading-relaxed group-hover:text-primary transition-colors duration-300" style={{ fontFamily: 'Times New Roman, serif' }}>
                      &ldquo;{testimonial.quote}&rdquo;
                    </blockquote>
                    
                    {/* Author attribution */}
                    <cite className="block">
                      <div className="font-semibold text-primary text-sm group-hover:text-primary/80 transition-colors duration-300" style={{ fontFamily: 'Times New Roman, serif' }}>
                        — {testimonial.author}
                      </div>
                      <div className="text-xs text-muted-foreground italic" style={{ fontFamily: 'Times New Roman, serif' }}>
                        {testimonial.context}
                      </div>
                    </cite>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 