import apiService from '@/lib/api'
import type {
  User,
  Product,
  Category,
  Transaction,
  AuditTrail,
  StorageFile,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
  CreateProductRequest,
  UpdateProductRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryFilters,
  UpdateTransactionRequest,
  TransactionFilters,
  AuditTrailFilters,
  StorageFilters,
  FileUploadRequest,
  ApiResponseWithPagination,
  ApiResponse,
  ApiResponseWrapper,
} from '@/types'

export class AdminApiService {
  // User Management
  async getUsers(filters?: UserFilters): Promise<ApiResponseWrapper<ApiResponseWithPagination<User>>> {
    return apiService.get('/users', filters)
  }

  async getUser(id: number): Promise<ApiResponseWrapper<User>> {
    return apiService.get(`/users/${id}`)
  }

  async createUser(data: CreateUserRequest): Promise<ApiResponse<User>> {
    return apiService.post('/api/admin/users', data)
  }

  async updateUser(id: number, data: UpdateUserRequest): Promise<ApiResponse<User>> {
    return apiService.put(`/api/admin/users/${id}`, data)
  }

  async deleteUser(id: number): Promise<ApiResponse<void>> {
    return apiService.delete(`/api/admin/users/${id}`)
  }

  async restoreUser(id: number): Promise<ApiResponse<User>> {
    return apiService.post(`/api/admin/users/${id}/restore`)
  }

  // Product Management
  async getProducts(filters?: any): Promise<ApiResponseWrapper<ApiResponseWithPagination<Product>>> {
    return apiService.get('/products', filters)
  }

  async getProduct(id: number): Promise<ApiResponseWrapper<Product>> {
    return apiService.get(`/products/${id}`)
  }

