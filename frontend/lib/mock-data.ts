// Mock data for the MultiStore Stock Management System

export interface Store {
  id: string
  name: string
  city: string
  address: string
  phone: string
  status: "active" | "inactive"
}

export interface Product {
  id: string
  name: string
  sku: string
  barcode: string
  price: number
  category: string
  description: string
}

export interface InventoryItem {
  id: string
  storeId: string
  storeName: string
  productId: string
  productName: string
  quantity: number
  minStock: number
  status: "in-stock" | "low-stock" | "out-of-stock"
}

export interface Sale {
  id: string
  storeId: string
  storeName: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  total: number
  category: string
  date: string
  customer?: string
}

export interface Transfer {
  id: string
  fromStoreId: string
  fromStoreName: string
  toStoreId: string
  toStoreName: string
  productId: string
  productName: string
  quantity: number
  status: "pending" | "in-transit" | "completed" | "cancelled"
  date: string
}

// Sample Stores
export const stores: Store[] = []

// Sample Products
export const products: Product[] = []

// Sample Inventory
export const inventory: InventoryItem[] = []

// Sample Sales
export const sales: Sale[] = []

// Sample Transfers
export const transfers: Transfer[] = []

// Dashboard statistics
export const dashboardStats = {
  totalStores: 0,
  totalProducts: 0,
  totalSales: 0,
  lowStockAlerts: 0,
}

// Sales per store for chart
export const salesPerStore: { store: string; sales: number }[] = []

// Stock distribution for pie chart
export const stockDistribution = [
  { name: "In Stock", value: 0, fill: "var(--color-chart-1)" },
  { name: "Low Stock", value: 0, fill: "var(--color-chart-4)" },
  { name: "Out of Stock", value: 0, fill: "var(--color-chart-5)" },
]

// Recent sales (last 5)
export const recentSales: Sale[] = []

// Low stock products
export const lowStockProducts: InventoryItem[] = []
