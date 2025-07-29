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

    <SheetContent side="right" class="w-full sm:max-w-lg">
      <SheetHeader>
        <SheetTitle class="flex items-center gap-2">
          <ShoppingCart class="h-5 w-5" />
          Shopping Cart
          <span v-if="itemCount > 0" class="text-muted-foreground">
            ({{ itemCount }} {{ itemCount === 1 ? 'item' : 'items' }})
          </span>
        </SheetTitle>
      </SheetHeader>

      <div class="flex flex-col h-full">
        <!-- Loading State -->
        <div v-if="isLoading && !isInitialized" class="flex-1 flex items-center justify-center">
          <div class="text-center">
            <div
              class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"
            ></div>
            <p class="text-muted-foreground">Loading cart...</p>
          </div>
        </div>

        <!-- Empty Cart -->
        <div v-else-if="isEmpty" class="flex-1 flex items-center justify-center">
          <div class="text-center">
            <ShoppingCart class="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 class="font-medium text-lg mb-2">Your cart is empty</h3>
            <p class="text-muted-foreground mb-4">Add some products to get started</p>
            <Button @click="continueShopping" class="w-full"> Continue Shopping </Button>
          </div>
        </div>

        <!-- Cart Items -->
        <div v-else class="flex flex-col h-full">
          <!-- Items List -->
          <ScrollArea class="flex-1 -mx-6 px-6">
            <div class="space-y-0">
              <CartItem v-for="item in items" :key="item.id" :item="item" />
            </div>
          </ScrollArea>

          <!-- Cart Summary -->
          <div class="border-t pt-4 mt-4">
            <CartSummary />
          </div>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ShoppingCart } from 'lucide-vue-next'
import { useCart } from '@/composables/useCart'
import CartItem from './CartItem.vue'
import CartSummary from './CartSummary.vue'

const router = useRouter()
const isOpen = ref(false)

const { items, itemCount, isEmpty, isLoading, isInitialized } = useCart()

const continueShopping = () => {
  isOpen.value = false
  router.push('/products')
}
</script>
