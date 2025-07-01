"use client"

import React, { useState, useEffect } from "react"
import { Menu, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "next-themes"
import Image from "next/image"
import Link from "next/link"

const navItems = [
  { href: "#home", label: "Home" },
  { href: "#rush", label: "Rush" },
  { href: "#members", label: "Members" },
  { href: "#partnerships", label: "Partnerships" },
]

interface NavbarProps {
  scrollToSection: (sectionId: string) => void
}

export function Navbar({ scrollToSection }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const scrollToSectionAndClose = (href: string) => {
    scrollToSection(href)
    setIsOpen(false)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const logoSrc = mounted && theme === "dark" 
    ? "/ktp-logos/KTP Logo Dark Plain No BG.png" 
    : "/ktp-logos/KTP Logo Plain Text.png"

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/55 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* Logo */}
          <button onClick={scrollToTop} className="flex items-center">
            <Image
              src={logoSrc}
              alt="KTP Logo"
              width={120}
              height={60}
              className="h-12 w-auto object-contain"
            />
          </button>

          {/* Desktop Navigation - Centered */}
          <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 space-x-8 md:flex">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => scrollToSection(item.href)}
                className="text-sm font-medium tracking-tight text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right side - Member Portal Button + Theme Toggle & Mobile Menu */}
          <div className="flex items-center space-x-2">
            {/* Member Portal Button - Desktop only */}
            <div className="hidden md:block">
              <Button asChild variant="outline" size="sm">
                <Link href="/member-portal">
                  <Users className="w-4 h-4 mr-2" />
                  Member Portal
                </Link>
              </Button>
            </div>
            
            <ThemeToggle />

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  <button onClick={scrollToTop} className="flex items-center mb-4">
                    <Image
                      src={logoSrc}
                      alt="KTP Logo"
                      width={140}
                      height={70}
                      className="h-14 w-auto object-contain"
                    />
                  </button>
                  {navItems.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => scrollToSectionAndClose(item.href)}
                      className="text-left text-lg font-medium tracking-tight text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </button>
                  ))}
                  {/* Member Portal Button - Mobile */}
                  <div className="pt-4">
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href="/member-portal" onClick={() => setIsOpen(false)}>
                        <Users className="w-4 h-4 mr-2" />
                        Member Portal
                      </Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
} 