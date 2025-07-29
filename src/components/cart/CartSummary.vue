<template>
  <div class="space-y-4">
    <!-- Cart Summary -->
    <div class="space-y-2">
      <div class="flex justify-between text-sm">
        <span class="text-muted-foreground">Items ({{ itemCount }})</span>
        <span>{{ getFormattedTotal() }}</span>
      </div>

      <Separator />

      <div class="flex justify-between font-medium">
        <span>Total</span>
        <span>{{ getFormattedTotal() }}</span>
      </div>
    </div>

    <!-- Action Buttons -->
    <div v-if="showActions" class="space-y-2">
      <Button class="w-full" :disabled="isEmpty || isLoading" @click="proceedToCheckout">
        <ShoppingCart class="w-4 h-4 mr-2" />
        Proceed to Checkout
      </Button>

      <Button
        variant="outline"
        class="w-full"
        :disabled="isEmpty || isLoading"
        @click="handleClearCart"
      >
        Clear Cart
      </Button>
    </div>

    <!-- Empty Cart State -->
    <div v-if="isEmpty" class="text-center py-8">
      <ShoppingCart class="w-12 h-12 mx-auto text-muted-foreground mb-4" />
      <h3 class="font-medium text-lg mb-2">Your cart is empty</h3>
      <p class="text-muted-foreground mb-4">Add some products to get started</p>
      <Button @click="continueShopping"> Continue Shopping </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ShoppingCart } from 'lucide-vue-next'
import { useCart } from '@/composables/useCart'
import { useRouter } from 'vue-router'

interface Props {
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
})

const router = useRouter()
const { itemCount, isEmpty, isLoading, getFormattedTotal, clearCart } = useCart()

const proceedToCheckout = () => {
  router.push('/checkout')
}

const continueShopping = () => {
  router.push('/products')
}

const handleClearCart = async () => {
  if (confirm('Are you sure you want to clear your cart?')) {
    await clearCart()
  }
}
</script>
