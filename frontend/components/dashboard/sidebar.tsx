"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Store,
  Package,
  Warehouse,
  ShoppingCart,
  ArrowLeftRight,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Layers,
  Smartphone,
} from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { authApi } from "@/lib/api-client"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, badge: null },
  { name: "Stores", href: "/stores", icon: Store, badge: null },
  { name: "Categories", href: "/categories", icon: Layers, badge: null },
  { name: "Products", href: "/products", icon: Package, badge: null },
  { name: "Inventory", href: "/inventory", icon: Warehouse, badge: null },
  { name: "Sales", href: "/sales", icon: ShoppingCart, badge: null },
  { name: "Transfers", href: "/transfers", icon: ArrowLeftRight, badge: null },
  { name: "Reports", href: "/reports", icon: BarChart3, badge: null },
  { name: "POS Terminal", href: "/mobile-sales", icon: Smartphone, badge: "NEW" },
]

const bottomNavigation = [
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // User Card
  const user = authApi.getUser()
  const userInitials = user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'AU'

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-background/80 backdrop-blur-sm shadow-sm border border-border/50"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-sidebar-border/50 transform transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:z-auto",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
              <Warehouse className="w-5 h-5 text-primary-foreground" />
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-sidebar-foreground">StockHub</h1>
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider h-4 flex items-center">
                {mounted ? "Multi-Store" : <div className="w-16 h-2 bg-sidebar-foreground/5 animate-pulse rounded" />}
              </div>
            </div>
          </div>

          {/* Section Label */}
          <div className="px-6 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest h-6 flex items-center">
            {mounted ? "Main Menu" : <div className="w-12 h-2.5 bg-sidebar-foreground/5 animate-pulse rounded" />}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            {!mounted ? (
              // Enhanced Skeleton State
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl opacity-40">
                  <div className="w-[18px] h-[18px] bg-sidebar-foreground/10 rounded-md animate-pulse" />
                  <div className="h-4 w-24 bg-sidebar-foreground/5 animate-pulse rounded" />
                </div>
              ))
            ) : (
              navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className={cn(
                      "w-[18px] h-[18px] transition-transform duration-200",
                      !isActive && "group-hover:scale-110"
                    )} />
                    <div className="flex-1 font-semibold tracking-wide">
                      {item.name}
                    </div>
                    {item.badge && (
                      <span className={cn(
                        "flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-md text-[10px] font-bold",
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-primary/10 text-primary"
                      )} translate="no">
                        {item.badge}
                      </span>
                    )}
                    {isActive && (
                      <ChevronRight className="w-4 h-4 opacity-70" />
                    )}
                  </Link>
                )
              })
            )}
          </nav>

          {/* Bottom navigation */}
          <div className="px-3 py-4 border-t border-sidebar-border/50 space-y-1">
            {/* Section Label */}
            <div className="px-3 pb-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest h-5 flex items-center">
              {mounted ? "Account" : <div className="w-10 h-2 bg-sidebar-foreground/5 animate-pulse rounded" />}
            </div>

            {bottomNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="w-[18px] h-[18px]" />
                  {item.name}
                </Link>
              )
            })}
            <button
              onClick={() => authApi.logout()}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
            >
              <LogOut className="w-[18px] h-[18px]" />
              Logout
            </button>
          </div>

          {/* User Card */}
          <div className="p-4 mx-3 mb-4 rounded-xl bg-muted/50 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-semibold text-sm">
                {mounted ? userInitials : '..'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{mounted ? (user?.name || 'Guest User') : 'Loading...'}</p>
                <p className="text-xs text-muted-foreground truncate">{mounted ? (user?.email || 'guest@stockhub.com') : '...'}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
