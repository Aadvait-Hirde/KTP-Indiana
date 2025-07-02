"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
  LogOut
} from 'lucide-react'

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  // const { user } = useAuthStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  // const canPostAnnouncements = user?.role === 'admin' || user?.role === 'exec' || user?.role === 'director'

  const navigationItems = [
    { icon: Home, label: 'Dashboard', href: '/member-portal', active: true },
    { icon: Calendar, label: 'Calendar', href: '/member-portal/calendar' },
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

  const logoSrc = mounted && theme === "light" 
    ? "/ktp-logos/KTP Logo Dark Plain No BG Slim.png" 
    : "/ktp-logos/KTP Logo Plain Text Slim.png"

  // Inverse the sidebar theme - use zinc for dark mode
  const sidebarClasses = mounted && theme === "light" 
    ? "bg-zinc-900 border-zinc-700 text-white" 
    : "bg-white border-zinc-200 text-zinc-900"

  return (
    <div className={`${sidebarClasses} border-r h-screen flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-24' : 'w-64'
    }`}>
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(true)}
              className="p-2 hover:bg-zinc-800 dark:hover:bg-zinc-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <div className="w-full flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(false)}
              className="p-2 hover:bg-zinc-800 dark:hover:bg-zinc-50 w-12 h-12 flex items-center justify-center"
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
          <Link key={item.href} href={item.href}>
            <Button
              variant={item.active ? "default" : "ghost"}
              className={`w-full ${isCollapsed ? 'px-3 justify-center' : 'px-4 justify-start'} ${
                item.active 
                  ? '' 
                  : 'hover:bg-zinc-800 dark:hover:bg-zinc-100 text-zinc-300 dark:text-zinc-600 hover:text-white dark:hover:text-zinc-900'
              } h-12 flex items-center`}
              size="default"
            >
              <item.icon className="h-5 w-5" />
              {!isCollapsed && <span className="ml-4">{item.label}</span>}
            </Button>
          </Link>
        ))}

        {/* External Links */}
        <div className="pt-6 mt-6 border-t border-zinc-700 dark:border-zinc-200">
          {!isCollapsed && (
            <div className="mb-3 px-4">
              <p className="text-xs font-medium text-zinc-400 dark:text-zinc-600 whitespace-nowrap">
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
                  className={`w-full ${isCollapsed ? 'px-3 justify-center' : 'px-4 justify-start'} hover:bg-zinc-800 dark:hover:bg-zinc-100 text-zinc-300 dark:text-zinc-600 hover:text-white dark:hover:text-zinc-900 h-12 flex items-center`}
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
      <div className="border-t border-zinc-700 dark:border-zinc-200">
        {/* Sign Out Button */}
        <div className="p-4 flex justify-center">
          <SignOutButton>
            <Button 
              variant="outline" 
              className={`${isCollapsed ? 'px-3 h-12 w-12 justify-center' : 'px-4 justify-start'} border-zinc-600 dark:border-zinc-400 hover:bg-zinc-800 dark:hover:bg-zinc-100 text-zinc-300 dark:text-zinc-600 hover:text-white dark:hover:text-zinc-900 h-12 flex items-center bg-transparent dark:bg-transparent`}
              size="default"
            >
              {!isCollapsed && <span>Sign Out</span>}
              {isCollapsed && <LogOut className="h-5 w-5" />}
            </Button>
          </SignOutButton>
        </div>
      </div>
    </div>
  )
} 