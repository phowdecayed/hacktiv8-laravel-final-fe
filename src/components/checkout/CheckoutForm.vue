<template>
  <div class="space-y-6">
    <!-- Order Summary -->
    <div class="bg-white rounded-lg border p-6">
      <h2 class="text-lg font-semibold mb-4">Order Summary</h2>

      <!-- Cart Items -->
      <div class="space-y-4 mb-6">
        <div
          v-for="item in cartItems"
          :key="item.id"
          class="flex items-center space-x-4 py-3 border-b last:border-b-0"
        >
          <div class="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
            <img
              v-if="item.product.image"
              :src="item.product.image"
              :alt="item.product.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
              <Package class="w-6 h-6" />
            </div>
          </div>

          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-medium text-gray-900 truncate">
              {{ item.product.name }}
            </h3>
            <p class="text-sm text-gray-500">
              {{ formatPrice(item.product.price) }} × {{ item.quantity }}
            </p>
          </div>

          <div class="text-sm font-medium text-gray-900">
            {{ formatPrice(item.total_price) }}
          </div>
        </div>
      </div>

      <!-- Order Total -->
      <div class="border-t pt-4">
        <div class="flex justify-between items-center">
          <span class="text-base font-medium text-gray-900">Total</span>
          <span class="text-lg font-semibold text-gray-900">
            {{ formatPrice(cartTotal) }}
          </span>
        </div>
        <p class="text-sm text-gray-500 mt-1">
          {{ cartItemCount }} item{{ cartItemCount !== 1 ? 's' : '' }}
        </p>
      </div>
    </div>

    <!-- Customer Notes -->
    <div class="bg-white rounded-lg border p-6">
      <h2 class="text-lg font-semibold mb-4">Order Notes (Optional)</h2>
      <Textarea
        v-model="notes"
        placeholder="Add any special instructions or notes for your order..."
        class="min-h-[100px]"
        :disabled="isCreatingOrder"
      />
    </div>

    <!-- Stock Validation Errors -->
    <Alert v-if="isValidationLoading" variant="default">
      <Loader2 class="h-4 w-4 animate-spin" />
      <AlertTitle>Validating stock...</AlertTitle>
      <AlertDescription>We are checking the availability of items in your cart.</AlertDescription>
    </Alert>

    <Alert v-if="hasStockIssues" variant="destructive">
      <AlertCircle class="h-4 w-4" />
      <AlertTitle>Stock Issues Found</AlertTitle>
      <AlertDescription>
        <ul class="list-disc list-inside space-y-1">
          <li
            v-for="item in stockValidation.filter((v) => v.cart_quantity > v.available_stock)"
            :key="item.product_id"
          >
            {{ item.name }}: Only {{ item.available_stock }} available, you have
            {{ item.cart_quantity }} in cart.
          </li>
        </ul>
        <p class="mt-2">Please go back to your cart to resolve these issues.</p>
      </AlertDescription>
    </Alert>

    <Alert v-if="validationErrors.length > 0" variant="destructive">
      <AlertCircle class="h-4 w-4" />
      <AlertTitle>Order Validation Failed</AlertTitle>
      <AlertDescription>
        <ul class="list-disc list-inside space-y-1">
          <li v-for="error in validationErrors" :key="error">{{ error }}</li>
        </ul>
      </AlertDescription>
    </Alert>

    <!-- Action Buttons -->
    <div class="flex flex-col sm:flex-row gap-3">
      <Button
        variant="outline"
        @click="$emit('back')"
        :disabled="isCreatingOrder"
        class="flex-1 sm:flex-none"
      >
        <ArrowLeft class="w-4 h-4 mr-2" />
        Back to Cart
      </Button>

      <Button
        @click="handlePlaceOrder"
        :disabled="
          isCreatingOrder || cartItems.length === 0 || hasStockIssues || isValidationLoading
        "
        class="flex-1"
      >
        <Loader2 v-if="isCreatingOrder" class="w-4 h-4 mr-2 animate-spin" />
        <CreditCard v-else class="w-4 h-4 mr-2" />
        {{ isCreatingOrder ? 'Processing...' : 'Place Order' }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useCart } from '@/composables/useCart'
import { useOrders } from '@/composables/useOrders'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Package, ArrowLeft, CreditCard, AlertCircle, Loader2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

// Emits
defineEmits<{
  back: []
  success: [orderId: number]
}>()

// Composables
const {
  items: cartItems,
  total: cartTotal,
  itemCount: cartItemCount,
  validateStock,
  hasStockIssues,
  stockValidation,
  isLoading: isCartLoading,
} = useCart()
const { createOrder, isCreatingOrder } = useOrders()

// State
const notes = ref('')
const validationErrors = ref<string[]>([])
const isValidationLoading = ref(false)

// Computed
const formatPrice = (price: number | string): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numPrice)
}

// Methods
const validateOrder = async (): Promise<boolean> => {
  validationErrors.value = []
  isValidationLoading.value = true

  console.log('validateOrder: cartItems.value.length =', cartItems.value.length)
  console.log('validateOrder: hasStockIssues.value (before validation) =', hasStockIssues.value)

  // Check if cart is empty
  if (cartItems.value.length === 0) {
    validationErrors.value.push('Your cart is empty')
    isValidationLoading.value = false
    return false
  }

  // Validate stock availability
  try {
    await validateStock()
    console.log('validateOrder: hasStockIssues.value (after validation) =', hasStockIssues.value)
    if (hasStockIssues.value) {
      validationErrors.value.push(
        'Some items in your cart have insufficient stock. Please adjust quantities.',
      )
      stockValidation.value.forEach((item) => {
        if (item.cart_quantity > item.available_stock) {
          validationErrors.value.push(
            `${item.name}: Only ${item.available_stock} available, you have ${item.cart_quantity} in cart.`,
          )
        }
      })
      return false
    }
  } catch (error) {
    console.error('Stock validation failed:', error)
    validationErrors.value.push('Failed to validate stock availability. Please try again.')
    return false
  } finally {
    isValidationLoading.value = false
  }

  return true
}

const handlePlaceOrder = async () => {
  if (hasStockIssues.value) {
    toast.error('Please resolve stock issues before placing an order.')
    return
  }

  // Re-validate just before placing the order
  const isValid = await validateOrder()
  if (!isValid) {
    toast.error('Please fix the validation errors before proceeding')
    return
  }

  try {
    const order = await createOrder({
      notes: notes.value.trim() || undefined,
    })

    if (order) {
      toast.success('Order placed successfully!')
      // The useOrders composable handles navigation and cart clearing
    }
  } catch (error) {
    console.error('Failed to place order:', error)
    // Error handling is done in the useOrders composable
  }
}

// Watch for changes in cart items and re-validate
watch(cartItems, () => {
  validateOrder()
})

// Lifecycle
onMounted(() => {
  // Initial validation
  validateOrder()
})
</script>
