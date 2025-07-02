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
  { href: "#portal", label: "Portal" },
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
              <SheetContent side="right" className="w-[300px] sm:w-[400px] dark:bg-zinc-900">
                <div className="flex flex-col h-full">
                  {/* Header with logo */}
                  <div className="flex justify-center py-6 border-b dark:border-zinc-700">
                    <button onClick={scrollToTop} className="flex items-center">
                      <Image
                        src={logoSrc}
                        alt="KTP Logo"
                        width={120}
                        height={60}
                        className="h-12 w-auto object-contain"
                      />
                    </button>
                  </div>

                  {/* Navigation items */}
                  <div className="flex-1 py-6">
                    <nav className="space-y-2">
                      {navItems.map((item) => (
                        <button
                          key={item.href}
                          onClick={() => scrollToSectionAndClose(item.href)}
                          className="w-full text-left px-4 py-3 text-lg font-medium tracking-tight text-muted-foreground transition-colors hover:text-foreground hover:bg-muted rounded-lg"
                        >
                          {item.label}
                        </button>
                      ))}
                    </nav>
                  </div>

                  {/* Bottom section with member portal button */}
                  <div className="border-t dark:border-zinc-700 pt-6 pb-6 flex justify-center">
                    <Button asChild variant="outline" size="lg" className="px-8">
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