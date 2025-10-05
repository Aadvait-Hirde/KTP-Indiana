"use client"

import React from "react"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/sections/hero-section"
import { TechPassionSection } from "@/components/sections/tech-passion-section"
import { AboutSection } from "@/components/sections/about-section"
import { PillarsSection } from "@/components/sections/pillars-section"
import { ExecBoardSection } from "@/components/sections/exec-board-section"
import { StandardsBoardSection } from "@/components/sections/standards-board-section"
import { KTPPortalSection } from "@/components/sections/ktp-portal-section"
import { DocsSection } from "@/components/sections/docs-section"
import { AlumniWorkSection } from "@/components/sections/alumni-work-section"
import { FAQSection } from "@/components/sections/faq-section"
import { Footer } from "@/components/sections/footer"

export default function Home() {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar scrollToSection={scrollToSection} />
      <HeroSection />
      <TechPassionSection />
      <AboutSection />
      <PillarsSection />
      <ExecBoardSection />
      <StandardsBoardSection />
      <KTPPortalSection />
      <DocsSection />
      <AlumniWorkSection />
      <FAQSection />
      <Footer scrollToSection={scrollToSection} />
    </div>
  )
} 