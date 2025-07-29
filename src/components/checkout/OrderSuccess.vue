<template>
  <div class="max-w-2xl mx-auto text-center py-12">
    <!-- Success Icon -->
    <div class="mb-6">
      <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle class="w-8 h-8 text-green-600" />
      </div>
    </div>

    <!-- Success Message -->
    <h1 class="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
    <p class="text-gray-600 mb-8">
      Thank you for your purchase. Your order has been received and is being processed.
    </p>

    <!-- Order Details Card -->
    <div v-if="order" class="bg-white rounded-lg border p-6 mb-8 text-left">
      <h2 class="text-lg font-semibold mb-4">Order Details</h2>

      <div class="space-y-3">
        <div class="flex justify-between">
          <span class="text-gray-600">Order ID:</span>
          <span class="font-medium">#{{ order.id }}</span>
        </div>

        <div class="flex justify-between">
          <span class="text-gray-600">Order Date:</span>
          <span class="font-medium">{{ formatDate(order.created_at) }}</span>
        </div>

        <div class="flex justify-between">
          <span class="text-gray-600">Status:</span>
          <Badge :class="getOrderStatusInfo(order.status).color">
            {{ getOrderStatusInfo(order.status).label }}
          </Badge>
        </div>

        <div class="flex justify-between">
          <span class="text-gray-600">Total Amount:</span>
          <span class="font-semibold text-lg">{{ formatPrice(order.total_amount) }}</span>
        </div>

        <div class="flex justify-between">
          <span class="text-gray-600">Items:</span>
          <span class="font-medium"
            >{{ getOrderItemCount(order) }} item{{
              getOrderItemCount(order) !== 1 ? 's' : ''
            }}</span
          >
        </div>

        <div v-if="order.notes" class="pt-3 border-t">
          <span class="text-gray-600 block mb-1">Notes:</span>
          <p class="text-sm text-gray-800">{{ order.notes }}</p>
        </div>
      </div>
    </div>

    <!-- Order Items -->
    <div v-if="order?.items" class="bg-white rounded-lg border p-6 mb-8 text-left">
      <h3 class="text-lg font-semibold mb-4">Order Items</h3>

      <div class="space-y-4">
        <div
          v-for="item in order.items"
          :key="item.id"
          class="flex items-center space-x-4 py-3 border-b last:border-b-0"
        >
          <div class="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-md overflow-hidden">
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

          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-medium text-gray-900 truncate">
              {{ item.product.name }}
            </h4>
            <p class="text-sm text-gray-500">{{ formatPrice(item.price) }} × {{ item.quantity }}</p>
          </div>

          <div class="text-sm font-medium text-gray-900">
            {{ formatPrice(item.total) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Next Steps -->
    <div class="bg-blue-50 rounded-lg p-6 mb-8 text-left">
      <h3 class="text-lg font-semibold text-blue-900 mb-3">What's Next?</h3>
      <ul class="space-y-2 text-sm text-blue-800">
        <li class="flex items-start">
          <Clock class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
          <span>Your order is being processed and will be prepared for shipment</span>
        </li>
        <li class="flex items-start">
          <Mail class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
          <span>You'll receive email updates about your order status</span>
        </li>
        <li class="flex items-start">
          <Truck class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
          <span>Track your order progress in your order history</span>
        </li>
      </ul>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-col sm:flex-row gap-3 justify-center">
      <Button variant="outline" @click="router.push('/orders')">
        <FileText class="w-4 h-4 mr-2" />
        View Order History
      </Button>

      <Button @click="router.push('/products')">
        <ShoppingBag class="w-4 h-4 mr-2" />
        Continue Shopping
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useOrders } from '@/composables/useOrders'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Package, Clock, Mail, Truck, FileText, ShoppingBag } from 'lucide-vue-next'
import type { Transaction } from '@/types/api'

// Props
interface Props {
  orderId?: number
}

const props = defineProps<Props>()

// Router
const router = useRouter()

// Composables
const { currentOrder, getOrderStatusInfo, formatOrderTotal, getOrderItemCount } = useOrders()

// Computed
const order = computed(() => currentOrder.value)

// Methods
const formatPrice = (price: string): string => {
  const numPrice = parseFloat(price)
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numPrice)
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
