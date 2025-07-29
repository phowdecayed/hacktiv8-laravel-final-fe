import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  Transaction,
  TransactionStatus,
  ApiResponse,
  PaginatedResponse,
  CreateTransactionRequest,
} from '@/types/api'
import apiService from '@/lib/api'
import { useCartStore } from '@/stores/cart'

export interface CreateOrderRequest {
  notes?: string
}

export interface OrderFilters {
  status?: TransactionStatus
  sort_by?: 'created_at' | 'total_amount'
  sort_order?: 'asc' | 'desc'
  page?: number
  per_page?: number
}

export const useOrdersStore = defineStore('orders', () => {
  // State
  const orders = ref<Transaction[]>([])
  const currentOrder = ref<Transaction | null>(null)
  const isLoading = ref(false)
  const isCreatingOrder = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  })

  // Getters
  const orderCount = computed(() => orders.value.length)
  const hasOrders = computed(() => orders.value.length > 0)
  const pendingOrders = computed(() => orders.value.filter((order) => order.status === 'pending'))
  const completedOrders = computed(() =>
    orders.value.filter((order) => ['delivered', 'shipped'].includes(order.status)),
  )

  // Actions
  const fetchOrders = async (filters: OrderFilters = {}) => {
    isLoading.value = true
    error.value = null

    try {
      const params = {
        ...filters,
        page: filters.page || 1,
        per_page: filters.per_page || 10,
      }

      const response = await apiService.get<PaginatedResponse<Transaction>>('/transactions', params)

      orders.value = response.data
      pagination.value = {
        current_page: response.pagination.current_page,
        last_page: response.pagination.last_page,
        per_page: response.pagination.per_page,
        total: response.pagination.total,
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch orders'
      console.error('Error fetching orders:', err)
    } finally {
      isLoading.value = false
    }
  }

  const fetchOrder = async (id: number) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await apiService.get<ApiResponse<Transaction>>(`/transactions/${id}`)
      currentOrder.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch order details'
      console.error('Error fetching order:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createOrder = async (orderData: CreateOrderRequest) => {
    isCreatingOrder.value = true
    error.value = null

    const cartStore = useCartStore()

    try {
      const items = cartStore.items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price, // Add price to the item payload
      }))

      const payload: CreateTransactionRequest = {
        items,
        notes: orderData.notes,
        status: 'pending', // Default status for new orders
      }

      const response = await apiService.post<ApiResponse<Transaction>>('/transactions', payload)
      const newOrder = response.data

      // Add the new order to the beginning of the orders list
      orders.value.unshift(newOrder)
      currentOrder.value = newOrder

      return newOrder
    } catch (err: any) {
      error.value = err.message || 'Failed to create order'
      throw err
    } finally {
      isCreatingOrder.value = false
    }
  }

  const updateOrderStatus = (orderId: number, status: TransactionStatus) => {
    const orderIndex = orders.value.findIndex((order) => order.id === orderId)
    if (orderIndex !== -1) {
      orders.value[orderIndex].status = status
    }

    if (currentOrder.value && currentOrder.value.id === orderId) {
      currentOrder.value.status = status
    }
  }

  const clearCurrentOrder = () => {
    currentOrder.value = null
  }

  const clearOrders = () => {
    orders.value = []
    currentOrder.value = null
    error.value = null
    pagination.value = {
      current_page: 1,
      last_page: 1,
      per_page: 10,
      total: 0,
    }
  }

  const refreshOrders = async () => {
    await fetchOrders({
      page: pagination.value.current_page,
      per_page: pagination.value.per_page,
    })
  }

  return {
    // State
    orders,
    currentOrder,
    isLoading,
    isCreatingOrder,
    error,
    pagination,

    // Getters
    orderCount,
    hasOrders,
    pendingOrders,
    completedOrders,

    // Actions
    fetchOrders,
    fetchOrder,
    createOrder,
    updateOrderStatus,
    clearCurrentOrder,
    clearOrders,
    refreshOrders,
  }
})
