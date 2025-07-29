<template>
  <CommandDialog v-model:open="isOpen">
    <CommandInput
      v-model="searchQuery"
      placeholder="Search products, categories, or navigate..."
      @update:model-value="handleSearch"
    />
    <CommandList>
      <CommandEmpty>No results found.</CommandEmpty>

      <!-- Quick Actions -->
      <CommandGroup v-if="!searchQuery" heading="Quick Actions">
        <CommandItem
          v-for="action in quickActions"
          :key="action.id"
          :value="action.id"
          @select="handleActionSelect(action)"
        >
          <component :is="action.icon" class="mr-2 h-4 w-4" />
          <span>{{ action.label }}</span>
          <CommandShortcut v-if="action.shortcut">{{ action.shortcut }}</CommandShortcut>
        </CommandItem>
      </CommandGroup>

      <!-- Recent Searches -->
      <CommandGroup v-if="!searchQuery && recentSearches.length > 0" heading="Recent Searches">
        <CommandItem
          v-for="search in recentSearches"
          :key="search"
          :value="search"
          @select="handleRecentSearch(search)"
        >
          <Clock class="mr-2 h-4 w-4" />
          <span>{{ search }}</span>
        </CommandItem>
      </CommandGroup>

      <!-- Product Results -->
      <CommandGroup v-if="searchResults.products.length > 0" heading="Products">
        <CommandItem
          v-for="product in searchResults.products"
          :key="`product-${product.id}`"
          :value="`product-${product.id}`"
          @select="handleProductSelect(product)"
        >
          <div class="flex items-center gap-3 w-full">
            <div class="w-8 h-8 bg-muted rounded flex items-center justify-center flex-shrink-0">
              <img
                v-if="product.images && product.images.length > 0"
                :src="product.images[0].image_path"
                :alt="product.name"
                class="w-full h-full object-cover rounded"
              />
              <Package v-else class="w-4 h-4 text-muted-foreground" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-medium text-sm truncate">{{ product.name }}</div>
              <div class="text-xs text-muted-foreground">
                {{ formatPrice(product.price) }}
              </div>
            </div>
          </div>
        </CommandItem>
      </CommandGroup>

      <!-- Category Results -->
      <CommandGroup v-if="searchResults.categories.length > 0" heading="Categories">
        <CommandItem
          v-for="category in searchResults.categories"
          :key="`category-${category.id}`"
          :value="`category-${category.id}`"
          @select="handleCategorySelect(category)"
        >
          <Tag class="mr-2 h-4 w-4" />
          <span>{{ category.name }}</span>
          <CommandShortcut>{{ category.products?.length || 0 }} products</CommandShortcut>
        </CommandItem>
      </CommandGroup>

      <!-- Navigation Results -->
      <CommandGroup v-if="navigationResults.length > 0" heading="Navigation">
        <CommandItem
          v-for="nav in navigationResults"
          :key="nav.path"
          :value="nav.path"
          @select="handleNavigationSelect(nav)"
        >
          <component :is="nav.icon" class="mr-2 h-4 w-4" />
          <span>{{ nav.label }}</span>
        </CommandItem>
      </CommandGroup>
    </CommandList>
  </CommandDialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from '@/components/ui/command'
import {
  Home,
  Package,
  ShoppingCart,
  User,
  History,
  Search,
  Clock,
  Tag,
  Settings,
  HelpCircle,
} from 'lucide-vue-next'
import { useProducts } from '@/composables/useProducts'
import { useAuthStore } from '@/stores/auth'
import { debounce } from '@/lib/utils'
import type { Product, Category } from '@/types/api'
import type { Component } from 'vue'

interface QuickAction {
  id: string
  label: string
  icon: Component
  action: () => void
  shortcut?: string
}

interface NavigationItem {
  path: string
  label: string
  icon: Component
}

interface SearchResults {
  products: Product[]
  categories: Category[]
}

const router = useRouter()
const authStore = useAuthStore()
const { products, categories, fetchProducts, fetchCategories } = useProducts()

const isOpen = ref(false)
const searchQuery = ref('')
const searchResults = ref<SearchResults>({
  products: [],
  categories: [],
})

