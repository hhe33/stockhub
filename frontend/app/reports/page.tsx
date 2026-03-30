"use client"

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e', '#06b6d4', '#f97316'];

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { TopNavbar } from "@/components/dashboard/top-navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { storesApi, analyticsApi, reportsApi } from "@/lib/api-client"
import { FileSpreadsheet, FileText, Calendar, TrendingUp, Package, DollarSign, BarChart3, PieChart as PieChartIcon, Activity, ArrowUpRight, Loader2 } from "lucide-react"
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

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0])
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0])
  const [selectedStore, setSelectedStore] = useState<string>("all")
  const [stores, setStores] = useState<any[]>([])
  
  const [summary, setSummary] = useState<any>(null)
  const [salesTrend, setSalesTrend] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [storePerformance, setStorePerformance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllData()
  }, [dateFrom, dateTo, selectedStore])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const params = {
        from: dateFrom,
        to: dateTo,
        storeId: selectedStore === "all" ? undefined : selectedStore
      }

      const [storesData, summaryData, trendData, categoriesSales, performance] = await Promise.all([
        storesApi.getAll(),
        reportsApi.getSummary(params),
        analyticsApi.getSalesTrend(params),
        analyticsApi.getSalesByCategory(params),
        analyticsApi.getSalesByStore({ from: dateFrom, to: dateTo })
      ])

      setStores(storesData)
      setSummary(summaryData)
      setSalesTrend(trendData)
      setCategoryData((categoriesSales || []).map((c: any, i: number) => ({
        ...c,
        fill: CHART_COLORS[i % CHART_COLORS.length]
      })))
      setStorePerformance(performance)
    } catch (err) {
      console.error("Failed to load reports data", err)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = (format: "pdf" | "csv") => {
    const type = format === "pdf" ? "stock.pdf" : "stock.csv"
    window.open(reportsApi.getExportUrl(type, selectedStore), "_blank")
  }

  if (loading || !summary) {
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
      {/* Ambient Background Glow */}
      <div className="fixed inset-0 pointer-events-none flex justify-center pt-[20vh] opacity-20 dark:opacity-40 z-0">
        <div className="w-[80vw] h-[60vh] bg-purple-500/20 blur-[130px] rounded-full mix-blend-screen" />
      </div>

      <TopNavbar title="Reports" subtitle="Analytics and performance reports" />

      <div className="p-4 lg:p-8 space-y-8 relative z-10">
        {/* Report Controls */}
        <div className="bg-background/40 backdrop-blur-md border border-border/50 p-6 rounded-3xl shadow-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative z-10 flex flex-col xl:flex-row gap-6 items-start xl:items-end">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
              <Field>
                <FieldLabel className="flex items-center gap-2 text-[10px] uppercase font-mono tracking-widest text-primary/70 mb-2">
                  <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                  Start Date
                </FieldLabel>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-12 bg-background/50 border-border/60 rounded-xl focus:ring-2 focus:ring-primary/20 shadow-inner [color-scheme:dark]"
                />
              </Field>
              <Field>
                <FieldLabel className="flex items-center gap-2 text-[10px] uppercase font-mono tracking-widest text-primary/70 mb-2">
                  <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                  End Date
                </FieldLabel>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-12 bg-background/50 border-border/60 rounded-xl focus:ring-2 focus:ring-primary/20 shadow-inner [color-scheme:dark]"
                />
              </Field>
              <Field>
                <FieldLabel className="text-[10px] uppercase font-mono tracking-widest text-primary/70 mb-2">Filter by Store</FieldLabel>
                <Select value={selectedStore} onValueChange={setSelectedStore}>
                  <SelectTrigger className="h-12 bg-background/50 border-border/60 rounded-xl focus:ring-2 focus:ring-primary/20 shadow-inner">
                    <SelectValue placeholder="All Stores" />
                  </SelectTrigger>
                  <SelectContent className="glass border-white/10">
                    <SelectItem value="all">All Stores</SelectItem>
                    {stores.map(store => (
                      <SelectItem key={store._id} value={store._id}>{store.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="flex gap-3 flex-shrink-0 w-full xl:w-auto">
              <Button variant="outline" onClick={() => handleExport("pdf")} className="h-12 flex-1 xl:flex-none px-6 rounded-xl gap-2 border-primary/20 bg-primary/5 hover:bg-primary/20 hover:text-primary transition-all shadow-sm">
                <FileText className="w-4 h-4" />
                <span className="font-semibold tracking-wide text-xs">PDF</span>
              </Button>
              <Button onClick={() => handleExport("csv")} className="h-12 flex-1 xl:flex-none px-6 rounded-xl gap-2 shadow-lg shadow-emerald-500/20 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white border-0 transition-all">
                <FileSpreadsheet className="w-4 h-4" />
                <span className="font-bold tracking-wide text-xs uppercase">Export CSV</span>
              </Button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="group relative overflow-hidden bg-background/40 backdrop-blur-md border border-border/50 hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)] hover:border-primary/50 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3.5 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform duration-500">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black tracking-widest text-emerald-500">
                  <ArrowUpRight className="w-3 h-3" />
                  {summary.revenue > 0 ? "+100%" : "0%"}
                </div>
              </div>
              <p className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground mb-1">Gross Revenue</p>
              <p className="text-4xl font-black tracking-tighter drop-shadow-sm">${summary.revenue.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-background/40 backdrop-blur-md border border-border/50 hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)] hover:border-primary/50 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3.5 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform duration-500">
                  <Package className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black tracking-widest text-emerald-500">
                  <ArrowUpRight className="w-3 h-3" />
                  {summary.unitsSold > 0 ? "+100%" : "0%"}
                </div>
              </div>
              <p className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground mb-1">Total Items Sold</p>
              <p className="text-4xl font-black tracking-tighter drop-shadow-sm">{summary.unitsSold}</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-background/40 backdrop-blur-md border border-border/50 hover:shadow-[0_0_30px_rgba(234,179,8,0.2)] hover:border-amber-500/50 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3.5 rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform duration-500">
                  <Activity className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black tracking-widest text-emerald-500">
                  <ArrowUpRight className="w-3 h-3" />
                  {summary.avgOrderValue > 0 ? "+100%" : "0%"}
                </div>
              </div>
              <p className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground mb-1">Avg Transaction</p>
              <p className="text-4xl font-black tracking-tighter drop-shadow-sm">${summary.avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            </CardContent>
          </Card>

          <Card className={cn(
            "group relative overflow-hidden bg-background/40 backdrop-blur-md border border-border/50 transition-all duration-500",
            summary.lowStockCount > 10 ? "hover:shadow-[0_0_30px_rgba(239,68,68,0.2)] hover:border-red-500/50" : 
            summary.lowStockCount > 0 ? "hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] hover:border-amber-500/50" : 
            "hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:border-emerald-500/50"
          )}>
            <div className={cn(
              "absolute inset-0 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br",
              summary.lowStockCount > 10 ? "from-red-500/10" : summary.lowStockCount > 0 ? "from-amber-500/10" : "from-emerald-500/10"
            )} />
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div className={cn(
                  "p-3.5 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform duration-500",
                  summary.lowStockCount > 10 ? "bg-red-500 shadow-red-500/30" : summary.lowStockCount > 0 ? "bg-amber-500 shadow-amber-500/30" : "bg-emerald-500 shadow-emerald-500/30"
                )}>
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-black tracking-widest border",
                  summary.lowStockCount > 0 ? "bg-rose-500/10 border-rose-500/20 text-rose-500" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                )}>
                  {summary.lowStockCount} Critical
                </div>
              </div>
              <p className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground mb-1">Stock Integrity</p>
              <p className="text-4xl font-black tracking-tighter drop-shadow-sm text-foreground">
                {Math.max(0, 100 - (summary.lowStockCount * 2))}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sales Trend Chart */}
          <Card className="bg-background/40 backdrop-blur-md border border-border/50 shadow-xl shadow-black/5 overflow-hidden group">
            <CardHeader className="pb-6 border-b border-border/30 bg-white/[0.01]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-inner group-hover:bg-primary/20 transition-colors">
                    <Activity className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold tracking-tight">Revenue Over Time</CardTitle>
                    <CardDescription className="text-xs font-mono uppercase tracking-widest mt-1 opacity-70">Monthly Revenue</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 relative">
              <div className="absolute -inset-10 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none blur-2xl" />
              <div className="h-[320px] relative z-10 w-full">
                {salesTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesTrend}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                      <XAxis dataKey="month" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(0,0,0,0.8)', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }} 
                      />
                      <Area type="monotone" dataKey="sales" stroke="var(--primary)" fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-3">
                    <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground/50 opacity-50" />
                    <p className="font-mono text-xs uppercase tracking-widest">Insufficient Data</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card className="bg-background/40 backdrop-blur-md border border-border/50 shadow-xl shadow-black/5 overflow-hidden group">
            <CardHeader className="pb-6 border-b border-border/30 bg-white/[0.01]">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-secondary/10 border border-secondary/20 shadow-inner group-hover:bg-secondary/20 transition-colors">
                  <PieChartIcon className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold tracking-tight">Sales by Category</CardTitle>
                  <CardDescription className="text-xs font-mono uppercase tracking-widest mt-1 opacity-70">Category Breakdown</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 relative">
              <div className="absolute -inset-10 bg-gradient-to-t from-secondary/5 to-transparent pointer-events-none blur-2xl" />
              <div className="h-[320px] relative z-10 w-full">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="sales"
                        nameKey="category"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill || CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(0,0,0,0.8)', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }} 
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-3">
                    <PieChartIcon className="w-16 h-16 mx-auto text-muted-foreground/50 opacity-50" />
                    <p className="font-mono text-xs uppercase tracking-widest">Insufficient Data</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Store Performance */}
          <Card className="bg-background/40 backdrop-blur-md border border-border/50 shadow-xl shadow-black/5 overflow-hidden group lg:col-span-2">
            <CardHeader className="pb-6 border-b border-border/30 bg-white/[0.01]">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-inner group-hover:bg-emerald-500/20 transition-colors">
                  <BarChart3 className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold tracking-tight">Store Performance</CardTitle>
                  <CardDescription className="text-xs font-mono uppercase tracking-widest mt-1 opacity-70">Performance by Store</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 relative">
              <div className="absolute -inset-10 bg-gradient-to-t from-emerald-500/5 to-transparent pointer-events-none blur-3xl opacity-50" />
              <div className="h-[360px] relative z-10 w-full pl-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={storePerformance} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                    <XAxis
                      dataKey="store"
                      tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.7 }}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.7 }}
                      tickLine={false}
                      axisLine={false}
                      width={60}
                    />
                    <Tooltip
                      cursor={{ fill: 'currentColor', opacity: 0.05 }}
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px',
                        padding: '12px 16px',
                        fontSize: '11px'
                      }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontFamily: 'monospace', textTransform: 'uppercase' }}
                      formatter={(value) => <span className="opacity-70">{value === "sales" ? "Revenue" : value}</span>}
                    />
                    <Bar
                      dataKey="sales"
                      fill="var(--primary)"
                      radius={[6, 6, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
