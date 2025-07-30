import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { adminApiService } from '@/services/api/admin'
import type {
  Category,
  CategoryFilters,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  ApiResponseWithPagination,
} from '@/types'

export const useCategoriesStore = defineStore('categories', () => {
  // State
  const categories = ref<Category[]>([])
  const currentCategory = ref<Category | null>(null)
  const pagination = ref({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
  })
  const filters = ref<CategoryFilters>({})
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const hasCategories = computed(() => categories.value.length > 0)
  const totalCategories = computed(() => pagination.value.total)
  const categoriesForSelect = computed(() =>
    categories.value.map((category) => ({
      label: category.name,
      value: category.id,
    })),
  )

  // Actions
  const fetchCategories = async (newFilters?: CategoryFilters) => {
    isLoading.value = true
    error.value = null

    if (newFilters) {
      filters.value = { ...filters.value, ...newFilters }
    }

    try {
      const response: ApiResponseWithPagination<Category> = await adminApiService.getCategories(
        filters.value,
      )
      categories.value = response.data
      pagination.value = {
        current_page: response.current_page,
        per_page: response.per_page,
        total: response.total,
        last_page: response.last_page,
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch categories'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchCategory = async (id: number) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await adminApiService.getCategory(id)
      currentCategory.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch category'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createCategory = async (categoryData: CreateCategoryRequest) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await adminApiService.createCategory(categoryData)
      categories.value.unshift(response.data)
      pagination.value.total += 1
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to create category'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateCategory = async (id: number, categoryData: UpdateCategoryRequest) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await adminApiService.updateCategory(id, categoryData)
      const index = categories.value.findIndex((category) => category.id === id)
      if (index !== -1) {
        categories.value[index] = response.data
      }
      if (currentCategory.value?.id === id) {
        currentCategory.value = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to update category'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteCategory = async (id: number) => {
    isLoading.value = true
    error.value = null

    try {
      await adminApiService.deleteCategory(id)
      categories.value = categories.value.filter((category) => category.id !== id)
      pagination.value.total -= 1
      if (currentCategory.value?.id === id) {
        currentCategory.value = null
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete category'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const restoreCategory = async (id: number) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await adminApiService.restoreCategory(id)
      const index = categories.value.findIndex((category) => category.id === id)
      if (index !== -1) {
        categories.value[index] = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to restore category'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const setFilters = (newFilters: CategoryFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {}
  }

  const clearError = () => {
    error.value = null
  }

  const clearCurrentCategory = () => {
    currentCategory.value = null
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

    // Actions
    fetchCategories,
    fetchCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    restoreCategory,
    setFilters,
    clearFilters,
    clearError,
    clearCurrentCategory,
  }
})
