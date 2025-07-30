import { ref, computed } from 'vue'
import { useNotifications } from './useNotifications'
import { adminApiService } from '@/services/api/admin'
import type { StorageFile, StorageFilters, FileUploadRequest, ApiResponseWithPagination } from '@/types'

export interface StorageState {
  files: StorageFile[]
  currentFile: StorageFile | null
  pagination: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
  filters: StorageFilters
  isLoading: boolean
  isUploading: boolean
  error: string | null
}

export function useStorage() {
  // State
  const files = ref<StorageFile[]>([])
  const currentFile = ref<StorageFile | null>(null)
  const pagination = ref({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1,
  })
  const filters = ref<StorageFilters>({})
  const isLoading = ref(false)
  const isUploading = ref(false)
  const error = ref<string | null>(null)
  
  const { showError, showSuccess } = useNotifications()

  // Getters
  const hasFiles = computed(() => files.value.length > 0)
  const totalFiles = computed(() => pagination.value.total)

  // Actions
  const fetchFiles = async (newFilters?: StorageFilters) => {
    isLoading.value = true
    error.value = null

    try {
      if (newFilters) {
        filters.value = { ...filters.value, ...newFilters }
      }

      const response = await adminApiService.getStorageFiles(filters.value)
      files.value = response.data.data
      pagination.value = response.data
    } catch (err: any) {
      showError(err.message || 'Terjadi kesalahan yang tidak diketahui.')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const uploadFile = async (data: FileUploadRequest) => {
    isUploading.value = true
    error.value = null

    try {
      const response = await adminApiService.uploadFile(data)
      showSuccess('File uploaded successfully')
      return response.data
    } catch (err: any) {
      showError(err.message || 'Terjadi kesalahan yang tidak diketahui.')
      throw err
    } finally {
      isUploading.value = false
    }
  }

  const deleteFile = async (id: number) => {
    isLoading.value = true
    error.value = null

    try {
      await adminApiService.deleteStorageFile(id)
      // Remove file from local state
      files.value = files.value.filter(file => file.id !== id)
      showSuccess('File deleted successfully')
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete file'
      error.value = errorMessage
      showError(errorMessage)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const restoreFile = async (id: number) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await adminApiService.restoreStorageFile(id)
      // Update file in local state
      const index = files.value.findIndex(file => file.id === id)
      if (index !== -1) {
        files.value[index] = response.data
      }
      showSuccess('File restored successfully')
      return response.data
    } catch (err: any) {
      showError(err.message || 'Failed to restore file')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const setFilters = (newFilters: StorageFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {}
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    files,
    currentFile,
    pagination,
    filters,
    isLoading,
    isUploading,
    error,

    // Getters
    hasFiles,
    totalFiles,

    // Actions
    fetchFiles,
    uploadFile,
    deleteFile,
    restoreFile,
    setFilters,
    clearFilters,
    clearError,
  }
}