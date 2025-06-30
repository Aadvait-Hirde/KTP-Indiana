import React from "react"
import Image from "next/image"

export function TechPassionSection() {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-22 items-center">
          {/* Left Image */}
          <div className="relative rounded-xl">
            <div className="relative w-full h-[500px] lg:h-[600px]">
              <Image
                src="/tech-passion-images/tech-passion.jpeg"
                alt="Technology Passion"
                fill
                className="object-cover rounded-lg hover:scale-110 transition-transform duration-500 cursor-pointer"
              />
            </div>
          </div>
          
          {/* Right Text */}
          <div className="space-y-6">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter text-gray-900 dark:text-white">
              Celebrating Technological Passion
            </h2>
            <div className="space-y-4 text-gray-700">
              <p className="text-lg leading-relaxed dark:text-muted-foreground tracking-tight">
                Welcome to the Alpha Eta Chapter of Kappa Theta Pi, Indiana&apos;s premier professional technology fraternity. At KTP, we prepare members for their prospective careers through professional development, taught by those who have been in the industry.
              </p>
              <p className="text-lg leading-relaxed dark:text-muted-foreground tracking-tight">
                Celebrate a culture of growth with some of IU&apos;s most brilliant and ambitious software developers, designers, biomedical engineers, and entrepreneurs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 