import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { adminApiService } from '@/services/api/admin'
import type { AuditTrail, AuditTrailFilters, ApiResponseWithPagination } from '@/types'

export const useAuditTrailStore = defineStore('auditTrail', () => {
  // State
  const auditEntries = ref<AuditTrail[]>([])
  const currentEntry = ref<AuditTrail | null>(null)
  const pagination = ref({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
  })
  const filters = ref<AuditTrailFilters>({})
  const isLoading = ref(false)
  const isExporting = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const hasEntries = computed(() => auditEntries.value.length > 0)
  const totalEntries = computed(() => pagination.value.total)

  // Actions
  const fetchAuditTrail = async (newFilters?: AuditTrailFilters) => {
    isLoading.value = true
    error.value = null

    if (newFilters) {
      filters.value = { ...filters.value, ...newFilters }
    }

    try {
      const response: ApiResponseWithPagination<AuditTrail> = await adminApiService.getAuditTrail(
        filters.value,
      )
      auditEntries.value = response.data
      pagination.value = {
        current_page: response.current_page,
        per_page: response.per_page,
        total: response.total,
        last_page: response.last_page,
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch audit trail'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchAuditEntry = async (id: number) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await adminApiService.getAuditTrailEntry(id)
      currentEntry.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch audit entry'
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

      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to export audit trail'
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
    auditEntries,
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
    fetchAuditTrail,
    fetchAuditEntry,
    exportAuditTrail,
    setFilters,
    clearFilters,
    clearError,
    clearCurrentEntry,
  }
})
