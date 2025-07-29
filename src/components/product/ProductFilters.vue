<template>
  <div class="space-y-4">
    <!-- Search and Sort Row -->
    <div class="flex flex-col sm:flex-row gap-4">
      <!-- Search Input -->
      <div class="flex-1">
        <div class="relative">
          <Search
            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground"
          />
          <Input
            v-model="localFilters.search"
            placeholder="Search products..."
            class="pl-10"
            @input="debouncedSearch"
          />
          <Button
            v-if="localFilters.search"
            size="sm"
            variant="ghost"
            class="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            @click="clearSearch"
          >
            <X class="w-4 h-4" />
          </Button>
        </div>
      </div>

      <!-- Sort Select -->
      <div class="w-full sm:w-48">
        <Select v-model="sortValue" @update:model-value="handleSortChange">
          <SelectTrigger>
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at-desc">Newest First</SelectItem>
            <SelectItem value="created_at-asc">Oldest First</SelectItem>
            <SelectItem value="name-asc">Name A-Z</SelectItem>
            <SelectItem value="name-desc">Name Z-A</SelectItem>
            <SelectItem value="price-asc">Price Low to High</SelectItem>
            <SelectItem value="price-desc">Price High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <!-- Filters Row -->
    <div class="flex flex-wrap gap-4">
      <!-- Category Filter -->
      <div class="w-full sm:w-48">
        <Select
          :model-value="localFilters.category_id?.toString() || 'all'"
          @update:model-value="handleCategoryChange"
        >
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem
              v-for="category in categories"
              :key="category.id"
              :value="category.id.toString()"
            >
              {{ category.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Price Range -->
      <div class="flex gap-2 items-center">
        <Input
          v-model.number="localFilters.min_price"
          type="number"
          placeholder="Min price"
          class="w-27"
          @input="debouncedPriceChange"
        />
        <span class="text-muted-foreground">-</span>
        <Input
          v-model.number="localFilters.max_price"
          type="number"
          placeholder="Max price"
          class="w-27"
          @input="debouncedPriceChange"
        />
      </div>

      <!-- Clear Filters Button -->
      <Button v-if="hasActiveFilters" variant="outline" size="sm" @click="clearAllFilters">
        <X class="w-4 h-4 mr-2" />
        Clear Filters
      </Button>
    </div>

    <!-- Active Filters Display -->
    <div v-if="hasActiveFilters" class="flex flex-wrap gap-2">
      <Badge v-if="localFilters.search" variant="secondary" class="flex items-center gap-1">
        Search: "{{ localFilters.search }}"
        <Button
          size="sm"
          variant="ghost"
          class="h-4 w-4 p-0 hover:bg-transparent"
          @click="clearSearch"
        >
          <X class="w-3 h-3" />
        </Button>
      </Badge>

      <Badge v-if="selectedCategory" variant="secondary" class="flex items-center gap-1">
        Category: {{ selectedCategory.name }}
        <Button
          size="sm"
          variant="ghost"
          class="h-4 w-4 p-0 hover:bg-transparent"
          @click="clearCategory"
        >
          <X class="w-3 h-3" />
        </Button>
      </Badge>

      <Badge
        v-if="localFilters.min_price || localFilters.max_price"
        variant="secondary"
        class="flex items-center gap-1"
      >
        Price: {{ formatPriceRange() }}
        <Button
          size="sm"
          variant="ghost"
          class="h-4 w-4 p-0 hover:bg-transparent"
          @click="clearPriceRange"
        >
          <X class="w-3 h-3" />
        </Button>
      </Badge>
    </div>

    <!-- Results Count -->
    <div v-if="showResultsCount" class="text-sm text-muted-foreground">
      {{ resultsText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X } from 'lucide-vue-next'
import type { ProductFilters, Category } from '@/types/api'
import { debounce } from '@/lib/utils'

interface Props {
  filters: ProductFilters
  categories: Category[]
  totalResults?: number
  isLoading?: boolean
  showResultsCount?: boolean
}

interface Emits {
  (e: 'update:filters', filters: Partial<ProductFilters>): void
  (e: 'clear-filters'): void
}

const props = withDefaults(defineProps<Props>(), {
  totalResults: 0,
  isLoading: false,
  showResultsCount: true,
})

const emit = defineEmits<Emits>()

// Local reactive copy of filters
const localFilters = ref<ProductFilters>({ ...props.filters })

// Sort value for the select component
const sortValue = ref('')

// Computed properties
const hasActiveFilters = computed(() => {
  return !!(
    localFilters.value.search ||
    localFilters.value.category_id ||
    localFilters.value.min_price ||
    localFilters.value.max_price
  )
})

const selectedCategory = computed(() => {
  if (!localFilters.value.category_id) return null
  return props.categories.find((cat) => cat.id === localFilters.value.category_id)
})

const resultsText = computed(() => {
  if (props.isLoading) return 'Loading...'
  if (props.totalResults === 0) return 'No products found'
  if (props.totalResults === 1) return '1 product found'
  return `${props.totalResults} products found`
})

// Debounced functions
const debouncedSearch = debounce(() => {
  emit('update:filters', { search: localFilters.value.search, page: 1 })
}, 300)

const debouncedPriceChange = debounce(() => {
  emit('update:filters', {
    min_price: localFilters.value.min_price || undefined,
    max_price: localFilters.value.max_price || undefined,
    page: 1,
  })
}, 500)

// Event handlers
const handleSortChange = (value: any) => {
  if (!value || typeof value !== 'string') return
  const [sort_by, sort_order] = value.split('-') as [string, 'asc' | 'desc']
  localFilters.value.sort = sort_by as 'name' | 'price' | 'created_at'
  localFilters.value.order = sort_order
  emit('update:filters', {
    sort: sort_by as 'name' | 'price' | 'created_at',
    order: sort_order,
    page: 1,
  })
}

const handleCategoryChange = (value: any) => {
  const categoryId = value === 'all' ? undefined : parseInt(value as string)
  localFilters.value.category_id = categoryId
  emit('update:filters', { category_id: categoryId, page: 1 })
}

const clearSearch = () => {
  localFilters.value.search = ''
  emit('update:filters', { search: '', page: 1 })
}

const clearCategory = () => {
  localFilters.value.category_id = undefined
  emit('update:filters', { category_id: undefined, page: 1 })
}

const clearPriceRange = () => {
  localFilters.value.min_price = undefined
  localFilters.value.max_price = undefined
  emit('update:filters', { min_price: undefined, max_price: undefined, page: 1 })
}

const clearAllFilters = () => {
  localFilters.value = {
    search: '',
    category_id: undefined,
    min_price: undefined,
    max_price: undefined,
    sort: 'created_at',
    order: 'desc',
    page: 1,
    limit: localFilters.value.limit,
  }
  sortValue.value = 'created_at-desc'
  emit('clear-filters')
}

const formatPriceRange = () => {
  const min = localFilters.value.min_price
  const max = localFilters.value.max_price

  if (min && max) {
    return `${formatPrice(min)} - ${formatPrice(max)}`
  } else if (min) {
    return `From ${formatPrice(min)}`
  } else if (max) {
    return `Up to ${formatPrice(max)}`
  }
  return ''
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

// Watch for external filter changes
watch(
  () => props.filters,
  (newFilters) => {
    localFilters.value = { ...newFilters }

    // Update sort value
    if (newFilters.sort && newFilters.order) {
      sortValue.value = `${newFilters.sort}-${newFilters.order}`
    }
  },
  { deep: true },
)

// Initialize sort value on mount
onMounted(() => {
  if (props.filters.sort && props.filters.order) {
    sortValue.value = `${props.filters.sort}-${props.filters.order}`
  } else {
    sortValue.value = 'created_at-desc'
  }
})
</script>
