"use client"

import { useState, useEffect } from "react"
import { productsApi, storesApi, transfersApi, inventoryApi } from "@/lib/api-client"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { type Transfer } from "@/lib/mock-data"
import { Plus, ArrowRight, Calendar, Search, Truck, CheckCircle, Clock, XCircle, Package, ArrowLeftRight } from "lucide-react"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { cn } from "@/lib/utils"

export default function TransfersPage() {
  const [transferList, setTransferList] = useState<Transfer[]>([])
  const [loading, setLoading] = useState(true)
  const [storeList, setStoreList] = useState<any[]>([])
  const [productList, setProductList] = useState<any[]>([])
  const [inventoryList, setInventoryList] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [formData, setFormData] = useState({
    fromStoreId: "",
    toStoreId: "",
    productId: "",
    quantity: "",
  })

  useEffect(() => {
    fetchInitial()
  }, [])

  const fetchInitial = async () => {
    try {
      setLoading(true)
      const [stores, products, inventory] = await Promise.all([
        storesApi.getAll(),
        productsApi.getAll(),
        inventoryApi.getAll()
      ])
      setStoreList(stores || [])
      setProductList(products || [])
      setInventoryList(inventory || [])
      await fetchTransfers()
    } catch (err) {
      console.error("Failed to fetch initial data:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchTransfers = async () => {
    try {
      const data = await transfersApi.getAll()
      setTransferList(data.map((t: any) => ({
        ...t,
        id: t._id,
        fromStoreName: t.fromStore?.name || "Unknown",
        toStoreName: t.toStore?.name || "Unknown",
        productName: t.product?.name || "Unknown",
        date: new Date(t.date).toLocaleDateString()
      })))
    } catch (err) {
      console.error("Failed to fetch transfers:", err)
    }
  }

  const filteredTransfers = transferList.filter(transfer => {
    const matchesSearch = transfer.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transfer.fromStoreName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transfer.toStoreName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || transfer.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: transferList.length,
    pending: transferList.filter(t => t.status === "pending").length,
    inTransit: transferList.filter(t => t.status === "in-transit").length,
    completed: transferList.filter(t => t.status === "completed").length,
  }

  const handleAdd = async () => {
    try {
      const payload = {
        fromStore: formData.fromStoreId,
        toStore: formData.toStoreId,
        product: formData.productId,
        quantity: parseInt(formData.quantity) || 0,
      }
      await transfersApi.create(payload)
      fetchTransfers() // Refresh list
      setFormData({ fromStoreId: "", toStoreId: "", productId: "", quantity: "" })
      setIsAddOpen(false)
    } catch (err) {
      console.error("Failed to create transfer:", err)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await transfersApi.approve(id)
      await fetchTransfers()
    } catch (err) {
      console.error("Failed to approve transfer:", err)
    }
  }

  const handleReject = async (id: string) => {
    try {
      await transfersApi.reject(id)
      await fetchTransfers()
    } catch (err) {
      console.error("Failed to reject transfer:", err)
    }
  }

  const getStatusConfig = (status: Transfer["status"]) => {
    switch (status) {
      case "pending":
        return {
          icon: Clock,
          label: "Pending",
          colors: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          dot: "bg-amber-500"
        }
      case "in-transit":
        return {
          icon: Truck,
          label: "In Transit",
          colors: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
          dot: "bg-blue-500"
        }
      case "completed":
        return {
          icon: CheckCircle,
          label: "Completed",
          colors: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          dot: "bg-emerald-500"
        }
      case "cancelled":
        return {
          icon: XCircle,
          label: "Cancelled",
          colors: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
          dot: "bg-rose-500"
        }
    }
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
      {/* Ambient Background Glow */}
      <div className="fixed inset-0 pointer-events-none flex justify-center pt-[20vh] opacity-20 dark:opacity-40 z-0">
        <div className="w-[80vw] h-[60vh] bg-blue-500/20 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <TopNavbar title="Stock Transfers" subtitle="Manage inventory transfers between stores" />

      <div className="p-4 lg:p-8 space-y-8 relative z-10">
        {/* Stats Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="group relative overflow-hidden border-border/50 bg-background/40 backdrop-blur-md hover:shadow-2xl hover:border-primary/50 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-6 relative">
              <div className="flex flex-col gap-4">
                <div className="w-fit p-3.5 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform">
                  <ArrowLeftRight className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground mb-1">Total Transfers</p>
                  <p className="text-3xl font-black tracking-tight drop-shadow-sm">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-border/50 bg-background/40 backdrop-blur-md hover:shadow-2xl hover:border-amber-500/50 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-6 relative">
              <div className="flex flex-col gap-4">
                <div className="w-fit p-3.5 rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground mb-1">Pending Sync</p>
                  <p className="text-3xl font-black tracking-tight text-amber-600 dark:text-amber-400 drop-shadow-sm">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-border/50 bg-background/40 backdrop-blur-md hover:shadow-2xl hover:border-blue-500/50 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-6 relative">
              <div className="flex flex-col gap-4">
                <div className="w-fit p-3.5 rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground mb-1">In Transit</p>
                  <p className="text-3xl font-black tracking-tight text-blue-600 dark:text-blue-400 drop-shadow-sm">{stats.inTransit}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-border/50 bg-background/40 backdrop-blur-md hover:shadow-2xl hover:border-emerald-500/50 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-6 relative">
              <div className="flex flex-col gap-4">
                <div className="w-fit p-3.5 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground mb-1">Completed</p>
                  <p className="text-3xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 drop-shadow-sm">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between bg-background/40 backdrop-blur-md border border-border/50 p-4 rounded-2xl shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transfers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 bg-background/50 border-border/60 rounded-xl focus:ring-2 focus:ring-primary/20 shadow-inner"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44 h-12 rounded-xl bg-background/50 border-border/60 focus:ring-2 focus:ring-primary/20">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="glass border-white/10">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-transit">In Transit</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 px-6 rounded-xl shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white border-0">
                <Plus className="w-4 h-4 mr-2" />
                New Transfer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md overflow-hidden p-0 glass border-white/10 shadow-2xl shadow-primary/20">
              <DialogHeader className="relative p-6 px-8 border-b border-white/5 bg-white/[0.02] flex flex-row items-center gap-4 text-left">
                <div className="p-3.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-inner shrink-0">
                  <ArrowLeftRight className="w-6 h-6" />
                </div>
                <div>
                  <DialogTitle className="text-2xl tracking-tight">Initiate Transfer</DialogTitle>
                  <DialogDescription className="font-mono text-primary/70 mt-1 uppercase text-[10px] tracking-widest">
                    SYSTEM_PROTOCOL // TRANSFER_LINK
                  </DialogDescription>
                </div>
              </DialogHeader>
              <div className="px-8 pb-6">
                <FieldGroup className="gap-6 pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel className="text-primary/70 font-mono text-[10px] uppercase tracking-widest mb-1.5 flex items-center gap-2">
                      <div className="w-1 h-1 bg-amber-500 rounded-full animate-pulse" />
                      Source Node
                    </FieldLabel>
                    <Select
                      value={formData.fromStoreId}
                      onValueChange={(value) => setFormData({ ...formData, fromStoreId: value })}
                    >
                      <SelectTrigger className="h-12 bg-white/[0.03] border-white/10 rounded-xl">
                        <SelectValue placeholder="Origin" />
                      </SelectTrigger>
                      <SelectContent className="glass border-white/10">
                        {storeList.filter((s: any) => s.status === "active").map((store: any) => (
                          <SelectItem key={store._id || store.id} value={String(store._id || store.id)} className="focus:bg-primary/10">{store.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel className="text-primary/70 font-mono text-[10px] uppercase tracking-widest mb-1.5 flex items-center gap-2">
                      <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                      Target Node
                    </FieldLabel>
                    <Select
                      value={formData.toStoreId}
                      onValueChange={(value) => setFormData({ ...formData, toStoreId: value })}
                    >
                      <SelectTrigger className="h-12 bg-white/[0.03] border-white/10 rounded-xl">
                        <SelectValue placeholder="Destination" />
                      </SelectTrigger>
                      <SelectContent className="glass border-white/10">
                        {storeList
                          .filter((s: any) => s.status === "active" && String(s._id || s.id) !== String(formData.fromStoreId))
                          .map((store: any) => (
                            <SelectItem key={store._id || store.id} value={String(store._id || store.id)} className="focus:bg-primary/10">{store.name}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <Field>
                  <FieldLabel className="text-primary/70 font-mono text-[10px] uppercase tracking-widest mb-1.5">Asset Payload</FieldLabel>
                  <Select
                    value={formData.productId}
                    onValueChange={(value) => setFormData({ ...formData, productId: value })}
                  >
                    <SelectTrigger className="h-12 bg-white/[0.03] border-white/10 rounded-xl">
                      <SelectValue placeholder="Select Asset for Transfer" />
                    </SelectTrigger>
                    <SelectContent className="glass border-white/10">
                      {inventoryList
                        .filter(inv => inv.store?._id === formData.fromStoreId && inv.quantity > 0)
                        .map((inv: any) => (
                          <SelectItem key={inv.product?._id} value={inv.product?._id} className="focus:bg-primary/10">
                            {inv.product?.name} ({inv.quantity} in stock)
                          </SelectItem>
                        ))}
                      {formData.fromStoreId && inventoryList.filter(inv => inv.store?._id === formData.fromStoreId && inv.quantity > 0).length === 0 && (
                        <SelectItem value="none" disabled>No stock in source store</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel className="text-primary/70 font-mono text-[10px] uppercase tracking-widest mb-1.5">Quantity to Relocate</FieldLabel>
                  <div className="relative">
                    <Input
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="0"
                      className="h-12 bg-white/[0.03] border-white/10 rounded-xl pl-12 font-black text-lg"
                    />
                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/50" />
                  </div>
                </Field>
              </FieldGroup>

                <DialogFooter className="gap-3 pt-6 border-t border-white/5">
                  <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="rounded-xl border border-white/5 hover:bg-white/5 uppercase text-[10px] font-black tracking-widest">
                    Abort Transfer
                  </Button>
                  <Button onClick={handleAdd} className="rounded-xl px-8 shadow-lg shadow-primary/20 uppercase text-[10px] font-black tracking-widest bg-gradient-to-r from-primary to-blue-600">
                    Execute Protocol
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Transfers Timeline */}
        <div className="space-y-4">
          {filteredTransfers.map((transfer, index) => {
            const statusConfig = getStatusConfig(transfer.status)
            const StatusIcon = statusConfig.icon

            return (
              <Card
                key={transfer.id}
                className={cn(
                  "group relative overflow-hidden bg-background/40 backdrop-blur-md border border-border/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500",
                  transfer.status === "completed" && "opacity-90 grayscale-[0.2]",
                  transfer.status === "cancelled" && "opacity-60 grayscale"
                )}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {/* Status line indicator with ambient glow */}
                <div className={cn(
                  "absolute left-0 inset-y-0 w-1.5 transition-all duration-500 origin-top",
                  statusConfig.dot, "shadow-[0_0_15px_rgba(0,0,0,0.5)] shadow-" + statusConfig.dot.split('-')[1] + "-500/50"
                )} />

                <CardContent className="p-0 pl-1.5">
                  <div className="flex flex-col lg:flex-row lg:items-center relative z-10">
                    {/* Transfer Route */}
                    <div className="flex-1 px-6 py-5 bg-gradient-to-br from-muted/30 to-transparent">
                      <div className="flex items-center gap-6">
                        <div className="flex-1 text-right">
                          <p className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground mb-1">Origin Node</p>
                          <p className="font-bold text-foreground text-lg tracking-tight">{transfer.fromStoreName}</p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className={cn(
                            "p-2.5 rounded-full shadow-inner border border-white/5 flex items-center justify-center",
                            statusConfig.colors.split(" ")[0],
                            "bg-opacity-20 backdrop-blur-sm"
                          )}>
                            <ArrowRight className={cn(
                              "w-5 h-5",
                              transfer.status === "in-transit" && "animate-[pulse_1.5s_ease-in-out_infinite]"
                            )} />
                          </div>
                        </div>

                        <div className="flex-1 text-left">
                          <p className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground mb-1">Target Node</p>
                          <p className="font-bold text-foreground text-lg tracking-tight">{transfer.toStoreName}</p>
                        </div>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="lg:border-l border-border/50 px-6 py-5 lg:w-56 bg-gradient-to-br from-transparent to-muted/10">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="w-3.5 h-3.5 text-primary/50" />
                        <p className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground">Asset Payload</p>
                      </div>
                      <p className="font-bold text-foreground truncate drop-shadow-sm mb-1">{transfer.productName}</p>
                      <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-widest bg-background border-primary/20 text-primary">
                        {transfer.quantity} Units
                      </Badge>
                    </div>

                    {/* Status & Date */}
                    <div className="lg:border-l border-border/50 px-6 py-5 lg:w-52 flex flex-col justify-between gap-3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/[0.02] to-transparent h-full">
                      <Badge className={cn("w-fit gap-1.5 uppercase font-black text-[9px] tracking-widest py-1 border shadow-sm", statusConfig.colors, "bg-opacity-20")}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </Badge>
                      
                      {transfer.status === "pending" && (
                        <div className="flex gap-2 w-full">
                          <Button variant="ghost" size="sm" className="rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white flex-1 h-8 text-[10px] uppercase font-black tracking-widest transition-colors duration-300" onClick={() => handleReject(transfer.id)}>
                            Deny
                          </Button>
                          <Button size="sm" className="rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white flex-1 h-8 text-[10px] uppercase font-black tracking-widest transition-colors duration-300 border border-emerald-500/20" onClick={() => handleApprove(transfer.id)}>
                            Allow
                          </Button>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-[10px] uppercase font-mono tracking-widest text-muted-foreground">
                        <div className="p-1 rounded bg-muted/50">
                          <Calendar className="w-3 h-3 text-muted-foreground/70" />
                        </div>
                        {transfer.date}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>


        {filteredTransfers.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
              <ArrowLeftRight className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No transfers found</h3>
            <p className="text-muted-foreground mb-6">Create a new transfer or adjust your filters.</p>
            <Button onClick={() => setIsAddOpen(true)} className="rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Transfer
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
