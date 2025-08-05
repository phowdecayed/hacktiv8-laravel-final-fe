<template>
  <Card
    class="group cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-[0.98] select-none"
    :class="{ 'flex flex-row': variant === 'list', 'flex flex-col': variant === 'grid' }"
    @click="$emit('product-click', product)"
  >
    <div
      class="relative overflow-hidden"
      :class="{
        'w-48 h-48 flex-shrink-0': variant === 'list',
        'aspect-square w-full': variant === 'grid',
      }"
    >
      <img
        :src="getProductImage(product)"
        :alt="product.name"
        class="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
        loading="lazy"
      />
      <!-- Stock status overlay -->
      <div
        v-if="product.stock === 0"
        class="absolute inset-0 bg-black/50 flex items-center justify-center"
      >
        <Badge variant="destructive" class="text-sm font-medium"> Out of Stock </Badge>
      </div>

      <!-- Low stock warning -->
      <div v-else-if="product.stock <= 5" class="absolute top-2 right-2">
        <Badge variant="secondary" class="text-xs"> Only {{ product.stock }} left </Badge>
      </div>
    </div>

    <CardContent
      class="p-4 flex-1"
      :class="{ 'flex flex-col justify-between': variant === 'list' }"
    >
      <div class="space-y-2">
        <h3
          class="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors"
          :class="{ 'text-base': variant === 'list' }"
        >
          {{ product.name }}
        </h3>

        <p
          v-if="product.description && variant === 'list'"
          class="text-sm text-muted-foreground line-clamp-2"
        >
          {{ product.description }}
        </p>

        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <p class="text-lg font-bold text-primary">
              {{ formatPrice(product.price) }}
            </p>

            <div v-if="product.category" class="flex items-center gap-1">
              <Badge variant="outline" class="text-xs">
                {{ product.category.name }}
              </Badge>
            </div>
          </div>

          <div class="text-right">
            <p class="text-xs text-muted-foreground">Stock: {{ product.stock }}</p>
          </div>
        </div>
      </div>

      <div v-if="showActions" class="mt-4 flex gap-2" :class="{ 'mt-2': variant === 'grid' }">
        <Button
          size="sm"
          :disabled="product.stock === 0 || isAddingToCart"
          class="flex-1 min-h-[44px] active:scale-95 transition-transform"
          @click.stop="handleAddToCart"
        >
          <ShoppingCart class="w-4 h-4 mr-2" />
          {{ isAddingToCart ? 'Adding...' : 'Add to Cart' }}
        </Button>

        <Button
          size="sm"
          variant="outline"
          class="min-h-[44px] min-w-[44px] active:scale-95 transition-transform"
          @click.stop="$emit('product-details', product)"
        >
          <Eye class="w-4 h-4" />
        </Button>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Eye } from 'lucide-vue-next'
import type { Product } from '@/types/api'
import { useFallbackImages } from '@/composables/useFallbackImages'

interface Props {
  product: Product
  variant?: 'grid' | 'list'
  showActions?: boolean
}

interface Emits {
  (e: 'product-click', product: Product): void
  (e: 'product-details', product: Product): void
  (e: 'add-to-cart', product: Product): void
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'grid',
  showActions: true,
})

const emit = defineEmits<Emits>()

const { getProductImage } = useFallbackImages()

const isAddingToCart = ref(false)

const formatPrice = (price: string) => {
  const numPrice = parseFloat(price)
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numPrice)
}

const handleAddToCart = async () => {
  if (props.product.stock === 0) return

  try {
    isAddingToCart.value = true
    emit('add-to-cart', props.product)
  } finally {
    isAddingToCart.value = false
  }
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
