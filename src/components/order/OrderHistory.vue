<template>
  <div class="space-y-6">
    <!-- Header with Filters -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="text-2xl font-bold">Order History</h2>
        <p class="text-gray-600">Track and manage your orders</p>
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row gap-3">
        <Select v-model="filters.status" @update:model-value="applyFilters">
          <SelectTrigger class="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>

        <Select v-model="filters.sort_by" @update:model-value="applyFilters">
          <SelectTrigger class="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Order Date</SelectItem>
            <SelectItem value="total_amount">Total Amount</SelectItem>
          </SelectContent>
        </Select>

        <Select v-model="filters.sort_order" @update:model-value="applyFilters">
          <SelectTrigger class="w-full sm:w-[120px]">
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Newest First</SelectItem>
            <SelectItem value="asc">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && orders.length === 0" class="flex items-center justify-center py-12">
      <Loader2 class="w-8 h-8 animate-spin text-gray-400" />
      <span class="ml-2 text-gray-600">Loading orders...</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="orders.length === 0" class="text-center py-12">
      <Package class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
      <p class="text-gray-600 mb-6">
        {{
          filters.status
            ? 'No orders match your current filter.'
            : "You haven't placed any orders yet."
        }}
      </p>
      <div class="space-y-3">
        <Button v-if="filters.status" @click="clearFilters" variant="outline">
          Clear Filters
        </Button>
        <Button @click="$router.push('/products')">
          <ShoppingBag class="w-4 h-4 mr-2" />
          Start Shopping
        </Button>
      </div>
    </div>

    <!-- Orders List -->
    <div v-else class="space-y-4">
      <Card
        v-for="order in orders"
        :key="order.id"
        class="hover:shadow-md transition-shadow cursor-pointer"
        @click="viewOrderDetails(order.id)"
      >
        <CardContent class="p-6">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <!-- Order Info -->
            <div class="flex-1 space-y-2">
              <div class="flex items-center gap-3">
                <h3 class="font-semibold text-lg">Order #{{ order.id }}</h3>
                <Badge :class="getOrderStatusInfo(order.status).color">
                  {{ getOrderStatusInfo(order.status).label }}
                </Badge>
              </div>

              <div
                class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-600"
              >
                <div class="flex items-center gap-1">
                  <Calendar class="w-4 h-4" />
                  <span>{{ formatDate(order.created_at) }}</span>
                </div>

                <div class="flex items-center gap-1">
                  <Package class="w-4 h-4" />
                  <span
                    >{{ getOrderItemCount(order) }} item{{
                      getOrderItemCount(order) !== 1 ? 's' : ''
                    }}</span
                  >
                </div>

                <div v-if="order.notes" class="flex items-center gap-1">
                  <FileText class="w-4 h-4" />
                  <span class="truncate max-w-[200px]">{{ order.notes }}</span>
                </div>
              </div>
            </div>

            <!-- Order Total and Action -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div class="text-right">
                <p class="text-lg font-semibold">{{ formatOrderTotal(order.total_amount) }}</p>
                <p class="text-sm text-gray-500">
                  {{ getOrderStatusInfo(order.status).description }}
                </p>
              </div>

              <Button variant="outline" size="sm" @click.stop="viewOrderDetails(order.id)">
                <Eye class="w-4 h-4 mr-2" />
                View Details
              </Button>
            </div>
          </div>

          <!-- Order Items Preview -->
          <div v-if="order.items && order.items.length > 0" class="mt-4 pt-4 border-t">
            <div class="flex items-center gap-4 overflow-x-auto">
              <div
                v-for="item in order.items.slice(0, 3)"
                :key="item.id"
                class="flex items-center gap-2 flex-shrink-0"
              >
                <div class="w-10 h-10 bg-gray-100 rounded-md overflow-hidden">
                  <img
                    v-if="item.product.images?.[0]"
                    :src="item.product.images[0].image_path"
                    :alt="item.product.name"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                    <Package class="w-4 h-4" />
                  </div>
                </div>
                <div class="text-sm">
                  <p class="font-medium truncate max-w-[120px]">{{ item.product.name }}</p>
                  <p class="text-gray-500">×{{ item.quantity }}</p>
                </div>
              </div>

              <div v-if="order.items.length > 3" class="text-sm text-gray-500 flex-shrink-0">
                +{{ order.items.length - 3 }} more item{{ order.items.length - 3 !== 1 ? 's' : '' }}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.last_page > 1" class="flex justify-center">
      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="pagination.current_page <= 1 || isLoading"
          @click="loadPage(pagination.current_page - 1)"
        >
          <ChevronLeft class="w-4 h-4" />
          Previous
        </Button>

        <span class="text-sm text-gray-600 px-3">
          Page {{ pagination.current_page }} of {{ pagination.last_page }}
        </span>

        <Button
          variant="outline"
          size="sm"
          :disabled="pagination.current_page >= pagination.last_page || isLoading"
          @click="loadPage(pagination.current_page + 1)"
        >
          Next
          <ChevronRight class="w-4 h-4" />
        </Button>
      </div>
    </div>

    <!-- Load More Button (Alternative to pagination) -->
    <div v-if="canLoadMore && !isLoading" class="flex justify-center">
      <Button variant="outline" @click="loadMoreOrders"> Load More Orders </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrders } from '@/composables/useOrders'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Calendar,
  Package,
  FileText,
  Eye,
  ShoppingBag,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-vue-next'
import type { OrderFilters } from '@/stores/orders'
import type { TransactionStatus } from '@/types/api'

// Router
const router = useRouter()

// Composables
const {
  orders,
  isLoading,
  pagination,
  canLoadMore,
  fetchOrders,
  loadMoreOrders,
  getOrderStatusInfo,
  formatOrderTotal,
  getOrderItemCount,
} = useOrders()

// Local state
const filters = reactive<OrderFilters>({
  status: undefined,
  sort_by: 'created_at',
  sort_order: 'desc',
  page: 1,
  per_page: 10,
})

// Methods
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const applyFilters = async () => {
  filters.page = 1 // Reset to first page when filtering
  await fetchOrders(filters)
}

const clearFilters = async () => {
  filters.status = undefined
  filters.sort_by = 'created_at'
  filters.sort_order = 'desc'
  filters.page = 1
  await fetchOrders(filters)
}

const loadPage = async (page: number) => {
  filters.page = page
  await fetchOrders(filters)
}

const viewOrderDetails = (orderId: number) => {
  router.push(`/orders/${orderId}`)
}

// Lifecycle
onMounted(async () => {
  await fetchOrders(filters)
})
</script>
