<template>
  <Sheet v-model:open="isOpen">
    <SheetTrigger as-child>
      <Button variant="outline" size="sm" class="relative">
        <ShoppingCart class="h-4 w-4" />
        <Badge
          v-if="itemCount > 0"
          variant="destructive"
          class="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {{ itemCount > 99 ? '99+' : itemCount }}
        </Badge>
      </Button>
    </SheetTrigger>

    <SheetContent class="flex flex-col gap-6 sm:max-w-lg">
      <SheetHeader>
        <SheetTitle class="flex items-center gap-2">
          <ShoppingCart class="h-5 w-5" />
          <span>Shopping Cart</span>
          <Badge v-if="itemCount > 0" variant="secondary" class="ml-2">
            {{ itemCount }} {{ itemCount === 1 ? 'item' : 'items' }}
          </Badge>
        </SheetTitle>
        <SheetDescription> Review your items and proceed to checkout. </SheetDescription>
      </SheetHeader>

      <!-- Stock Validation Warning -->
      <Alert v-if="hasStockIssues" variant="destructive" class="mt-4">
        <AlertTriangle class="h-4 w-4" />
        <AlertDescription>
          Some items in your cart have insufficient stock. Please review your cart before proceeding.
        </AlertDescription>
      </Alert>

      <!-- Main Content -->
      <div class="flex-1 overflow-y-auto mx-2 min-h-0">
        <!-- Loading State -->
        <div v-if="isLoading && !isInitialized" class="flex h-full items-center justify-center">
          <div class="text-center space-y-2">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p class="text-muted-foreground">Loading cart...</p>
          </div>
        </div>

        <!-- Empty Cart -->
        <div v-else-if="isEmpty" class="flex h-full items-center justify-center px-6">
          <div class="text-center space-y-4">
            <ShoppingCart class="w-16 h-16 mx-auto text-muted-foreground" />
            <div>
              <h3 class="font-medium text-lg">Your cart is empty</h3>
              <p class="text-muted-foreground text-sm">Add some products to get started.</p>
            </div>
            <Button @click="continueShopping" class="w-full"> Continue Shopping </Button>
          </div>
        </div>

        <!-- Cart Items -->
        <div v-else class="px-6 divide-y">
          <CartItem v-for="item in items" :key="item.id" :item="item" />
        </div>
      </div>

      <!-- Footer with Summary -->
      <SheetFooter v-if="!isEmpty" class="mt-auto border-t pt-6">
        <CartSummary />
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, AlertTriangle } from 'lucide-vue-next'
import { useCart } from '@/composables/useCart'
import CartItem from './CartItem.vue'
import CartSummary from './CartSummary.vue'

const router = useRouter()
const isOpen = ref(false)

const {
  items,
  itemCount,
  isEmpty,
  isLoading,
  isInitialized,
  validateStock,
  hasStockIssues,
} = useCart()

watch(isOpen, (newVal) => {
  if (newVal && !isEmpty.value) {
    validateStock()
  }
})

const continueShopping = () => {
  isOpen.value = false
  router.push('/products')
}
</script>
