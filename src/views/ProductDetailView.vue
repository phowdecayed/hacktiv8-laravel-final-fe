<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Loading State -->
    <div v-if="isLoadingProduct" class="space-y-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Image Skeleton -->
        <div class="space-y-4">
          <Skeleton class="aspect-square w-full rounded-lg" />
          <div class="flex gap-2">
            <Skeleton class="w-20 h-20 rounded-lg" />
            <Skeleton class="w-20 h-20 rounded-lg" />
            <Skeleton class="w-20 h-20 rounded-lg" />
          </div>
        </div>

        <!-- Content Skeleton -->
        <div class="space-y-6">
          <div class="space-y-2">
            <Skeleton class="h-4 w-24" />
            <Skeleton class="h-8 w-3/4" />
          </div>
          <Skeleton class="h-10 w-32" />
          <div class="space-y-2">
            <Skeleton class="h-4 w-full" />
            <Skeleton class="h-4 w-full" />
            <Skeleton class="h-4 w-2/3" />
          </div>
          <Skeleton class="h-12 w-full" />
        </div>
      </div>
    </div>

    <!-- Product Detail -->
    <ProductDetail
      v-if="currentProduct"
      :product="currentProduct"
      :related-products="relatedProducts"
      :is-loading="isLoadingProduct"
      @add-to-cart="handleAddToCart"
      @add-to-wishlist="handleAddToWishlist"
      @product-click="handleProductClick"
      @product-details="handleProductDetails"
      @back-to-products="handleBackToProducts"
    />

    <!-- Error State -->
    <div v-if="error && !isLoadingProduct" class="text-center py-12">
      <div class="flex flex-col items-center space-y-4">
        <div class="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
          <AlertCircle class="w-8 h-8 text-destructive" />
        </div>
        <div class="space-y-2">
          <h3 class="text-lg font-semibold text-destructive">Error Loading Product</h3>
          <p class="text-muted-foreground">{{ error }}</p>
        </div>
        <div class="flex gap-2">
          <Button variant="outline" @click="handleRetry">
            <RefreshCw class="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button @click="handleBackToProducts"> Browse Products </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProductDetail from '@/components/product/ProductDetail.vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, RefreshCw } from 'lucide-vue-next'
import { useProducts } from '@/composables/useProducts'
import type { Product } from '@/types/api'

const route = useRoute()
const router = useRouter()

const {
  products,
  currentProduct,
  isLoadingProduct,
  error,
  fetchProduct,
  fetchProducts,
  clearError,
  clearCurrentProduct,
} = useProducts()

// Computed properties
const productId = computed(() => {
  const id = route.params.id
  return Array.isArray(id) ? parseInt(id[0]) : parseInt(id as string)
})

const relatedProducts = computed(() => {
  if (!currentProduct.value) return []

  // Get products from the same category, excluding current product
  return products.value
    .filter(
      (p) =>
        p.id !== currentProduct.value!.id && p.category_id === currentProduct.value!.category_id,
    )
    .slice(0, 4)
})

// Methods
const loadProduct = async () => {
  if (!productId.value || isNaN(productId.value)) {
    router.push('/products')
    return
  }

  try {
    await fetchProduct(productId.value)

    // Load related products if we don't have any products loaded
    if (products.value.length === 0) {
      await fetchProducts({ per_page: 20 })
    }
  } catch (err) {
    console.error('Failed to load product:', err)
  }
}

const handleAddToCart = (product: Product, quantity: number) => {
  // TODO: Implement add to cart functionality in cart task
  console.log('Add to cart:', product, 'quantity:', quantity)
}

const handleAddToWishlist = (product: Product) => {
  // TODO: Implement wishlist functionality
  console.log('Add to wishlist:', product)
}

const handleProductClick = (product: Product) => {
  router.push(`/products/${product.id}`)
}

const handleProductDetails = (product: Product) => {
  router.push(`/products/${product.id}`)
}

const handleBackToProducts = () => {
  router.push('/products')
}

const handleRetry = () => {
  clearError()
  loadProduct()
}

// Lifecycle
onMounted(() => {
  loadProduct()
})

// Watch for route changes
watch(
  () => route.params.id,
  () => {
    clearCurrentProduct()
    loadProduct()
  },
)
</script>
