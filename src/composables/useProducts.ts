import { computed } from 'vue'
import { useProductsStore } from '@/stores/products'
import type { ProductFilters } from '@/types/api'

export const useProducts = () => {
  const store = useProductsStore()

  // Computed properties for reactive access to store state
  const products = computed(() => store.products)
  const categories = computed(() => store.categories)
  const currentProduct = computed(() => store.currentProduct)
  const isLoading = computed(() => store.isLoading)
  const isLoadingCategories = computed(() => store.isLoadingCategories)
  const isLoadingProduct = computed(() => store.isLoadingProduct)
  const error = computed(() => store.error)
  const pagination = computed(() => store.pagination)
  const filters = computed(() => store.filters)
  const hasProducts = computed(() => store.hasProducts)
  const hasCategories = computed(() => store.hasCategories)
  const totalPages = computed(() => store.totalPages)
  const currentPage = computed(() => store.currentPage)
  const totalProducts = computed(() => store.totalProducts)

  // Methods for interacting with the store
  const fetchProducts = async (newFilters?: Partial<ProductFilters>) => {
    await store.fetchProducts(newFilters)
  }

  const fetchCategories = async () => {
    await store.fetchCategories()
  }

  const fetchProduct = async (id: number) => {
    return await store.fetchProduct(id)
  }

  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    store.updateFilters(newFilters)
  }

  const clearFilters = () => {
    store.clearFilters()
  }

  const setPage = (page: number) => {
    store.setPage(page)
  }

  const nextPage = () => {
    store.nextPage()
  }

  const prevPage = () => {
    store.prevPage()
  }

  const clearError = () => {
    store.clearError()
  }

  const clearCurrentProduct = () => {
    store.clearCurrentProduct()
  }

  // Helper methods for common operations
  const searchProducts = async (searchTerm: string) => {
    await fetchProducts({ search: searchTerm, page: 1 })
  }

  const filterByCategory = async (categoryId: number | undefined) => {
    await fetchProducts({ category_id: categoryId, page: 1 })
  }

  const sortProducts = async (
    sortBy: 'name' | 'price' | 'created_at',
    sortOrder: 'asc' | 'desc' = 'asc',
  ) => {
    await fetchProducts({ sort_by: sortBy, sort_order: sortOrder, page: 1 })
  }

  const filterByPriceRange = async (minPrice?: number, maxPrice?: number) => {
    await fetchProducts({ min_price: minPrice, max_price: maxPrice, page: 1 })
  }

  const goToPage = async (page: number) => {
    await fetchProducts({ page })
  }

  const refreshProducts = async () => {
    await fetchProducts()
  }

  const refreshCategories = async () => {
    await fetchCategories()
  }

  // Initialize data - useful for components that need to load data on mount
  const initializeProducts = async () => {
    if (!hasProducts.value) {
      await fetchProducts()
    }
  }

  const initializeCategories = async () => {
    if (!hasCategories.value) {
      await fetchCategories()
    }
  }

  const initializeAll = async () => {
    await Promise.all([initializeProducts(), initializeCategories()])
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
    hasProducts,
    hasCategories,
    totalPages,
    currentPage,
    totalProducts,

    // Core methods
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

    // Helper methods
    searchProducts,
    filterByCategory,
    sortProducts,
    filterByPriceRange,
    goToPage,
    refreshProducts,
    refreshCategories,

    // Initialization methods
    initializeProducts,
    initializeCategories,
    initializeAll,
  }
}
