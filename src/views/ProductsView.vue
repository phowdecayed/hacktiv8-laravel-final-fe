<template>
  <PageLayout title="Products" description="Discover our amazing collection">
    <!-- Desktop Filters -->
    <div class="hidden md:block">
      <ProductFilters
        :filters="filters"
        :categories="categories"
        :total-results="totalProducts"
        :is-loading="isLoading"
        @update:filters="handleFiltersUpdate"
        @clear-filters="handleClearFilters"
      />
    </div>

    <!-- Mobile Filters -->
    <div class="md:hidden">
      <MobileFilters
        :filters="filters"
        :categories="categories"
        @update:filters="handleFiltersUpdate"
        @clear-filters="handleClearFilters"
      />
    </div>

    <!-- Products Grid -->
    <ProductGrid
      :products="products"
      :is-loading="isLoading"
      :error="error"
      :view-mode="viewMode"
      @product-click="handleProductClick"
      @product-details="handleProductDetails"
      @add-to-cart="handleAddToCart"
      @view-mode-change="handleViewModeChange"
      @retry="handleRetry"
      @empty-action="handleEmptyAction"
    />

    <!-- Pagination -->
    <div v-if="hasProducts && !isLoading" class="flex justify-center">
      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage <= 1"
          @click="goToPage(currentPage - 1)"
        >
          <ChevronLeft class="w-4 h-4" />
          Previous
        </Button>

        <div class="flex items-center space-x-1">
          <Button
            v-for="page in visiblePages"
            :key="page"
            :variant="page === currentPage ? 'default' : 'outline'"
            size="sm"
            @click="goToPage(page)"
          >
            {{ page }}
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage >= totalPages"
          @click="goToPage(currentPage + 1)"
        >
          Next
          <ChevronRight class="w-4 h-4" />
        </Button>
      </div>
    </div>

    <!-- Results Summary -->
    <div v-if="hasProducts && !isLoading" class="text-center text-sm text-muted-foreground">
      Showing {{ (currentPage - 1) * (filters.limit || 12) + 1 }} to
      {{ Math.min(currentPage * (filters.limit || 12), totalProducts) }} of
      {{ totalProducts }} products
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Button } from '@/components/ui/button'
import ProductGrid from '@/components/product/ProductGrid.vue'
import ProductFilters from '@/components/product/ProductFilters.vue'
import MobileFilters from '@/components/product/MobileFilters.vue'
import PageLayout from '@/components/layout/PageLayout.vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useProducts } from '@/composables/useProducts'
import type { Product, ProductFilters as ProductFiltersType } from '@/types/api'

const router = useRouter()
const route = useRoute()

const {
  products,
  categories,
  isLoading,
  error,
  filters,
  hasProducts,
  totalPages,
  currentPage,
  totalProducts,
  fetchProducts,
  fetchCategories,
  updateFilters,
  clearFilters,
  goToPage,
  clearError,
} = useProducts()

// Local state
const viewMode = ref<'grid' | 'list'>('grid')

// Computed properties
const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

// Methods
const handleFiltersUpdate = async (newFilters: Partial<ProductFiltersType>) => {
  updateFilters(newFilters)
  await fetchProducts()
  updateUrlParams()
}

const handleClearFilters = async () => {
  clearFilters()
  await fetchProducts()
  updateUrlParams()
}

const handleProductClick = (product: Product) => {
  router.push(`/products/${product.id}`)
}

const handleProductDetails = (product: Product) => {
  router.push(`/products/${product.id}`)
}

const handleAddToCart = (product: Product) => {
  // TODO: Implement add to cart functionality in cart task
  console.log('Add to cart:', product)
}

const handleViewModeChange = (mode: 'grid' | 'list') => {
  viewMode.value = mode
}

const handleRetry = async () => {
  clearError()
  await fetchProducts()
}

const handleEmptyAction = () => {
  clearFilters()
  fetchProducts()
}

const updateUrlParams = () => {
  const query: Record<string, string> = {}

  if (filters.value.search) query.search = filters.value.search
  if (filters.value.category_id) query.category = filters.value.category_id.toString()
  if (filters.value.status) query.status = filters.value.status
  if (filters.value.date_from) query.date_from = filters.value.date_from
  if (filters.value.date_to) query.date_to = filters.value.date_to
  if (filters.value.min_price) query.min_price = filters.value.min_price.toString()
  if (filters.value.max_price) query.max_price = filters.value.max_price.toString()
  if (filters.value.sort) query.sort = filters.value.sort
  if (filters.value.order) query.order = filters.value.order
  if (filters.value.page && filters.value.page > 1) query.page = filters.value.page.toString()
  if (filters.value.limit) query.limit = filters.value.limit.toString()

  router.replace({ query })
}

const loadFiltersFromUrl = () => {
  const query = route.query
  const urlFilters: Partial<ProductFiltersType> = {}

  if (query.search) urlFilters.search = query.search as string
  if (query.category) urlFilters.category_id = parseInt(query.category as string)
  if (query.status) urlFilters.status = query.status as 'available' | 'unavailable'
  if (query.date_from) urlFilters.date_from = query.date_from as string
  if (query.date_to) urlFilters.date_to = query.date_to as string
  if (query.min_price) urlFilters.min_price = parseFloat(query.min_price as string)
  if (query.max_price) urlFilters.max_price = parseFloat(query.max_price as string)
  if (query.sort) urlFilters.sort = query.sort as 'name' | 'price' | 'created_at'
  if (query.order) urlFilters.order = query.order as 'asc' | 'desc'
  if (query.page) urlFilters.page = parseInt(query.page as string)
  if (query.limit) urlFilters.limit = parseInt(query.limit as string)

  if (Object.keys(urlFilters).length > 0) {
    updateFilters(urlFilters)
  }
}

// Initialize data
onMounted(async () => {
  loadFiltersFromUrl()
  await Promise.all([fetchCategories(), fetchProducts()])
})

// Watch for route changes
watch(
  () => route.query,
  () => {
    loadFiltersFromUrl()
    fetchProducts()
  },
)
</script>
