"use client"

import { useState } from "react"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { storesApi, inventoryApi, salesApi } from "@/lib/api-client"
import { Plus, MoreHorizontal, Pencil, Trash2, Search, MapPin, Phone, Store as StoreIcon, Users, Package, ArrowUpRight, Loader2 } from "lucide-react"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { cn } from "@/lib/utils"
import { useEffect } from "react"

export default function StoresPage() {
  const [storeList, setStoreList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [inventoryList, setInventoryList] = useState<any[]>([])
  const [salesList, setSalesList] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedStore, setSelectedStore] = useState<any | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    address: "",
    phone: "",
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      const [stores, inv, sales] = await Promise.all([
        storesApi.getAll(),
        inventoryApi.getAll().catch(() => []),
        salesApi.getAll().catch(() => []),
      ])
      setStoreList(stores)
      setInventoryList(inv)
      setSalesList(sales)
    } catch (err) {
      console.error("Failed to fetch stores data:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStores = async () => {
    try {
      const data = await storesApi.getAll()
      setStoreList(data)
    } catch (err) {
      console.error("Failed to fetch stores:", err)
    }
  }

  const filteredStores = storeList.filter(store =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.city.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAdd = async () => {
    try {
      await storesApi.create(formData)
      await fetchStores()
      setFormData({ name: "", city: "", address: "", phone: "" })
      setIsAddOpen(false)
    } catch (err) {
      console.error("Failed to add store:", err)
    }
  }

  const handleEdit = async () => {
    if (!selectedStore) return
    try {
      const id = selectedStore._id || selectedStore.id
      await storesApi.update(id, formData)
      await fetchStores()
      setIsEditOpen(false)
      setSelectedStore(null)
    } catch (err) {
      console.error("Failed to edit store:", err)
    }
  }

  const handleDelete = async () => {
    if (!selectedStore) return
    try {
      const id = selectedStore._id || selectedStore.id
      await storesApi.delete(id)
      await fetchStores()
      setIsDeleteOpen(false)
      setSelectedStore(null)
    } catch (err) {
      console.error("Failed to delete store:", err)
    }
  }

  const openEditDialog = (store: any) => {
    setSelectedStore(store)
    setFormData({
      name: store.name,
      city: store.city,
      address: store.address,
      phone: store.phone,
    })
    setIsEditOpen(true)
  }

  const openDeleteDialog = (store: any) => {
    setSelectedStore(store)
    setIsDeleteOpen(true)
  }

  const openDetailsDialog = (store: any) => {
    setSelectedStore(store)
    setIsDetailsOpen(true)
  }

  const activeStores = storeList.filter(s => s.status === "active").length
  const inactiveStores = storeList.filter(s => s.status === "inactive").length

  // Calculate stats for details view
  const storeId = selectedStore?._id || selectedStore?.id
  const storeInventory = storeId ? inventoryList.filter((i: any) => (i.store?._id || i.storeId) === storeId) : []
  const storeSales = storeId ? salesList.filter((s: any) => (s.store?._id || s.storeId) === storeId) : []

  const totalItems = storeInventory.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0)
  const lowStockCount = storeInventory.filter((i: any) => i.quantity < (i.minStock || 10)).length
  const totalRevenue = storeSales.reduce((acc: number, sale: any) => acc + (sale.total || 0), 0)

  return (
    <DashboardLayout>
      {/* Ambient Background Glow */}
      <div className="fixed inset-0 pointer-events-none flex justify-center pt-[20vh] opacity-20 dark:opacity-40">
        <div className="w-[80vw] h-[60vh] bg-primary/20 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <TopNavbar title="Stores" subtitle="Manage your store locations" />

      <div className="p-4 lg:p-8 space-y-8 relative z-10">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="group relative overflow-hidden border-border/50 bg-background/40 backdrop-blur-md hover:shadow-2xl hover:border-primary/50 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-3xl rounded-full group-hover:bg-primary/30 transition-colors duration-500" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Stores</p>
                  <p className="text-3xl font-bold tracking-tight">{storeList.length}</p>
                </div>
                <div className="p-3 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                  <StoreIcon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-border/50 bg-background/40 backdrop-blur-md hover:shadow-2xl hover:border-emerald-500/50 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 blur-3xl rounded-full group-hover:bg-emerald-500/30 transition-colors duration-500" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Active Stores</p>
                  <p className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">{activeStores}</p>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/25">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-border/50 bg-background/40 backdrop-blur-md hover:shadow-2xl hover:border-amber-500/50 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/20 blur-3xl rounded-full group-hover:bg-amber-500/30 transition-colors duration-500" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Inactive</p>
                  <p className="text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400">{inactiveStores}</p>
                </div>
                <div className="p-3 rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/25">
                  <Package className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-background/40 backdrop-blur-md border border-border/50 p-4 rounded-2xl shadow-sm">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search stores by name or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 bg-background/50 border-border/60 rounded-xl focus:ring-2 focus:ring-primary/20 shadow-inner"
            />
          </div>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="h-11 px-6 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                <Plus className="w-4 h-4 mr-2" />
                Add Store
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl">Add New Store</DialogTitle>
                <DialogDescription>
                  Create a new store location for your inventory system.
                </DialogDescription>
              </DialogHeader>
              <FieldGroup className="gap-6 pt-4">
                <Field>
                  <FieldLabel className="text-primary/70 font-mono text-[10px] uppercase tracking-widest mb-1.5 flex items-center gap-2">
                    <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                    Store Name
                  </FieldLabel>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter store name"
                    className="h-12 bg-white/[0.03] border-white/10 rounded-xl font-bold"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel className="text-primary/70 font-mono text-[10px] uppercase tracking-widest mb-1.5">Sector / City</FieldLabel>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Enter city"
                      className="h-12 bg-white/[0.03] border-white/10 rounded-xl font-medium"
                    />
                  </Field>
                  <Field>
                    <FieldLabel className="text-primary/70 font-mono text-[10px] uppercase tracking-widest mb-1.5">Comm. Line</FieldLabel>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter phone number"
                      className="h-12 bg-white/[0.03] border-white/10 rounded-xl font-mono text-sm"
                    />
                  </Field>
                </div>
                <Field>
                  <FieldLabel className="text-primary/70 font-mono text-[10px] uppercase tracking-widest mb-1.5">Geographic Coordinates</FieldLabel>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter full address"
                    className="h-12 bg-white/[0.03] border-white/10 rounded-xl"
                  />
                </Field>
              </FieldGroup>
              <DialogFooter className="gap-3 pt-6">
                <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="rounded-xl border border-white/5 hover:bg-white/5 uppercase text-[10px] font-black tracking-widest">
                  Cancel
                </Button>
                <Button onClick={handleAdd} className="rounded-xl px-8 shadow-lg shadow-primary/20 uppercase text-[10px] font-black tracking-widest">
                  Add Store
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredStores.map((store, index) => (
            <Card
              key={store._id || store.id}
              className={cn(
                "group relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5",
                "bg-background/40 backdrop-blur-md border",
                store.status === "active" 
                  ? "border-border/50 hover:border-primary/40 hover:shadow-primary/10" 
                  : "border-border/20 opacity-75 hover:opacity-100 grayscale-[0.5] hover:grayscale-0",
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Dynamic Top Border Highlight */}
              <div className={cn(
                "absolute top-0 inset-x-0 h-1 transition-all duration-500 origin-left scale-x-0 group-hover:scale-x-100",
                store.status === "active" ? "bg-gradient-to-r from-primary to-secondary" : "bg-gradient-to-r from-amber-500 to-rose-500"
              )} />
              
              {/* Decorative Background Mesh */}
              <div className={cn(
                "absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none",
                store.status === "active" ? "from-primary/40 via-transparent to-transparent" : "from-amber-500/40 via-transparent to-transparent"
              )} />

              <CardContent className="p-7 relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-3.5 rounded-2xl transition-all duration-500 relative",
                      store.status === "active"
                        ? "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-[0_0_2rem_-0.5rem_var(--tw-shadow-color)] shadow-primary"
                        : "bg-muted text-muted-foreground group-hover:bg-amber-500 group-hover:text-white group-hover:shadow-[0_0_2rem_-0.5rem_var(--tw-shadow-color)] shadow-amber-500"
                    )}>
                      <StoreIcon className="w-6 h-6" />
                      {/* Inner Ring Glow */}
                      <div className="absolute inset-0 rounded-2xl border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">{store.name}</h3>
                      <Badge
                        variant={store.status === "active" ? "default" : "secondary"}
                        className={cn(
                          "mt-1.5 text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 border",
                          store.status === "active" 
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        )}
                      >
                        {store.status === "active" ? "● Operational" : "○ Offline"}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => openEditDialog(store)} className="gap-2">
                        <Pencil className="w-4 h-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openDeleteDialog(store)}
                        className="text-destructive focus:text-destructive gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-muted-foreground">{store.city}</p>
                      <p className="text-xs text-muted-foreground/70">{store.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <p className="text-muted-foreground">{store.phone}</p>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-border/50 relative">
                  {/* Subtle divider glow */}
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <Button
                    variant="ghost"
                    onClick={() => openDetailsDialog(store)}
                    className="w-full h-10 text-sm font-semibold text-muted-foreground hover:text-primary gap-2 rounded-xl group/btn bg-muted/20 hover:bg-primary/5 transition-all"
                  >
                    Enter Command Center
                    <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredStores.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
              <StoreIcon className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No stores found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your search or add a new store.</p>
            <Button onClick={() => setIsAddOpen(true)} className="rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Store
            </Button>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">Edit Store</DialogTitle>
              <DialogDescription>
                Update the store information.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup className="gap-6 pt-4">
              <Field>
                <FieldLabel className="text-primary/70 font-mono text-[10px] uppercase tracking-widest mb-1.5 flex items-center gap-2">
                  <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                  Store Designation
                </FieldLabel>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="h-12 bg-white/[0.03] border-white/10 rounded-xl font-bold" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel className="text-primary/70 font-mono text-[10px] uppercase tracking-widest mb-1.5">Sector / City</FieldLabel>
                  <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="h-12 bg-white/[0.03] border-white/10 rounded-xl font-medium" />
                </Field>
                <Field>
                  <FieldLabel className="text-primary/70 font-mono text-[10px] uppercase tracking-widest mb-1.5">Comm. Line</FieldLabel>
                  <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="h-12 bg-white/[0.03] border-white/10 rounded-xl font-mono text-sm" />
                </Field>
              </div>
              <Field>
                <FieldLabel className="text-primary/70 font-mono text-[10px] uppercase tracking-widest mb-1.5">Geographic Coordinates</FieldLabel>
                <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="h-12 bg-white/[0.03] border-white/10 rounded-xl" />
              </Field>
            </FieldGroup>
            <DialogFooter className="gap-3 pt-6">
              <Button variant="ghost" onClick={() => setIsEditOpen(false)} className="rounded-xl border border-white/5 hover:bg-white/5 uppercase text-[10px] font-black tracking-widest">Cancel</Button>
              <Button onClick={handleEdit} className="rounded-xl px-8 shadow-lg shadow-primary/20 uppercase text-[10px] font-black tracking-widest">Update Store</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">Delete Store</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {'"'}{selectedStore?.name}{'"'}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} className="rounded-xl">
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-2xl overflow-hidden">
            <DialogHeader className="relative pb-6 border-b border-white/5">
              <div className="flex items-center gap-5">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-xl shadow-primary/20">
                  <StoreIcon className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <DialogTitle className="text-3xl tracking-tighter">{selectedStore?.name}</DialogTitle>
                    <Badge
                      variant={selectedStore?.status === "active" ? "default" : "secondary"}
                      className={cn(
                        "px-3 py-0.5 text-[10px] font-black uppercase tracking-widest",
                        selectedStore?.status === "active" && "bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
                      )}
                    >
                      {selectedStore?.status === "active" ? "Store Active" : "Store Inactive"}
                    </Badge>
                  </div>
                  <DialogDescription className="flex items-center gap-2">
                    <span className="inline-block w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                    ID: {selectedStore?.id || "N/A"}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 relative">
              <div className="space-y-8">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4 flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    Location Details
                  </h4>
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Physical Address</p>
                      <p className="text-sm font-bold text-foreground">{selectedStore?.address}, {selectedStore?.city}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Contact Phone</p>
                      <p className="text-sm font-mono text-primary">{selectedStore?.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
                  <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-3">Store Capacity</h4>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-primary w-[85%] rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider italic">Utilization Rate: 85%</p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
                <div className="relative glass border border-white/10 rounded-2xl p-6 h-full overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-20">
                    <Package className="w-20 h-20" />
                  </div>

                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-6">Inventory Overview</h4>

                  <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1 leading-none">Total Products</p>
                      <p className="text-2xl font-black text-foreground">{totalItems}</p>
                    </div>
                    <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1 leading-none">Low Stock</p>
                      <p className="text-2xl font-black text-amber-500">{lowStockCount}</p>
                    </div>
                    <div className="bg-primary/20 rounded-xl p-5 border border-primary/20 col-span-2">
                      <p className="text-[10px] text-primary uppercase font-black tracking-widest mb-1 leading-none">Store Revenue</p>
                      <p className="text-3xl font-black text-white">${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2 border-t border-white/5">
              <Button onClick={() => setIsDetailsOpen(false)} className="rounded-xl w-full sm:w-auto px-8 shadow-lg shadow-primary/20 uppercase text-[10px] font-black tracking-widest">
                Close Details
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
