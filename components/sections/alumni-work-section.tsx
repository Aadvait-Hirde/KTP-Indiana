import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import Image from "next/image"

export function AlumniWorkSection() {
  // Company logos arranged in the pattern shown in the user's image
  const companyLogos = [
    // Row 1
    ["google", "microsoft", "deloitte", "jpmorgan", "meta", "citadel", "capital_one", "spotify"],
    // Row 2  
    ["bloomberg", "doordash", "hudson_river_trading", "amazon", "tiktok", "nvidia", "duolingo", "jane_street"],
    // Row 3
    ["pwc", "ey", "accenture", "linkedin", "tesla", "ibm", "cisco", "asana"],
    // Row 4
    ["slack", "figma", "bleacher_report", "stripe", "pnc", "boeing", "salesforce"],
    // Row 5
    ["mongo_db", "vmware", "nike", "uber", "netskope", "att", "ford", "modern_treasury"],
    // Row 6
    ["indeed", "bank_of_america", "workday", "caterpillar", "viget", "united"]
  ]

  return (
    <section id="partnerships" className="py-24 bg-muted/50 relative overflow-hidden">
      {/* Wave Pattern Background */}
      <div className="absolute inset-0 opacity-5">
        <svg 
          className="absolute inset-0 w-full h-full" 
          viewBox="0 0 1200 400"
          preserveAspectRatio="none"
        >
          <path 
            d="M0,160 C400,100 800,220 1200,160 L1200,400 L0,400 Z" 
            fill="currentColor"
            className="text-primary"
          />
        </svg>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter mb-4 text-gray-900 dark:text-white">
            Where KTP Alumni Work
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            KTP graduates are making an impact at top companies worldwide
          </p>
        </div>
        
        {/* One big white container for all logos */}
        <div className="mb-16 bg-white dark:bg-white rounded-2xl p-8">
          <div className="space-y-6">
            {companyLogos.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center items-center gap-4 md:gap-6 lg:gap-8 flex-wrap">
                {row.map((company, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-center p-2 hover:scale-135 transition-transform duration-200 w-20 h-14 md:w-24 md:h-16 lg:w-28 lg:h-18"
                  >
                    <Image
                      src={`/company-logos/${company}.png`}
                      alt={company.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      width={100}
                      height={50}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        
        <Card className="max-w-2xl mx-auto text-center bg-card dark:bg-card border-border dark:border-border">
          <CardHeader>
            <CardTitle className="text-foreground dark:text-foreground">Partner with KTP</CardTitle>
            <CardDescription className="text-muted-foreground dark:text-muted-foreground">
              Connect with talented students and help shape the next generation of technologists
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                variant="outline" 
                size="lg" 
                className="text-foreground dark:text-foreground border-border dark:border-border hover:bg-muted dark:hover:bg-muted"
                onClick={() => window.open('https://airtable.com/apptTTB2WqRF4M8y7/pagLnzIFluCfywg6q/form', '_blank')}
              >
                Partnership Opportunities
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="secondary" 
                size="lg" 
                className="bg-muted dark:bg-muted text-foreground dark:text-foreground hover:bg-muted/80 dark:hover:bg-muted/80"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = '/KTP Sponsorship Packet.pdf';
                  link.download = 'KTP Sponsorship Packet.pdf';
                  link.click();
                }}
              >
                View our Sponsorship Packet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
} 