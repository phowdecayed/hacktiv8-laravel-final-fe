<template>
  <div class="flex items-center gap-4 py-4 border-b border-border last:border-b-0">
    <!-- Product Image -->
    <div class="flex-shrink-0">
      <img
        :src="item.product.images?.[0]?.image_path || '/placeholder-product.jpg'"
        :alt="item.product.name"
        class="w-16 h-16 object-cover rounded-md"
      />
    </div>

    <!-- Product Info -->
    <div class="flex-1 min-w-0">
      <h3 class="font-medium text-sm text-foreground truncate">
        {{ item.product.name }}
      </h3>
      <p class="text-sm text-muted-foreground mt-1">{{ formatPrice(item.price) }} each</p>
      <p v-if="item.product.stock <= 5" class="text-xs text-orange-600 mt-1">
        Only {{ item.product.stock }} left in stock
      </p>
    </div>

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
    <div class="text-right min-w-0">
      <p class="font-medium text-sm">
        {{ formatPrice(item.total) }}
      </p>
    </div>

    <!-- Remove Button -->
    <Button
      variant="ghost"
      size="sm"
      :disabled="isLoading"
      @click="removeFromCart"
      class="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
    >
      <X class="h-4 w-4" />
    </Button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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
