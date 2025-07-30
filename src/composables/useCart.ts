import { computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useNotifications } from '@/composables/useNotifications'

export const useCart = () => {
  const cartStore = useCartStore()
  const authStore = useAuthStore()
  const notifications = useNotifications()

  // Computed properties
  const items = computed(() => cartStore.items)
  const itemCount = computed(() => cartStore.itemCount)
  const total = computed(() => cartStore.total)
  const isEmpty = computed(() => cartStore.isEmpty)
  const hasItems = computed(() => cartStore.hasItems)
  const isLoading = computed(() => cartStore.isLoading)
  const isInitialized = computed(() => cartStore.isInitialized)
  const stockValidation = computed(() => cartStore.stockValidation)
  const hasStockIssues = computed(() => cartStore.hasStockIssues)

  // Helper functions
  const requireAuth = () => {
    if (!authStore.isAuthenticated) {
      notifications.showAuthError()
      throw new Error('Authentication required')
    }
  }

  const formatPrice = (price: string | number): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numPrice)
  }

  // Cart operations
  const addToCart = async (productId: number, quantity: number = 1): Promise<boolean> => {
    try {
      requireAuth()

      const loadingToast = notifications.showLoading('Adding item to cart...')

      await cartStore.addToCart(productId, quantity)

      notifications.updateLoadingToast(loadingToast, 'success', 'Item added to cart')
      return true
    } catch (error: any) {
      const message = error?.message || 'Failed to add item to cart'
      notifications.showError(message)
      return false
    }
  }

  const updateQuantity = async (itemId: number, quantity: number): Promise<boolean> => {
    try {
      requireAuth()

      if (quantity < 0) {
        notifications.showError('Quantity cannot be negative')
        return false
      }

      const loadingToast = notifications.showLoading('Updating cart...')

      await cartStore.updateQuantity(itemId, quantity)

      const successMessage = quantity === 0 ? 'Item removed from cart' : 'Cart updated'
      notifications.updateLoadingToast(loadingToast, 'success', successMessage)

      return true
    } catch (error: any) {
      const message = error?.message || 'Failed to update cart'
      notifications.showError(message)
      return false
    }
  }

  const removeItem = async (itemId: number): Promise<boolean> => {
    try {
      requireAuth()

      const loadingToast = notifications.showLoading('Removing item...')

      await cartStore.removeItem(itemId)

      notifications.updateLoadingToast(loadingToast, 'success', 'Item removed from cart')
      return true
    } catch (error: any) {
      const message = error?.message || 'Failed to remove item'
      notifications.showError(message)
      return false
    }
  }

  const clearCart = async (): Promise<boolean> => {
    try {
      requireAuth()

      const loadingToast = notifications.showLoading('Clearing cart...')

      await cartStore.clearCart()

      notifications.updateLoadingToast(loadingToast, 'success', 'Cart cleared')
      return true
    } catch (error: any) {
      const message = error?.message || 'Failed to clear cart'
      notifications.showError(message)
      return false
    }
  }

  const refreshCart = async (): Promise<boolean> => {
    try {
      const loadingToast = notifications.showLoading('Refreshing cart...')

      await cartStore.syncWithBackend()

      notifications.updateLoadingToast(loadingToast, 'success', 'Cart refreshed')
      return true
    } catch (error: any) {
      const message = error?.message || 'Failed to refresh cart'
      notifications.showError(message)
      return false
    }
  }

  const initializeCart = async (): Promise<void> => {
    try {
      await cartStore.initializeCart()
    } catch (error: any) {
      console.error('Failed to initialize cart:', error)
    }
  }

  // Utility functions
  const getItemByProductId = (productId: number) => {
    return cartStore.getItemByProductId(productId)
  }

  const getItemById = (itemId: number) => {
    return cartStore.getItemById(itemId)
  }

  const isProductInCart = (productId: number): boolean => {
    return !!getItemByProductId(productId)
  }

  const getProductQuantityInCart = (productId: number): number => {
    const item = getItemByProductId(productId)
    return item?.quantity || 0
  }

  const canAddToCart = (
    productId: number,
    requestedQuantity: number,
    availableStock: number,
  ): boolean => {
    const currentQuantity = getProductQuantityInCart(productId)
    return currentQuantity + requestedQuantity < availableStock
  }

  const getTotalItems = (): number => {
    return itemCount.value
  }

  const getTotalPrice = (): string => {
    return total.value.toFixed(2)
  }

  const getFormattedTotal = (): string => {
    return formatPrice(total.value)
  }

  const getStockValidationStatus = (productId: number) => {
    const validation = stockValidation.value.find(item => item.product_id === productId)
    if (!validation) return 'valid'
    if (validation.available_stock === 0) return 'unavailable'
    if (validation.available_stock < validation.cart_quantity) return 'insufficient'
    return 'valid'
  }

  // Batch operations
  const updateMultipleItems = async (
    updates: Array<{ itemId: number; quantity: number }>,
  ): Promise<boolean> => {
    try {
      requireAuth()

      const loadingToast = notifications.showLoading(`Updating ${updates.length} items...`)

      const promises = updates.map(({ itemId, quantity }) =>
        cartStore.updateQuantity(itemId, quantity),
      )

      await Promise.all(promises)

      notifications.updateLoadingToast(loadingToast, 'success', 'Cart updated')
      return true
    } catch (error: any) {
      const message = error?.message || 'Failed to update cart items'
      notifications.showError(message)
      return false
    }
  }

  const removeMultipleItems = async (itemIds: number[]): Promise<boolean> => {
    try {
      requireAuth()

      const loadingToast = notifications.showLoading(`Removing ${itemIds.length} items...`)

      const promises = itemIds.map((itemId) => cartStore.removeItem(itemId))
      await Promise.all(promises)

      notifications.updateLoadingToast(
        loadingToast,
        'success',
        `${itemIds.length} item(s) removed from cart`,
      )
      return true
    } catch (error: any) {
      const message = error?.message || 'Failed to remove items'
      notifications.showError(message)
      return false
    }
  }

  return {
    // State
    items,
    itemCount,
    total,
    isEmpty,
    hasItems,
    isLoading,
    isInitialized,

    // Operations
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart,
    initializeCart,

    // Utilities
    getItemByProductId,
    getItemById,
    isProductInCart,
    getProductQuantityInCart,
    canAddToCart,
    getTotalItems,
    getTotalPrice,
    getFormattedTotal,
    formatPrice,

    // Batch operations
    updateMultipleItems,
    removeMultipleItems,

    // Stock Validation
    stockValidation,
    hasStockIssues,
    validateStock: cartStore.validateStock,
    getStockValidationStatus,
  }
}
