import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import type {
  CartItem,
  PaginatedResponse,
  AddToCartRequest,
  UpdateCartItemRequest,
  StockValidationItem,
  ApiResponse,
} from '@/types/api'
import apiService from '@/lib/api'
import { useAuthStore } from '@/stores/auth'

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref<CartItem[]>([])
  const isLoading = ref(false)
  const isInitialized = ref(false)
  const stockValidation = ref<StockValidationItem[]>([])
  const hasStockIssues = ref(false)

  // Getters
  const itemCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const total = computed(() => {
    return items.value.reduce((sum, item) => sum + Number(item.total_price), 0)
  })

  const isEmpty = computed(() => items.value.length === 0)

  const hasItems = computed(() => items.value.length > 0)

  const getItemById = computed(() => (id: number) => items.value.find((item) => item.id === id))

  const getItemByProductId = computed(
    () => (productId: number) => items.value.find((item) => item.product.id === productId),
  )

  // Actions
  const fetchCart = async (): Promise<void> => {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      items.value = []
      isInitialized.value = true
      return
    }

    isLoading.value = true
    try {
      const response = await apiService.get<PaginatedResponse<CartItem>>('/cart', {
        limit: 100, // Fetch up to 100 items
      })

      if (response.data && Array.isArray(response.data)) {
        items.value = response.data
      } else {
        items.value = []
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error)
      items.value = []
    } finally {
      isLoading.value = false
      isInitialized.value = true
    }
  }

  const addToCart = async (productId: number, quantity: number = 1): Promise<void> => {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      throw new Error('Authentication required')
    }

    isLoading.value = true
    try {
      const requestData: AddToCartRequest = {
        product_id: productId,
        quantity,
      }
      const response = await apiService.post<ApiResponse<CartItem>>('/cart', requestData)

      const updatedItem = response.data
      const itemIndex = items.value.findIndex((item) => item.id === updatedItem.id)

      if (itemIndex !== -1) {
        items.value[itemIndex] = updatedItem
      } else {
        items.value.push(updatedItem)
      }
    } catch (error) {
      console.error('Failed to add item to cart:', error)
      await fetchCart() // a full refetch on error to ensure consistency
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const updateQuantity = async (itemId: number, quantity: number): Promise<void> => {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      throw new Error('Authentication required')
    }

    if (quantity <= 0) {
      await removeItem(itemId)
      return
    }

    isLoading.value = true
    try {
      const requestData: UpdateCartItemRequest = {
        quantity,
      }
      const response = await apiService.put<ApiResponse<CartItem>>(`/cart/${itemId}`, requestData)

      const itemIndex = items.value.findIndex((item) => item.id === itemId)
      if (itemIndex !== -1) {
        items.value[itemIndex] = response.data
      }
    } catch (error) {
      console.error('Failed to update cart item:', error)
      await fetchCart() // a full refetch on error to ensure consistency
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const removeItem = async (itemId: number): Promise<void> => {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      throw new Error('Authentication required')
    }

    isLoading.value = true
    try {
      await apiService.delete(`/cart/${itemId}`)

      items.value = items.value.filter((item) => item.id !== itemId)
    } catch (error) {
      console.error('Failed to remove cart item:', error)
      await fetchCart() // a full refetch on error to ensure consistency
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const clearCart = async (): Promise<void> => {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      throw new Error('Authentication required')
    }

    isLoading.value = true
    try {
      await apiService.delete('/cart')

      items.value = []
    } catch (error) {
      console.error('Failed to clear cart:', error)
      await fetchCart() // a full refetch on error to ensure consistency
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const syncWithBackend = async (): Promise<void> => {
    await fetchCart()
  }

  const initializeCart = async (): Promise<void> => {
    if (isInitialized.value) return

    const authStore = useAuthStore()
    if (authStore.isAuthenticated) {
      await fetchCart()
    } else {
      items.value = []
      isInitialized.value = true
    }
  }

  const resetCart = (): void => {
    items.value = []
    isLoading.value = false
    isInitialized.value = false
    stockValidation.value = []
    hasStockIssues.value = false
  }

  const validateStock = async (): Promise<void> => {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated || isEmpty.value) {
      stockValidation.value = []
      hasStockIssues.value = false
      return
    }

    try {
      const response =
        await apiService.get<ApiResponse<StockValidationItem[]>>('/cart/validate-stock')
      const validationData = response.data
      stockValidation.value = validationData

      hasStockIssues.value = validationData.some(
        (item) => item.cart_quantity > item.available_stock,
      )
    } catch (error) {
      console.error('Failed to validate stock:', error)
      hasStockIssues.value = true // Assume issues if validation fails
    }
  }

  return {
    // State
    items,
    isLoading: readonly(isLoading),
    isInitialized: readonly(isInitialized),

    // Getters
    itemCount,
    total,
    isEmpty,
    hasItems,
    getItemById,
    getItemByProductId,

    // Actions
    fetchCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    syncWithBackend,
    initializeCart,
    resetCart,
    validateStock,

    // Stock Validation
    stockValidation: readonly(stockValidation),
    hasStockIssues: readonly(hasStockIssues),
  }
})
