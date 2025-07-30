<template>
  <PageLayout title="Order History" description="Track and manage your orders">
    <template v-if="!isAuthenticated">
      <div class="text-center py-12">
        <Lock class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
        <p class="text-gray-600 mb-6">Please log in to view your order history</p>
        <Button @click="$router.push('/login')">
          <LogIn class="w-4 h-4 mr-2" />
          Log In
        </Button>
      </div>
    </template>
    <template v-else>
      <!-- Desktop Filters -->
      <div class="hidden md:block">
        <OrderFilters
          :filters="filters"
          :total-results="pagination.total"
          :is-loading="isLoading"
          @update:filters="handleFiltersUpdate"
          @clear-filters="handleClearFilters"
        />
      </div>

      <!-- Mobile Filters (if needed, can be added later) -->
      <!-- <div class="md:hidden">
        <MobileOrderFilters
          :filters="filters"
          @update:filters="handleFiltersUpdate"
          @clear-filters="handleClearFilters"
        />
      </div> -->

      <!-- Order History List -->
      <OrderHistory
        :orders="orders"
        :is-loading="isLoading"
        :error="error"
        @retry="handleRetry"
        @empty-action="handleEmptyAction"
      />

      <!-- Pagination -->
      <div v-if="hasOrders && !isLoading && pagination.last_page > 1" class="flex justify-center">
        <div class="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            :disabled="pagination.current_page <= 1 || isLoading"
            @click="goToPage(pagination.current_page - 1)"
          >
            <ChevronLeft class="w-4 h-4" />
            Previous
          </Button>

          <div class="flex items-center space-x-1">
            <Button
              v-for="page in visiblePages"
              :key="page"
              :variant="page === pagination.current_page ? 'default' : 'outline'"
              size="sm"
              @click="goToPage(page)"
            >
              {{ page }}
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            :disabled="pagination.current_page >= pagination.last_page || isLoading"
            @click="goToPage(pagination.current_page + 1)"
          >
            Next
            <ChevronRight class="w-4 h-4" />
          </Button>
        </div>
      </div>

      <!-- Results Summary -->
      <div v-if="hasOrders && !isLoading" class="text-center text-sm text-muted-foreground">
        Showing {{ (pagination.current_page - 1) * (filters.per_page || 10) + 1 }} to
        {{ Math.min(pagination.current_page * (filters.per_page || 10), pagination.total) }} of
        {{ pagination.total }} orders
      </div>
    </template>
  </PageLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PageLayout from '@/components/layout/PageLayout.vue'
import OrderHistory from '@/components/order/OrderHistory.vue'
import OrderFilters from '@/components/order/OrderFilters.vue'
import { Button } from '@/components/ui/button'
import { Lock, LogIn, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useOrders } from '@/composables/useOrders'
import type { OrderFilters as OrderFiltersType } from '@/stores/orders'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const {
  orders,
  isLoading,
  error,
  pagination,
  filters,
  hasOrders,
  fetchOrders,
  updateFilters,
  clearFilters,
  goToPage,
  clearError,
} = useOrders()

const isAuthenticated = computed(() => authStore.isAuthenticated)

// Computed properties
const visiblePages = computed(() => {
  if (!pagination.value) return []
  const pages = []
  const start = Math.max(1, pagination.value.current_page - 2)
  const end = Math.min(pagination.value.last_page, pagination.value.current_page + 2)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// Methods
const handleFiltersUpdate = (newFilters: Partial<OrderFiltersType>) => {
  updateFilters(newFilters)
  updateUrlParams()
}

const handleClearFilters = () => {
  clearFilters()
  updateUrlParams()
}

const handleRetry = () => {
  clearError()
  fetchOrders(filters)
}

const handleEmptyAction = () => {
  router.push('/products') // Example: redirect to products page
}

const handleGoToPage = (page: number) => {
  goToPage(page)
  updateUrlParams()
}

const updateUrlParams = () => {
  const query: Record<string, string> = {}

  if (filters.status && filters.status !== 'all') query.status = filters.status
  if (filters.sort_by) query.sort_by = filters.sort_by
  if (filters.sort_order) query.sort_order = filters.sort_order
  if (filters.page && filters.page > 1) query.page = filters.page.toString()
  if (filters.per_page && filters.per_page !== 10) query.per_page = filters.per_page.toString()

  router.replace({ query })
}

const loadFiltersFromUrl = () => {
  const query = route.query
  const urlFilters: Partial<OrderFiltersType> = {}

  if (query.status) urlFilters.status = query.status as OrderFiltersType['status']
  if (query.sort_by) urlFilters.sort_by = query.sort_by as OrderFiltersType['sort_by']
  if (query.sort_order) urlFilters.sort_order = query.sort_order as OrderFiltersType['sort_order']
  if (query.page) urlFilters.page = parseInt(query.page as string)
  if (query.per_page) urlFilters.per_page = parseInt(query.per_page as string)

  if (Object.keys(urlFilters).length > 0) {
    updateFilters(urlFilters)
  }
}

// Lifecycle
onMounted(async () => {
  if (!authStore.isInitialized) {
    await authStore.checkAuth()
  }
  if (isAuthenticated.value) {
    loadFiltersFromUrl()
    fetchOrders(filters)
  }
})

// Watch for route changes to update filters and fetch orders
watch(
  () => route.query,
  () => {
    if (isAuthenticated.value) {
      loadFiltersFromUrl()
    }
  },
)

// Watch for authentication status changes
watch(isAuthenticated, (newVal, oldVal) => {
  if (newVal && !oldVal) {
    loadFiltersFromUrl()
    fetchOrders(filters)
  } else if (!newVal) {
    // Optional: Clear orders if user logs out
    // This is handled by the store/composable, but you can add extra logic here
  }
})
</script>
