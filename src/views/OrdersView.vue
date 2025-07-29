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
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PageLayout from '@/components/layout/PageLayout.vue'
import OrderHistory from '@/components/order/OrderHistory.vue'
import OrderFilters from '@/components/order/OrderFilters.vue' // New component
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
  hasOrders,
  fetchOrders,
  updateFilters,
  clearFilters,
  goToPage,
  clearError,
} = useOrders()

const isAuthenticated = computed(() => authStore.isAuthenticated)

// Local state for filters, mirroring useOrders composable
const filters = reactive<OrderFiltersType>({
  status: 'all',
  sort_by: 'created_at',
  sort_order: 'desc',
  page: 1,
  per_page: 10,
})

// Computed properties
const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, pagination.value.current_page - 2)
  const end = Math.min(pagination.value.last_page, pagination.value.current_page + 2)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// Methods
const handleFiltersUpdate = async (newFilters: Partial<OrderFiltersType>) => {
  Object.assign(filters, newFilters)
  filters.page = 1 // Always reset to page 1 on filter change
  await fetchOrders(filters)
  updateUrlParams()
}

const handleClearFilters = async () => {
  filters.status = 'all'
  filters.sort_by = 'created_at'
  filters.sort_order = 'desc'
  filters.page = 1
  filters.per_page = 10
  await fetchOrders(filters)
  updateUrlParams()
}

const handleRetry = async () => {
  clearError()
  await fetchOrders(filters)
}

const handleEmptyAction = () => {
  handleClearFilters()
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
    Object.assign(filters, urlFilters)
  }
}

// Lifecycle
onMounted(async () => {
  if (!authStore.isInitialized) {
    await authStore.checkAuth()
  }
  if (isAuthenticated.value) {
    loadFiltersFromUrl()
    await fetchOrders(filters)
  }
})

// Watch for route changes to update filters and fetch orders
watch(
  () => route.query,
  async () => {
    if (isAuthenticated.value) {
      loadFiltersFromUrl()
      await fetchOrders(filters)
    }
  },
)

// Watch for authentication status changes
watch(isAuthenticated, async (newVal) => {
  if (newVal) {
    loadFiltersFromUrl()
    await fetchOrders(filters)
  } else {
    orders.value = [] // Clear orders if user logs out
  }
})
</script>