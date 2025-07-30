import { ref, computed, reactive } from 'vue'
import { useOrdersStore, type CreateOrderRequest, type OrderFilters } from '@/stores/orders'
import { useCartStore } from '@/stores/cart'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import type { Transaction, TransactionStatus } from '@/types/api'

export const useOrders = () => {
  const ordersStore = useOrdersStore()
  const cartStore = useCartStore()
  const router = useRouter()

  // Local reactive state for filters
  const filters = reactive<OrderFilters>({
    status: 'all',
    sort_by: 'created_at',
    sort_order: 'desc',
    page: 1,
    per_page: 10,
  })

  // Computed properties from store
  const orders = computed(() => ordersStore.orders)
  const currentOrder = computed(() => ordersStore.currentOrder)
  const isLoading = computed(() => ordersStore.isLoading)
  const isCreatingOrder = computed(() => ordersStore.isCreatingOrder)
  const error = computed(() => ordersStore.error)
  const pagination = computed(() => ordersStore.pagination)
  const orderCount = computed(() => ordersStore.orderCount)
  const hasOrders = computed(() => ordersStore.hasOrders)
  const pendingOrders = computed(() => ordersStore.pendingOrders)
  const completedOrders = computed(() => ordersStore.completedOrders)

  // Fetch orders with optional filters
  const fetchOrders = async (customFilters: OrderFilters = {}) => {
    Object.assign(filters, customFilters)
    try {
      await ordersStore.fetchOrders(filters)
    } catch (err: any) {
      toast.error('Failed to load orders')
      console.error('Error in useOrders.fetchOrders:', err)
    }
  }

  // Fetch a specific order by ID
  const fetchOrder = async (id: number): Promise<Transaction | null> => {
    try {
      const order = await ordersStore.fetchOrder(id)
      return order
    } catch (err: any) {
      toast.error('Failed to load order details')
      console.error('Error in useOrders.fetchOrder:', err)
      return null
    }
  }

  // Create a new order from cart items
  const createOrder = async (orderData: CreateOrderRequest = {}): Promise<Transaction | null> => {
    try {
      // Validate cart has items
      if (!cartStore.hasItems) {
        toast.error('Your cart is empty')
        return null
      }

      // Validate cart items stock before creating order
      await cartStore.validateStock()
      if (cartStore.hasStockIssues) {
        toast.error('Some items in your cart are no longer available')
        return null
      }

      const order = await ordersStore.createOrder(orderData)

      console.log('Cart items before clear in useOrders:', cartStore.items.length)
      // Clear cart after successful order creation
      await cartStore.clearCart()
      console.log('Cart items after clear in useOrders:', cartStore.items.length)
      cartStore.resetStockValidationState()

      toast.success('Order created successfully!')

      // Navigate to order confirmation or order details
      router.push(`/orders/${order.id}?success=true`)

      return order
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create order'
      toast.error(errorMessage)
      console.error('Error in useOrders.createOrder:', err)
      return null
    }
  }

  // Filter and pagination actions
  const updateFilters = (newFilters: Partial<OrderFilters>) => {
    Object.assign(filters, newFilters, { page: 1 })
    fetchOrders(filters)
  }

  const clearFilters = () => {
    Object.assign(filters, {
      status: 'all',
      sort_by: 'created_at',
      sort_order: 'desc',
      page: 1,
      per_page: 10,
    })
    fetchOrders(filters)
  }

  const goToPage = (page: number) => {
    filters.page = page
    fetchOrders(filters)
  }

  const clearError = () => {
    ordersStore.clearError()
  }

  // Get order status display information
  const getOrderStatusInfo = (status: TransactionStatus) => {
    const statusMap = {
      pending: {
        label: 'Pending',
        color: 'bg-yellow-100 text-yellow-800',
        description: 'Order is being processed',
      },
      processing: {
        label: 'Processing',
        color: 'bg-blue-100 text-blue-800',
        description: 'Order is being prepared',
      },
      shipped: {
        label: 'Shipped',
        color: 'bg-purple-100 text-purple-800',
        description: 'Order has been shipped',
      },
      delivered: {
        label: 'Delivered',
        color: 'bg-green-100 text-green-800',
        description: 'Order has been delivered',
      },
      completed: {
        label: 'Completed',
        color: 'bg-green-100 text-green-800',
        description: 'Order has been completed',
      },
      cancelled: {
        label: 'Cancelled',
        color: 'bg-red-100 text-red-800',
        description: 'Order has been cancelled',
      },
      refunded: {
        label: 'Refunded',
        color: 'bg-gray-100 text-gray-800',
        description: 'Order has been refunded',
      },
    }

    return statusMap[status] || statusMap.pending
  }

  // Format order total for display
  const formatOrderTotal = (amount: string): string => {
    const numAmount = parseFloat(amount)
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount)
  }

  // Calculate order item count
  const getOrderItemCount = (order: Transaction): number => {
    return order.items.reduce((total, item) => total + item.quantity, 0)
  }

  // Get order summary for display
  const getOrderSummary = (order: Transaction) => {
    const itemCount = getOrderItemCount(order)
    const statusInfo = getOrderStatusInfo(order.status)
    const formattedTotal = formatOrderTotal(order.total_amount)

    return {
      id: order.id,
      date: new Date(order.created_at).toLocaleDateString('id-ID'),
      itemCount,
      total: formattedTotal,
      status: statusInfo,
      notes: order.notes,
    }
  }

  // Refresh orders list
  const refreshOrders = async () => {
    try {
      await ordersStore.fetchOrders(filters) // Use local filters
    } catch (err: any) {
      toast.error('Failed to refresh orders')
      console.error('Error in useOrders.refreshOrders:', err)
    }
  }

  // Clear current order
  const clearCurrentOrder = () => {
    ordersStore.clearCurrentOrder()
  }

  // Load more orders (pagination)
  const loadMoreOrders = async () => {
    if (pagination.value.current_page < pagination.value.last_page) {
      filters.page = (filters.page || 1) + 1
      await fetchOrders(filters)
    }
  }

  // Check if more orders can be loaded
  const canLoadMore = computed(() => pagination.value.current_page < pagination.value.last_page)

  return {
    // State
    orders,
    currentOrder,
    isLoading,
    isCreatingOrder,
    error,
    pagination,
    filters, // Expose filters

    // Computed
    orderCount,
    hasOrders,
    pendingOrders,
    completedOrders,
    canLoadMore,

    // Actions
    fetchOrders,
    fetchOrder,
    createOrder,
    refreshOrders,
    clearCurrentOrder,
    loadMoreOrders,
    updateFilters,
    clearFilters,
    goToPage,
    clearError,

    // Utilities
    getOrderStatusInfo,
    formatOrderTotal,
    getOrderItemCount,
    getOrderSummary,
  }
}
