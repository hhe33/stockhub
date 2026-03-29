"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn(
        "relative w-9 h-9 rounded-full transition-all duration-300",
        "hover:bg-accent hover:scale-105"
      )}
    >
      {!mounted ? (
        <div className="w-5 h-5 bg-muted rounded-full animate-pulse" />
      ) : (
        <>
          <Sun className={cn(
            "h-5 w-5 transition-all duration-300",
            theme === "dark" ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
          )} />
          <Moon className={cn(
            "absolute h-5 w-5 transition-all duration-300",
            theme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
          )} />
          <span className="sr-only">Toggle theme</span>
        </>
      )}
    </Button>
  )
}
