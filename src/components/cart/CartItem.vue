<template>
  <div class="flex items-start gap-4 py-4">
    <!-- Product Image -->
    <div class="flex-shrink-0">
      <img
        :src="item.product.image || '/placeholder-product.jpg'"
        :alt="item.product.name"
        class="w-20 h-20 object-cover rounded-md border"
      />
    </div>

    <!-- Content -->
    <div class="flex-1 flex flex-col gap-2">
      <!-- Top Row: Title and Remove Button -->
      <div class="flex justify-between items-start">
        <div class="flex-1 min-w-0 pr-2">
          <h3 class="font-medium text-sm text-foreground leading-tight line-clamp-2">
            {{ item.product.name }}
          </h3>
          <p v-if="item.product.stock <= 5" class="text-xs text-orange-600 mt-1">
            Only {{ item.product.stock }} left in stock
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          :disabled="isLoading"
          @click="removeFromCart"
          class="h-7 w-7 p-0 text-muted-foreground hover:text-destructive flex-shrink-0"
        >
          <X class="h-4 w-4" />
        </Button>
      </div>

      <!-- Bottom Row: Quantity and Price -->
      <div class="flex justify-between items-end">
        <!-- Quantity Controls -->
        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            :disabled="isLoading || item.quantity <= 1"
            @click="decrementQuantity"
            class="h-8 w-8 p-0"
          >
            <Minus class="h-3 w-3" />
          </Button>
          <span class="w-8 text-center text-sm font-medium">
            {{ item.quantity }}
          </span>
          <Button
            variant="outline"
            size="sm"
            :disabled="isLoading || item.quantity >= item.product.stock"
            @click="incrementQuantity"
            class="h-8 w-8 p-0"
          >
            <Plus class="h-3 w-3" />
          </Button>
        </div>

        <!-- Total Price -->
        <div class="text-right">
          <p class="font-semibold text-base">
            {{ formatPrice(item.total_price) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Minus, Plus, X } from 'lucide-vue-next'
import { useCart } from '@/composables/useCart'
import type { CartItem } from '@/types/api'

interface Props {
  item: CartItem
}

const props = defineProps<Props>()

const { updateQuantity, removeItem, isLoading, formatPrice } = useCart()

const incrementQuantity = async () => {
  await updateQuantity(props.item.id, props.item.quantity + 1)
}

const decrementQuantity = async () => {
  await updateQuantity(props.item.id, props.item.quantity - 1)
}

const removeFromCart = async () => {
  await removeItem(props.item.id)
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
