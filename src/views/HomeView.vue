<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import ProductGrid from '@/components/product/ProductGrid.vue'
import PageLayout from '@/components/layout/PageLayout.vue'
import { Package } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useProducts } from '@/composables/useProducts'
import { useCart } from '@/composables/useCart'
import type { Product } from '@/types/api'

const router = useRouter()
const { user, isAuthenticated } = useAuth()

const {
  products,
  categories,
  isLoading,
  isLoadingCategories,
  hasProducts,
  hasCategories,
  fetchProducts,
  fetchCategories,
} = useProducts()

const { addToCart } = useCart()

// Computed properties
const featuredProducts = computed(() => {
  // Show latest 8 products as featured
  return products.value.slice(0, 8)
})

const categoryProductCounts = computed(() => {
  const counts = new Map<number, number>()
  for (const product of products.value) {
    if (product.category_id) {
      counts.set(product.category_id, (counts.get(product.category_id) || 0) + 1)
    }
  }
  return counts
})

// Methods
const handleCategoryClick = (categoryId: number) => {
  router.push(`/products?category=${categoryId}`)
}

const handleProductClick = (product: Product) => {
  router.push(`/products/${product.id}`)
}

const handleProductDetails = (product: Product) => {
  router.push(`/products/${product.id}`)
}

const handleAddToCart = async (product: Product) => {
  await addToCart(product.id)
}

// Initialize data
onMounted(async () => {
  await Promise.all([
    fetchCategories(),
    fetchProducts({ limit: 100, sort: 'created_at', order: 'desc' }),
  ])
})
</script>

<template>
  <PageLayout :show-breadcrumbs="false">
    <div class="space-y-12">
      <!-- Hero Section -->
      <div class="text-center">
        <h1 class="text-3xl font-extrabold text-foreground sm:text-4xl">
          Welcome to our E-Commerce Store
        </h1>
        <p class="mt-4 text-lg text-muted-foreground">Discover amazing products at great prices</p>

        <template v-if="isAuthenticated">
          <div class="mt-6 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <p class="text-green-800 dark:text-green-200">
              Welcome back, <strong>{{ user?.name }}</strong
              >!
            </p>
          </div>
        </template>

        <div class="mt-8">
          <RouterLink to="/products">
            <Button size="lg">Browse Products</Button>
          </RouterLink>
        </div>
      </div>

      <!-- Categories Section -->
      <div v-if="hasCategories" class="space-y-6">
        <div class="text-center">
          <h2 class="text-2xl font-bold text-foreground">Shop by Category</h2>
          <p class="mt-2 text-muted-foreground">Find what you're looking for</p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div
            v-for="category in categories.slice(0, 8)"
            :key="category.id"
            class="group cursor-pointer active:scale-95 transition-transform"
            @click="handleCategoryClick(category.id)"
          >
            <div
              class="bg-card rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow border"
            >
              <div
                class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Package class="w-8 h-8 text-primary" />
              </div>
              <h3
                class="font-semibold text-card-foreground group-hover:text-primary transition-colors"
              >
                {{ category.name }}
              </h3>
              <p class="text-sm text-muted-foreground mt-1">
                {{ categoryProductCounts.get(category.id) || 0 }} products
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Featured Products Section -->
      <div v-if="hasProducts" class="space-y-6">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-2xl font-bold text-foreground">Featured Products</h2>
            <p class="mt-2 text-muted-foreground">Check out our latest arrivals</p>
          </div>
          <RouterLink to="/products">
            <Button variant="outline">View All</Button>
          </RouterLink>
        </div>

        <ProductGrid
          :products="featuredProducts"
          :is-loading="isLoading"
          :show-view-toggle="false"
          :show-empty-action="false"
          view-mode="grid"
          @product-click="handleProductClick"
          @product-details="handleProductDetails"
          @add-to-cart="handleAddToCart"
        />
      </div>

      <!-- Loading States -->
      <div v-if="isLoading || isLoadingCategories" class="space-y-12">
        <!-- Categories Loading -->
        <div v-if="isLoadingCategories" class="space-y-6">
          <div class="text-center">
            <Skeleton class="h-8 w-48 mx-auto" />
            <Skeleton class="h-4 w-32 mx-auto mt-2" />
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div v-for="i in 8" :key="i" class="space-y-3">
              <Skeleton class="h-24 w-full rounded-lg" />
              <Skeleton class="h-4 w-3/4 mx-auto" />
              <Skeleton class="h-3 w-1/2 mx-auto" />
            </div>
          </div>
        </div>

        <!-- Products Loading -->
        <div v-if="isLoading" class="space-y-6">
          <div class="flex justify-between items-center">
            <div class="space-y-2">
              <Skeleton class="h-8 w-48" />
              <Skeleton class="h-4 w-32" />
            </div>
            <Skeleton class="h-10 w-20" />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div v-for="i in 8" :key="i" class="space-y-3">
              <Skeleton class="aspect-square w-full rounded-lg" />
              <Skeleton class="h-4 w-3/4" />
              <Skeleton class="h-6 w-1/2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </PageLayout>
</template>
