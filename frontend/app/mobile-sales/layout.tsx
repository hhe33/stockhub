"use client"

import { ReactNode } from "react"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"

export default function MobileSalesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-primary/20">
      {/* Mobile-optimized container */}
      <main className="flex-1 flex flex-col w-full max-w-md mx-auto relative px-4 pb-20 pt-4">
        {children}
      </main>
      
      {/* Dynamic Bottom Navigation can be added here later */}
    </div>
  )
}
