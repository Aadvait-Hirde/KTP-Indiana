import React from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FAQSection() {
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

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about KTP
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-1" className="border border-border rounded-lg px-6 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                What if I have no previous tech experience?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                No prior tech experience is needed to join KTP. We seek potential in problem-solving, communication, and analytical skills, as well as a genuine passion for tech. If these qualities resonate with you, you&apos;ll fit right in.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2" className="border border-border rounded-lg px-6 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                What does the time commitment look like?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Pledging for KTP typically requires a 2-5 hour per week commitment. After initiation, this time commitment decreases, but how much you get out of KTP depends on what you put into it, as is the case with all campus organizations.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3" className="border border-border rounded-lg px-6 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                What if I can&apos;t afford dues?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Although we aim to minimize quarterly costs, we offer financial aid for those unable to afford dues. For accommodation requests or more information, contact us.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4" className="border border-border rounded-lg px-6 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                Which majors are represented in KTP?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Kappa Theta Pi&apos;s members come from many tech-related majors, including Computer Science, Economics, Finance, Engineering and many more. We welcome all who are passionate about tech, regardless of major.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5" className="border border-border rounded-lg px-6 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                How does KTP help with career development?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                We offer mentorship programs, resume reviews, mock interviews, networking events with industry professionals, YC-style demo days, Shark Tanks and connections to our extensive alumni network at top tech companies.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-6" className="border border-border rounded-lg px-6 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                What&apos;s the rush process like?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Our rush process includes Professional Fraternity Night, Meet the Chapter, two Open Rush events, followed by an application round, and four Closed Rush events.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  )
} 