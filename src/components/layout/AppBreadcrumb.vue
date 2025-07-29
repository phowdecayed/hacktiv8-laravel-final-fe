<template>
  <nav aria-label="Breadcrumb" class="mb-6">
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink as-child>
            <RouterLink to="/">
              <Home class="h-4 w-4" />
              <span class="sr-only">Home</span>
            </RouterLink>
          </BreadcrumbLink>
        </BreadcrumbItem>

        <template v-for="(item, index) in breadcrumbItems" :key="item.path">
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink v-if="index < breadcrumbItems.length - 1" as-child>
              <RouterLink :to="item.path">
                {{ item.label }}
              </RouterLink>
            </BreadcrumbLink>
            <BreadcrumbPage v-else>
              {{ item.label }}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </template>
      </BreadcrumbList>
    </Breadcrumb>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Home } from 'lucide-vue-next'

interface BreadcrumbItem {
  label: string
  path: string
}

interface Props {
  items?: BreadcrumbItem[]
  showHome?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showHome: true,
})

const route = useRoute()

// Auto-generate breadcrumbs from route if no items provided
const breadcrumbItems = computed<BreadcrumbItem[]>(() => {
  if (props.items) {
    return props.items
  }

  // Auto-generate from current route
  const pathSegments = route.path.split('/').filter(Boolean)
  const items: BreadcrumbItem[] = []

  let currentPath = ''
  for (const segment of pathSegments) {
    currentPath += `/${segment}`

    // Generate label from segment
    let label = segment

    // Handle special cases
    if (segment === 'products') {
      label = 'Products'
    } else if (segment === 'cart') {
      label = 'Shopping Cart'
    } else if (segment === 'checkout') {
      label = 'Checkout'
    } else if (segment === 'orders') {
      label = 'Order History'
    } else if (segment === 'profile') {
      label = 'Profile'
    } else if (segment === 'login') {
      label = 'Login'
    } else if (segment === 'register') {
      label = 'Register'
    } else if (segment === 'about') {
      label = 'About Us'
    } else if (/^\d+$/.test(segment)) {
      // If it's a numeric ID, try to get more context
      const parentPath = currentPath.split('/').slice(0, -1).join('/')
      if (parentPath.includes('products')) {
        label = 'Product Details'
      } else if (parentPath.includes('orders')) {
        label = 'Order Details'
      } else {
        label = `#${segment}`
      }
    } else {
      // Capitalize and replace hyphens with spaces
      label = segment
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }

    items.push({
      label,
      path: currentPath,
    })
  }

  return items
})

// Don't show breadcrumbs on home page unless explicitly provided
const shouldShowBreadcrumbs = computed(() => {
  return props.items || route.path !== '/'
})
</script>
