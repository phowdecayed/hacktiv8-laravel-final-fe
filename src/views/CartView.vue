<template>
  <div class="max-w-6xl mx-auto">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold">Shopping Cart</h1>
      <p class="text-muted-foreground mt-2">Review your items and proceed to checkout</p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && !isInitialized" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"
        ></div>
        <p class="text-muted-foreground">Loading your cart...</p>
      </div>
    </div>

    <!-- Empty Cart State -->
    <div v-else-if="isEmpty" class="text-center py-12">
      <ShoppingCart class="w-24 h-24 mx-auto text-muted-foreground mb-6" />
      <h2 class="text-2xl font-semibold mb-4">Your cart is empty</h2>
      <p class="text-muted-foreground mb-8 max-w-md mx-auto">
        Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
      </p>
      <div class="space-y-4">
        <Button size="lg" @click="continueShopping">
          <ArrowLeft class="w-4 h-4 mr-2" />
          Continue Shopping
        </Button>
        <div class="text-sm text-muted-foreground">
          <RouterLink to="/products" class="text-primary hover:underline">
            Browse our products
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- Cart Content -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Cart Items -->
      <div class="lg:col-span-2">
        <Card>
          <CardHeader class="flex flex-row items-center justify-between">
            <CardTitle class="flex items-center gap-2">
              <ShoppingCart class="w-5 h-5" />
              Cart Items
              <Badge variant="secondary">{{ itemCount }}</Badge>
            </CardTitle>

            <!-- Batch Actions -->
            <div class="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                :disabled="isLoading || selectedItems.length === 0"
                @click="removeSelectedItems"
              >
                <Trash2 class="w-4 h-4 mr-2" />
                Remove Selected ({{ selectedItems.length }})
              </Button>

              <Button variant="outline" size="sm" :disabled="isLoading" @click="handleClearCart">
                <X class="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          </CardHeader>

          <CardContent class="space-y-0">
            <!-- Select All -->
            <div class="flex items-center gap-3 py-4 border-b">
              <Checkbox :checked="allItemsSelected" @update:checked="toggleSelectAll" />
              <span class="text-sm font-medium">Select All</span>
            </div>

            <!-- Cart Items List -->
            <div class="space-y-0">
              <div
                v-for="item in items"
                :key="item.id"
                class="flex items-start gap-4 py-6 border-b border-border last:border-b-0"
              >
                <!-- Selection Checkbox -->
                <Checkbox
                  :checked="selectedItems.includes(item.id)"
                  @update:checked="(checked: boolean) => toggleItemSelection(item.id, checked)"
                  class="mt-2"
                />

                <!-- Product Image -->
                <div class="flex-shrink-0">
                  <img
                    :src="item.product.images?.[0]?.image_path || '/placeholder-product.jpg'"
                    :alt="item.product.name"
                    class="w-20 h-20 object-cover rounded-lg"
                  />
                </div>

                <!-- Product Details -->
                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <h3 class="font-semibold text-lg mb-1">
                        <RouterLink
                          :to="`/products/${item.product.id}`"
                          class="hover:text-primary transition-colors"
                        >
                          {{ item.product.name }}
                        </RouterLink>
                      </h3>

                      <p class="text-muted-foreground text-sm mb-2">
                        {{ formatPrice(item.price) }} each
                      </p>

                      <!-- Stock Warning -->
                      <div v-if="item.product.stock <= 5" class="flex items-center gap-1 mb-2">
                        <AlertTriangle class="w-4 h-4 text-orange-500" />
                        <span class="text-xs text-orange-600">
                          Only {{ item.product.stock }} left in stock
                        </span>
                      </div>

                      <!-- Out of Stock Warning -->
                      <div v-if="item.product.stock === 0" class="flex items-center gap-1 mb-2">
                        <AlertCircle class="w-4 h-4 text-red-500" />
                        <span class="text-xs text-red-600"> Out of stock </span>
                      </div>
                    </div>

                    <!-- Item Total -->
                    <div class="text-right">
                      <p class="font-semibold text-lg">
                        {{ formatPrice(item.total) }}
                      </p>
                    </div>
                  </div>

                  <!-- Quantity Controls and Actions -->
                  <div class="flex items-center justify-between mt-4">
                    <div class="flex items-center gap-3">
                      <span class="text-sm text-muted-foreground">Quantity:</span>
                      <div class="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          :disabled="isLoading || item.quantity <= 1"
                          @click="updateQuantity(item.id, item.quantity - 1)"
                          class="h-8 w-8 p-0"
                        >
                          <Minus class="h-3 w-3" />
                        </Button>

                        <span class="w-12 text-center font-medium">
                          {{ item.quantity }}
                        </span>

                        <Button
                          variant="outline"
                          size="sm"
                          :disabled="isLoading || item.quantity >= item.product.stock"
                          @click="updateQuantity(item.id, item.quantity + 1)"
                          class="h-8 w-8 p-0"
                        >
                          <Plus class="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      :disabled="isLoading"
                      @click="removeItem(item.id)"
                      class="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 class="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Order Summary -->
      <div class="lg:col-span-1">
        <div class="sticky top-24">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <CartSummary :show-actions="false" />

              <!-- Validation Messages -->
              <div v-if="validationErrors.length > 0" class="mt-4 space-y-2">
                <Alert variant="destructive">
                  <AlertCircle class="h-4 w-4" />
                  <AlertTitle>Cart Issues</AlertTitle>
                  <AlertDescription>
                    <ul class="list-disc list-inside space-y-1">
                      <li v-for="error in validationErrors" :key="error">
                        {{ error }}
                      </li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>

              <!-- Checkout Button -->
              <div class="mt-6">
                <Button
                  class="w-full"
                  size="lg"
                  :disabled="isEmpty || isLoading || validationErrors.length > 0"
                  @click="proceedToCheckout"
                >
                  <CreditCard class="w-4 h-4 mr-2" />
                  Proceed to Checkout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  ShoppingCart,
  ArrowLeft,
  Trash2,
  X,
  Minus,
  Plus,
  AlertTriangle,
  AlertCircle,
  CreditCard,
} from 'lucide-vue-next'
import { useCart } from '@/composables/useCart'
import CartSummary from '@/components/cart/CartSummary.vue'

