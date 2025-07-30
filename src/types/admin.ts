// Admin-related types and interfaces

import type { Transaction, Product, User } from './api'

export interface AdminDashboardStats {
  total_users: number
  total_products: number
  total_categories: number
  total_transactions: number
  total_sales: number
  recent_transactions: Transaction[]
  top_selling_products: Product[]
  low_stock_items: Product[]
  recent_user_registrations: User[]
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
