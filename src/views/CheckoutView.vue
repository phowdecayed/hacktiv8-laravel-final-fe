<template>
  <div class="min-h-screen">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Checkout</h1>
        <p class="text-gray-600 mt-1">Review your order and complete your purchase</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center py-12">
        <Loader2 class="w-8 h-8 animate-spin text-gray-400" />
        <span class="ml-2 text-gray-600">Loading checkout...</span>
      </div>

      <!-- Empty Cart State -->
      <div v-else-if="isEmpty" class="text-center py-12">
        <ShoppingCart class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
        <p class="text-gray-600 mb-6">Add some items to your cart before checking out</p>
        <Button @click="router.push('/products')">
          <Package class="w-4 h-4 mr-2" />
          Browse Products
        </Button>
      </div>

      <!-- Checkout Form -->
      <CheckoutForm v-else @back="handleBack" @success="handleOrderSuccess" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '@/composables/useCart'
import { useAuthStore } from '@/stores/auth'
import CheckoutForm from '@/components/checkout/CheckoutForm.vue'
import { Button } from '@/components/ui/button'
import { Loader2, ShoppingCart, Package } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

// Router
const router = useRouter()

// Composables
const { items, isEmpty, isLoading, initializeCart, validateStock } = useCart()
const authStore = useAuthStore()

// Computed
const hasItems = computed(() => items.value.length > 0)

// Methods
const handleBack = () => {
  router.push('/cart')
}

const handleOrderSuccess = (orderId: number) => {
  // Navigation is handled by useOrders composable, but we can add additional logic here if needed
}

// Lifecycle
onMounted(async () => {
  // Check authentication
  if (!authStore.isAuthenticated) {
    toast.error('Please log in to continue with checkout')
    router.push('/login')
    return
  }

  // Initialize cart if not already done
  await initializeCart()

  // Validate stock
  if (hasItems.value) {
    await validateStock()
  }

  // If cart is empty after initialization, show message
  if (isEmpty.value) {
    toast.info('Your cart is empty. Add some items before checking out.')
  }
})
</script>