const router = useRouter()
const {
  items,
  itemCount,
  isEmpty,
  isLoading,
  isInitialized,
  updateQuantity,
  removeItem,
  clearCart,
  removeMultipleItems,
  formatPrice,
} = useCart()

// Local state
const selectedItems = ref<number[]>([])
const validationErrors = ref<string[]>([])

// Computed properties
const allItemsSelected = computed(() => {
  return items.value.length > 0 && selectedItems.value.length === items.value.length
})

// Methods
const toggleSelectAll = (checked: boolean) => {
  if (checked) {
    selectedItems.value = items.value.map((item) => item.id)
  } else {
    selectedItems.value = []
  }
}

const toggleItemSelection = (itemId: number, checked: boolean) => {
  if (checked) {
    selectedItems.value.push(itemId)
  } else {
    selectedItems.value = selectedItems.value.filter((id) => id !== itemId)
  }
}

const removeSelectedItems = async () => {
  if (selectedItems.value.length === 0) return

  const count = selectedItems.value.length
  const confirmed = confirm(`Are you sure you want to remove ${count} item(s) from your cart?`)

  if (confirmed) {
    const success = await removeMultipleItems(selectedItems.value)
    if (success) {
      selectedItems.value = []
    }
  }
}

const handleClearCart = async () => {
  const confirmed = confirm('Are you sure you want to clear your entire cart?')
  if (confirmed) {
    const success = await clearCart()
    if (success) {
      selectedItems.value = []
    }
  }
}

const continueShopping = () => {
  router.push('/products')
}

const proceedToCheckout = async () => {
  router.push('/checkout')
}

// Lifecycle
onMounted(async () => {
  // No validation on mount
})
</script>
