// User related types
export interface User {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  password_confirmation: string
}

// Product related types
export interface Product {
  id: number
  name: string
  description: string | null
  price: string
  stock: number
  category_id: number | null
  user_id: number
  created_at: string
  updated_at: string
  deleted_at: string | null
  user: User
  category: Category | null
  images: ProductImage[]
}

export interface ProductImage {
  id: number
  product_id: number
  image_path: string
  user_id: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Category {
  id: number
  name: string
  description: string | null
  user_id: number
  created_at: string
  updated_at: string
  deleted_at: string | null
  user: User
  products?: Product[]
}

// Cart related types
export interface CartProduct {
  id: number
  name: string
  price: string | number
  stock: number
  image: string | null
}

export interface CartItem {
  id: number
  product: CartProduct
  quantity: number
  total_price: string | number
  created_at: string
  updated_at: string
}

export interface CartSummary {
  data: CartItem[]
  total: string
  item_count: number
}

export interface AddToCartRequest {
  product_id: number
  quantity: number
}

export interface UpdateCartItemRequest {
  quantity: number
}

export interface CartValidationResult {
  valid: boolean
  errors: string[]
}

export interface StockValidationItem {
  product_id: number
  name: string
  available_stock: number
  cart_quantity: number
}

export interface StockValidationResponse {
  message: string
  data: StockValidationItem[]
}


// Transaction related types
export interface Transaction {
  id: number
  user_id: number
  total_amount: string
  status: TransactionStatus
  notes: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  user: User
  items: TransactionItem[]
}

export interface TransactionItem {
  id: number
  transaction_id: number
  product_id: number
  quantity: number
  price: string
  total: string
  created_at: string
  updated_at: string
  product: Product
}

export type TransactionStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export interface CreateTransactionRequest {
  items: Array<{ product_id: number; quantity: number }>
  notes?: string
  status?: TransactionStatus
}

export interface TransactionFilters {
  status?: TransactionStatus
  sort_by?: 'created_at' | 'total_amount'
  sort_order?: 'asc' | 'desc'
  page?: number
  per_page?: number
}

// API response types
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

// Pagination types
export interface PaginationMeta {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta
}

// Filter and search types
export interface ProductFilters {
  search?: string
  category_id?: number
  status?: 'available' | 'unavailable'
  date_from?: string
  date_to?: string
  min_price?: number
  max_price?: number
  sort?: 'name' | 'price' | 'created_at'
  order?: 'asc' | 'desc'
  page?: number
  limit?: number
}
