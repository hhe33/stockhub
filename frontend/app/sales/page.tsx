"use client"

import { useState, useEffect } from "react"
import { salesApi } from "@/lib/api-client"
import { Loader2 } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { TopNavbar } from "@/components/dashboard/top-navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { stores } from "@/lib/mock-data"
import { Search, Eye, DollarSign, ShoppingCart, TrendingUp, Calendar, Receipt, ArrowUpRight, User, Plus } from "lucide-react"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { cn } from "@/lib/utils"
import { CreateSaleDialog } from "@/components/sales/create-sale-dialog"

export interface SaleItem {
  product: {
    _id: string
    name: string
    category: string
  }
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface SaleRecord {
  id: string
  storeId: string
  storeName: string
  items: SaleItem[]
  total: number
  date: string
  customer?: string
  totalUnits: number
}

export default function SalesPage() {
  const [salesList, setSalesList] = useState<SaleRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [storeFilter, setStoreFilter] = useState<string>("all")
  const [selectedSale, setSelectedSale] = useState<SaleRecord | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  useEffect(() => {
    fetchSales()
  }, [])

  const fetchSales = async () => {
    try {
      const data = await salesApi.getAll()
      setSalesList(data.map((s: any) => {
        const totalUnits = s.items?.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0) || 0
        return {
          id: s._id,
          storeId: s.store?._id,
          storeName: s.store?.name || "Unknown Store",
          items: s.items || [],
          total: s.total,
          date: new Date(s.date).toLocaleDateString(),
          customer: s.customer,
          totalUnits
        }
      }))
    } catch (err) {
      console.error("Failed to fetch sales:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredSales = salesList.filter(sale => {
    const matchesSearch = sale.items.some(i => i.product.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      sale.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sale.customer && sale.customer.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStore = storeFilter === "all" || sale.storeId === storeFilter
    return matchesSearch && matchesStore
  })

  const totalRevenue = salesList.reduce((acc, sale) => acc + sale.total, 0)
  const totalTransactions = salesList.length
  const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0
  const totalUnits = salesList.reduce((acc, sale) => acc + sale.totalUnits, 0)

  const openDetailDialog = (sale: SaleRecord) => {
    setSelectedSale(sale)
    setIsDetailOpen(true)
  }

  const handleSaleSuccess = () => {
    fetchSales()
  }

  if (loading) {
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
      <div className="fixed inset-0 pointer-events-none flex justify-center pt-[20vh] opacity-20 dark:opacity-40 z-0">
        <div className="w-[80vw] h-[60vh] bg-emerald-500/20 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <TopNavbar title="Sales" subtitle="View sales history and transactions" />

      <div className="p-4 lg:p-8 space-y-8 relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Sales Registry</h2>
          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="rounded-xl h-11 px-6 shadow-lg shadow-primary/20 transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Sale
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <Card className="group relative overflow-hidden border-border/50 bg-background/40 backdrop-blur-md hover:shadow-2xl hover:border-primary/50 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-6 relative">
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-mono tracking-tighter mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold tracking-tight">${totalRevenue.toLocaleString("en-US")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-border/50 bg-background/40 backdrop-blur-md hover:shadow-2xl hover:border-secondary/50 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-6 relative">
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-secondary text-secondary-foreground shadow-lg shadow-secondary/25 group-hover:scale-110 transition-transform">
                  <Receipt className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-mono tracking-tighter mb-1">Transactions</p>
                  <p className="text-3xl font-bold tracking-tight">{totalTransactions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-border/50 bg-background/40 backdrop-blur-md hover:shadow-2xl hover:border-emerald-500/50 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-6 relative">
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-mono tracking-tighter mb-1">Avg Order Value</p>
                  <p className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">${averageOrderValue.toFixed(0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-border/50 bg-background/40 backdrop-blur-md hover:shadow-2xl hover:border-amber-500/50 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-6 relative">
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-mono tracking-tighter mb-1">Units Sold</p>
                  <p className="text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400">{totalUnits}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between bg-background/40 backdrop-blur-md border border-border/50 p-4 rounded-2xl shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sales..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 bg-background/50 border-border/60 rounded-xl focus:ring-2 focus:ring-primary/20 shadow-inner"
              />
            </div>
            <Select value={storeFilter} onValueChange={setStoreFilter}>
              <SelectTrigger className="w-full sm:w-48 h-12 rounded-xl bg-background/50 border-border/60 focus:ring-2 focus:ring-primary/20">
                <SelectValue placeholder="All Stores" />
              </SelectTrigger>
              <SelectContent className="glass border-white/10">
                <SelectItem value="all">All Stores</SelectItem>
                {stores.map(store => (
                  <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {storeFilter !== "all" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStoreFilter("all")}
              className="h-12 px-6 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors font-medium"
            >
              Clear filters
            </Button>
          )}
        </div>

        {/* Sales List */}
        <div className="space-y-4">
          {filteredSales.map((sale, index) => (
            <Card
              key={sale.id}
              className="group relative border-border/50 bg-background/40 backdrop-blur-md hover:border-primary/40 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              {/* Dynamic Left Border Highlight */}
              <div className="absolute left-0 inset-y-0 w-1 bg-gradient-to-b from-primary to-emerald-500 transition-all duration-500 origin-top scale-y-0 group-hover:scale-y-100" />
              
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row sm:items-center relative z-10">
                  {/* Order ID */}
                  <div className="flex-shrink-0 px-6 py-5 sm:border-r border-border/50 bg-gradient-to-br from-muted/50 to-transparent w-full sm:w-48">
                    <p className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground mb-1">Order Ref</p>
                    <p className="text-xl font-black tracking-tight text-primary drop-shadow-sm group-hover:text-primary transition-colors">#{sale.id.padStart(4, '0')}</p>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 px-6 py-5 grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="col-span-1 sm:col-span-2">
                      <p className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground mb-1">Items</p>
                      <p className="font-bold text-foreground mb-1 line-clamp-1">
                        {sale.items.length === 1 ? sale.items[0].product?.name : `${sale.items.length} Unique Items`}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px] h-4 px-1.5 opacity-80 uppercase tracking-widest bg-background">
                          {sale.items.length === 1 ? sale.items[0].product?.category : "Mixed Categories"}
                        </Badge>
                        <p className="text-xs font-mono text-muted-foreground">
                          {sale.items.length === 1 
                            ? `$${sale.items[0].unitPrice?.toFixed(2)} × ${sale.items[0].quantity}`
                            : `${sale.totalUnits} Total Units`}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground mb-1">Store Location</p>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                        <p className="font-semibold text-foreground">{sale.storeName}</p>
                      </div>
                    </div>
                    <div className="hidden lg:block">
                      <p className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground mb-1">Customer</p>
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-muted/50">
                          <User className="w-3.5 h-3.5 text-muted-foreground/70" />
                        </div>
                        <p className="font-medium text-foreground">{sale.customer || "Walk-in"}</p>
                      </div>
                    </div>
                    <div className="hidden lg:block">
                      <p className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground mb-1">Transaction Date</p>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="p-1 rounded bg-muted/50">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground/70" />
                        </div>
                        <p className="font-mono text-sm">{sale.date}</p>
                      </div>
                    </div>
                  </div>

                  {/* Total & Action */}
                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 px-6 py-5 sm:border-l border-border/50 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent w-full sm:w-48 group-hover:from-emerald-500/10 transition-colors duration-500">
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground mb-0.5">Total Value</p>
                      <p className="text-2xl font-black text-foreground drop-shadow-sm tracking-tight">${sale.total.toFixed(2)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDetailDialog(sale)}
                      className="gap-2 opacity-50 bg-background/50 border border-border/50 shadow-sm group-hover:opacity-100 group-hover:bg-primary/10 group-hover:text-primary transition-all rounded-lg text-xs tracking-wider uppercase font-semibold h-8"
                    >
                      Inspect
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSales.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
              <Receipt className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No sales found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        )}

        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="sm:max-w-md overflow-hidden p-0 glass border-white/10 shadow-2xl shadow-primary/20">
            <DialogHeader className="relative p-6 px-8 border-b border-white/5 bg-white/[0.02] flex flex-row items-center gap-4 text-left">
              <div className="p-3.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-inner shrink-0">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl tracking-tight">Order Record</DialogTitle>
                <DialogDescription className="font-mono text-primary/70 mt-1 uppercase">
                  SYSTEM_REGISTRY // #{selectedSale?.id.padStart(4, '0')}
                </DialogDescription>
              </div>
            </DialogHeader>
            {selectedSale && (
              <div className="px-8 pb-6">
                <FieldGroup className="gap-6 pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel className="text-primary/70 font-mono text-[10px] uppercase tracking-widest mb-1.5">Node Origin</FieldLabel>
                      <div className="h-12 bg-white/[0.03] border border-white/10 rounded-xl px-4 flex items-center text-sm font-bold shadow-inner truncate">
                        {selectedSale.storeName}
                      </div>
                    </Field>
                    <Field>
                      <FieldLabel className="text-primary/70 font-mono text-[10px] uppercase tracking-widest mb-1.5">Registry Date</FieldLabel>
                      <div className="h-12 bg-white/[0.03] border border-white/10 rounded-xl px-4 flex items-center text-sm font-bold shadow-inner">
                        {selectedSale.date}
                      </div>
                    </Field>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-2 border border-white/10 rounded-xl p-3 bg-black/20 custom-scrollbar shadow-inner">
                    <p className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground mb-2 sticky top-0 bg-black/90 pb-2 z-10 w-full backdrop-blur-md">Itemized Ledger</p>
                    {selectedSale.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                        <div>
                          <p className="font-bold line-clamp-1">{item.product?.name || 'Unknown Product'}</p>
                          <p className="text-[10px] text-muted-foreground uppercase">{item.product?.category || '-'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-xs text-primary/80">${item.unitPrice?.toFixed(2)} × {item.quantity}</p>
                          <p className="font-bold text-primary">${item.subtotal?.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="relative group mt-2">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative p-6 rounded-2xl bg-black/40 border border-white/10 space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">Volume Metrics</span>
                        <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary font-bold">
                          {selectedSale.totalUnits} UNITS
                        </Badge>
                      </div>
                      <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Final Allocation</span>
                        <span className="text-3xl font-black text-white italic tracking-tighter">
                          ${selectedSale.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </FieldGroup>
              </div>
            )}
            <DialogFooter className="gap-3 p-6 px-8 border-t border-white/5 bg-black/20">
              <Button onClick={() => setIsDetailOpen(false)} className="w-full rounded-xl h-12 shadow-lg shadow-primary/20 uppercase text-[10px] font-black tracking-widest transition-all hover:scale-[1.02] bg-primary hover:bg-primary/90">
                Close Feed
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <CreateSaleDialog 
          open={isCreateOpen} 
          onOpenChange={setIsCreateOpen} 
          onSuccess={handleSaleSuccess} 
        />
      </div>
    </DashboardLayout>
  )
}
