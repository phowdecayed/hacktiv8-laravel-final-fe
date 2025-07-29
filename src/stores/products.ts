import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  Product,
  Category,
  ProductFilters,
  PaginatedResponse,
  PaginationMeta,
} from '@/types/api'
import apiService from '@/lib/api'

export const useProductsStore = defineStore('products', () => {
  // State
  const products = ref<Product[]>([])
  const categories = ref<Category[]>([])
  const currentProduct = ref<Product | null>(null)
  const isLoading = ref(false)
  const isLoadingCategories = ref(false)
  const isLoadingProduct = ref(false)
  const error = ref<string | null>(null)

  // Pagination state
  const pagination = ref<PaginationMeta>({
    current_page: 1,
    from: 0,
    last_page: 1,
    per_page: 12,
    to: 0,
    total: 0,
  })

  // Filters state
  const filters = ref<ProductFilters>({
    search: '',
    category_id: undefined,
    min_price: undefined,
    max_price: undefined,
    sort_by: 'created_at',
    sort_order: 'desc',
    page: 1,
    per_page: 12,
  })

  // Getters
  const hasProducts = computed(() => products.value.length > 0)
  const hasCategories = computed(() => categories.value.length > 0)
  const totalPages = computed(() => pagination.value.last_page)
  const currentPage = computed(() => pagination.value.current_page)
  const totalProducts = computed(() => pagination.value.total)

  // Actions
  const fetchProducts = async (newFilters?: Partial<ProductFilters>) => {
    try {
      isLoading.value = true
      error.value = null

      // Update filters if provided
      if (newFilters) {
        filters.value = { ...filters.value, ...newFilters }
      }

      // Build query parameters
      const params: Record<string, any> = {}

      if (filters.value.search) params.search = filters.value.search
      if (filters.value.category_id) params.category_id = filters.value.category_id
      if (filters.value.min_price) params.min_price = filters.value.min_price
      if (filters.value.max_price) params.max_price = filters.value.max_price
      if (filters.value.sort_by) params.sort_by = filters.value.sort_by
      if (filters.value.sort_order) params.sort_order = filters.value.sort_order
      if (filters.value.page) params.page = filters.value.page
      if (filters.value.per_page) params.per_page = filters.value.per_page

      const response = await apiService.get<PaginatedResponse<Product>>('/products', params)

      products.value = response.data
      pagination.value = response.meta
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch products'
      products.value = []
    } finally {
      isLoading.value = false
    }
  }

  const fetchCategories = async () => {
    try {
      isLoadingCategories.value = true
      error.value = null

      const response = await apiService.get<{ data: Category[] }>('/categories')
      categories.value = response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch categories'
      categories.value = []
    } finally {
      isLoadingCategories.value = false
    }
  }

  const fetchProduct = async (id: number) => {
    try {
      isLoadingProduct.value = true
      error.value = null

      const response = await apiService.get<{ data: Product }>(`/products/${id}`)
      currentProduct.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch product'
      currentProduct.value = null
      throw err
    } finally {
      isLoadingProduct.value = false
    }
  }

  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    filters.value = { ...filters.value, ...newFilters }

    // Reset to first page when filters change (except when changing page)
    if (!newFilters.page) {
      filters.value.page = 1
    }
  }

  const clearFilters = () => {
    filters.value = {
      search: '',
      category_id: undefined,
      min_price: undefined,
      max_price: undefined,
      sort_by: 'created_at',
      sort_order: 'desc',
      page: 1,
      per_page: 12,
    }
  }

  const setPage = (page: number) => {
    filters.value.page = page
  }

  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      setPage(currentPage.value + 1)
    }
  }

  const prevPage = () => {
    if (currentPage.value > 1) {
      setPage(currentPage.value - 1)
    }
  }

  const clearError = () => {
    error.value = null
  }

  const clearCurrentProduct = () => {
    currentProduct.value = null
  }

  return {
    // State
    products,
    categories,
    currentProduct,
    isLoading,
    isLoadingCategories,
    isLoadingProduct,
    error,
    pagination,
    filters,

    // Getters
    hasProducts,
    hasCategories,
    totalPages,
    currentPage,
    totalProducts,

    // Actions
    fetchProducts,
    fetchCategories,
    fetchProduct,
    updateFilters,
    clearFilters,
    setPage,
    nextPage,
    prevPage,
    clearError,
    clearCurrentProduct,
  }
})
