<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="i in skeletonCount" :key="i" class="space-y-3">
          <Skeleton class="aspect-square w-full rounded-lg" />
          <div class="space-y-2">
            <Skeleton class="h-4 w-3/4" />
            <Skeleton class="h-4 w-1/2" />
            <Skeleton class="h-6 w-1/3" />
          </div>
        </div>
      </div>
    </div>

    <!-- Products Grid -->
    <div v-else-if="hasProducts" class="space-y-4">
      <!-- View Toggle -->
      <div v-if="showViewToggle" class="flex justify-end">
        <div class="flex items-center border rounded-lg p-1">
          <Button
            size="sm"
            variant="ghost"
            :class="{ 'bg-muted': viewMode === 'grid' }"
            @click="$emit('view-mode-change', 'grid')"
          >
            <Grid3X3 class="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            :class="{ 'bg-muted': viewMode === 'list' }"
            @click="$emit('view-mode-change', 'list')"
          >
            <List class="w-4 h-4" />
          </Button>
        </div>
      </div>

      <!-- Grid Layout -->
      <div
        v-if="viewMode === 'grid'"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
          variant="grid"
          :show-actions="showActions"
          @click="$emit('product-click', product)"
          @view-details="$emit('product-details', product)"
          @add-to-cart="$emit('add-to-cart', product)"
        />
      </div>

      <!-- List Layout -->
      <div v-else class="space-y-4">
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
          variant="list"
          :show-actions="showActions"
          @click="$emit('product-click', product)"
          @view-details="$emit('product-details', product)"
          @add-to-cart="$emit('add-to-cart', product)"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <div class="flex flex-col items-center space-y-4">
        <div class="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
          <Package class="w-12 h-12 text-muted-foreground" />
        </div>
        <div class="space-y-2">
          <h3 class="text-lg font-semibold">{{ emptyTitle }}</h3>
          <p class="text-muted-foreground max-w-md">
            {{ emptyDescription }}
          </p>
        </div>
        <Button v-if="showEmptyAction" @click="$emit('empty-action')">
          {{ emptyActionText }}
        </Button>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="text-center py-8">
      <div class="flex flex-col items-center space-y-4">
        <div class="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
          <AlertCircle class="w-8 h-8 text-destructive" />
        </div>
        <div class="space-y-2">
          <h3 class="text-lg font-semibold text-destructive">Error Loading Products</h3>
          <p class="text-muted-foreground">{{ error }}</p>
        </div>
        <Button variant="outline" @click="$emit('retry')">
          <RefreshCw class="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ProductCard from './ProductCard.vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Package, AlertCircle, RefreshCw, Grid3X3, List } from 'lucide-vue-next'
import type { Product } from '@/types/api'

interface Props {
  products: Product[]
  isLoading?: boolean
  error?: string | null
  viewMode?: 'grid' | 'list'
  showViewToggle?: boolean
  showActions?: boolean
  skeletonCount?: number
  emptyTitle?: string
  emptyDescription?: string
  emptyActionText?: string
  showEmptyAction?: boolean
}

interface Emits {
  (e: 'product-click', product: Product): void
  (e: 'product-details', product: Product): void
  (e: 'add-to-cart', product: Product): void
  (e: 'view-mode-change', mode: 'grid' | 'list'): void
  (e: 'retry'): void
  (e: 'empty-action'): void
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  error: null,
  viewMode: 'grid',
  showViewToggle: true,
  showActions: true,
  skeletonCount: 8,
  emptyTitle: 'No products found',
  emptyDescription:
    "We couldn't find any products matching your criteria. Try adjusting your filters or search terms.",
  emptyActionText: 'Browse All Products',
  showEmptyAction: true,
})

const emit = defineEmits<Emits>()

const hasProducts = computed(() => props.products.length > 0)
</script>