  async createProduct(data: CreateProductRequest): Promise<ApiResponse<Product>> {
    const formData = new FormData()
    formData.append('name', data.name)
    if (data.description) formData.append('description', data.description)
    formData.append('price', data.price.toString())
    formData.append('stock', data.stock.toString())
    if (data.category_id) formData.append('category_id', data.category_id.toString())

    if (data.images) {
      data.images.forEach((image, index) => {
        formData.append(`images[${index}]`, image)
      })
    }

    return apiService.post('/api/admin/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }

  async updateProduct(id: number, data: UpdateProductRequest): Promise<ApiResponse<Product>> {
    const formData = new FormData()
    if (data.name) formData.append('name', data.name)
    if (data.description) formData.append('description', data.description)
    if (data.price) formData.append('price', data.price.toString())
    if (data.stock) formData.append('stock', data.stock.toString())
    if (data.category_id) formData.append('category_id', data.category_id.toString())

    if (data.images) {
      data.images.forEach((image, index) => {
        formData.append(`images[${index}]`, image)
      })
    }

    return apiService.post(`/api/admin/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }

  async deleteProduct(id: number): Promise<ApiResponse<void>> {
    return apiService.delete(`/api/admin/products/${id}`)
  }

  async restoreProduct(id: number): Promise<ApiResponse<Product>> {
    return apiService.post(`/api/admin/products/${id}/restore`)
  }

  async bulkDeleteProducts(ids: number[]): Promise<ApiResponse<void>> {
    return apiService.post('/api/admin/products/bulk-delete', { ids })
  }

  async bulkUpdateProductStock(
    updates: Array<{ id: number; stock: number }>,
  ): Promise<ApiResponse<void>> {
    return apiService.post('/api/admin/products/bulk-update-stock', { updates })
  }

  async bulkUpdateProductCategory(
    productIds: number[],
    categoryId: number | null,
  ): Promise<ApiResponse<void>> {
    return apiService.post('/api/admin/products/bulk-update-category', {
      product_ids: productIds,
      category_id: categoryId,
    })
  }

  // Category Management
  async getCategories(filters?: CategoryFilters): Promise<ApiResponseWrapper<ApiResponseWithPagination<Category>>> {
    return apiService.get('/categories', filters)
  }

  async getCategory(id: number): Promise<ApiResponseWrapper<Category>> {
    return apiService.get(`/categories/${id}`)
  }

  async createCategory(data: CreateCategoryRequest): Promise<ApiResponse<Category>> {
    return apiService.post('/api/admin/categories', data)
  }

  async updateCategory(id: number, data: UpdateCategoryRequest): Promise<ApiResponse<Category>> {
    return apiService.put(`/api/admin/categories/${id}`, data)
  }

  async deleteCategory(id: number): Promise<ApiResponse<void>> {
    return apiService.delete(`/api/admin/categories/${id}`)
  }

  async restoreCategory(id: number): Promise<ApiResponse<Category>> {
    return apiService.post(`/api/admin/categories/${id}/restore`)
  }

  // Transaction Management
  async getTransactions(
    filters?: TransactionFilters,
  ): Promise<ApiResponseWrapper<ApiResponseWithPagination<Transaction>>> {
    return apiService.get('/transactions', filters)
  }

  async getTransaction(id: number): Promise<ApiResponseWrapper<Transaction>> {
    return apiService.get(`/transactions/${id}`)
  }

  async updateTransaction(
    id: number,
    data: UpdateTransactionRequest,
  ): Promise<ApiResponse<Transaction>> {
    return apiService.put(`/api/admin/transactions/${id}`, data)
  }

  async cancelTransaction(id: number, reason?: string): Promise<ApiResponse<Transaction>> {
    return apiService.post(`/api/admin/transactions/${id}/cancel`, { reason })
  }

  async refundTransaction(id: number, reason?: string): Promise<ApiResponse<Transaction>> {
    return apiService.post(`/api/admin/transactions/${id}/refund`, { reason })
  }

  // Audit Trail
  async getAuditTrail(filters?: AuditTrailFilters): Promise<ApiResponseWrapper<ApiResponseWithPagination<AuditTrail>>> {
    return apiService.get('/audit-trails', filters)
  }

  async getAuditTrailEntry(id: number): Promise<ApiResponseWrapper<AuditTrail>> {
    return apiService.get(`/audit-trails/${id}`)
  }

  async exportAuditTrail(filters?: AuditTrailFilters): Promise<Blob> {
    const response = await apiService.get<Blob>('/api/admin/audit-trail/export', filters, {
      responseType: 'blob',
    })
    return response
  }

  // Storage Management
  async getStorageFiles(filters?: StorageFilters): Promise<ApiResponseWrapper<ApiResponseWithPagination<StorageFile>>> {
    return apiService.get('/storage', filters)
  }

  async getStorageFile(id: number): Promise<ApiResponseWrapper<StorageFile>> {
    return apiService.get(`/storage/${id}`)
  }

  async uploadFile(data: FileUploadRequest): Promise<ApiResponse<StorageFile>> {
    const formData = new FormData()
    formData.append('file', data.file)
    if (data.category) formData.append('category', data.category)

    return apiService.post('/api/admin/storage', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }

  async deleteStorageFile(id: number): Promise<ApiResponse<void>> {
    return apiService.delete(`/api/admin/storage/${id}`)
  }

  async restoreStorageFile(id: number): Promise<ApiResponse<StorageFile>> {
    return apiService.post(`/api/admin/storage/${id}/restore`)
  }

  // Dashboard Analytics
  async getDashboardStats(): Promise<ApiResponseWrapper<any>> {
    return apiService.get('/admin/dashboard/stats')
  }

  async getSalesAnalytics(dateRange?: { from: string; to: string }): Promise<ApiResponseWrapper<any>> {
    return apiService.get('/admin/analytics/sales', dateRange)
  }

  async getInventoryAnalytics(): Promise<ApiResponseWrapper<any>> {
    return apiService.get('/admin/analytics/inventory')
  }

  async getUserAnalytics(): Promise<ApiResponseWrapper<any>> {
    return apiService.get('/admin/analytics/users')
  }
}

export const adminApiService = new AdminApiService()
