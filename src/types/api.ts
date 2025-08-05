// User related types
export interface User {
  id: number
  name: string
  email: string
  role?: UserRole
  email_verified_at: string | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
  permissions?: readonly string[]
  statistics?: UserStatistics
}

export interface UserStatistics {
  total_products: number
  total_categories: number
  total_transactions: number
  total_revenue: number
}

export type UserRole = 'admin' | 'editor' | 'moderator' | 'customer'

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
  sales_count?: number
  min_stock?: number
  total_quantity_sold?: number
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

export interface CreateCategoryRequest {
  name: string
  description?: string
}

export interface UpdateCategoryRequest {
  name?: string
  description?: string
}

export interface CategoryFilters {
  search?: string
  page?: number
  per_page?: number
  with_products?: boolean
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
  | 'completed'
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

export interface Pagination {
  current_page: number
  first_page_url: string | null
  from: number
  last_page: number
  last_page_url: string | null
  links: Array<{ url: string | null; label: string; active: boolean }>
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number
  total: number
}

export interface ApiResponseWithPagination<T> {
  data: T[]
  message?: string
  pagination: Pagination
}

export interface AuditTrailResponse extends Pagination {
  data: AuditTrail[]
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

export interface MyTransactionsPaginatedResponse {
  current_page: number
  data: Transaction[]
  first_page_url: string
  from: number
  last_page: number
  last_page_url: string
  links: Array<{ url: string | null; label: string; active: boolean }>
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number
  total: number
}

// Audit Trail types
export interface AuditTrail {
  id: number
  user_id: number
  model_type: string
  model_id: number
  action: AuditAction
  old_values: Record<string, any> | null
  new_values: Record<string, any> | null
  ip_address: string
  user_agent: string
  created_at: string
  updated_at: string
  user: User
}

export type AuditAction = 'created' | 'updated' | 'deleted' | 'restored'

export interface AuditTrailFilters {
  user_id?: number
  model_type?: string
  action?: AuditAction
  date_from?: string
  date_to?: string
  page?: number
  per_page?: number
}

// Storage File types
export interface StorageFile {
  id: number
  filename: string
  original_name: string
  mime_type: string
  size: number
  user_id: number
  created_at: string
  updated_at: string
  deleted_at: string | null
  user: User
  file_url: string
}

export interface FileUploadRequest {
  file: File
  category?: string
}

export interface StorageFilters {
  mime_type?: string
  user_id?: number
  search?: string
  page?: number
  per_page?: number
  date_to?: string
  date_from?: string
  limit?: number
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

// Admin-specific request types
export interface CreateUserRequest {
  name: string
  email: string
  password: string
  role: UserRole
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  password?: string
  password_confirmation?: string
  role?: UserRole
}

export interface UserFilters {
  role?: UserRole
  search?: string
  verified?: boolean
  page?: number
  per_page?: number
}

export interface CreateProductRequest {
  name: string
  description?: string
  price: number
  stock: number
  min_stock?: number
  category_id?: number
  images?: File[]
}

export interface UpdateProductRequest {
  name?: string
  description?: string
  price?: number
  stock?: number
  min_stock?: number
  category_id?: number
  images?: File[]
}

export interface UpdateTransactionRequest {
  status?: TransactionStatus
  notes?: string
}
