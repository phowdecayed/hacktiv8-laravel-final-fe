import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { adminApiService } from '@/services/api/admin'
import type { AdminDashboardStats } from '@/types/admin'

export const useAdminStore = defineStore('admin', () => {
  // State
  const dashboardStats = ref<AdminDashboardStats | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const hasStats = computed(() => !!dashboardStats.value)

  // Actions
  const fetchDashboardStats = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await adminApiService.getDashboardStats()
      dashboardStats.value = response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch dashboard stats'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const clearStats = () => {
    dashboardStats.value = null
    error.value = null
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    dashboardStats,
    isLoading,
    error,

    // Getters
    hasStats,

    // Actions
    fetchDashboardStats,
    clearStats,
    clearError,
  }
})
