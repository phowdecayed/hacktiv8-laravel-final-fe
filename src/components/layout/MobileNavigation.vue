<template>
  <div class="md:hidden">
    <!-- Mobile Bottom Navigation -->
    <div class="fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <nav class="flex items-center justify-around py-2">
        <RouterLink
          v-for="item in navigationItems"
          :key="item.path"
          :to="item.path"
          class="flex flex-col items-center gap-1 p-2 min-w-[60px] text-xs font-medium transition-colors active:scale-95"
          :class="[
            isActive(item.path) ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
          ]"
        >
          <div class="relative">
            <component :is="item.icon" class="w-5 h-5" />
            <Badge
              v-if="item.badge && item.badge > 0"
              variant="destructive"
              class="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-xs"
            >
              {{ item.badge > 99 ? '99+' : item.badge }}
            </Badge>
          </div>
          <span class="truncate">{{ item.label }}</span>
        </RouterLink>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { Badge } from '@/components/ui/badge'
import { Home, Package, ShoppingCart, User, History } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useCart } from '@/composables/useCart'
import type { Component } from 'vue'

interface NavigationItem {
  path: string
  label: string
  icon: Component
  badge?: number
  requiresAuth?: boolean
}

const route = useRoute()
const authStore = useAuthStore()
const { itemCount } = useCart()

const isAuthenticated = computed(() => authStore.isAuthenticated)

const navigationItems = computed<NavigationItem[]>(() => {
  const items: NavigationItem[] = [
    {
      path: '/',
      label: 'Home',
      icon: Home,
    },
    {
      path: '/products',
      label: 'Products',
      icon: Package,
    },
  ]

  if (isAuthenticated.value) {
    items.push(
      {
        path: '/cart',
        label: 'Cart',
        icon: ShoppingCart,
        badge: itemCount.value,
        requiresAuth: true,
      },
      {
        path: '/orders',
        label: 'Orders',
        icon: History,
        requiresAuth: true,
      },
      {
        path: '/profile',
        label: 'Profile',
        icon: User,
        requiresAuth: true,
      },
    )
  } else {
    items.push({
      path: '/login',
      label: 'Login',
      icon: User,
    })
  }

  return items
})

const isActive = (path: string): boolean => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>
