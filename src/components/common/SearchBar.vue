<template>
  <div class="relative">
    <div class="relative">
      <Search
        class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground"
      />
      <Input
        v-model="searchQuery"
        placeholder="Search products..."
        class="pl-10 pr-10"
        @input="handleSearch"
        @keydown.enter="handleEnterSearch"
      />
      <Button
        v-if="searchQuery"
        size="sm"
        variant="ghost"
        class="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
        @click="clearSearch"
      >
        <X class="w-4 h-4" />
      </Button>
    </div>

    <!-- Search Suggestions Dropdown -->
    <div
      v-if="showSuggestions && suggestions.length > 0"
      class="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
    >
      <div class="p-2">
        <div class="text-xs text-muted-foreground mb-2">Suggestions</div>
        <div
          v-for="suggestion in suggestions"
          :key="suggestion.id"
          class="flex items-center gap-3 p-2 hover:bg-muted rounded-md cursor-pointer"
          @click="selectSuggestion(suggestion)"
        >
          <div class="w-10 h-10 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
            <img
              v-if="suggestion.images && suggestion.images.length > 0"
              :src="suggestion.images[0].image_path"
              :alt="suggestion.name"
              class="w-full h-full object-cover rounded-md"
            />
            <Package v-else class="w-5 h-5 text-muted-foreground" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-medium text-sm truncate">{{ suggestion.name }}</div>
            <div class="text-xs text-muted-foreground">
              {{ formatPrice(suggestion.price) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X, Package } from 'lucide-vue-next'
import { useProducts } from '@/composables/useProducts'
import { debounce } from '@/lib/utils'
import type { Product } from '@/types/api'

interface Props {
  placeholder?: string
  showSuggestions?: boolean
  maxSuggestions?: number
}

interface Emits {
  (e: 'search', query: string): void
  (e: 'clear'): void
  (e: 'select', product: Product): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search products...',
  showSuggestions: true,
  maxSuggestions: 5,
})

const emit = defineEmits<Emits>()

const router = useRouter()
const { products, fetchProducts } = useProducts()

// State
const searchQuery = ref('')
const suggestions = ref<Product[]>([])
const showSuggestions = ref(false)

// Methods
const handleSearch = debounce(async () => {
  if (searchQuery.value.trim().length >= 2) {
    try {
      await fetchProducts({
        search: searchQuery.value.trim(),
        limit: props.maxSuggestions,
      })
      suggestions.value = products.value.slice(0, props.maxSuggestions)
      showSuggestions.value = props.showSuggestions && suggestions.value.length > 0
    } catch (error) {
      console.error('Search failed:', error)
      suggestions.value = []
      showSuggestions.value = false
    }
  } else {
    suggestions.value = []
    showSuggestions.value = false
  }

  emit('search', searchQuery.value.trim())
}, 300)

const handleEnterSearch = () => {
  if (searchQuery.value.trim()) {
    hideSuggestions()
    router.push(`/products?search=${encodeURIComponent(searchQuery.value.trim())}`)
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  suggestions.value = []
  showSuggestions.value = false
  emit('clear')
}

const selectSuggestion = (product: Product) => {
  hideSuggestions()
  emit('select', product)
  router.push(`/products/${product.id}`)
}

const hideSuggestions = () => {
  showSuggestions.value = false
}

const formatPrice = (price: string) => {
  const numPrice = parseFloat(price)
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numPrice)
}

// Click outside to close suggestions
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Element
  if (!target.closest('.relative')) {
    hideSuggestions()
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Watch for search query changes
watch(searchQuery, (newQuery) => {
  if (!newQuery.trim()) {
    suggestions.value = []
    showSuggestions.value = false
  }
})
</script>
