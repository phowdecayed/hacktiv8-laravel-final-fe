<template>
  <div class="space-y-4">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <Loader2 class="w-8 h-8 animate-spin text-gray-400" />
      <span class="ml-2 text-gray-600">Loading orders...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <CircleAlert class="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-gray-900 mb-2">Error loading orders</h3>
      <p class="text-gray-600 mb-6">{{ error }}</p>
      <Button @click="emit('retry')">
        <RefreshCw class="w-4 h-4 mr-2" />
        Retry
      </Button>
    </div>

    <!-- Empty State -->
    <div v-else-if="orders.length === 0" class="text-center py-12">
      <Package class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
      <p class="text-gray-600 mb-6">
        You haven't placed any orders yet or no orders match your current filter.
      </p>
      <Button @click="emit('empty-action')">
        <ShoppingBag class="w-4 h-4 mr-2" />
        Start Shopping
      </Button>
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
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useOrders } from '@/composables/useOrders'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Package,
  FileText,
  Eye,
  ShoppingBag,
  Loader2,
  CircleAlert,
  RefreshCw,
} from 'lucide-vue-next'
import type { Transaction } from '@/types/api'

interface Props {
  orders: Transaction[]
  isLoading: boolean
  error: string | null
}

const props = defineProps<Props>()
const emit = defineEmits(['retry', 'empty-action'])

// Router
const router = useRouter()

// Composables
const {
  getOrderStatusInfo,
  formatOrderTotal,
  getOrderItemCount,
} = useOrders()

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

const viewOrderDetails = (orderId: number) => {
  router.push(`/orders/${orderId}`)
}
</script>