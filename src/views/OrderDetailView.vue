<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Show success component if this is a new order -->
      <OrderSuccess v-if="showSuccess" :order-id="orderId" />

      <!-- Regular order detail view -->
      <div v-else>
        <!-- Check Authentication -->
        <div v-if="!isAuthenticated" class="text-center py-12">
          <Lock class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 class="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p class="text-gray-600 mb-6">Please log in to view order details</p>
          <Button @click="$router.push('/login')">
            <LogIn class="w-4 h-4 mr-2" />
            Log In
          </Button>
        </div>

        <!-- Order Detail -->
        <OrderDetail v-else :order-id="orderId" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useOrders } from '@/composables/useOrders'
import { useAuthStore } from '@/stores/auth'
import OrderSuccess from '@/components/checkout/OrderSuccess.vue'
import OrderDetail from '@/components/order/OrderDetail.vue'
import { Button } from '@/components/ui/button'
import { Lock, LogIn } from 'lucide-vue-next'

// Route
const route = useRoute()

// Composables
const { fetchOrder } = useOrders()
const authStore = useAuthStore()

// Computed
const orderId = computed(() => parseInt(route.params.id as string))
const showSuccess = computed(() => route.query.success === 'true')
const isAuthenticated = computed(() => authStore.isAuthenticated)

// Lifecycle
onMounted(async () => {
  // Ensure auth is checked
  if (!authStore.isInitialized) {
    await authStore.checkAuth()
  }

  // Fetch order if authenticated and not showing success page
  if (isAuthenticated.value && orderId.value && !showSuccess.value) {
    await fetchOrder(orderId.value)
  }
})
</script>
