<template>
  <div class="md:hidden">
    <!-- Filter Trigger Button -->
    <Button variant="outline" class="w-full" @click="isOpen = true">
      <Filter class="w-4 h-4 mr-2" />
      Filters
      <Badge v-if="activeFilterCount > 0" variant="secondary" class="ml-2">
        {{ activeFilterCount }}
      </Badge>
    </Button>

    <!-- Mobile Filter Drawer -->
    <Drawer v-model:open="isOpen">
      <DrawerContent class="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle class="flex items-center justify-between">
            <span>Filters</span>
            <Button v-if="hasActiveFilters" variant="ghost" size="sm" @click="clearAllFilters">
              Clear All
            </Button>
          </DrawerTitle>
        </DrawerHeader>

        <div class="px-4 pb-4 space-y-6 overflow-y-auto">
          <!-- Search -->
          <div class="space-y-2">
            <Label class="text-sm font-medium">Search</Label>
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

          <!-- Category -->
          <div class="space-y-2">
            <Label class="text-sm font-medium">Category</Label>
            <Select
              :model-value="localFilters.category_id?.toString() || ''"
              @update:model-value="handleCategoryChange"
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
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
          <div class="space-y-2">
            <Label class="text-sm font-medium">Price Range</Label>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <Label class="text-xs text-muted-foreground">Min Price</Label>
                <Input
                  v-model.number="localFilters.min_price"
                  type="number"
                  placeholder="0"
                  @input="debouncedPriceChange"
                />
              </div>
              <div>
                <Label class="text-xs text-muted-foreground">Max Price</Label>
                <Input
                  v-model.number="localFilters.max_price"
                  type="number"
                  placeholder="No limit"
                  @input="debouncedPriceChange"
                />
              </div>
            </div>
          </div>

          <!-- Sort -->
          <div class="space-y-2">
            <Label class="text-sm font-medium">Sort By</Label>
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

          <!-- Active Filters -->
          <div v-if="hasActiveFilters" class="space-y-2">
            <Label class="text-sm font-medium">Active Filters</Label>
            <div class="flex flex-wrap gap-2">
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
                {{ selectedCategory.name }}
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
                {{ formatPriceRange() }}
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
          </div>
        </div>

        <DrawerFooter>
          <div class="flex gap-2">
            <Button class="flex-1" @click="applyFilters"> Apply Filters </Button>
            <Button variant="outline" @click="isOpen = false"> Cancel </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer'
import { Filter, Search, X } from 'lucide-vue-next'
import type { ProductFilters, Category } from '@/types/api'
import { debounce } from '@/lib/utils'

interface Props {
  filters: ProductFilters
  categories: Category[]
}

interface Emits {
  (e: 'update:filters', filters: Partial<ProductFilters>): void
  (e: 'clear-filters'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = ref(false)
const localFilters = ref<ProductFilters>({ ...props.filters })
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

const activeFilterCount = computed(() => {
  let count = 0
  if (localFilters.value.search) count++
  if (localFilters.value.category_id) count++
  if (localFilters.value.min_price || localFilters.value.max_price) count++
  return count
})

const selectedCategory = computed(() => {
  if (!localFilters.value.category_id) return null
  return props.categories.find((cat) => cat.id === localFilters.value.category_id)
})

// Debounced functions
const debouncedSearch = debounce(() => {
  // Don't emit immediately, wait for apply
}, 300)

const debouncedPriceChange = debounce(() => {
  // Don't emit immediately, wait for apply
}, 500)

// Event handlers
const handleSortChange = (value: any) => {
  if (!value || typeof value !== 'string') return
  const [sort_by, sort_order] = value.split('-') as [string, 'asc' | 'desc']
  localFilters.value.sort_by = sort_by as 'name' | 'price' | 'created_at'
  localFilters.value.sort_order = sort_order
}

const handleCategoryChange = (value: any) => {
  const categoryId = value && typeof value === 'string' ? parseInt(value) : undefined
  localFilters.value.category_id = categoryId
}

const clearSearch = () => {
  localFilters.value.search = ''
}

const clearCategory = () => {
  localFilters.value.category_id = undefined
}

const clearPriceRange = () => {
  localFilters.value.min_price = undefined
  localFilters.value.max_price = undefined
}

const clearAllFilters = () => {
  localFilters.value = {
    search: '',
    category_id: undefined,
    min_price: undefined,
    max_price: undefined,
    sort_by: 'created_at',
    sort_order: 'desc',
    page: 1,
    per_page: localFilters.value.per_page,
  }
  sortValue.value = 'created_at-desc'
  emit('clear-filters')
  isOpen.value = false
}

const applyFilters = () => {
  emit('update:filters', { ...localFilters.value, page: 1 })
  isOpen.value = false
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
    if (newFilters.sort_by && newFilters.sort_order) {
      sortValue.value = `${newFilters.sort_by}-${newFilters.sort_order}`
    }
  },
  { deep: true },
)

// Initialize sort value on mount
onMounted(() => {
  if (props.filters.sort_by && props.filters.sort_order) {
    sortValue.value = `${props.filters.sort_by}-${props.filters.sort_order}`
  } else {
    sortValue.value = 'created_at-desc'
  }
})
</script>
