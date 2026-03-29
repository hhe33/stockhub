"use client"

import { useState, useEffect } from "react"
import { Bell, Search, User, Command } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { authApi } from "@/lib/api-client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TopNavbarProps {
  title: string
  subtitle?: string
}

export function TopNavbar({ title, subtitle }: TopNavbarProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const user = authApi.getUser()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-30 bg-background/40 backdrop-blur-md border-b border-white/5 h-16">
      <div className="flex items-center justify-between h-full px-4 lg:px-8">
        {mounted ? (
          <>
            {/* Left section - Title */}
            <div className="pl-12 lg:pl-0">
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <h1 className="text-lg font-black tracking-tight text-foreground uppercase italic">{title}</h1>
              </div>
              {subtitle && (
                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest leading-none">{subtitle}</p>
              )}
            </div>

            {/* Right section - Search, notifications, theme, profile */}
            <div className="flex items-center gap-4">
              {/* Search Command */}
              <Button
                variant="outline"
                className="hidden md:flex items-center gap-2 h-9 px-4 text-muted-foreground/40 hover:text-foreground border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all rounded-xl group/search"
              >
                <Search className="h-4 w-4 transition-colors group-hover/search:text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider">System Search...</span>
                <kbd className="pointer-events-none ml-4 hidden h-5 select-none items-center gap-1 rounded bg-white/5 border border-white/10 px-1.5 font-mono text-[8px] font-bold opacity-100 sm:flex">
                  CMD K
                </kbd>
              </Button>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 hover:bg-white/5 rounded-xl group/nav"
                onClick={() => router.push('/settings?tab=notifications')}
              >
                <Bell className="h-[18px] w-[18px] text-muted-foreground transition-colors group-hover/nav:text-primary" />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full" />
              </Button>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Divider */}
              <div className="h-6 w-px bg-white/5 mx-1 hidden sm:block" />

              {/* Profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 hover:bg-white/5 p-0.5 border border-white/5">
                    <div className="w-full h-full rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 mt-1 glass border-white/10">
                  <DropdownMenuLabel>
                    <div className="flex flex-col gap-0.5 py-1">
                      <span className="text-xs font-black uppercase tracking-widest text-primary">System {user?.role || "User"}</span>
                      <span className="text-sm font-bold text-foreground">{user?.name || "Guest User"}</span>
                      <span className="text-[10px] font-mono text-muted-foreground/60">{user?.role === "admin" ? "LVL_01_CLEARANCE" : "LVL_02_ACCESS"}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem
                    className="text-xs font-bold uppercase tracking-wider focus:bg-primary/10 cursor-pointer"
                    onClick={() => router.push('/settings?tab=profile')}
                  >
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-xs font-bold uppercase tracking-wider focus:bg-primary/10 cursor-pointer"
                    onClick={() => router.push('/settings?tab=security')}
                  >
                    Security Config
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem
                    className="text-xs font-bold uppercase tracking-wider text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                    onClick={() => authApi.logout()}
                  >
                    Terminate Session
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-between">
            <div className="h-8 w-32 bg-white/5 animate-pulse rounded-lg" />
            <div className="h-8 w-48 bg-white/5 animate-pulse rounded-lg" />
          </div>
        )}
      </div>
    </header>
  )
}
