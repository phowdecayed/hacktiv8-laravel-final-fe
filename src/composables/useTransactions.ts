import { ref, computed, reactive } from 'vue'
import { adminApiService } from '@/services/api/admin'
import { toast } from 'vue-sonner'
import type {
  Transaction,
  TransactionStatus,
  TransactionFilters,
  UpdateTransactionRequest,
  ApiResponseWithPagination,
} from '@/types'

export interface AdminTransactionFilters extends TransactionFilters {
  customer_search?: string
  date_from?: string
  date_to?: string
  min_amount?: number
  max_amount?: number
}

export const useTransactions = () => {
  // State
  const transactions = ref<Transaction[]>([])
  const currentTransaction = ref<Transaction | null>(null)
  const isLoading = ref(false)
  const isUpdating = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  })

  // Filters
  const filters = reactive<AdminTransactionFilters>({
    status: undefined,
    customer_search: '',
    date_from: '',
    date_to: '',
    min_amount: undefined,
    max_amount: undefined,
    sort_by: 'created_at',
    sort_order: 'desc',
    page: 1,
    per_page: 10,
  })

  // Computed
  const hasTransactions = computed(() => transactions.value.length > 0)
  const pendingTransactions = computed(() =>
    transactions.value.filter((t) => t.status === 'pending'),
  )
  const processingTransactions = computed(() =>
    transactions.value.filter((t) => t.status === 'processing'),
  )
  const completedTransactions = computed(() =>
    transactions.value.filter((t) => ['delivered', 'completed'].includes(t.status)),
  )

  // Actions
  const fetchTransactions = async (customFilters: AdminTransactionFilters = {}) => {
    isLoading.value = true
    error.value = null

    try {
      // Merge filters and remove empty values
      const mergedFilters = { ...filters, ...customFilters }
      const cleanFilters = Object.fromEntries(
        Object.entries(mergedFilters).filter(([_, value]) => value !== '' && value !== undefined),
      )

      const response = await adminApiService.getTransactions(cleanFilters)

      transactions.value = response.data.data
      pagination.value = response.data.pagination || {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch transactions'
      toast.error('Failed to load transactions')
      console.error('Error fetching transactions:', err)
    } finally {
      isLoading.value = false
    }
  }

  const fetchTransaction = async (id: number): Promise<Transaction | null> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await adminApiService.getTransaction(id)
      currentTransaction.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch transaction details'
      toast.error('Failed to load transaction details')
      console.error('Error fetching transaction:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const updateTransactionStatus = async (
    id: number,
    status: TransactionStatus,
    notes?: string,
  ): Promise<boolean> => {
    isUpdating.value = true
    error.value = null

    try {
      const updateData: UpdateTransactionRequest = { status }
      if (notes) updateData.notes = notes

      const response = await adminApiService.updateTransaction(id, updateData)

      // Update local state
      const transactionIndex = transactions.value.findIndex((t) => t.id === id)
      if (transactionIndex !== -1) {
        transactions.value[transactionIndex] = response.data
      }

      if (currentTransaction.value && currentTransaction.value.id === id) {
        currentTransaction.value = response.data
      }

      toast.success(`Transaction status updated to ${status}`)
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to update transaction status'
      toast.error('Failed to update transaction status')
      console.error('Error updating transaction status:', err)
      return false
    } finally {
      isUpdating.value = false
    }
  }

  const cancelTransaction = async (id: number, reason?: string): Promise<boolean> => {
    isUpdating.value = true
    error.value = null

    try {
      const response = await adminApiService.cancelTransaction(id, reason)

      // Update local state
      const transactionIndex = transactions.value.findIndex((t) => t.id === id)
      if (transactionIndex !== -1) {
        transactions.value[transactionIndex] = response.data
      }

      if (currentTransaction.value && currentTransaction.value.id === id) {
        currentTransaction.value = response.data
      }

      toast.success('Transaction cancelled successfully')
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to cancel transaction'
      toast.error('Failed to cancel transaction')
      console.error('Error cancelling transaction:', err)
      return false
    } finally {
      isUpdating.value = false
    }
  }

  const refundTransaction = async (id: number, reason?: string): Promise<boolean> => {
    isUpdating.value = true
    error.value = null

    try {
      const response = await adminApiService.refundTransaction(id, reason)

      // Update local state
      const transactionIndex = transactions.value.findIndex((t) => t.id === id)
      if (transactionIndex !== -1) {
        transactions.value[transactionIndex] = response.data
      }

      if (currentTransaction.value && currentTransaction.value.id === id) {
        currentTransaction.value = response.data
      }

      toast.success('Transaction refunded successfully')
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to refund transaction'
      toast.error('Failed to refund transaction')
      console.error('Error refunding transaction:', err)
      return false
    } finally {
      isUpdating.value = false
    }
  }

  const deleteTransaction = async (id: number): Promise<boolean> => {
    isUpdating.value = true
    error.value = null

    try {
      await adminApiService.deleteTransaction(id)

      // Update local state
      transactions.value = transactions.value.filter((t) => t.id !== id)

      toast.success('Transaction deleted successfully')
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to delete transaction'
      toast.error('Failed to delete transaction')
      console.error('Error deleting transaction:', err)
      return false
    } finally {
      isUpdating.value = false
    }
  }

  // Filter and pagination utilities
  const updateFilters = (newFilters: Partial<AdminTransactionFilters>) => {
    Object.assign(filters, newFilters, { page: 1 })
    fetchTransactions()
  }

  const clearFilters = () => {
    Object.assign(filters, {
      status: undefined,
      customer_search: '',
      date_from: '',
      date_to: '',
      min_amount: undefined,
      max_amount: undefined,
      sort_by: 'created_at',
      sort_order: 'desc',
      page: 1,
      per_page: 10,
    })
    fetchTransactions()
  }

  const goToPage = (page: number) => {
    filters.page = page
    fetchTransactions()
  }

  const clearError = () => {
    error.value = null
  }

  const clearCurrentTransaction = () => {
    currentTransaction.value = null
  }

  // Utility functions
  const getStatusInfo = (status: TransactionStatus) => {
    const statusMap = {
      pending: {
        label: 'Pending',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: '⏳',
        description: 'Awaiting processing',
      },
      processing: {
        label: 'Processing',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: '⚙️',
        description: 'Order being prepared',
      },
      shipped: {
        label: 'Shipped',
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: '🚚',
        description: 'Order shipped',
      },
      delivered: {
        label: 'Delivered',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: '✅',
        description: 'Order delivered',
      },
      completed: {
        label: 'Completed',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: '✅',
        description: 'Order completed',
      },
      cancelled: {
        label: 'Cancelled',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: '❌',
        description: 'Order cancelled',
      },
      refunded: {
        label: 'Refunded',
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: '💰',
        description: 'Order refunded',
      },
    }

    return statusMap[status] || statusMap.pending
  }

  const formatCurrency = (amount: string | number): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount)
  }

  const getTransactionItemCount = (transaction: Transaction): number => {
    return transaction.items.reduce((total, item) => total + item.quantity, 0)
  }

  const canUpdateStatus = (
    currentStatus: TransactionStatus,
    newStatus: TransactionStatus,
  ): boolean => {
    const statusFlow: Record<TransactionStatus, TransactionStatus[]> = {
      pending: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: ['completed', 'refunded'],
      completed: ['refunded'],
      cancelled: [],
      refunded: [],
    }

    return statusFlow[currentStatus]?.includes(newStatus) || false
  }

  const getAvailableStatusTransitions = (currentStatus: TransactionStatus): TransactionStatus[] => {
    const statusFlow: Record<TransactionStatus, TransactionStatus[]> = {
      pending: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: ['completed', 'refunded'],
      completed: ['refunded'],
      cancelled: [],
      refunded: [],
    }

    return statusFlow[currentStatus] || []
  }

  return {
    // State
    transactions,
    currentTransaction,
    isLoading,
    isUpdating,
    error,
    pagination,
    filters,

    // Computed
    hasTransactions,
    pendingTransactions,
    processingTransactions,
    completedTransactions,

    // Actions
    fetchTransactions,
    fetchTransaction,
    updateTransactionStatus,
    cancelTransaction,
    refundTransaction,
    deleteTransaction,
    updateFilters,
    clearFilters,
    goToPage,
    clearError,
    clearCurrentTransaction,

    // Utilities
    getStatusInfo,
    formatCurrency,
    getTransactionItemCount,
    canUpdateStatus,
    getAvailableStatusTransitions,
  }
}
