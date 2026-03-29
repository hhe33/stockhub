"use client"

import { useState, useEffect } from "react"
import { categoriesApi } from "@/lib/api-client"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { TopNavbar } from "@/components/dashboard/top-navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Plus, MoreHorizontal, Pencil, Trash2, Search, Layers, Tag, AlignLeft, AlertCircle } from "lucide-react"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { cn } from "@/lib/utils"

interface Category {
  _id: string
  name: string
  description?: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ name: "", description: "" })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const data = await categoriesApi.getAll()
      setCategories(data)
    } catch (err: any) {
      console.error("Failed to fetch categories:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    try {
      setError(null)
      await categoriesApi.create(formData)
      setIsAddModalOpen(false)
      setFormData({ name: "", description: "" })
      fetchCategories()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleEdit = async () => {
    if (!currentCategory) return
    try {
      setError(null)
      await categoriesApi.update(currentCategory._id, formData)
      setIsEditModalOpen(false)
      setCurrentCategory(null)
      setFormData({ name: "", description: "" })
      fetchCategories()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDelete = async () => {
    if (!currentCategory) return
    try {
      setError(null)
      await categoriesApi.delete(currentCategory._id)
      setIsDeleteModalOpen(false)
      setCurrentCategory(null)
      fetchCategories()
    } catch (err: any) {
      setError(err.message || "Cannot delete category")
    }
  }

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <DashboardLayout>
      {/* Ambient Background Glow */}
      <div className="fixed inset-0 pointer-events-none flex justify-center pt-[20vh] opacity-20 dark:opacity-40">
        <div className="w-[80vw] h-[60vh] bg-primary/20 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <TopNavbar title="Categories" subtitle="Manage product classifications" />

      <div className="p-4 lg:p-8 space-y-8 relative z-10">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-background/40 backdrop-blur-md border border-border/50 p-4 rounded-2xl shadow-sm">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              className="pl-11 h-12 rounded-xl bg-background/50 border-border/60 focus:ring-2 focus:ring-primary/20 shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Dialog open={isAddModalOpen} onOpenChange={(open) => {
            setIsAddModalOpen(open)
            if (open) {
                setFormData({ name: "", description: "" })
                setError(null)
            }
          }}>
            <DialogTrigger asChild>
              <Button className="h-11 px-6 rounded-xl gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95">
                <Plus className="w-4 h-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl overflow-hidden p-0 rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
              <DialogHeader className="p-6 pb-0 relative">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Layers className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold tracking-tight">Add Category</DialogTitle>
                    <DialogDescription className="text-xs uppercase tracking-widest font-semibold text-primary/60 mt-0.5">
                      SYSTEM_REGISTRY // CREATE_NODE
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="p-6 relative space-y-5">
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive text-sm animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <FieldGroup>
                  <Field>
                    <FieldLabel className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-primary" />
                      Category Name
                    </FieldLabel>
                    <Input
                      placeholder="e.g. Food, Electronics..."
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-11 rounded-xl bg-background/50 border-border/50 focus:border-primary/50"
                    />
                  </Field>

                  <Field>
                    <FieldLabel className="flex items-center gap-2">
                      <AlignLeft className="w-3.5 h-3.5 text-primary" />
                      Description
                    </FieldLabel>
                    <Textarea
                      placeholder="Briefly describe this category..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="min-h-[100px] rounded-xl bg-background/50 border-border/50 focus:border-primary/50 resize-none py-3"
                    />
                  </Field>
                </FieldGroup>
              </div>

              <DialogFooter className="p-6 pt-0 relative bg-muted/30">
                <Button variant="ghost" onClick={() => setIsAddModalOpen(false)} className="rounded-xl h-11 flex-1 sm:flex-none">
                  Cancel
                </Button>
                <Button onClick={handleAdd} className="rounded-xl h-11 px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 flex-1 sm:flex-none">
                  Create Category
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Categories Grid/Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-44 rounded-2xl border border-border/50 bg-background/40 backdrop-blur-md animate-pulse" />
            ))
          ) : filteredCategories.length > 0 ? (
            filteredCategories.map((category, index) => (
              <Card 
                key={category._id} 
                className={cn(
                  "group relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5",
                  "bg-background/40 backdrop-blur-md border border-border/50 hover:border-primary/40 hover:shadow-primary/10"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Dynamic Top Border Highlight */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-secondary transition-all duration-500 origin-left scale-x-0 group-hover:scale-x-100" />
                
                {/* Decorative Background Mesh */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none" />

                <CardContent className="p-7 relative z-10">
                  <div className="flex items-start justify-between mb-5">
                    <div className="p-3.5 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-[0_0_2rem_-0.5rem_var(--tw-shadow-color)] shadow-primary transition-all duration-500 relative">
                      <Layers className="w-6 h-6" />
                      {/* Inner Ring Glow */}
                      <div className="absolute inset-0 rounded-2xl border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 rounded-xl bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl">
                        <DropdownMenuItem onClick={() => {
                          setCurrentCategory(category)
                          setFormData({ name: category.name, description: category.description || "" })
                          setError(null)
                          setIsEditModalOpen(true)
                        }} className="gap-2 cursor-pointer focus:bg-primary/10">
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setCurrentCategory(category)
                          setError(null)
                          setIsDeleteModalOpen(true)
                        }} className="gap-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <h3 className="font-bold text-xl tracking-tight mb-2 group-hover:text-primary transition-colors">{category.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed min-h-[60px]">
                    {category.description || "No description provided."}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-24 text-center space-y-6 rounded-3xl border border-border/50 bg-background/40 backdrop-blur-md shadow-sm">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-2 relative">
                <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping" />
                <Layers className="w-10 h-10 text-primary/70" />
              </div>
              <div>
                <h3 className="text-2xl font-bold tracking-tight">No categories found</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                  {searchQuery ? `No results for "${searchQuery}"` : "Start by adding your first product category."}
                </p>
              </div>
              {!searchQuery && (
                <Button onClick={() => setIsAddModalOpen(true)} className="rounded-xl h-12 px-8 shadow-lg shadow-primary/20 text-sm tracking-wide font-semibold mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Category
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[450px] bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl p-0 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
          <DialogHeader className="p-6 pb-0 relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Pencil className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight">Edit Category</DialogTitle>
                <DialogDescription className="text-xs uppercase tracking-widest font-semibold text-primary/60 mt-0.5">
                  SYSTEM_REGISTRY // UPDATE_NODE
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 relative space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive text-sm animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <FieldGroup>
              <Field>
                <FieldLabel className="flex items-center gap-2 text-sm font-semibold">
                  <Tag className="w-3.5 h-3.5 text-primary" />
                  Category Name
                </FieldLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-11 rounded-xl bg-background/50 border-border/50 focus:border-primary/50 shadow-sm"
                />
              </Field>

              <Field>
                <FieldLabel className="flex items-center gap-2 text-sm font-semibold">
                  <AlignLeft className="w-3.5 h-3.5 text-primary" />
                  Description
                </FieldLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-[120px] rounded-xl bg-background/50 border-border/50 focus:border-primary/50 resize-none py-3 shadow-sm"
                />
              </Field>
            </FieldGroup>
          </div>

          <DialogFooter className="p-6 pt-0 relative bg-muted/30">
            <Button variant="ghost" onClick={() => setIsEditModalOpen(false)} className="rounded-xl h-11 flex-1 sm:flex-none">
              Cancel
            </Button>
            <Button onClick={handleEdit} className="rounded-xl h-11 px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 flex-1 sm:flex-none">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[400px] bg-background border-border/50 shadow-2xl p-0 rounded-2xl overflow-hidden">
          <div className="p-6 space-y-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-2">
              <Trash2 className="w-7 h-7" />
            </div>
            <div className="text-center space-y-2">
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">Delete Category?</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground leading-relaxed px-2">
                This action cannot be undone. You won't be able to delete categories that are currently linked to active products.
              </DialogDescription>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive text-xs font-medium animate-in zoom-in-95">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
          </div>

          <DialogFooter className="p-4 bg-muted/30 border-t border-border/50 flex flex-col sm:flex-row gap-2">
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)} className="rounded-xl h-10 w-full sm:w-auto">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="rounded-xl h-10 w-full sm:w-auto shadow-lg shadow-destructive/20">
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
