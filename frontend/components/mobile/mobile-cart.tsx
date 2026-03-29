"use client"

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Trash2, CreditCard, ChevronRight, Package, X } from "lucide-react"
import { salesApi } from "@/lib/api-client"
import { toast } from "sonner"
import { useState } from "react"

interface MobileCartProps {
  cart: any[]
  storeId: string
  onClear: () => void
  onRemoveItem: (id: string) => void
  onComplete: () => void
}

export function MobileCart({ cart, storeId, onClear, onRemoveItem, onComplete }: MobileCartProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const total = cart.reduce((acc, item) => acc + (item.product?.product?.price || 0) * item.quantity, 0)

  const handleSubmit = async () => {
    if (cart.length === 0) return
    setIsSubmitting(true)
    
    try {
      const items = cart.map(item => ({
        product: item.product.product._id,
        quantity: item.quantity,
        unitPrice: item.product.product.price,
        subtotal: item.quantity * item.product.product.price
      }))

      await salesApi.create({
        store: storeId,
        items,
        total,
        paymentMethod: "Cash" // Default for mobile POS
      })

      toast.success("Transaction Finalized", {
        description: `Successfully processed ${cart.length} items. Total: $${total.toFixed(2)}`,
        icon: <CreditCard className="w-4 h-4" />
      })
      
      onComplete()
    } catch (err: any) {
      toast.error("Uplink Failed", {
        description: err.response?.data?.message || "Could not synchronize sale with central node."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DrawerContent className="max-h-[90vh] bg-background/95 backdrop-blur-xl border-t-border/40">
      <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mt-4 mb-2" />
      
      <DrawerHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <DrawerTitle className="text-2xl font-black uppercase tracking-tight">Deployment Cart</DrawerTitle>
            <DrawerDescription className="text-xs font-mono uppercase tracking-widest opacity-60">Ready for Uplink</DrawerDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClear} className="text-destructive hover:bg-destructive/10 rounded-full">
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </DrawerHeader>

      <div className="overflow-y-auto px-4 py-4 space-y-4">
        {cart.length === 0 ? (
          <div className="text-center py-12 space-y-4 opacity-30">
            <ShoppingCart className="w-16 h-16 mx-auto" />
            <p className="text-sm font-medium uppercase tracking-widest">Cart is Empty</p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.product._id} className="flex items-center justify-between p-4 rounded-3xl bg-muted/30 border border-border/40">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-background border border-border/40 flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-none mb-1">{item.product.product?.name}</h4>
                  <p className="text-xs text-muted-foreground font-mono">
                    {item.quantity} x ${item.product.product?.price}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-black text-sm">${(item.quantity * (item.product.product?.price || 0)).toFixed(2)}</span>
                <Button size="icon" variant="ghost" onClick={() => onRemoveItem(item.product._id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <DrawerFooter className="border-t border-border/40 pt-4 pb-10 bg-muted/10">
        <div className="flex items-center justify-between mb-6 px-2">
          <span className="text-sm font-bold uppercase tracking-widest opacity-60">Total Valuation</span>
          <span className="text-3xl font-black tracking-tighter text-primary">${total.toFixed(2)}</span>
        </div>
        
        <DrawerClose asChild>
          <Button 
            onClick={handleSubmit} 
            disabled={cart.length === 0 || isSubmitting}
            className="h-16 rounded-[2rem] text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/20 bg-gradient-to-r from-primary to-primary/80 transition-all active:scale-95"
          >
            {isSubmitting ? "Syncing..." : "Initialize Checkout"}
            <ChevronRight className="ml-2 w-6 h-6" />
          </Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  )
}
