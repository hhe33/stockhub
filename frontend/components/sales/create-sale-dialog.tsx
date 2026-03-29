"use client"

import { useState, useEffect } from "react"
import { storesApi, inventoryApi, salesApi } from "@/lib/api-client"
import { Loader2, Plus, ShoppingCart, Trash2, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { Field, FieldLabel } from "@/components/ui/field"

interface CartItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export function CreateSaleDialog({ open, onOpenChange, onSuccess }: { open: boolean, onOpenChange: (open: boolean) => void, onSuccess: () => void }) {
  const [stores, setStores] = useState<any[]>([])
  const [inventoryList, setInventoryList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [selectedStoreId, setSelectedStoreId] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])

  // Product Selection Form
  const [selectedProductId, setSelectedProductId] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [unitPrice, setUnitPrice] = useState("")

  useEffect(() => {
    if (open) {
      fetchData()
      setSelectedStoreId("")
      setCart([])
      resetProductForm()
      setError("")
    }
  }, [open])

  useEffect(() => {
    if (selectedProductId) {
      const invItem = availableInventory.find(i => i.product?._id === selectedProductId)
      if (invItem && invItem.product?.price) {
        setUnitPrice(invItem.product.price.toString())
      }
    } else {
      setUnitPrice("")
    }
  }, [selectedProductId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [storesData, inventoryData] = await Promise.all([
        storesApi.getAll(),
        inventoryApi.getAll()
      ])
      setStores(storesData)
      setInventoryList(inventoryData)
    } catch (err) {
      console.error("Failed to load generic data", err)
    } finally {
      setLoading(false)
    }
  }

  const resetProductForm = () => {
    setSelectedProductId("")
    setQuantity("1")
    setUnitPrice("")
  }

  const handleStoreChange = (storeId: string) => {
    setSelectedStoreId(storeId)
    setCart([]) // Reset cart when store changes since inventory changes
    resetProductForm()
  }

  // Filter inventory for selected store that has quantity > 0
  const availableInventory = inventoryList.filter(
    (item) => item.store?._id === selectedStoreId && item.quantity > 0
  )

  const handleAddProduct = () => {
    setError("")
    if (!selectedProductId) {
      setError("Please select a product.")
      return
    }
    const invItem = availableInventory.find(i => i.product?._id === selectedProductId)
    if (!invItem) return

    const qty = Number(quantity)
    const price = Number(unitPrice)

    if (isNaN(qty) || qty <= 0) {
      setError("Quantity must be greater than 0.")
      return
    }
    if (isNaN(price) || price < 0) {
      setError("Price must be valid.")
      return
    }
    
    // Check if enough global stock
    const currentInCart = cart.find(c => c.productId === selectedProductId)?.quantity || 0
    if (currentInCart + qty > invItem.quantity) {
      setError(`Not enough stock. Only ${invItem.quantity} units available.`)
      return
    }

    const existingCartItemIndex = cart.findIndex(c => c.productId === selectedProductId)
    if (existingCartItemIndex > -1) {
      const newCart = [...cart]
      newCart[existingCartItemIndex].quantity += qty
      // Update subtotal
      newCart[existingCartItemIndex].subtotal = newCart[existingCartItemIndex].quantity * newCart[existingCartItemIndex].unitPrice
      setCart(newCart)
    } else {
      setCart([...cart, {
        productId: selectedProductId,
        productName: invItem.product?.name,
        quantity: qty,
        unitPrice: price,
        subtotal: qty * price
      }])
    }
    resetProductForm()
  }

  const handleRemoveProduct = (productId: string) => {
    setCart(cart.filter(c => c.productId !== productId))
  }

  const total = cart.reduce((acc, item) => acc + item.subtotal, 0)

  const handleSubmit = async () => {
    if (!selectedStoreId || cart.length === 0) return
    try {
      setSubmitting(true)
      setError("")
      const payload = {
        store: selectedStoreId,
        items: cart.map(c => ({
          product: c.productId,
          quantity: c.quantity,
          unitPrice: c.unitPrice,
          subtotal: c.subtotal
        })),
        total
      }
      await salesApi.create(payload)
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || "Failed to create sale.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl glass border-white/10 shadow-2xl p-0 overflow-hidden bg-background">
        <DialogHeader className="p-6 border-b border-border/50 bg-muted/20">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary" />
            Create Sale
          </DialogTitle>
          <DialogDescription>
            Register a new sale for a specific store branch.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {error && (
              <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {error}
              </div>
            )}
            
            <Field>
              <FieldLabel>1. Select Store</FieldLabel>
              <Select value={selectedStoreId} onValueChange={handleStoreChange}>
                <SelectTrigger className="h-12 bg-background border-border">
                  <SelectValue placeholder="Choose where the sale occurred" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map(s => (
                    <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {selectedStoreId && (
              <div className="space-y-4">
                <FieldLabel>2. Add Products</FieldLabel>
                <div className="p-4 rounded-xl border border-border/50 bg-muted/10 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <Field className="md:col-span-2">
                    <FieldLabel className="text-xs">Product (In Stock)</FieldLabel>
                    <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select product..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableInventory.map(inv => (
                          <SelectItem key={inv.product._id} value={inv.product._id}>
                            {inv.product.name} ({inv.quantity} available)
                          </SelectItem>
                        ))}
                        {availableInventory.length === 0 && (
                          <SelectItem value="null" disabled>No products in stock for this store</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel className="text-xs">Quantity</FieldLabel>
                    <Input 
                      type="number" 
                      min="1"
                      className="bg-background"
                      value={quantity} 
                      onChange={e => setQuantity(e.target.value)} 
                    />
                  </Field>
                  <Field>
                    <FieldLabel className="text-xs">Unit Price ($)</FieldLabel>
                    <Input 
                      type="number"
                      min="0"
                      step="0.01"
                      className="bg-background"
                      value={unitPrice} 
                      onChange={e => setUnitPrice(e.target.value)} 
                    />
                  </Field>
                  <Button 
                    type="button" 
                    onClick={handleAddProduct}
                    className="md:col-span-4 h-10 w-full"
                    disabled={!selectedProductId || availableInventory.length === 0}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add to Order
                  </Button>
                </div>
              </div>
            )}

            {cart.length > 0 && (
              <div className="space-y-4">
                <FieldLabel>3. Order Summary</FieldLabel>
                <div className="border border-border/50 rounded-xl overflow-hidden bg-background">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium">Product</th>
                        <th className="px-4 py-3 text-right font-medium">Qty</th>
                        <th className="px-4 py-3 text-right font-medium">Price</th>
                        <th className="px-4 py-3 text-right font-medium">Subtotal</th>
                        <th className="px-4 py-3 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {cart.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3 font-medium">{item.productName}</td>
                          <td className="px-4 py-3 text-right">{item.quantity}</td>
                          <td className="px-4 py-3 text-right">${item.unitPrice.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right text-primary font-bold">${item.subtotal.toFixed(2)}</td>
                          <td className="px-4 py-3 text-center">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => handleRemoveProduct(item.productId)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-muted/20 border-t border-border/50">
                      <tr>
                        <td colSpan={3} className="px-4 py-4 text-right font-semibold uppercase tracking-wider text-xs">Total Target</td>
                        <td className="px-4 py-4 text-right font-black text-xl text-foreground">${total.toFixed(2)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="p-6 border-t border-border/50 bg-muted/10 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={cart.length === 0 || submitting}
            className="w-40"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Sale"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
