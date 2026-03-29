"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus, Package, Tag } from "lucide-react"

interface MobileProductCardProps {
  product: any
  quantity: number
  onAdd: () => void
  onRemove: () => void
}

export function MobileProductCard({ product, quantity, onAdd, onRemove }: MobileProductCardProps) {
  const stock = product.quantity || 0
  const isOutOfStock = stock <= 0

  return (
    <Card className="overflow-hidden border-border/40 bg-card/40 backdrop-blur-md relative group active:scale-[0.98] transition-all duration-200">
      <CardContent className="p-0">
        <div className="flex p-4 gap-4">
          {/* Product Image / Icon Placeholder */}
          <div className="w-24 h-24 rounded-2xl bg-muted/50 border border-border/40 flex items-center justify-center relative overflow-hidden flex-shrink-0">
            {product.product?.image ? (
              <img 
                src={product.product.image} 
                alt={product.product.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className="w-10 h-10 text-muted-foreground/40" />
            )}
            
            {isOutOfStock && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] flex items-center justify-center">
                <Badge variant="destructive" className="font-black text-[10px] uppercase tracking-tighter shadow-lg">Sold Out</Badge>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-lg leading-snug truncate pr-2">{product.product?.name}</h3>
                <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-widest bg-primary/5 text-primary border-primary/20">
                  {product.product?.category?.name || "General"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1 mb-2 font-mono uppercase tracking-tighter">
                SKU: {product.product?.sku || "N/A"}
              </p>
            </div>

            <div className="flex items-center justify-between mt-auto">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase font-mono tracking-widest flex items-center gap-1">
                  <div className={`w-1 h-1 rounded-full ${isOutOfStock ? 'bg-destructive' : 'bg-emerald-500'} animate-pulse`} />
                  {stock} available
                </span>
                <span className="text-xl font-black tracking-tight text-primary">
                  ${product.product?.price || "0.00"}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {quantity > 0 && (
                  <>
                    <Button 
                      size="icon" 
                      variant="outline" 
                      onClick={(e) => { e.stopPropagation(); onRemove(); }}
                      className="rounded-xl h-10 w-10 border-border/60 hover:bg-destructive/10 hover:text-destructive active:scale-90"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-lg font-black min-w-[20px] text-center">{quantity}</span>
                  </>
                )}
                
                <Button 
                  size="icon" 
                  disabled={isOutOfStock}
                  onClick={(e) => { e.stopPropagation(); onAdd(); }}
                  className={`rounded-xl h-10 w-10 shadow-lg active:scale-95 transition-all ${
                    quantity > 0 ? 'bg-primary' : 'bg-primary/20 text-primary border border-primary/40 hover:bg-primary hover:text-white'
                  }`}
                >
                  <Plus className={`w-5 h-5 ${quantity > 0 ? '' : 'animate-bounce-subtle'}`} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
