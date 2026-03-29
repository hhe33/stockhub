"use client"

import * as React from "react"
import { ThemeProvider } from "./theme-provider"
import { Toaster } from "./ui/sonner"

export function RootProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
      <Toaster position="top-right" />
    </ThemeProvider>
  )
}