// Recent searches (stored in localStorage)
const recentSearches = ref<string[]>([])

// Quick actions
const quickActions = computed<QuickAction[]>(() => {
  const actions: QuickAction[] = [
    {
      id: 'home',
      label: 'Go to Home',
      icon: Home,
      action: () => router.push('/'),
    },
    {
      id: 'products',
      label: 'Browse Products',
      icon: Package,
      action: () => router.push('/products'),
    },
  ]

  if (authStore.isAuthenticated) {
    actions.push(
      {
        id: 'cart',
        label: 'View Cart',
        icon: ShoppingCart,
        action: () => router.push('/cart'),
      },
      {
        id: 'orders',
        label: 'Order History',
        icon: History,
        action: () => router.push('/orders'),
      },
      {
        id: 'profile',
        label: 'Profile Settings',
        icon: User,
        action: () => router.push('/profile'),
      },
    )
  }

  actions.push({
    id: 'help',
    label: 'Help & Support',
    icon: HelpCircle,
    action: () => {
      // Could open help modal or navigate to help page
      console.log('Help requested')
    },
  })

  return actions
})

// Navigation items for search
const navigationItems: NavigationItem[] = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/products', label: 'Products', icon: Package },
  { path: '/cart', label: 'Shopping Cart', icon: ShoppingCart },
  { path: '/orders', label: 'Order History', icon: History },
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/login', label: 'Login', icon: User },
  { path: '/register', label: 'Register', icon: User },
]

const navigationResults = computed(() => {
  if (!searchQuery.value) return []

  const query = searchQuery.value.toLowerCase()
  return navigationItems.filter(
    (item) => item.label.toLowerCase().includes(query) || item.path.toLowerCase().includes(query),
  )
})

// Debounced search function
const debouncedSearch = debounce(async (query: string) => {
  if (!query.trim()) {
    searchResults.value = { products: [], categories: [] }
    return
  }

  try {
    // Search products
    await fetchProducts({ search: query, per_page: 5 })
    searchResults.value.products = products.value.slice(0, 5)

    // Search categories
    const filteredCategories = categories.value
      .filter((category) => category.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3)
    searchResults.value.categories = filteredCategories
  } catch (error) {
    console.error('Search failed:', error)
    searchResults.value = { products: [], categories: [] }
  }
}, 300)

const handleSearch = (query: string) => {
  searchQuery.value = query
  debouncedSearch(query)
}

const handleActionSelect = (action: QuickAction) => {
  action.action()
  isOpen.value = false
}

const handleProductSelect = (product: Product) => {
  addToRecentSearches(product.name)
  router.push(`/products/${product.id}`)
  isOpen.value = false
}

const handleCategorySelect = (category: Category) => {
  addToRecentSearches(category.name)
  router.push(`/products?category=${category.id}`)
  isOpen.value = false
}

const handleNavigationSelect = (nav: NavigationItem) => {
  router.push(nav.path)
  isOpen.value = false
}

const handleRecentSearch = (search: string) => {
  searchQuery.value = search
  router.push(`/products?search=${encodeURIComponent(search)}`)
  isOpen.value = false
}

const addToRecentSearches = (search: string) => {
  const searches = recentSearches.value.filter((s) => s !== search)
  searches.unshift(search)
  recentSearches.value = searches.slice(0, 5)
  localStorage.setItem('recentSearches', JSON.stringify(recentSearches.value))
}

const loadRecentSearches = () => {
  try {
    const stored = localStorage.getItem('recentSearches')
    if (stored) {
      recentSearches.value = JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load recent searches:', error)
  }
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

// Keyboard shortcut handler
const handleKeydown = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    isOpen.value = !isOpen.value
  }

  if (e.key === 'Escape') {
    isOpen.value = false
  }
}

// Watch for dialog open/close
watch(isOpen, (open) => {
  if (open) {
    searchQuery.value = ''
    searchResults.value = { products: [], categories: [] }
  }
})

// Lifecycle
onMounted(() => {
  loadRecentSearches()
  fetchCategories()
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// Expose method to open search
defineExpose({
  open: () => {
    isOpen.value = true
  },
})
</script>
