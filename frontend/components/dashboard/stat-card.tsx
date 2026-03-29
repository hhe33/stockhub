import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: "default" | "primary" | "secondary" | "warning" | "danger" | "success"
}

export function StatCard({ title, value, icon: Icon, trend, variant = "default" }: StatCardProps) {
  const variantStyles = {
    default: "bg-card hover:shadow-lg",
    primary: "bg-gradient-to-br from-primary/5 to-primary/10 hover:shadow-lg hover:shadow-primary/5",
    secondary: "bg-gradient-to-br from-secondary/5 to-secondary/10 hover:shadow-lg hover:shadow-secondary/5",
    warning: "bg-gradient-to-br from-warning/5 to-warning/10 hover:shadow-lg hover:shadow-warning/5",
    danger: "bg-gradient-to-br from-destructive/5 to-destructive/10 hover:shadow-lg hover:shadow-destructive/5",
    success: "bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/5",
  }

  const iconStyles = {
    default: "bg-muted text-muted-foreground",
    primary: "bg-primary text-primary-foreground shadow-lg shadow-primary/30",
    secondary: "bg-secondary text-secondary-foreground shadow-lg shadow-secondary/30",
    warning: "bg-warning text-warning-foreground shadow-lg shadow-warning/30",
    danger: "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/30",
    success: "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30",
  }

  return (
    <Card className={cn(
      "relative overflow-hidden glass border border-white/10 shadow-xl transition-all duration-500 group rounded-2xl",
      "hover:border-primary/50 hover:shadow-primary/5 hover:scale-[1.02]"
    )}>
      {/* Digital Grid Underlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Tech Brackets */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-primary/30 rounded-tl-sm pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-primary/30 rounded-br-sm pointer-events-none" />

      <CardContent className="p-6 relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className={cn("w-1 h-1 rounded-full animate-pulse",
                variant === "warning" ? "bg-amber-500" : variant === "danger" ? "bg-rose-500" : variant === "success" ? "bg-emerald-500" : "bg-primary"
              )} />
              <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">{title}</p>
            </div>

            <p className="text-3xl font-black tracking-tight text-foreground tabular-nums">
              {value}
            </p>

            {trend && (
              <div className={cn(
                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tight",
                trend.isPositive
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
              )}>
                {trend.isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {Math.abs(trend.value)}%
              </div>
            )}
          </div>
          <div className={cn(
            "p-3 rounded-xl transition-all duration-500 group-hover:rotate-12 group-hover:shadow-glow",
            iconStyles[variant]
          )}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>

      {/* Decorative neon glow */}
      <div className={cn(
        "absolute -bottom-8 -right-8 w-24 h-24 rounded-full opacity-10 blur-2xl transition-all duration-700 group-hover:opacity-30 group-hover:scale-150",
        variant === "primary" && "bg-primary",
        variant === "secondary" && "bg-secondary",
        variant === "warning" && "bg-amber-500",
        variant === "danger" && "bg-rose-500",
        variant === "success" && "bg-emerald-500",
        variant === "default" && "bg-primary"
      )} />

      {/* Active Scan line logic (subtle) */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent group-hover:animate-scan-horizontal opacity-0 group-hover:opacity-100" />
    </Card>
  )
}
