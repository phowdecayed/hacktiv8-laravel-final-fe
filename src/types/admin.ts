// Admin-related types and interfaces

import type { Transaction, Product } from './api'

export interface AdminDashboardStats {
  totalUsers: number
  totalProducts: number
  totalCategories: number
  totalTransactions: number
  totalRevenue: number
  recentTransactions: Transaction[]
  lowStockProducts: Product[]
  topProducts: Product[]
}

export interface AdminPermission {
  id: number
  name: string
  description: string
  guard_name: string
  created_at: string
  updated_at: string
}

export interface AdminRole {
  id: number
  name: string
  description: string
  guard_name: string
  permissions: AdminPermission[]
  created_at: string
  updated_at: string
}

// Re-export commonly used types
export type { User, Product, Category, Transaction, AuditTrail, StorageFile } from './api'
