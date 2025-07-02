"use client"

import React from "react"
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useTheme } from 'next-themes'
// import { useAuthStore } from '@/lib/auth-store'
import { Button } from '@/components/ui/button'
import { SignOutButton } from '@clerk/nextjs'
import { 
  Calendar, 
  Megaphone, 
  Users, 
  CreditCard, 
  ShoppingBag, 
  ChevronLeft,
  Home,
  LogOut,
  Menu,
  X,
  Briefcase
} from 'lucide-react'

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  // const { user } = useAuthStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  // const canPostAnnouncements = user?.role === 'admin' || user?.role === 'exec' || user?.role === 'director'

  const navigationItems = [
    { icon: Home, label: 'Dashboard', href: '/member-portal' },
    { icon: Calendar, label: 'Calendar', href: '/member-portal/calendar' },
    { icon: Briefcase, label: 'Internships', href: '/member-portal/internships' },
    { icon: Megaphone, label: 'Announcements', href: '/member-portal/announcements' },
    { icon: Users, label: 'Alumni Directory', href: '/member-portal/alumni' },
    { icon: ShoppingBag, label: 'Merch Store', href: '/member-portal/merch' },
    { icon: CreditCard, label: 'Pay Dues', href: '/member-portal/dues' },
  ]

  const externalLinks = [
    { 
      icon: '/portal-images/social-icons/slack-icon.png', 
      label: 'Slack', 
      href: 'https://app.slack.com',
      external: true 
    },
    { 
      icon: '/portal-images/social-icons/groupme-icon.png', 
      label: 'GroupMe', 
      href: 'https://web.groupme.com/chats',
      external: true 
    },
  ]

  const logoSrc = mounted && theme === "dark" 
    ? "/ktp-logos/KTP Logo Dark Plain No BG Slim.png" 
    : "/ktp-logos/KTP Logo Dark Plain No BG Slim.png"

  // Use dark sidebar for both themes - exact same styling
  const sidebarClasses = "bg-zinc-900 border-zinc-700 text-white"

  // Check if current path matches navigation item
  const isActiveRoute = (href: string) => {
    if (href === '/member-portal') {
      return pathname === '/member-portal'
    }
    return pathname.startsWith(href)
  }

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${sidebarClasses} border-r h-screen flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-16 md:w-24' : 'w-64'
      } ${
        isMobileOpen ? 'fixed left-0 top-0 z-50' : 'hidden md:block'
      } md:relative md:z-20`}>
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          {!isCollapsed ? (
            <>
              <div className="flex-1 flex justify-center">
                <Image
                  src={logoSrc}
                  alt="KTP Logo"
                  width={120}
                  height={60}
                  className="h-10 w-auto object-contain"
                />
              </div>
              <div className="flex items-center space-x-2">
                {/* Mobile close button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileOpen(false)}
                  className="md:hidden p-2 hover:bg-zinc-800"
                >
                  <X className="h-4 w-4" />
                </Button>
                {/* Desktop collapse button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCollapsed(true)}
                  className="hidden md:flex p-2 hover:bg-zinc-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="w-full flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(false)}
                className="p-2 hover:bg-zinc-800 w-12 h-12 flex items-center justify-center"
              >
                <Image
                  src={logoSrc}
                  alt="KTP Logo"
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
              </Button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-3">
          {navigationItems.map((item) => (
            <Button
              key={item.href}
              onClick={() => handleNavigation(item.href)}
              variant="ghost"
              className={`w-full ${isCollapsed ? 'px-3 justify-center' : 'px-4 justify-start'} ${
                isActiveRoute(item.href)
                  ? mounted && theme === "light" 
                    ? 'bg-white text-black hover:bg-gray-100' 
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : mounted && theme === "light"
                    ? 'text-zinc-300 hover:bg-white hover:text-black'
                    : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
              } h-12 flex items-center`}
              size="default"
            >
              <item.icon className="h-5 w-5" />
              {!isCollapsed && <span className="ml-4">{item.label}</span>}
            </Button>
          ))}

          {/* External Links */}
          <div className="pt-6 mt-6 border-t border-zinc-700">
            {!isCollapsed && (
              <div className="mb-3 px-4">
                <p className="text-xs font-medium text-zinc-400 whitespace-nowrap">
                  External Links
                </p>
              </div>
            )}
            <div className={`space-y-3 ${isCollapsed ? 'space-y-6' : ''}`}>
              {externalLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="ghost"
                    className={`w-full ${isCollapsed ? 'px-3 justify-center' : 'px-4 justify-start'} ${
                      mounted && theme === "light"
                        ? 'text-zinc-300 hover:bg-white hover:text-black'
                        : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    } h-12 flex items-center`}
                    size="default"
                  >
                    <Image
                      src={item.icon}
                      alt={item.label}
                      width={20}
                      height={20}
                      className="h-5 w-5"
                    />
                    {!isCollapsed && <span className="ml-4">{item.label}</span>}
                  </Button>
                </a>
              ))}
            </div>
          </div>
        </nav>

        {/* Bottom Section - Sign Out Only */}
        <div className="border-t border-zinc-700 mt-auto">
          {/* Sign Out Button */}
          <div className="p-4 flex justify-center">
            <SignOutButton>
              <Button 
                variant="outline" 
                className={`${isCollapsed ? 'px-3 h-12 w-12 justify-center' : 'w-full px-4 justify-start'} border-zinc-600 hover:bg-zinc-800 text-zinc-300 hover:text-white h-12 flex items-center bg-transparent`}
                size="default"
              >
                {!isCollapsed && <span>Sign Out</span>}
                {isCollapsed && <LogOut className="h-5 w-5" />}
              </Button>
            </SignOutButton>
          </div>
        </div>
      </div>
    </>
  )
} 