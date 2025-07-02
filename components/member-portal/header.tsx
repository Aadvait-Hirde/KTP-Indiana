"use client"

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/auth-store'
import { ThemeToggle } from '@/components/theme-toggle'

export function Header() {
  const { user } = useAuthStore()
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) {
      setGreeting('Good Morning')
    } else if (hour < 17) {
      setGreeting('Good Afternoon')
    } else {
      setGreeting('Good Evening')
    }
  }, [])

  return (
    <header className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Greeting */}
        <div>
          <h1 className="text-3xl font-bold">
            {greeting}, {user?.name?.split(' ')[0]}!
          </h1>
        </div>

        {/* Right side - User info and controls */}
        <div className="flex items-center space-x-4">
          {/* User name */}
          <p className="font-medium text-lg">{user?.name}</p>
          
          {/* Theme toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
} 