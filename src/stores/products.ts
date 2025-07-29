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
    sort: 'created_at',
    order: 'desc',
    page: 1,
    limit: 12,
  })

  // Getters
  const hasProducts = computed(() => products.value.length > 0)
  const hasCategories = computed(() => categories.value.length > 0)
  const totalPages = computed(() => pagination.value?.last_page ?? 1)
  const currentPage = computed(() => pagination.value?.current_page ?? 1)
  const totalProducts = computed(() => pagination.value?.total ?? 0)

  // Actions
  const fetchProducts = async (newFilters?: Partial<ProductFilters>) => {
    try {
      isLoading.value = true
      error.value = null

      // Update filters if provided
      if (newFilters) {
        filters.value = { ...filters.value, ...newFilters }
      }

      // Build query parameters from the ref
      const params: Record<string, any> = {
        search: filters.value.search,
        category_id: filters.value.category_id,
        min_price: filters.value.min_price,
        max_price: filters.value.max_price,
        sort: filters.value.sort,
        order: filters.value.order,
        page: filters.value.page,
        limit: filters.value.limit,
      }

      // Remove undefined/null values
      Object.keys(params).forEach((key) => {
        if (params[key] === undefined || params[key] === null || params[key] === '') {
          delete params[key]
        }
      })

      const response = await apiService.get<PaginatedResponse<Product>>('/products', params)

      products.value = response.data
      pagination.value = response.meta
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch products'
      products.value = []
      // Reset pagination on error to prevent template errors
      pagination.value = {
        current_page: 1,
        from: 0,
        last_page: 1,
        per_page: 12,
        to: 0,
        total: 0,
      }
    } finally {
      isLoading.value = false
    }
  }

  const fetchCategories = async (params: { with_products?: boolean } = {}) => {
    try {
      isLoadingCategories.value = true
      error.value = null

      const response = await apiService.get<{ data: Category[] }>('/categories', params)
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

      const response = await apiService.get<Product>(`/products/${id}`)
      currentProduct.value = response
      return response
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
