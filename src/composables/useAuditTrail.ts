import { ref, computed } from 'vue'
import { useNotifications } from './useNotifications'
import { adminApiService } from '@/services/api/admin'
import type { AuditTrail, AuditTrailFilters, ApiResponseWithPagination } from '@/types'

export interface AuditTrailState {
  entries: AuditTrail[]
  currentEntry: AuditTrail | null
  pagination: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
  filters: AuditTrailFilters
  isLoading: boolean
  isExporting: boolean
  error: string | null
}

export function useAuditTrail() {
  // State
  const entries = ref<AuditTrail[]>([])
  const currentEntry = ref<AuditTrail | null>(null)
  const pagination = ref({
    current_page: 1,
    per_page: 20,
    total: 0,
    last_page: 1,
  })
  const filters = ref<AuditTrailFilters>({})
  const isLoading = ref(false)
  const isExporting = ref(false)
  const error = ref<string | null>(null)

  const { showError, showSuccess } = useNotifications()

  // Getters
  const hasEntries = computed(() => entries.value.length > 0)
  const totalEntries = computed(() => pagination.value.total)

  // Actions
  const fetchEntries = async (newFilters?: AuditTrailFilters) => {
    isLoading.value = true
    error.value = null

    try {
      if (newFilters) {
        filters.value = { ...filters.value, ...newFilters }
      }

      const response = (await adminApiService.getAuditTrail(
        filters.value,
      )) as unknown as ApiResponseWithPagination<AuditTrail>
      entries.value = response.data
      // Ensure pagination is always an object, even if response.data.pagination is undefined
      pagination.value = {
        current_page: response.current_page,
        per_page: response.per_page,
        total: response.total,
        last_page: response.last_page,
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch audit trail'
      if (error.value) showError(error.value)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchEntry = async (id: number) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await adminApiService.getAuditTrailEntry(id)
      currentEntry.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch audit entry'
      if (error.value) showError(error.value)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const exportAuditTrail = async (exportFilters?: AuditTrailFilters) => {
    isExporting.value = true
    error.value = null

    try {
      const blob = await adminApiService.exportAuditTrail(exportFilters || filters.value)

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `audit-trail-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      showSuccess('Audit trail exported successfully')
      return true
    } catch (err: any) {
      showError(err.message || 'Failed to export audit trail')
      throw err
    } finally {
      isExporting.value = false
    }
  }

  const setFilters = (newFilters: AuditTrailFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {}
  }

  const clearError = () => {
    error.value = null
  }

  const clearCurrentEntry = () => {
    currentEntry.value = null
  }

  return {
    // State
    entries,
    currentEntry,
    pagination,
    filters,
    isLoading,
    isExporting,
    error,

    // Getters
    hasEntries,
    totalEntries,

    // Actions
    fetchEntries,
    fetchEntry,
    exportAuditTrail,
    setFilters,
    clearFilters,
    clearError,
    clearCurrentEntry,
  }
}
