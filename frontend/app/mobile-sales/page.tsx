"use client"

import { useState, useEffect } from "react"
import { StoreSelector } from "@/components/mobile/store-selector"
import { Loader2, ShoppingCart, LogOut, Package, Search, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { storesApi, inventoryApi } from "@/lib/api-client"
import { MobileProductCard } from "@/components/mobile/product-card"
import { MobileCart } from "@/components/mobile/mobile-cart"
import {
  Drawer,
  DrawerTrigger,
} from "@/components/ui/drawer"

export default function MobileSalesPage() {
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null)
  const [selectedStoreName, setSelectedStoreName] = useState<string>("")
  const [isInitializing, setIsInitializing] = useState(true)
  const [loading, setLoading] = useState(false)
  const [inventory, setInventory] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [cart, setCart] = useState<any[]>([])

  useEffect(() => {
    const savedStore = localStorage.getItem("mobile_pos_store")
    const savedName = localStorage.getItem("mobile_pos_store_name")
    if (savedStore) {
      setSelectedStoreId(savedStore)
      setSelectedStoreName(savedName || "Node")
      fetchInventory(savedStore)
    }
    setIsInitializing(false)
  }, [])

  const fetchInventory = async (storeId: string) => {
    setLoading(true)
    try {
      const data = await inventoryApi.getAll()
      // Filter inventory for the specific store
      const storeStock = data.filter((item: any) => item.store?._id === storeId)
      setInventory(storeStock)
    } catch (err) {
      console.error("Failed to load inventory", err)
    } finally {
      setLoading(false)
    }
  }

  const handleStoreSelect = async (id: string) => {
    try {
      const stores = await storesApi.getAll()
      const store = stores.find((s: any) => s._id === id)
      const name = store?.name || "Node"
      
      setSelectedStoreId(id)
      setSelectedStoreName(name)
      localStorage.setItem("mobile_pos_store", id)
      localStorage.setItem("mobile_pos_store_name", name)
      fetchInventory(id)
    } catch (err) {
      console.error("Failed to sync store info", err)
    }
  }

  const handleLogout = () => {
    setSelectedStoreId(null)
    localStorage.removeItem("mobile_pos_store")
    localStorage.removeItem("mobile_pos_store_name")
    setInventory([])
    setCart([])
    
    // Use authApi to clear JWT and redirect to login
    import("@/lib/api-client").then(m => m.authApi.logout());
  }

  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.product._id === item._id)
      if (existing) {
        return prev.map(i => i.product._id === item._id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { product: item, quantity: 1 }]
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.product._id === itemId)
      if (existing?.quantity === 1) {
        return prev.filter(i => i.product._id !== itemId)
      }
      return prev.map(i => i.product._id === itemId ? { ...i, quantity: i.quantity - 1 } : i)
    })
  }

  const filteredInventory = inventory.filter(p => 
    p.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.product?.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.product?.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const cartCount = cart.reduce((acc, i) => acc + i.quantity, 0)

  if (isInitializing) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
      </div>
    )
  }

  if (!selectedStoreId) {
    return <StoreSelector onSelect={handleStoreSelect} />
  }

  return (
    <Drawer>
      <div className="flex flex-col min-h-full space-y-6 animate-in fade-in duration-500">
        <header className="flex items-center justify-between border-b border-border/40 pb-4 sticky top-0 bg-background/80 backdrop-blur-lg z-20 pt-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Package className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-black text-[10px] uppercase tracking-widest text-primary leading-none mb-1">POS Station</h1>
              <p className="font-bold truncate max-w-[150px]">{selectedStoreName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full h-10 w-10 active:bg-destructive/10 active:text-destructive">
              <LogOut className="w-5 h-5 text-muted-foreground" />
            </Button>
            
            <DrawerTrigger asChild>
              <div className="relative">
                <Button size="icon" className="rounded-2xl h-11 w-11 shadow-lg shadow-primary/20 relative group active:scale-90 transition-transform">
                  <ShoppingCart className="w-5 h-5 group-active:animate-bounce-subtle" />
                </Button>
                {cartCount > 0 && (
                  <Badge className="absolute -top-1.5 -right-1.5 h-6 min-w-[24px] flex items-center justify-center p-1 rounded-full border-2 border-background shadow-sm animate-in zoom-in bg-destructive text-white font-bold text-[10px]">
                    {cartCount}
                  </Badge>
                )}
              </div>
            </DrawerTrigger>
          </div>
        </header>

        <div className="space-y-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input 
              placeholder="Search Intelligence..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 pl-12 bg-muted/30 border-border/40 rounded-2xl text-lg shadow-inner focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex-1 space-y-4 pb-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
              <p className="text-xs uppercase font-mono tracking-widest opacity-50">Syncing Catalog...</p>
            </div>
          ) : filteredInventory.length > 0 ? (
            <div className="grid gap-3">
              {filteredInventory.map((item) => (
                <MobileProductCard
                  key={item._id}
                  product={item}
                  quantity={cart.find(i => i.product._id === item._id)?.quantity || 0}
                  onAdd={() => addToCart(item)}
                  onRemove={() => removeFromCart(item._id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-12 space-y-4 opacity-40">
              <div className="p-6 rounded-full bg-muted/50 border border-border/50">
                <Search className="w-16 h-16" />
              </div>
              <div>
                <h3 className="text-xl font-bold uppercase tracking-tight">No Matches</h3>
                <p className="text-sm">Refine your search parameters</p>
              </div>
            </div>
          )}
        </div>

        {/* Persistent Checkout Banner if cart has items */}
        {cartCount > 0 && (
          <DrawerTrigger asChild>
            <div className="fixed bottom-6 left-4 right-4 z-40 animate-in slide-in-from-bottom-8 duration-500">
              <Button className="w-full h-16 rounded-[2rem] shadow-2xl shadow-primary/30 bg-primary text-white font-black uppercase tracking-widest flex justify-between px-8 text-lg hover:bg-primary/90 transition-all active:scale-[0.98]">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span>View Cart</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="opacity-50 font-mono text-xs">{cartCount} items</span>
                  <div className="w-px h-6 bg-white/20" />
                  <span>${cart.reduce((acc, i) => acc + (i.product.product?.price || 0) * i.quantity, 0).toFixed(2)}</span>
                </div>
              </Button>
            </div>
          </DrawerTrigger>
        )}

        <MobileCart 
          cart={cart} 
          storeId={selectedStoreId} 
          onClear={() => setCart([])}
          onRemoveItem={(id) => setCart(prev => prev.filter(i => i.product._id !== id))}
          onComplete={() => {
            setCart([])
            fetchInventory(selectedStoreId)
          }}
        />
      </div>
    </Drawer>
  )
}

