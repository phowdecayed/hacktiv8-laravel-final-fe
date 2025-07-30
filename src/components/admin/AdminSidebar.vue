<template>
  <aside
    class="bg-white shadow-lg transition-all duration-300 h-full flex flex-col"
    :class="[collapsed ? 'w-16' : 'w-64', isMobile ? 'fixed' : 'relative']"
  >
    <!-- Logo -->
    <div class="p-4 border-b border-gray-200 flex-shrink-0">
      <div class="flex items-center">
        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-sm">A</span>
        </div>
        <span
          v-if="!collapsed"
          class="ml-3 text-xl font-semibold text-gray-900 transition-opacity duration-300"
        >
          Admin Panel
        </span>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 mt-6 px-3 overflow-y-auto">
      <ul class="space-y-2">
        <li v-for="item in navigationItems" :key="item.path">
          <RouterLink
            :to="item.path"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 group"
            :class="[
              isActiveRoute(item.path)
                ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
            ]"
            :title="collapsed ? item.name : ''"
            @click="handleNavClick"
          >
            <component
              :is="getIcon(item.icon)"
              class="w-5 h-5 flex-shrink-0"
              :class="[
                collapsed ? 'mx-auto' : 'mr-3',
                isActiveRoute(item.path)
                  ? 'text-blue-700'
                  : 'text-gray-500 group-hover:text-gray-700',
              ]"
            />
            <span v-if="!collapsed" class="transition-opacity duration-300 truncate">
              {{ item.name }}
            </span>

            <!-- Badge for notifications (if any) -->
            <span
              v-if="!collapsed && item.badge"
              class="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
            >
              {{ item.badge }}
            </span>
          </RouterLink>
        </li>
      </ul>

      <!-- Role indicator -->
      <div
        v-if="!collapsed && user"
        class="mt-6 px-3 py-2 text-xs text-gray-500 border-t border-gray-200"
      >
        <div class="flex items-center">
          <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
          <span class="capitalize">{{ user.role }} Access</span>
        </div>
      </div>
    </nav>

    <!-- Collapse toggle -->
    <div class="flex-shrink-0 p-3 border-t border-gray-200">
      <Button
        @click="$emit('toggle-collapse')"
        variant="ghost"
        size="sm"
        class="w-full justify-center"
        :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      >
        <ChevronLeft
          class="w-4 h-4 transition-transform duration-300"
          :class="collapsed ? 'rotate-180' : ''"
        />
        <span v-if="!collapsed" class="ml-2">Collapse</span>
      </Button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { getAdminNavigation, type AdminNavigationItem } from '@/router/admin'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Users,
  Package,
  Tags,
  ShoppingCart,
  FileText,
  HardDrive,
  BarChart3,
  Settings,
  ChevronLeft,
} from 'lucide-vue-next'

interface Props {
  collapsed: boolean
  isMobile?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'toggle-collapse': []
  'nav-click': []
}>()

const route = useRoute()
const { user } = useAuth()

// Icon mapping
const iconMap = {
  LayoutDashboard,
  Users,
  Package,
  Tags,
  ShoppingCart,
  FileText,
  HardDrive,
  BarChart3,
  Settings,
}

// Computed properties
const navigationItems = computed(() => {
  if (!user?.role) return []
  return getAdminNavigation(user.role)
})

// Methods
const getIcon = (iconName: string) => {
  return iconMap[iconName as keyof typeof iconMap] || LayoutDashboard
}

const isActiveRoute = (path: string) => {
  return route.path === path || (route.path.startsWith(path) && route.path[path.length] === '/')
}

const handleNavClick = () => {
  emit('nav-click')
}
</script>
