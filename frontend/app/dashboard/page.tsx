"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { TopNavbar } from "@/components/dashboard/top-navbar"
import { StatCard } from "@/components/dashboard/stat-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Store,
  Package,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  MoreHorizontal,
  TrendingUp,
  ShoppingCart,
  Calendar,
  Loader2,
} from "lucide-react"
import { useState, useEffect } from "react"
import { dashboardApi, analyticsApi } from "@/lib/api-client"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart,
} from "recharts"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Quick actions data
const quickActions = [
  { label: "Add Product", href: "/products", icon: Package, color: "bg-blue-500" },
  { label: "New Sale", href: "/sales", icon: ShoppingCart, color: "bg-emerald-500" },
  { label: "Create Transfer", href: "/transfers", icon: TrendingUp, color: "bg-amber-500" },
  { label: "View Reports", href: "/reports", icon: MoreHorizontal, color: "bg-purple-500" },
]

export default function DashboardPage() {
  const [dateFrom, setDateFrom] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0])
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0])
  const [stats, setStats] = useState<any>(null)
  const [salesData, setSalesData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const params = { from: dateFrom, to: dateTo }
        const [dashboardData, analyticsData] = await Promise.all([
          dashboardApi.getStats(params),
          analyticsApi.getSalesByStore(params)
        ])
        setStats(dashboardData)
        setSalesData(analyticsData)
      } catch (error) {
        console.error("Failed to load dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [dateFrom, dateTo])

  if (loading || !stats) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <TopNavbar title="Dashboard" subtitle="Overview of your inventory system" />

      <div className="p-4 lg:p-8 space-y-8 relative">
        {/* System Status Hero Section */}
        <div className="relative overflow-hidden glass rounded-[2.5rem] rounded-tr-none border border-white/10 p-6 lg:p-10 shadow-2xl group transition-all duration-700 hover:border-primary/30">
          <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 via-transparent to-transparent pointer-events-none" />

          {/* Scanning Line */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent animate-scan opacity-30" />

          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8 z-10">
            <div className="space-y-6 max-w-2xl">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">System: Active</span>
              </div>

              <div>
                <h2 className="text-4xl lg:text-5xl font-black text-foreground tracking-tighter uppercase italic leading-none mb-3">
                  Command <span className="text-primary group-hover:text-blue-500 transition-colors">Central</span>
                </h2>
                <p className="text-base text-muted-foreground font-medium leading-relaxed max-w-lg">
                  Liaison established with <span className="text-foreground font-bold">{stats.stats.totalStores} node stores</span>.
                  Currently tracking <span className="text-primary font-bold">{stats.stats.totalProducts} active assets</span>.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                {quickActions.map((action) => (
                  <Link key={action.label} href={action.href} className="group/btn">
                    <Button
                      variant="outline"
                      className="h-12 bg-white/[0.03] hover:bg-primary hover:text-white border-white/5 hover:border-primary backdrop-blur-md rounded-xl gap-3 transition-all duration-500 px-6 font-bold uppercase tracking-widest text-xs"
                    >
                      <action.icon className="w-4 h-4 transition-transform group-hover/btn:rotate-12" />
                      {action.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>

            <div className="hidden xl:flex flex-col items-end gap-2 text-right">
              <p className="text-[10px] font-mono text-primary/40 uppercase tracking-widest">[AUTH_CLEARANCE: LVL_1]</p>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="w-1 h-8 bg-primary/20 rounded-full overflow-hidden">
                    <div className="w-full h-1/2 bg-primary animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                  </div>
                ))}
              </div>
              <p className="text-[10px] font-mono text-primary/40 uppercase tracking-widest">[SYSTEM_STABILITY: 100%]</p>
            </div>
          </div>
        </div>

        {/* Section Label & Date Filtering */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/30">Intelligence Metrics</h3>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
          </div>

          <div className="flex items-center gap-4 bg-background/40 backdrop-blur-md border border-white/5 p-4 rounded-2xl shadow-xl">
            <Field className="w-40">
              <FieldLabel className="text-[9px] uppercase font-mono tracking-widest text-primary/70 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> From
              </FieldLabel>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9 text-xs bg-background/50 border-white/5 rounded-lg focus:ring-1 focus:ring-primary/20 [color-scheme:dark]"
              />
            </Field>
            <div className="h-8 w-[1px] bg-white/5 self-end mb-1" />
            <Field className="w-40">
              <FieldLabel className="text-[9px] uppercase font-mono tracking-widest text-primary/70 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> To
              </FieldLabel>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9 text-xs bg-background/50 border-white/5 rounded-lg focus:ring-1 focus:ring-primary/20 [color-scheme:dark]"
              />
            </Field>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Operational Nodes"
            value={stats.stats.totalStores}
            icon={Store}
            variant="primary"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Assets Managed"
            value={stats.stats.totalProducts}
            icon={Package}
            variant="secondary"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Gross Revenue"
            value={`$${stats.stats.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            icon={DollarSign}
            variant="default"
            trend={{ value: 23, isPositive: true }}
          />
          <StatCard
            title="Integrity Alerts"
            value={stats.stats.lowStockAlerts}
            icon={AlertTriangle}
            variant="danger"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sales per Store Chart */}
          <Card className="lg:col-span-3 glass border-white/10 shadow-2xl overflow-hidden rounded-[2rem]">
            <CardHeader className="flex flex-row items-center justify-between pb-4 px-8 pt-8 relative">
              <div className="absolute top-0 left-0 w-2 h-16 bg-primary/20 blur-xl" />
              <div>
                <CardTitle className="text-xl font-black uppercase italic tracking-wider">Revenue Stream</CardTitle>
                <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">Node Analysis</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono text-primary/40 uppercase">LIVE_FEED</span>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-8">
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="neonGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                    <XAxis
                      dataKey="store"
                      tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.6)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '11px'
                      }}
                      itemStyle={{ color: 'var(--primary)' }}
                      cursor={{ stroke: 'rgba(255, 255, 255, 0.1)', strokeWidth: 1 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="var(--primary)"
                      strokeWidth={3}
                      fill="url(#neonGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Stock Distribution Pie Chart */}
          <Card className="lg:col-span-2 glass border-white/10 shadow-2xl overflow-hidden rounded-[2rem]">
            <CardHeader className="pb-4 px-8 pt-8">
              <CardTitle className="text-xl font-black uppercase italic tracking-wider">Asset Allocation</CardTitle>
              <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">Current Stock Status</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-8 flex flex-col items-center">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.stockDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={105}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {stats.stockDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} className="hover:opacity-80 transition-opacity" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.6)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={40}
                      content={({ payload }) => (
                        <div className="flex flex-wrap justify-center gap-4 mt-4">
                          {payload?.map((entry: any, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                              <span className="text-[10px] font-black uppercase text-foreground tracking-wider">{entry.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 w-full text-center">
                <p className="text-[10px] font-mono text-primary/40 uppercase mb-1">Total System Value</p>
                <p className="text-xl font-black text-foreground">${stats.stats.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Intel Section */}
        <div className="flex items-center gap-4 px-2">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/30">Data Intel</h3>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-8">
          {/* Recent Sales Table */}
          <Card className="glass border-white/10 shadow-2xl overflow-hidden rounded-[2rem]">
            <CardHeader className="flex flex-row items-center justify-between px-8 pt-8 pb-4 bg-white/[0.02]">
              <div>
                <CardTitle className="text-xl font-black uppercase italic tracking-wider">Recent Uplink</CardTitle>
                <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">Latest Transactions</CardDescription>
              </div>
              <Link href="/sales">
                <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl border-white/5 bg-white/[0.02] hover:bg-primary hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.2em]">
                  Registry
                  <ArrowUpRight className="ml-2 h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {stats.recentSales.map((sale: any, index: number) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between p-6 hover:bg-white/[0.03] transition-all group/row"
                  >
                    <div className="flex items-center gap-5">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg transform transition-transform group-hover/row:scale-110 group-hover/row:rotate-3",
                        index % 4 === 0 ? "bg-blue-600 shadow-blue-500/20" : index % 4 === 1 ? "bg-emerald-600 shadow-emerald-500/20" : index % 4 === 2 ? "bg-amber-600 shadow-amber-500/20" : "bg-purple-600 shadow-purple-500/20"
                      )}>
                        {sale.productName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-base text-foreground group-hover/row:text-primary transition-colors">{sale.productName}</p>
                        <p className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest">{sale.storeName} • QTY: {sale.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-lg text-foreground">${sale.total.toFixed(2)}</p>
                      <p className="text-[8px] font-mono text-primary/40 uppercase">CONFIRMED</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alerts Table */}
          <Card className="glass border-white/10 shadow-2xl overflow-hidden rounded-[2rem]">
            <CardHeader className="flex flex-row items-center justify-between px-8 pt-8 pb-4 bg-rose-500/[0.03]">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 animate-pulse">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black uppercase italic tracking-wider">Integrity Breach</CardTitle>
                  <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">Resource Shortage</CardDescription>
                </div>
              </div>
              <Link href="/inventory">
                <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl border-white/5 bg-white/[0.02] hover:bg-rose-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.2em]">
                  Resolve
                  <ArrowUpRight className="ml-2 h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {stats.lowStockProducts.map((item: any) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center justify-between p-6 transition-all group/alert",
                      item.status === "out-of-stock" ? "bg-rose-500/[0.02]" : "hover:bg-white/[0.03]"
                    )}
                  >
                    <div className="flex items-center gap-5">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover/alert:scale-110",
                        item.status === "out-of-stock" ? "bg-rose-500/20 text-rose-500" : "bg-amber-500/20 text-amber-500"
                      )}>
                        <Package className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-base text-foreground">{item.productName}</p>
                        <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                          {item.storeName} • LEVEL: {item.quantity} / {item.minStock} MIN
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={item.status === "out-of-stock" ? "destructive" : "outline"}
                      className={cn(
                        "rounded-xl h-8 px-4 font-black uppercase tracking-[0.1em] text-[8px]",
                        item.status === "low-stock" && "border-amber-500/50 text-amber-500 bg-amber-500/5"
                      )}
                    >
                      {item.status === "out-of-stock" ? "Breach" : "Warning"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
