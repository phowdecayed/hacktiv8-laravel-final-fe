import { computed } from 'vue'
import { useCategoriesStore } from '@/stores/categories'
import type {
  Category,
  CategoryFilters,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '@/types'

export function useCategories() {
  const store = useCategoriesStore()

  // State
  const categories = computed(() => {
    const cats = store.categories || []
    console.log('Computed categories:', cats)
    return cats
  })
  const currentCategory = computed(() => store.currentCategory)
  const pagination = computed(() => store.pagination)
  const filters = computed(() => store.filters)
  const isLoading = computed(() => store.isLoading)
  const error = computed(() => store.error)

  // Getters
  const hasCategories = computed(() => store.hasCategories)
  const totalCategories = computed(() => store.totalCategories)
  const categoriesForSelect = computed(() => store.categoriesForSelect)

  // Statistics
  const categoriesWithProducts = computed(
    () => (categories.value || []).filter((cat) => cat.products && cat.products.length > 0).length,
  )

  const emptyCategories = computed(
    () => (categories.value || []).filter((cat) => !cat.products || cat.products.length === 0).length,
  )

  const categoryStats = computed(() => ({
    total: totalCategories.value,
    withProducts: categoriesWithProducts.value,
    empty: emptyCategories.value,
  }))

  // Actions
  const fetchCategories = async (newFilters?: CategoryFilters) => {
    return store.fetchCategories(newFilters)
  }

  const fetchCategory = async (id: number) => {
    return store.fetchCategory(id)
  }

  const createCategory = async (categoryData: CreateCategoryRequest) => {
    return store.createCategory(categoryData)
  }

  const updateCategory = async (id: number, categoryData: UpdateCategoryRequest) => {
    return store.updateCategory(id, categoryData)
  }

  const deleteCategory = async (id: number) => {
    return store.deleteCategory(id)
  }

  const restoreCategory = async (id: number) => {
    return store.restoreCategory(id)
  }

  const bulkDeleteCategories = async (ids: number[]) => {
    const promises = ids.map((id) => store.deleteCategory(id))
    return Promise.all(promises)
  }

  const bulkRestoreCategories = async (ids: number[]) => {
    const promises = ids.map((id) => store.restoreCategory(id))
    return Promise.all(promises)
  }

  const setFilters = (newFilters: CategoryFilters) => {
    store.setFilters(newFilters)
  }

  const clearFilters = () => {
    store.clearFilters()
  }

  const clearError = () => {
    store.clearError()
  }

  const clearCurrentCategory = () => {
    store.clearCurrentCategory()
  }

  // Utility functions
  const getCategoryById = (id: number): Category | undefined => {
    return (categories.value || []).find((cat) => cat.id === id)
  }

  const getCategoriesByIds = (ids: number[]): Category[] => {
    return (categories.value || []).filter((cat) => ids.includes(cat.id))
  }

  const validateCategoryName = (name: string, excludeId?: number): boolean => {
    return !(categories.value || []).some(
      (cat) => cat.name.toLowerCase() === name.toLowerCase() && cat.id !== excludeId,
    )
  }

  const getCategoryProductCount = (categoryId: number): number => {
    const category = getCategoryById(categoryId)
    return category?.products?.length || 0
  }

  const getActiveCategories = (): Category[] => {
    return (categories.value || []).filter((cat) => !cat.deleted_at)
  }

  const getDeletedCategories = (): Category[] => {
    return (categories.value || []).filter((cat) => cat.deleted_at)
  }

  return {
    // State
    categories,
    currentCategory,
    pagination,
    filters,
    isLoading,
    error,

    // Getters
    hasCategories,
    totalCategories,
    categoriesForSelect,
    categoryStats,
    categoriesWithProducts,
    emptyCategories,

    // Actions
    fetchCategories,
    fetchCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    restoreCategory,
    bulkDeleteCategories,
    bulkRestoreCategories,
    setFilters,
    clearFilters,
    clearError,
    clearCurrentCategory,

    // Utilities
    getCategoryById,
    getCategoriesByIds,
    validateCategoryName,
    getCategoryProductCount,
    getActiveCategories,
    getDeletedCategories,
  }
}
