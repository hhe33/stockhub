"use client"

import { useState, useEffect } from "react"
import { storesApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Warehouse, MapPin, CheckCircle2, ChevronRight, Loader2 } from "lucide-react"

interface StoreSelectorProps {
  onSelect: (storeId: string) => void
}

export function StoreSelector({ onSelect }: StoreSelectorProps) {
  const [stores, setStores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStores()
  }, [])

  const fetchStores = async () => {
    try {
      const data = await storesApi.getAll()
      setStores(data)
    } catch (err) {
      console.error("Failed to load stores", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-medium opacity-70 uppercase tracking-widest">Identifying Nodes...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black tracking-tight uppercase">Select Station</h2>
        <p className="text-muted-foreground text-sm">Synchronize with a deployment node</p>
      </div>

      <div className="grid gap-4">
        {stores.map((store) => (
          <button
            key={store._id}
            onClick={() => onSelect(store._id)}
            className="group relative text-left w-full overflow-hidden"
          >
            <Card className="border-border/40 bg-card/40 backdrop-blur-xl group-active:scale-[0.98] transition-all duration-200">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-inner group-hover:bg-primary/20 transition-colors">
                    <Warehouse className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-none mb-1">{store.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {store.location || "Sector 01"}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      {stores.length === 0 && (
        <div className="text-center p-8 bg-muted/20 border border-dashed rounded-3xl">
          <p className="text-sm text-muted-foreground font-mono italic">No available stations found in this cluster.</p>
        </div>
      )}
    </div>
  )
}
