"use client"

import { useState, useEffect } from "react"
import { inventoryApi, storesApi, productsApi } from "@/lib/api-client"
import { Loader2, Plus, AlertTriangle, Package, Warehouse, CheckCircle2, XCircle, Search } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { TopNavbar } from "@/components/dashboard/top-navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { cn } from "@/lib/utils"

export default function InventoryPage() {
  const [stores, setStores] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [inventoryList, setInventoryList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Main Store Filter
  const [selectedStoreId, setSelectedStoreId] = useState<string>("")
  
  // Secondary Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  
  // Adjust Stock State
  const [isAdjustOpen, setIsAdjustOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [adjustForm, setAdjustForm] = useState({ quantity: "", minStock: "" })

  // Add Product State
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [addForm, setAddForm] = useState({ 
    productId: "", 
    storeId: "", 
    quantity: "0", 
    minStock: "10" 
  })

  // Watch for store changes to suggest a default storeId in addForm
  useEffect(() => {
    if (selectedStoreId !== "all" && selectedStoreId !== "") {
      setAddForm(prev => ({ ...prev, storeId: selectedStoreId }))
    }
  }, [selectedStoreId])

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      const [storesData, productsData, inventoryData] = await Promise.all([
        storesApi.getAll(),
        productsApi.getAll(),
        inventoryApi.getAll()
      ])
      
      setStores(storesData)
      setProducts(productsData)
      
      const mappedInventory = inventoryData.map((item: any) => {
        const quantity = item.quantity || 0
        const minStock = item.minStock || 10
        let status = "in-stock"
        if (quantity === 0) status = "out-of-stock"
        else if (quantity < minStock) status = "low-stock"

        return {
          id: item._id,
          productId: item.product?._id,
          productName: item.product?.name || "Unknown Product",
          productCategory: item.product?.category || "-",
          storeId: item.store?._id,
          storeName: item.store?.name || "Unknown Store",
          quantity,
          minStock,
          status,
        }
      })
      
      setInventoryList(mappedInventory)
      
      if (!selectedStoreId) {
        setSelectedStoreId("all")
      }
    } catch (err) {
      console.error("Failed to fetch data:", err)
    } finally {
      setLoading(false)
    }
  }

  const openAdjustDialog = (item: any) => {
    setSelectedItem(item)
    setAdjustForm({ quantity: String(item.quantity ?? 0), minStock: String(item.minStock ?? 10) })
    setIsAdjustOpen(true)
  }

  const handleAdjust = async () => {
    if (!selectedItem) return
    try {
      await inventoryApi.update(selectedItem.id, {
        quantity: adjustForm.quantity === "" ? 0 : Number(adjustForm.quantity),
        minStock: adjustForm.minStock === "" ? 10 : Number(adjustForm.minStock),
      })
      await fetchInitialData()
      setIsAdjustOpen(false)
      setSelectedItem(null)
    } catch (err) {
      console.error("Failed to adjust inventory:", err)
    }
  }

  const handleAddProduct = async () => {
    const targetStoreId = selectedStoreId !== "all" ? selectedStoreId : addForm.storeId
    if (!addForm.productId || !targetStoreId) return
    try {
      await inventoryApi.restock({
        store: targetStoreId,
        product: addForm.productId,
        addQuantity: addForm.quantity === "" ? 0 : Number(addForm.quantity),
        minStock: addForm.minStock === "" ? 10 : Number(addForm.minStock)
      })
      await fetchInitialData()
      setIsAddOpen(false)
      setAddForm({ productId: "", storeId: selectedStoreId !== "all" ? selectedStoreId : "", quantity: "0", minStock: "10" })
    } catch (err) {
      console.error("Failed to add product to store:", err)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in-stock":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"><CheckCircle2 className="w-3 h-3 mr-1" /> OK</Badge>
      case "low-stock":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20"><AlertTriangle className="w-3 h-3 mr-1" /> Low</Badge>
      case "out-of-stock":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Out</Badge>
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

  const storeInventory = selectedStoreId === "all" 
    ? inventoryList 
    : inventoryList.filter(item => item.storeId === selectedStoreId)
  
  const filteredInventory = storeInventory.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Determine available global products that are NOT yet in this store's inventory
  const availableProducts = products.filter(p => !storeInventory.some(i => i.productId === p._id))

  const selectedStoreName = stores.find(s => s._id === selectedStoreId)?.name || 'Unknown Store'

  return (
    <DashboardLayout>
      <TopNavbar title="Inventory" subtitle="Manage stock per store" />

      <div className="p-4 lg:p-8 space-y-8">
        {/* Main Store Selection Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <Warehouse className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Select Store</p>
              <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
                <SelectTrigger className="w-full md:w-64 h-12 bg-background border-border shadow-sm text-lg font-bold">
                  <SelectValue placeholder="Choose a branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">🌐 All Stores (Global)</SelectItem>
                  {stores.map(store => (
                    <SelectItem key={store._id} value={store._id}>{store.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            onClick={() => setIsAddOpen(true)} 
            disabled={products.length === 0}
            className="w-full md:w-auto h-12 rounded-xl shadow-lg shadow-primary/20"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Product to Store
          </Button>
        </div>

        {selectedStoreId ? (
          <Card className="border border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/20 border-b border-border/50 pb-4">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  Inventory for <span className="text-primary">{selectedStoreId === 'all' ? 'All Stores' : selectedStoreName}</span>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-10 w-full sm:w-48 bg-background border-border/60"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] h-10 bg-background">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="in-stock">In Stock</SelectItem>
                      <SelectItem value="low-stock">Low Stock</SelectItem>
                      <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredInventory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Product</th>
                        <th className="px-6 py-4 font-semibold">Category</th>
                        {selectedStoreId === 'all' && <th className="px-6 py-4 font-semibold">Store</th>}
                        <th className="px-6 py-4 font-semibold">Quantity</th>
                        <th className="px-6 py-4 font-semibold">Min Quantity</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {filteredInventory.map((item) => (
                        <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-6 py-4 font-medium text-foreground">{item.productName}</td>
                          <td className="px-6 py-4 text-muted-foreground">{item.productCategory}</td>
                          {selectedStoreId === 'all' && <td className="px-6 py-4 text-primary font-medium">{item.storeName}</td>}
                          <td className="px-6 py-4 font-bold text-foreground">{item.quantity}</td>
                          <td className="px-6 py-4 text-muted-foreground">{item.minStock}</td>
                          <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                          <td className="px-6 py-4 text-right">
                            <Button variant="outline" size="sm" onClick={() => openAdjustDialog(item)}>
                              Adjust
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium text-foreground mb-1">No products found</p>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery || statusFilter !== 'all' 
                      ? "Try adjusting your filters." 
                      : "This store's inventory is empty. Add a product to get started."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-20">
             <Warehouse className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
             <h2 className="text-2xl font-bold text-foreground mb-2">No Store Selected</h2>
             <p className="text-muted-foreground max-w-md mx-auto">Please select a store branch from the dropdown above to view and manage its inventory.</p>
          </div>
        )}

        {/* Adjust Stock Dialog */}
        <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adjust Stock: {selectedItem?.productName}</DialogTitle>
              <DialogDescription>Update the current quantity or minimum required stock.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <Field>
                <FieldLabel>Current Stock</FieldLabel>
                <Input
                  type="number"
                  value={adjustForm.quantity}
                  onChange={(e) => setAdjustForm({ ...adjustForm, quantity: e.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel>Min. Required</FieldLabel>
                <Input
                  type="number"
                  value={adjustForm.minStock}
                  onChange={(e) => setAdjustForm({ ...adjustForm, minStock: e.target.value })}
                />
              </Field>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAdjustOpen(false)}>Cancel</Button>
              <Button onClick={handleAdjust}>Update Inventory</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Product to Store Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Product to {selectedStoreName}</DialogTitle>
              <DialogDescription>Select an existing global product to initialize its stock in this branch.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedStoreId === "all" && (
                <Field>
                  <FieldLabel>Target Store</FieldLabel>
                  <Select value={addForm.storeId} onValueChange={(v) => setAddForm({ ...addForm, storeId: v, productId: "" })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a store" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map(store => (
                        <SelectItem key={store._id} value={store._id}>{store.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
              <Field>
                <FieldLabel>Select Product</FieldLabel>
                <Select value={addForm.productId} onValueChange={(v) => setAddForm({ ...addForm, productId: v })}>
                  <SelectTrigger disabled={selectedStoreId === "all" && !addForm.storeId}>
                    <SelectValue placeholder={selectedStoreId === "all" && !addForm.storeId ? "Pick a store first" : "Choose a product"} />
                  </SelectTrigger>
                  <SelectContent>
                    {products
                      .filter(p => {
                        const targetId = selectedStoreId !== "all" ? selectedStoreId : addForm.storeId
                        if (!targetId) return true
                        // Exclude products already in the target store
                        return !inventoryList.some(i => i.productId === p._id && i.storeId === targetId)
                      })
                      .map(p => (
                        <SelectItem key={p._id} value={p._id}>{p.name} ({p.category})</SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Initial Quantity</FieldLabel>
                  <Input
                    type="number"
                    value={addForm.quantity}
                    onChange={(e) => setAddForm({ ...addForm, quantity: e.target.value })}
                  />
                </Field>
                <Field>
                  <FieldLabel>Min. Quantity Alert</FieldLabel>
                  <Input
                    type="number"
                    value={addForm.minStock}
                    onChange={(e) => setAddForm({ ...addForm, minStock: e.target.value })}
                  />
                </Field>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onClick={handleAddProduct} disabled={!addForm.productId}>Add to Store</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  )
}
