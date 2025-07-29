<template>
  <div v-if="product" class="space-y-8">
    <!-- Breadcrumb Navigation -->
    <Breadcrumb v-if="showBreadcrumb">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/products">Products</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator v-if="product.category" />
        <BreadcrumbItem v-if="product.category">
          <BreadcrumbLink :href="`/products?category=${product.category.id}`">
            {{ product.category.name }}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{{ product.name }}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Image Gallery -->
      <div class="space-y-4">
        <!-- Main Image -->
        <div class="aspect-square w-full bg-muted rounded-lg overflow-hidden">
          <img
            v-if="selectedImage"
            :src="selectedImage.image_path"
            :alt="product.name"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-muted-foreground">
            <Package class="w-24 h-24" />
          </div>
        </div>

        <!-- Image Thumbnails -->
        <div v-if="product.images && product.images.length > 1" class="flex gap-2 overflow-x-auto">
          <button
            v-for="(image, index) in product.images"
            :key="image.id"
            class="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors"
            :class="{
              'border-primary': selectedImageIndex === index,
              'border-muted': selectedImageIndex !== index,
            }"
            @click="selectedImageIndex = index"
          >
            <img
              :src="image.image_path"
              :alt="`${product.name} ${index + 1}`"
              class="w-full h-full object-cover"
            />
          </button>
        </div>
      </div>

      <!-- Product Information -->
      <div class="space-y-6">
        <!-- Title and Category -->
        <div class="space-y-2">
          <div v-if="product.category" class="flex items-center gap-2">
            <Badge variant="outline">{{ product.category.name }}</Badge>
          </div>
          <h1 class="text-3xl font-bold">{{ product.name }}</h1>
        </div>

        <!-- Price and Stock -->
        <div class="space-y-4">
          <div class="text-3xl font-bold text-primary">
            {{ formatPrice(product.price) }}
          </div>

          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <span class="text-sm text-muted-foreground">Stock:</span>
              <Badge :variant="stockBadgeVariant" class="font-medium">
                {{ stockText }}
              </Badge>
            </div>
          </div>
        </div>

        <!-- Quantity Selector and Add to Cart -->
        <div v-if="product.stock > 0" class="space-y-4">
          <div class="flex items-center gap-4">
            <label class="text-sm font-medium">Quantity:</label>
            <div class="flex items-center border rounded-lg">
              <Button size="sm" variant="ghost" :disabled="quantity <= 1" @click="decreaseQuantity">
                <Minus class="w-4 h-4" />
              </Button>
              <Input
                v-model.number="quantity"
                type="number"
                :min="1"
                :max="product.stock"
                class="w-20 text-center border-0 focus-visible:ring-0"
                @input="validateQuantity"
              />
              <Button
                size="sm"
                variant="ghost"
                :disabled="quantity >= product.stock"
                @click="increaseQuantity"
              >
                <Plus class="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div class="flex gap-4">
            <Button
              size="lg"
              class="flex-1"
              :disabled="isAddingToCart || product.stock === 0"
              @click="handleAddToCart"
            >
              <ShoppingCart class="w-5 h-5 mr-2" />
              {{ isAddingToCart ? 'Adding...' : 'Add to Cart' }}
            </Button>

            <Button size="lg" variant="outline" @click="$emit('add-to-wishlist', product)">
              <Heart class="w-5 h-5" />
            </Button>
          </div>
        </div>

        <!-- Out of Stock Message -->
        <div v-else class="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div class="flex items-center gap-2 text-destructive">
            <AlertCircle class="w-5 h-5" />
            <span class="font-medium">Out of Stock</span>
          </div>
          <p class="text-sm text-muted-foreground mt-1">
            This product is currently unavailable. Check back later or browse similar products.
          </p>
        </div>

        <!-- Product Description -->
        <div v-if="product.description" class="space-y-2">
          <h3 class="text-lg font-semibold">Description</h3>
          <div class="prose prose-sm max-w-none">
            <p class="text-muted-foreground whitespace-pre-wrap">{{ product.description }}</p>
          </div>
        </div>

        <!-- Product Details -->
        <div class="space-y-2">
          <h3 class="text-lg font-semibold">Product Details</h3>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-muted-foreground">SKU:</span>
              <span class="ml-2 font-medium">#{{ product.id.toString().padStart(6, '0') }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">Added:</span>
              <span class="ml-2 font-medium">{{ formatDate(product.created_at) }}</span>
            </div>
            <div v-if="product.category">
              <span class="text-muted-foreground">Category:</span>
              <span class="ml-2 font-medium">{{ product.category.name }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">Seller:</span>
              <span class="ml-2 font-medium">{{ product.user.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Related Products -->
    <div v-if="relatedProducts && relatedProducts.length > 0" class="space-y-4">
      <h3 class="text-xl font-semibold">Related Products</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProductCard
          v-for="relatedProduct in relatedProducts"
          :key="relatedProduct.id"
          :product="relatedProduct"
          variant="grid"
          @click="$emit('product-click', relatedProduct)"
          @view-details="$emit('product-details', relatedProduct)"
          @add-to-cart="handleRelatedProductAddToCart"
        />
      </div>
    </div>
  </div>

  <!-- Product Not Found -->
  <div v-else class="text-center py-12">
    <div class="flex flex-col items-center space-y-4">
      <div class="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
        <Package class="w-12 h-12 text-muted-foreground" />
      </div>
      <div class="space-y-2">
        <h3 class="text-lg font-semibold">Product Not Found</h3>
        <p class="text-muted-foreground max-w-md">
          The product you're looking for doesn't exist or has been removed.
        </p>
      </div>
      <Button @click="$emit('back-to-products')"> Browse Products </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import ProductCard from './ProductCard.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Package, ShoppingCart, Heart, Plus, Minus, AlertCircle } from 'lucide-vue-next'
import type { Product } from '@/types/api'

interface Props {
  product: Product | null
  relatedProducts?: Product[]
  showBreadcrumb?: boolean
  isLoading?: boolean
}

interface Emits {
  (e: 'add-to-cart', product: Product, quantity: number): void
  (e: 'add-to-wishlist', product: Product): void
  (e: 'product-click', product: Product): void
  (e: 'product-details', product: Product): void
  (e: 'back-to-products'): void
}

const props = withDefaults(defineProps<Props>(), {
  relatedProducts: () => [],
  showBreadcrumb: true,
  isLoading: false,
})

const emit = defineEmits<Emits>()

// State
const quantity = ref(1)
const selectedImageIndex = ref(0)
const isAddingToCart = ref(false)

// Computed properties
const selectedImage = computed(() => {
  if (!props.product?.images || props.product.images.length === 0) return null
  return props.product.images[selectedImageIndex.value]
})

const stockBadgeVariant = computed(() => {
  if (!props.product) return 'secondary'
  if (props.product.stock === 0) return 'destructive'
  if (props.product.stock <= 5) return 'secondary'
  return 'default'
})

const stockText = computed(() => {
  if (!props.product) return 'Unknown'
  if (props.product.stock === 0) return 'Out of Stock'
  if (props.product.stock <= 5) return `Only ${props.product.stock} left`
  return `${props.product.stock} available`
})

// Methods
const formatPrice = (price: string) => {
  const numPrice = parseFloat(price)
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numPrice)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const increaseQuantity = () => {
  if (props.product && quantity.value < props.product.stock) {
    quantity.value++
  }
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const validateQuantity = () => {
  if (!props.product) return

  if (quantity.value < 1) {
    quantity.value = 1
  } else if (quantity.value > props.product.stock) {
    quantity.value = props.product.stock
  }
}

const handleAddToCart = async () => {
  if (!props.product || props.product.stock === 0) return

  try {
    isAddingToCart.value = true
    emit('add-to-cart', props.product, quantity.value)
  } finally {
    isAddingToCart.value = false
  }
}

const handleRelatedProductAddToCart = (product: Product) => {
  emit('add-to-cart', product, 1)
}

// Watch for product changes to reset state
watch(
  () => props.product,
  (newProduct) => {
    if (newProduct) {
      quantity.value = 1
      selectedImageIndex.value = 0
    }
  },
  { immediate: true },
)
</script>
