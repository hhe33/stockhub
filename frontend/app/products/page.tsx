"use client"

import { useState, useEffect } from "react"
import { categoriesApi, inventoryApi, productsApi, salesApi, storesApi } from "@/lib/api-client"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { TopNavbar } from "@/components/dashboard/top-navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { type Product } from "@/lib/mock-data"
import { Plus, MoreHorizontal, Pencil, Trash2, Search, Barcode, DollarSign, Package, Layers, Tag, Grid3X3, List, AlertTriangle } from "lucide-react"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { cn } from "@/lib/utils"

const defaultCategories: string[] = []

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  Electronics: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500/20" },
  Accessories: { bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400", border: "border-purple-500/20" },
  Apparel: { bg: "bg-pink-500/10", text: "text-pink-600 dark:text-pink-400", border: "border-pink-500/20" },
  Home: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/20" },
  Other: { bg: "bg-slate-500/10", text: "text-slate-600 dark:text-slate-400", border: "border-slate-500/20" },
}

export default function ProductsPage() {
  const [productList, setProductList] = useState<Product[]>([])
  const [inventoryList, setInventoryList] = useState<any[]>([])
  const [storeList, setStoreList] = useState<any[]>([])
  const [categoryList, setCategoryList] = useState<string[]>(defaultCategories)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      setIsLoadingData(true)
      const [products, inv, stores, categories] = await Promise.all([
        productsApi.getAll(),
        inventoryApi.getAll(),
        storesApi.getAll(),
        categoriesApi.getAll().catch(() => []),
      ])
      setProductList(products.map((p: any) => ({ ...p, id: p._id || p.id })))
      setInventoryList(inv || [])
      setStoreList(stores || [])
      if (Array.isArray(categories) && categories.length > 0) {
        setCategoryList(categories.map((c: any) => c.name).filter(Boolean))
      }
    } catch (err) {
      console.error("Failed to fetch products/inventory/stores:", err)
    } finally {
      setIsLoadingData(false)
    }
  }

  const fetchProducts = async () => {
    try {
      setIsLoadingData(true)
      const data = await productsApi.getAll()
      // Map backend _id to id if necessary, or update Product interface
      setProductList(data.map((p: any) => ({ ...p, id: p._id || p.id })))
    } catch (err) {
      console.error("Failed to fetch products:", err)
    } finally {
      setIsLoadingData(false)
    }
  }

  const fetchInventory = async () => {
    try {
      const data = await inventoryApi.getAll()
      setInventoryList(data || [])
    } catch (err) {
      console.error("Failed to fetch inventory:", err)
    }
  }

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    barcode: "",
    price: "",
    category: "",
    description: "",
    initialStoreId: "",
    initialQuantity: "",
  })

  const [isRestockOpen, setIsRestockOpen] = useState(false)
  const [restockForm, setRestockForm] = useState({ storeId: "", addQuantity: "", minStock: "" })

  const filteredProducts = productList.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode.includes(searchQuery)
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const getTotalStock = (productId: string) => {
    return inventoryList
      .filter((i: any) => (i.product?._id || i.productId) === productId)
      .reduce((acc: number, item: any) => acc + (Number(item.quantity) || 0), 0)
  }

  const handleAdd = async () => {
    try {
      const newProductData = {
        name: formData.name,
        sku: formData.sku,
        barcode: formData.barcode,
        price: parseFloat(formData.price) || 0,
        category: formData.category,
        description: formData.description,
        initialStoreId: formData.initialStoreId || undefined,
        initialQuantity: formData.initialQuantity === "" ? undefined : Number(formData.initialQuantity),
      }
      const savedProduct = await productsApi.create(newProductData)
      setProductList([...productList, { ...savedProduct, id: savedProduct._id }])
      await fetchInventory()
      setFormData({ name: "", sku: "", barcode: "", price: "", category: "", description: "", initialStoreId: "", initialQuantity: "" })
      setIsAddOpen(false)
    } catch (err) {
      console.error("Failed to add product:", err)
    }
  }

  const handleCreateCategory = async () => {
    try {
      const name = newCategoryName.trim()
      if (!name) return
      await categoriesApi.create({ name })
      const data = await categoriesApi.getAll()
      setCategoryList((data || []).map((c: any) => c.name).filter(Boolean))
      setNewCategoryName("")
      // Auto-select the newly created category
      setFormData(prev => ({ ...prev, category: name }))
    } catch (err) {
      console.error("Failed to create category:", err)
    }
  }

  const openRestockDialog = (product: Product) => {
    setSelectedProduct(product)
    setRestockForm({ storeId: "", addQuantity: "", minStock: "" })
    setIsRestockOpen(true)
  }

  const handleRestock = async () => {
    if (!selectedProduct) return
    try {
      if (!restockForm.storeId) return
      const addQuantity = Number(restockForm.addQuantity)
      if (!addQuantity || addQuantity <= 0) return

      await inventoryApi.restock({
        store: restockForm.storeId,
        product: selectedProduct.id,
        addQuantity,
        minStock: restockForm.minStock === "" ? undefined : Number(restockForm.minStock),
      })
      await fetchInventory()
      setIsRestockOpen(false)
      setSelectedProduct(null)
    } catch (err) {
      console.error("Failed to restock:", err)
    }
  }

  const handleEdit = async () => {
    if (!selectedProduct) return
    try {
      const updateData = {
        name: formData.name,
        sku: formData.sku,
        barcode: formData.barcode,
        price: parseFloat(formData.price) || 0,
        category: formData.category,
        description: formData.description,
      }
      const updatedProduct = await productsApi.update(selectedProduct.id, updateData)
      setProductList(productList.map(p =>
        p.id === selectedProduct.id ? { ...updatedProduct, id: updatedProduct._id } : p
      ))
      setIsEditOpen(false)
      setSelectedProduct(null)
    } catch (err) {
      console.error("Failed to edit product:", err)
    }
  }

  const handleDelete = async () => {
    if (!selectedProduct) return
    try {
      await productsApi.delete(selectedProduct.id)
      setProductList(productList.filter(p => p.id !== selectedProduct.id))
      setIsDeleteOpen(false)
      setSelectedProduct(null)
    } catch (err) {
      console.error("Failed to delete product:", err)
    }
  }

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      price: String(product.price),
      category: product.category,
      description: product.description,
      initialStoreId: "",
      initialQuantity: "",
    })
    setIsEditOpen(true)
  }

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product)
    setIsDeleteOpen(true)
  }

  const totalValue = productList.reduce((acc, p) => acc + (p.price * getTotalStock(p.id)), 0)

  return (
    <DashboardLayout>
      {/* Ambient Background Glow */}
      <div className="fixed inset-0 pointer-events-none flex justify-center pt-[20vh] opacity-20 dark:opacity-40 z-0">
        <div className="w-[80vw] h-[60vh] bg-primary/20 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <TopNavbar title="Products" subtitle="Manage your product catalog" />

      <div className="p-4 lg:p-8 space-y-8 relative z-10">
        {/* Restock Dialog */}
        <Dialog open={isRestockOpen} onOpenChange={setIsRestockOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">Restock Product</DialogTitle>
              <DialogDescription>
                Add units for {selectedProduct?.name}. Stock is per-store.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup className="gap-6 pt-4">
              <Field>
                <FieldLabel className="text-primary/70 font-mono text-[10px] uppercase tracking-widest mb-1.5 flex items-center gap-2">
                  <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                  Store Destination
                </FieldLabel>
                <Select value={restockForm.storeId} onValueChange={(v) => setRestockForm({ ...restockForm, storeId: v })}>
                  <SelectTrigger className="h-12 bg-white/[0.03] border-white/10 rounded-xl transition-all font-bold">
                    <SelectValue placeholder="Select store" />
                  </SelectTrigger>
                  <SelectContent className="glass border-white/10">
                    {storeList.map((s: any) => (
                      <SelectItem key={s._id || s.id} value={String(s._id || s.id)} className="focus:bg-primary/10">
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel className="text-primary/70 font-mono text-[10px] uppercase tracking-widest mb-1.5">Add Units</FieldLabel>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={restockForm.addQuantity}
                    onChange={(e) => setRestockForm({ ...restockForm, addQuantity: e.target.value })}
                    className="h-12 bg-white/[0.03] border-white/10 rounded-xl font-black text-lg text-primary"
                  />
                </Field>
                <Field>
                  <FieldLabel className="text-primary/70 font-mono text-[10px] uppercase tracking-widest mb-1.5">Min Stock</FieldLabel>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Optional"
                    value={restockForm.minStock}
                    onChange={(e) => setRestockForm({ ...restockForm, minStock: e.target.value })}
                    className="h-12 bg-white/[0.03] border-white/10 rounded-xl font-mono text-sm"
                  />
                </Field>
              </div>
            </FieldGroup>
            <DialogFooter className="gap-3 pt-6">
              <Button variant="ghost" onClick={() => setIsRestockOpen(false)} className="rounded-xl border border-white/5 hover:bg-white/5 uppercase text-[10px] font-black tracking-widest">
                Abort
              </Button>
              <Button onClick={handleRestock} className="rounded-xl px-8 shadow-lg shadow-primary/20 uppercase text-[10px] font-black tracking-widest bg-primary hover:bg-primary/90 transition-all">
                Restock Asset
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <Card className="group relative overflow-hidden border-border/50 bg-background/40 backdrop-blur-md hover:shadow-2xl hover:border-primary/50 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-6 relative">
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Products</p>
                  <p className="text-3xl font-bold tracking-tight">{productList.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden border-border/50 bg-background/40 backdrop-blur-md hover:shadow-2xl hover:border-secondary/50 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-6 relative">
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-secondary text-secondary-foreground shadow-lg shadow-secondary/25 group-hover:scale-110 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Categories</p>
                  <p className="text-3xl font-bold tracking-tight">{categoryList.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden border-border/50 bg-background/40 backdrop-blur-md hover:shadow-2xl hover:border-emerald-500/50 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-6 relative">
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Value</p>
                  <p className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">${totalValue.toLocaleString("en-US")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden border-border/50 bg-background/40 backdrop-blur-md hover:shadow-2xl hover:border-rose-500/50 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-6 relative">
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-500/25 group-hover:scale-110 transition-transform relative">
                  <AlertTriangle className="w-6 h-6" />
                  {productList.filter(p => getTotalStock(p.id) < 10).length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Integrity Alerts</p>
                  <p className="text-3xl font-bold tracking-tight text-rose-600 dark:text-rose-400">{productList.filter(p => getTotalStock(p.id) < 10).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between bg-background/40 backdrop-blur-md border border-border/50 p-4 rounded-2xl shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 bg-background/50 border-border/60 rounded-xl focus:ring-2 focus:ring-primary/20 shadow-inner"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-44 h-12 rounded-xl bg-background/50 border-border/60 focus:ring-2 focus:ring-primary/20">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="glass border-white/10">
                <SelectItem value="all">All Categories</SelectItem>
                {categoryList.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3">
            <div className="flex border border-border/60 rounded-xl overflow-hidden bg-background/50 backdrop-blur-sm shadow-inner">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className={cn("h-12 w-12 rounded-none transition-all", viewMode === "grid" && "bg-primary/20 text-primary")}
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="w-5 h-5" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className={cn("h-12 w-12 rounded-none transition-all", viewMode === "list" && "bg-primary/20 text-primary")}
                onClick={() => setViewMode("list")}
              >
                <List className="w-5 h-5" />
              </Button>
            </div>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="h-12 px-6 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all font-semibold tracking-wide">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>
                    Fill in the details to add a new product to your catalog.
                  </DialogDescription>
                </DialogHeader>
                <FieldGroup className="gap-6 pt-4">
                  <Field>
                    <FieldLabel>Product Name</FieldLabel>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Premium Headphones"
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>SKU</FieldLabel>
                      <Input
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        placeholder="SKU-12345"
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Barcode</FieldLabel>
                      <Input
                        value={formData.barcode}
                        onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                        placeholder="12345678"
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Price</FieldLabel>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0.00"
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Category</FieldLabel>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryList.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <FieldLabel>Create Category</FieldLabel>
                      <Input
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="New category name"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button type="button" variant="outline" onClick={handleCreateCategory} className="w-full">
                        Add
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Initial Store</FieldLabel>
                      <Select 
                        value={formData.initialStoreId} 
                        onValueChange={(v) => setFormData({ ...formData, initialStoreId: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Store" />
                        </SelectTrigger>
                        <SelectContent>
                          {storeList.map((s: any) => (
                            <SelectItem key={s._id || s.id} value={String(s._id || s.id)}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel>Initial Quantity</FieldLabel>
                      <Input
                        type="number"
                        value={formData.initialQuantity}
                        onChange={(e) => setFormData({ ...formData, initialQuantity: e.target.value })}
                        placeholder="0"
                      />
                    </Field>
                  </div>

                  <Field>
                    <FieldLabel>Description</FieldLabel>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Product details..."
                      rows={3}
                    />
                  </Field>
                </FieldGroup>
                <DialogFooter className="pt-6 gap-3">
                  <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAdd}>Add Product</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Products Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => {
              const colors = categoryColors[product.category] || categoryColors.Other
              const stock = getTotalStock(product.id)
              return (
                <Card
                  key={product.id}
                  className={cn(
                    "group relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5",
                    "bg-background/40 backdrop-blur-md border",
                    stock === 0 ? "border-rose-500/30" : stock < 10 ? "border-amber-500/30" : "border-border/50 hover:border-primary/40"
                  )}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  {/* Dynamic Top Border Highlight */}
                  <div className={cn(
                    "absolute top-0 inset-x-0 h-1 transition-all duration-500 origin-left scale-x-0 group-hover:scale-x-100",
                    stock === 0 ? "bg-rose-500" : stock < 10 ? "bg-amber-500" : "bg-gradient-to-r from-primary to-secondary"
                  )} />
                  
                  {/* Decorative Background Mesh */}
                  <div className={cn(
                    "absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none",
                    stock === 0 ? "from-rose-500/40 via-transparent to-transparent" : stock < 10 ? "from-amber-500/40 via-transparent to-transparent" : "from-primary/40 via-transparent to-transparent"
                  )} />

                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <Badge className={cn("text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 border", colors.bg, colors.text, colors.border)}>
                        {product.category}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass border-white/10">
                          <DropdownMenuItem onClick={() => openEditDialog(product)}>
                            <Pencil className="w-4 h-4 mr-2" />Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openRestockDialog(product)}>
                            <Package className="w-4 h-4 mr-2" />Restock
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDeleteDialog(product)} className="text-destructive focus:text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="mb-5">
                      <h3 className="font-bold text-lg text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors tracking-tight">
                        {product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 h-10">{product.description}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-6 text-xs text-muted-foreground">
                      <span className="font-mono bg-background/50 border border-border/50 px-2 py-1 rounded-md">{product.sku}</span>
                      <span className="flex items-center gap-1 font-mono bg-background/50 border border-border/50 px-2 py-1 rounded-md">
                        <Barcode className="w-3.5 h-3.5" />
                        {product.barcode.slice(-8) || "NO-BARCODE"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-5 border-t border-border/50 relative">
                      {/* Subtle divider glow */}
                      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div>
                        <p className="text-2xl font-black tracking-tight text-primary drop-shadow-sm">${product.price.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground mb-0.5">Stock Level</p>
                        <div className="flex items-center justify-end gap-1.5">
                          {stock < 10 && (
                            <span className={cn(
                              "relative flex h-2 w-2",
                              stock === 0 ? "text-rose-500" : "text-amber-500"
                            )}>
                              <span className={cn(
                                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                                stock === 0 ? "bg-rose-400" : "bg-amber-400"
                              )}></span>
                              <span className={cn(
                                "relative inline-flex rounded-full h-2 w-2",
                                stock === 0 ? "bg-rose-500" : "bg-amber-500"
                              )}></span>
                            </span>
                          )}
                          <p className={cn(
                            "font-bold text-lg leading-none",
                            stock === 0 ? "text-rose-500" : stock < 10 ? "text-amber-500" : "text-emerald-500"
                          )}>{stock}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="border border-border/50 bg-background/40 backdrop-blur-md overflow-hidden rounded-2xl shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/20">
                      <th className="text-left py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-widest">Product</th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-widest hidden md:table-cell">SKU / Barcode</th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-widest">Category</th>
                      <th className="text-right py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-widest">Price</th>
                      <th className="text-right py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-widest hidden lg:table-cell">Stock Level</th>
                      <th className="text-right py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredProducts.map((product) => {
                      const colors = categoryColors[product.category] || categoryColors.Other
                      const stock = getTotalStock(product.id)
                      return (
                        <tr key={product.id} className="group hover:bg-muted/30 hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1),inset_0_-1px_0_0_rgba(148,163,184,0.1)] transition-all">
                          <td className="py-4 px-6">
                            <div>
                              <p className="font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">{product.name}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{product.description}</p>
                            </div>
                          </td>
                          <td className="py-4 px-6 hidden md:table-cell">
                            <div className="space-y-1.5">
                              <p className="text-xs font-mono bg-background/50 border border-border/50 px-2 py-0.5 rounded inline-block">{product.sku}</p>
                              <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                                <Barcode className="w-3 h-3" />
                                {product.barcode.slice(-8) || "NO-BARCODE"}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <Badge className={cn("text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 border", colors.bg, colors.text, colors.border)}>
                              {product.category}
                            </Badge>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span className="text-lg font-black text-primary">${product.price.toFixed(2)}</span>
                          </td>
                          <td className="py-4 px-6 text-right hidden lg:table-cell align-middle">
                            <div className="flex items-center justify-end gap-2">
                              {stock < 10 && (
                                <span className={cn(
                                  "relative flex h-2 w-2",
                                  stock === 0 ? "text-rose-500" : "text-amber-500"
                                )}>
                                  <span className={cn(
                                    "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                                    stock === 0 ? "bg-rose-400" : "bg-amber-400"
                                  )}></span>
                                  <span className={cn(
                                    "relative inline-flex rounded-full h-2 w-2",
                                    stock === 0 ? "bg-rose-500" : "bg-amber-500"
                                  )}></span>
                                </span>
                              )}
                              <span className={cn(
                                "font-bold text-base",
                                stock === 0 ? "text-rose-500" : stock < 10 ? "text-amber-500" : "text-emerald-500"
                              )}>{stock}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="glass border-white/10">
                                <DropdownMenuItem onClick={() => openEditDialog(product)}>
                                  <Pencil className="w-4 h-4 mr-2" />Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openRestockDialog(product)}>
                                  <Package className="w-4 h-4 mr-2" />Restock
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openDeleteDialog(product)} className="text-destructive focus:text-destructive">
                                  <Trash2 className="w-4 h-4 mr-2" />Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
              <Package className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your filters or add a new product.</p>
            <Button onClick={() => setIsAddOpen(true)} className="rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Product
            </Button>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-2xl overflow-hidden p-0 glass border-white/10 shadow-2xl shadow-primary/20">
            <DialogHeader className="relative p-6 px-8 border-b border-white/5 bg-white/[0.02] flex flex-row items-center gap-4 text-left">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-inner shrink-0">
                <Pencil className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl tracking-tight">Modify Asset</DialogTitle>
                <DialogDescription className="font-mono text-amber-500/70 mt-1">
                  SYSTEM_REGISTRY // EDIT_PRODUCT
                </DialogDescription>
              </div>
            </DialogHeader>
            <div className="px-8 pb-6">
              <FieldGroup className="gap-6 pt-6">
                <Field>
                  <FieldLabel className="text-primary/70 font-mono text-[10px] uppercase tracking-widest mb-1.5 flex items-center gap-2">
                    <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                    Product Descriptor
                  </FieldLabel>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="h-12 bg-white/[0.03] border-white/10 rounded-xl font-bold" />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel className="text-primary/70 font-mono text-[10px] uppercase tracking-widest mb-1.5">SKU ID</FieldLabel>
                    <Input value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className="h-12 bg-white/[0.03] border-white/10 rounded-xl font-mono text-sm" />
                  </Field>
                  <Field>
                    <FieldLabel className="text-primary/70 font-mono text-[10px] uppercase tracking-widest mb-1.5">Registry Barcode</FieldLabel>
                    <Input value={formData.barcode} onChange={(e) => setFormData({ ...formData, barcode: e.target.value })} className="h-12 bg-white/[0.03] border-white/10 rounded-xl font-mono text-sm" />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel className="text-primary/70 font-mono text-[10px] uppercase tracking-widest mb-1.5">Unit Valuation ($)</FieldLabel>
                    <Input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="h-12 bg-white/[0.03] border-white/10 rounded-xl font-black text-lg text-primary" />
                  </Field>
                  <Field>
                    <FieldLabel className="text-primary/70 font-mono text-[10px] uppercase tracking-widest mb-1.5">Asset Category</FieldLabel>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger className="h-12 bg-white/[0.03] border-white/10 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent className="glass border-white/10">
                        {categoryList.map(cat => (<SelectItem key={cat} value={cat} className="focus:bg-primary/10">{cat}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <Field>
                  <FieldLabel className="text-primary/70 font-mono text-[10px] uppercase tracking-widest mb-1.5">Technical Specs</FieldLabel>
                  <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="bg-white/[0.03] border-white/10 rounded-xl min-h-[100px]" />
                </Field>
              </FieldGroup>
            </div>
            <DialogFooter className="gap-3 p-6 px-8 border-t border-white/5 bg-black/20">
              <Button variant="ghost" onClick={() => setIsEditOpen(false)} className="rounded-xl border border-white/5 hover:bg-white/5 uppercase text-[10px] font-black tracking-widest">
                Abort
              </Button>
              <Button onClick={handleEdit} className="rounded-xl px-8 shadow-lg shadow-amber-500/20 uppercase text-[10px] font-black tracking-widest bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 transition-all">
                Update Registry
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">Delete Product</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {'"'}{selectedProduct?.name}{'"'}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="rounded-xl">Cancel</Button>
              <Button variant="destructive" onClick={handleDelete} className="rounded-xl">Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
