<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="flex items-center justify-between px-4 sm:px-6 py-4">
      <!-- Left side -->
      <div class="flex items-center space-x-4">
        <!-- Sidebar toggle -->
        <Button
          @click="$emit('toggle-sidebar')"
          variant="ghost"
          size="sm"
          :class="isMobile ? 'block' : 'lg:hidden'"
        >
          <Menu class="w-5 h-5" />
        </Button>

        <!-- Page title -->
        <div class="min-w-0 flex-1">
          <h1 class="text-lg sm:text-xl font-semibold text-gray-900 truncate">
            {{ pageTitle }}
          </h1>
          <p v-if="pageDescription && !isMobile" class="text-sm text-gray-600 truncate">
            {{ pageDescription }}
          </p>
        </div>
      </div>

      <!-- Right side -->
      <div class="flex items-center space-x-2 sm:space-x-4">
        <!-- Search -->
        <div class="relative hidden md:block">
          <Search
            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
          />
          <Input
            v-model="searchQuery"
            placeholder="Search..."
            class="pl-10 w-48 lg:w-64"
            @keyup.enter="handleSearch"
            @input="handleSearchInput"
          />
        </div>

        <!-- Mobile search toggle -->
        <Button v-if="isMobile" @click="toggleMobileSearch" variant="ghost" size="sm">
          <Search class="w-5 h-5" />
        </Button>

        <!-- Notifications -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="sm" class="relative">
              <Bell class="w-5 h-5" />
              <span
                v-if="notificationCount > 0"
                class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
              >
                {{ notificationCount > 9 ? '9+' : notificationCount }}
              </span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" class="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <div v-if="notifications.length === 0" class="p-4 text-center text-gray-500">
              No new notifications
            </div>

            <div v-else class="max-h-64 overflow-y-auto">
              <DropdownMenuItem
                v-for="notification in notifications"
                :key="notification.id"
                class="flex flex-col items-start p-3 hover:bg-gray-50"
              >
                <div class="flex items-start w-full">
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
                    <p class="text-xs text-gray-600 mt-1">{{ notification.message }}</p>
                    <p class="text-xs text-gray-400 mt-1">
                      {{ formatTime(notification.created_at) }}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    @click.stop="dismissNotification(notification.id)"
                  >
                    <X class="w-3 h-3" />
                  </Button>
                </div>
              </DropdownMenuItem>
            </div>

            <DropdownMenuSeparator />
            <DropdownMenuItem @click="viewAllNotifications" class="text-center">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <!-- User menu -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" class="flex items-center space-x-2 px-2 sm:px-3">
              <Avatar class="w-8 h-8">
                <AvatarImage :src="''" :alt="user?.name || 'User'" />
                <AvatarFallback>
                  {{ userInitials }}
                </AvatarFallback>
              </Avatar>
              <div class="hidden sm:block text-left">
                <p class="text-sm font-medium text-gray-900">{{ user?.name }}</p>
                <p class="text-xs text-gray-500 capitalize">{{ user?.role }}</p>
              </div>
              <ChevronDown class="w-4 h-4 text-gray-400 hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" class="w-56">
            <DropdownMenuLabel>
              <div class="flex flex-col">
                <span>{{ user?.name }}</span>
                <span class="text-xs font-normal text-gray-500 capitalize">{{ user?.role }}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem @click="goToProfile">
              <User class="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>

            <DropdownMenuItem @click="goToSettings" v-if="canAccessSettings">
              <Settings class="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>

            <DropdownMenuItem @click="toggleTheme">
              <Palette class="w-4 h-4 mr-2" />
              Theme
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem @click="handleLogout" class="text-red-600 focus:text-red-600">
              <LogOut class="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <!-- Mobile search bar -->
    <div v-if="showMobileSearch" class="px-4 pb-4 border-t border-gray-200">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          v-model="searchQuery"
          placeholder="Search..."
          class="pl-10 w-full"
          @keyup.enter="handleSearch"
          @input="handleSearchInput"
          ref="mobileSearchInput"
        />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Palette,
  X,
} from 'lucide-vue-next'

interface Props {
  isMobile?: boolean
}

defineProps<Props>()

defineEmits<{
  'toggle-sidebar': []
}>()

const route = useRoute()
const router = useRouter()
const { user, isAdmin } = useAuth()

// State
const searchQuery = ref('')
const showMobileSearch = ref(false)
const mobileSearchInput = ref<HTMLInputElement>()

// Mock notifications - in real app, this would come from a store/API
const notifications = ref([
  {
    id: 1,
    title: 'New Order',
    message: 'Order #1234 has been placed',
    created_at: new Date().toISOString(),
    read: false,
  },
  {
    id: 2,
    title: 'Low Stock Alert',
    message: 'Product "Widget A" is running low',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    read: false,
  },
  {
    id: 3,
    title: 'System Update',
    message: 'System maintenance completed',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    read: true,
  },
])

// Computed properties
const pageTitle = computed(() => {
  return (route.meta.title as string) || 'Dashboard'
})

const pageDescription = computed(() => {
  return (route.meta.description as string) || ''
})

const userInitials = computed(() => {
  if (!user?.name) return 'U'
  return user.name
    .split(' ')
    .map((word: string) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const notificationCount = computed(() => {
  return notifications.value.filter((n) => !n.read).length
})

const canAccessSettings = computed(() => {
  return isAdmin.value
})

// Methods
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    // Implement global search functionality
    console.log('Searching for:', searchQuery.value)
    // You could emit an event or use a global search store
    router.push(`/admin/search?q=${encodeURIComponent(searchQuery.value)}`)
  }
}

const handleSearchInput = () => {
  // Implement real-time search suggestions if needed
  // This could trigger a debounced search for suggestions
}

const toggleMobileSearch = async () => {
  showMobileSearch.value = !showMobileSearch.value
  if (showMobileSearch.value) {
    await nextTick()
    mobileSearchInput.value?.focus()
  }
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
  return `${Math.floor(diffInMinutes / 1440)}d ago`
}

const dismissNotification = (id: number) => {
  const index = notifications.value.findIndex((n) => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

const viewAllNotifications = () => {
  router.push('/admin/notifications')
}

const goToProfile = () => {
  router.push('/profile')
}

const goToSettings = () => {
  router.push('/admin/settings')
}

const toggleTheme = () => {
  // Implement theme toggle functionality
  console.log('Toggle theme')
}

const handleLogout = async () => {
  await useAuth().logout()
  router.push('/login')
}
</script>
