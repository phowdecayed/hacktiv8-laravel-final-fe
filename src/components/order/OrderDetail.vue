<template>
  <div v-if="order" class="space-y-6">
    <!-- Order Header -->
    <div class="bg-white rounded-lg border p-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold mb-2">Order #{{ order.id }}</h1>
          <div class="flex items-center gap-4 text-sm text-gray-600">
            <div class="flex items-center gap-1">
              <Calendar class="w-4 h-4" />
              <span>Placed on {{ formatDate(order.created_at) }}</span>
            </div>
            <div class="flex items-center gap-1">
              <Package class="w-4 h-4" />
              <span
                >{{ getOrderItemCount(order) }} item{{
                  getOrderItemCount(order) !== 1 ? 's' : ''
                }}</span
              >
            </div>
          </div>
        </div>

        <div class="text-right">
          <Badge :class="getOrderStatusInfo(order.status).color" class="mb-2">
            {{ getOrderStatusInfo(order.status).label }}
          </Badge>
          <p class="text-2xl font-bold">{{ formatOrderTotal(order.total_amount) }}</p>
        </div>
      </div>

      <!-- Order Status Timeline -->
      <div class="border-t pt-6">
        <h3 class="font-semibold mb-4">Order Status</h3>
        <div class="flex items-center justify-between">
          <div
            v-for="(status, index) in statusTimeline"
            :key="status.key"
            class="flex flex-col items-center flex-1"
          >
            <!-- Status Icon -->
            <div
              :class="[
                'w-10 h-10 rounded-full flex items-center justify-center mb-2',
                status.completed
                  ? 'bg-green-100 text-green-600'
                  : status.current
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-400',
              ]"
            >
              <CheckCircle v-if="status.completed" class="w-5 h-5" />
              <Clock v-else-if="status.current" class="w-5 h-5" />
              <Circle v-else class="w-5 h-5" />
            </div>

            <!-- Status Label -->
            <span
              :class="[
                'text-xs text-center',
                status.completed || status.current ? 'text-gray-900 font-medium' : 'text-gray-500',
              ]"
            >
              {{ status.label }}
            </span>

            <!-- Connecting Line -->
            <div
              v-if="index < statusTimeline.length - 1"
              :class="[
                'absolute h-0.5 top-5 transform translate-y-0.5',
                'w-full max-w-[calc(100%-2.5rem)]',
                status.completed ? 'bg-green-300' : 'bg-gray-200',
              ]"
              :style="{ left: `${(100 / statusTimeline.length) * (index + 0.5)}%` }"
            />
          </div>
        </div>

        <!-- Status Description -->
        <div class="mt-4 p-3 bg-gray-50 rounded-md">
          <p class="text-sm text-gray-700">
            {{ getOrderStatusInfo(order.status).description }}
          </p>
        </div>
      </div>
    </div>

    <!-- Order Items -->
    <div class="bg-white rounded-lg border p-6">
      <h2 class="text-lg font-semibold mb-4">Order Items</h2>

      <div class="space-y-4">
        <div
          v-for="item in order.items"
          :key="item.id"
          class="flex items-center space-x-4 py-4 border-b last:border-b-0"
        >
          <!-- Product Image -->
          <div class="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
            <img
              v-if="item.product.images?.[0]"
              :src="item.product.images[0].image_path"
              :alt="item.product.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
              <Package class="w-6 h-6" />
            </div>
          </div>

          <!-- Product Details -->
          <div class="flex-1 min-w-0">
            <h3 class="font-medium text-gray-900 truncate">
              <RouterLink
                :to="`/products/${item.product.id}`"
                class="hover:text-blue-600 transition-colors"
              >
                {{ item.product.name }}
              </RouterLink>
            </h3>
            <p class="text-sm text-gray-500 mt-1">
              {{ item.product.description?.substring(0, 100)
              }}{{ item.product.description && item.product.description.length > 100 ? '...' : '' }}
            </p>
            <div class="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span>{{ formatPrice(item.price) }} each</span>
              <span>Quantity: {{ item.quantity }}</span>
            </div>
          </div>

          <!-- Item Total -->
          <div class="text-right">
            <p class="font-semibold text-gray-900">{{ formatPrice(item.total) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Summary -->
    <div class="bg-white rounded-lg border p-6">
      <h2 class="text-lg font-semibold mb-4">Order Summary</h2>

      <div class="space-y-3">
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">Subtotal ({{ getOrderItemCount(order) }} items)</span>
          <span>{{ formatOrderTotal(order.total_amount) }}</span>
        </div>

        <!-- Future: Add shipping, tax, discounts here -->

        <div class="border-t pt-3">
          <div class="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>{{ formatOrderTotal(order.total_amount) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Notes -->
    <div v-if="order.notes" class="bg-white rounded-lg border p-6">
      <h2 class="text-lg font-semibold mb-4">Order Notes</h2>
      <p class="text-gray-700">{{ order.notes }}</p>
    </div>

    <!-- Customer Information -->
    <div class="bg-white rounded-lg border p-6">
      <h2 class="text-lg font-semibold mb-4">Customer Information</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 class="font-medium text-gray-900 mb-2">Contact Details</h3>
          <div class="space-y-1 text-sm text-gray-600">
            <p>{{ order.user.name }}</p>
            <p>{{ order.user.email }}</p>
          </div>
        </div>

        <!-- Future: Add billing/shipping address here -->
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-col sm:flex-row gap-3">
      <Button variant="outline" @click="$router.push('/orders')">
        <ArrowLeft class="w-4 h-4 mr-2" />
        Back to Orders
      </Button>

      <Button variant="outline" @click="$router.push('/products')">
        <ShoppingBag class="w-4 h-4 mr-2" />
        Continue Shopping
      </Button>

      <!-- Future: Add reorder, cancel, return buttons based on status -->
    </div>
  </div>

  <!-- Loading State -->
  <div v-else-if="isLoading" class="flex items-center justify-center py-12">
    <Loader2 class="w-8 h-8 animate-spin text-gray-400" />
    <span class="ml-2 text-gray-600">Loading order details...</span>
  </div>

  <!-- Error State -->
  <div v-else class="text-center py-12">
    <AlertCircle class="w-16 h-16 text-red-400 mx-auto mb-4" />
    <h2 class="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
    <p class="text-gray-600 mb-6">
      The order you're looking for doesn't exist or you don't have permission to view it.
    </p>
    <Button @click="$router.push('/orders')">
      <ArrowLeft class="w-4 h-4 mr-2" />
      Back to Orders
    </Button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useOrders } from '@/composables/useOrders'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Package,
  CheckCircle,
  Clock,
  Circle,
  ArrowLeft,
  ShoppingBag,
  Loader2,
  AlertCircle,
} from 'lucide-vue-next'
import type { TransactionStatus } from '@/types/api'

// Props
interface Props {
  orderId?: number
}

const props = defineProps<Props>()

// Composables
const {
  currentOrder: order,
  isLoading,
  getOrderStatusInfo,
  formatOrderTotal,
  getOrderItemCount,
} = useOrders()

// Computed
const statusTimeline = computed(() => {
  if (!order.value) return []

  const allStatuses: { key: TransactionStatus; label: string }[] = [
    { key: 'pending', label: 'Order Placed' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'completed', label: 'User Review' },
  ]

  const currentStatus = order.value.status
  const currentIndex = allStatuses.findIndex((s) => s.key === currentStatus)

  // Handle cancelled/refunded orders
  if (currentStatus === 'cancelled' || currentStatus === 'refunded') {
    return [
      { key: 'pending', label: 'Order Placed', completed: true, current: false },
      {
        key: currentStatus,
        label: currentStatus === 'cancelled' ? 'Cancelled' : 'Refunded',
        completed: false,
        current: true,
      },
    ]
  }

  return allStatuses.map((status, index) => ({
    ...status,
    completed: index < currentIndex,
    current: index === currentIndex,
  }))
})

// Methods
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatPrice = (price: string): string => {
  const numPrice = parseFloat(price)
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numPrice)
}
</script>
