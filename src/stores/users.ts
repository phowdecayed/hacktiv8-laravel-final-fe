import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { adminApiService } from '@/services/api/admin'
import type {
  User,
  UserFilters,
  CreateUserRequest,
  UpdateUserRequest,
  ApiResponseWithPagination,
  ApiResponseWrapper,
} from '@/types'

export const useUsersStore = defineStore('users', () => {
  // State
  const users = ref<User[]>([])
  const currentUser = ref<User | null>(null)
  const pagination = ref({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
  })
  const filters = ref<UserFilters>({})
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const hasUsers = computed(() => users.value.length > 0)
  const totalUsers = computed(() => pagination.value.total)

  // Actions
  const fetchUsers = async (newFilters?: UserFilters) => {
    isLoading.value = true
    error.value = null

    if (newFilters) {
      filters.value = { ...filters.value, ...newFilters }
    }

    try {
      const responseWrapper = await adminApiService.getUsers(filters.value)
      const response = responseWrapper.data
      users.value = response.data
      pagination.value = {
        current_page: response.current_page,
        per_page: response.per_page,
        total: response.total,
        last_page: response.last_page,
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch users'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchUser = async (id: number) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await adminApiService.getUser(id)
      currentUser.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch user'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createUser = async (userData: CreateUserRequest) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await adminApiService.createUser(userData)
      users.value.unshift(response.data)
      pagination.value.total += 1
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to create user'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateUser = async (id: number, userData: UpdateUserRequest) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await adminApiService.updateUser(id, userData)
      const index = users.value.findIndex((user) => user.id === id)
      if (index !== -1) {
        users.value[index] = response.data
      }
      if (currentUser.value?.id === id) {
        currentUser.value = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to update user'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteUser = async (id: number) => {
    isLoading.value = true
    error.value = null

    try {
      await adminApiService.deleteUser(id)
      users.value = users.value.filter((user) => user.id !== id)
      pagination.value.total -= 1
      if (currentUser.value?.id === id) {
        currentUser.value = null
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete user'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const restoreUser = async (id: number) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await adminApiService.restoreUser(id)
      const index = users.value.findIndex((user) => user.id === id)
      if (index !== -1) {
        users.value[index] = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to restore user'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const setFilters = (newFilters: UserFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {}
  }

  const clearError = () => {
    error.value = null
  }

  const clearCurrentUser = () => {
    currentUser.value = null
  }

  return {
    // State
    users,
    currentUser,
    pagination,
    filters,
    isLoading,
    error,

    // Getters
    hasUsers,
    totalUsers,

    // Actions
    fetchUsers,
    fetchUser,
    createUser,
    updateUser,
    deleteUser,
    restoreUser,
    setFilters,
    clearFilters,
    clearError,
    clearCurrentUser,
  }
})
