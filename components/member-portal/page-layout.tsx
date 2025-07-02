"use client"

import { ReactNode } from 'react'
import { Sidebar } from './sidebar'

interface PageLayoutProps {
  children: ReactNode
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="flex h-screen bg-muted/30 relative overflow-hidden">
      {/* Wave Background - behind everything */}
      <div className="absolute inset-0 opacity-5 pointer-events-none z-0">
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
          <path 
            d="M0,200 C300,140 600,260 1200,180 L1200,400 L0,400 Z" 
            fill="currentColor"
            className="text-primary opacity-60"
          />
        </svg>
      </div>

      {/* Sidebar */}
      <div className="relative z-20">
        <Sidebar />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative z-10">
        <div className="h-full overflow-y-auto pt-16 md:pt-0">
          {children}
        </div>
      </div>
    </div>
  )
} 