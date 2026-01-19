"use client";

import React from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { MemberPortalSidebar } from "@/components/member-portal/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

type Props = {
  children: React.ReactNode;
};

export default function MemberPortalLayout({ children }: Props) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen w-screen bg-muted/30 relative overflow-hidden">
        {/* Sidebar */}
        <div className="relative z-20">
          <MemberPortalSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative z-10">
          {/* Header with sidebar toggle */}
          <div className="bg-transparent px-4 md:px-6 py-4 pt-4 md:pt-4 pb-2 md:pb-3">
            <div className="flex items-center justify-between">
              <SidebarTrigger />
              <div className="flex items-center space-x-4">
                <ThemeToggle />
              </div>
            </div>
          </div>

          <main className="flex-1 overflow-y-auto px-4 md:px-6 pt-2 md:pt-3 pb-4 md:pb-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
