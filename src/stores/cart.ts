import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import type {
  CartItem,
  CartSummary,
  ApiResponse,
  AddToCartRequest,
  UpdateCartItemRequest,
  CartValidationResult,
} from '@/types/api'
import apiService from '@/lib/api'
import { useAuthStore } from '@/stores/auth'

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref<CartItem[]>([])
  const cartSummary = ref<CartSummary | null>(null)
  const isLoading = ref(false)
  const isInitialized = ref(false)

  // Getters
  const itemCount = computed(() => cartSummary.value?.item_count ?? 0)

  const total = computed(() => cartSummary.value?.total ?? '0.00')

  const isEmpty = computed(() => items.value.length === 0)

  const hasItems = computed(() => items.value.length > 0)

  const getItemById = computed(() => (id: number) => items.value.find((item) => item.id === id))

  const getItemByProductId = computed(
    () => (productId: number) => items.value.find((item) => item.product_id === productId),
  )

  // Actions
  const fetchCart = async (): Promise<void> => {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      items.value = []
      cartSummary.value = null
      return
    }

    isLoading.value = true
    try {
      const response = await apiService.get<ApiResponse<CartSummary>>('/cart')
      cartSummary.value = response.data
      items.value = response.data.data
    } catch (error) {
      console.error('Failed to fetch cart:', error)
      items.value = []
      cartSummary.value = null
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

      // Check if item already exists in cart
      const existingItemIndex = items.value.findIndex((item) => item.product_id === productId)

      if (existingItemIndex !== -1) {
        // Update existing item
        items.value[existingItemIndex] = response.data
      } else {
        // Add new item
        items.value.push(response.data)
      }
    } catch (error) {
      console.error('Failed to add item to cart:', error)
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
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const validateStock = async (): Promise<CartValidationResult> => {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      return { valid: false, errors: ['Authentication required'] }
    }

    try {
      const response = await apiService.post<ApiResponse<CartValidationResult>>('/cart/validate')
      return response.data
    } catch (error) {
      console.error('Failed to validate cart:', error)
      return { valid: false, errors: ['Failed to validate cart'] }
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
    validateStock,
    syncWithBackend,
    initializeCart,
    resetCart,
  }
})
