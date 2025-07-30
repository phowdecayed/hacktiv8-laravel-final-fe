// Central export for all types
export * from './api'
export * from './user'

// Admin-specific exports (avoiding conflicts)
export type { AdminDashboardStats, AdminPermission, AdminRole } from './admin'

// Common utility types
export interface ValidationError {
  message: string
  errors: Record<string, string[]>
}

export interface ApiResponseWithPagination<T> {
  current_page: number
  data: T[]
  first_page_url: string
  from: number
  last_page: number
  last_page_url: string
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number
  total: number
}

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
}

export interface PaginationConfig {
  page: number
  per_page: number
  total: number
  last_page: number
}

export interface FormSchema {
  fields: FormField[]
}

export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'file' | 'checkbox'
  required?: boolean
  placeholder?: string
  options?: Array<{ label: string; value: any }>
  validation?: any
}
