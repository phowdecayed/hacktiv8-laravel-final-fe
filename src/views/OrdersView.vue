<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Check Authentication -->
      <div v-if="!isAuthenticated" class="text-center py-12">
        <Lock class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
        <p class="text-gray-600 mb-6">Please log in to view your order history</p>
        <Button @click="$router.push('/login')">
          <LogIn class="w-4 h-4 mr-2" />
          Log In
        </Button>
      </div>

      <!-- Order History -->
      <OrderHistory v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import OrderHistory from '@/components/order/OrderHistory.vue'
import { Button } from '@/components/ui/button'
import { Lock, LogIn } from 'lucide-vue-next'

// Composables
const authStore = useAuthStore()

// Computed
const isAuthenticated = computed(() => authStore.isAuthenticated)

// Lifecycle
onMounted(async () => {
  // Ensure auth is checked
  if (!authStore.isInitialized) {
    await authStore.checkAuth()
  }
})
</script>
