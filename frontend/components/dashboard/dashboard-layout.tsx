"use client"

import dynamic from "next/dynamic"
import { Sidebar } from "./sidebar"
import { TopNavbar } from "./top-navbar"
import { ClientOnly } from "../client-only"
import * as React from "react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

function DashboardLayoutContent({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background relative">
      {/* Animated background elements for consistency */}
      <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] animate-pulse pointer-events-none" style={{ animationDelay: '-2s' }} />

      <Sidebar />
      <main className="flex-1 relative overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
        <div className="relative z-10 w-full min-h-full">
          <ClientOnly>
            {children}
          </ClientOnly>
        </div>
      </main>
    </div>
  )
}

// Export as dynamic with SSR disabled to prevent ALL hydration errors in the dashboard
export const DashboardLayout = dynamic(() => Promise.resolve(DashboardLayoutContent), { 
  ssr: false,
  loading: () => <div className="flex h-screen items-center justify-center bg-background text-primary animate-pulse font-mono tracking-widest text-xs uppercase">Initializing System...</div>
})
