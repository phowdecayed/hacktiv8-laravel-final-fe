<template>
  <div class="space-y-4">
    <!-- Cart Summary Details -->
    <div class="space-y-2 text-sm">
      <div class="flex justify-between">
        <span class="text-muted-foreground">Subtotal</span>
        <span>{{ getFormattedTotal() }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-muted-foreground">Shipping</span>
        <span>Free</span>
      </div>
      <div class="flex justify-between">
        <span class="text-muted-foreground">Taxes</span>
        <span>Calculated at checkout</span>
      </div>
      <Separator class="my-2" />
      <div class="flex justify-between font-semibold text-base">
        <span>Order Total</span>
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
        @click="isConfirmOpen = true"
      >
        <Trash2 class="w-4 h-4 mr-2" />
        Clear Cart
      </Button>
    </div>

    <!-- Confirmation Dialog for Clearing Cart -->
    <ConfirmationDialog
      v-model:is-open="isConfirmOpen"
      title="Are you absolutely sure?"
      description="This action cannot be undone. This will permanently remove all items from your cart."
      confirm-text="Yes, clear cart"
      @confirm="handleClearCart"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ShoppingCart, Trash2 } from 'lucide-vue-next'
import { useCart } from '@/composables/useCart'
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue'

interface Props {
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
})

const router = useRouter()
const { isEmpty, isLoading, getFormattedTotal, clearCart } = useCart()
const isConfirmOpen = ref(false)

const proceedToCheckout = () => {
  router.push('/checkout')
}

const handleClearCart = async () => {
  await clearCart()
  isConfirmOpen.value = false
}
</script>
