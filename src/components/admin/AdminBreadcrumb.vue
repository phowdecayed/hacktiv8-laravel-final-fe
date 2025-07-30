<template>
  <nav class="flex" aria-label="Breadcrumb">
    <Breadcrumb>
      <BreadcrumbList>
        <!-- Home/Dashboard -->
        <BreadcrumbItem>
          <BreadcrumbLink
            :href="isCurrentRoute('/admin/dashboard') ? undefined : '/admin/dashboard'"
            :class="isCurrentRoute('/admin/dashboard') ? 'text-gray-900 font-medium' : ''"
          >
            <Home class="w-4 h-4 mr-1" />
            Dashboard
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator v-if="breadcrumbItems.length > 0" />

        <!-- Dynamic breadcrumb items -->
        <template v-for="(item, index) in breadcrumbItems" :key="item.path">
          <BreadcrumbItem>
            <BreadcrumbLink
              v-if="index < breadcrumbItems.length - 1"
              :href="item.path"
              class="hover:text-gray-900 transition-colors"
            >
              {{ item.name }}
            </BreadcrumbLink>
            <BreadcrumbPage v-else class="text-gray-900 font-medium">
              {{ item.name }}
            </BreadcrumbPage>
          </BreadcrumbItem>

          <BreadcrumbSeparator v-if="index < breadcrumbItems.length - 1" />
        </template>
      </BreadcrumbList>
    </Breadcrumb>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Home } from 'lucide-vue-next'

const route = useRoute()

interface BreadcrumbItem {
  name: string
  path: string
}

// Breadcrumb name mapping for better display names
const breadcrumbNameMap: Record<string, string> = {
  dashboard: 'Dashboard',
  users: 'User Management',
  products: 'Product Management',
  categories: 'Category Management',
  transactions: 'Transaction Management',
  audit: 'Audit Trail',
  storage: 'Storage Management',
  analytics: 'Analytics & Reports',
  settings: 'Settings',
}

// Computed properties
const breadcrumbItems = computed((): BreadcrumbItem[] => {
  const pathSegments = route.path.split('/').filter((segment) => segment)
  const items: BreadcrumbItem[] = []

  // Skip 'admin' segment and build breadcrumb from remaining segments
  const adminIndex = pathSegments.indexOf('admin')
  if (adminIndex === -1) return items

  const relevantSegments = pathSegments.slice(adminIndex + 1)

  // Skip if we're on the dashboard (no additional breadcrumbs needed)
  if (
    relevantSegments.length === 0 ||
    (relevantSegments.length === 1 && relevantSegments[0] === 'dashboard')
  ) {
    return items
  }

  let currentPath = '/admin'

  for (const segment of relevantSegments) {
    currentPath += `/${segment}`

    // Use mapped name if available, otherwise format the segment
    let name = breadcrumbNameMap[segment]
    if (!name) {
      name = segment
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }

    items.push({
      name,
      path: currentPath,
    })
  }

  // Use route meta breadcrumb if available (highest priority)
  if (route.meta.breadcrumb) {
    const lastItem = items[items.length - 1]
    if (lastItem) {
      lastItem.name = route.meta.breadcrumb as string
    }
  }

  return items
})

// Methods
const isCurrentRoute = (path: string): boolean => {
  return route.path === path
}
</script>
