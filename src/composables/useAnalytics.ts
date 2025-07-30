import { ref, computed } from 'vue'
import { useNotifications } from './useNotifications'
import { adminApiService } from '@/services/api/admin'
import type { AdminDashboardStats } from '@/types/admin'

export interface AnalyticsState {
  stats: AdminDashboardStats | null
  salesData: any[]
  inventoryData: any[]
  userData: any[]
  isLoading: boolean
  error: string | null
}

export function useAnalytics() {
  // State
  const stats = ref<AdminDashboardStats | null>(null)
  const salesData = ref<any[]>([])
  const inventoryData = ref<any[]>([])
  const userData = ref<any[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  const { showError } = useNotifications()

  // Getters
  const hasStats = computed(() => stats.value !== null)

  // Actions
  const fetchDashboardStats = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await adminApiService.getDashboardStats()
      stats.value = response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch dashboard stats'
      showError(error.value)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchSalesAnalytics = async (dateRange?: { from: string; to: string }) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await adminApiService.getSalesAnalytics(dateRange)
      salesData.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch sales analytics'
      showError(error.value)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchInventoryAnalytics = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await adminApiService.getInventoryAnalytics()
      inventoryData.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch inventory analytics'
      showError(error.value)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchUserAnalytics = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await adminApiService.getUserAnalytics()
      userData.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch user analytics'
      showError(error.value)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    stats: stats.value,
    salesData: salesData.value,
    inventoryData: inventoryData.value,
    userData: userData.value,
    isLoading: isLoading.value,
    error: error.value,

    // Getters
    hasStats,

    // Actions
    fetchDashboardStats,
    fetchSalesAnalytics,
    fetchInventoryAnalytics,
    fetchUserAnalytics,
    clearError,
  }
}