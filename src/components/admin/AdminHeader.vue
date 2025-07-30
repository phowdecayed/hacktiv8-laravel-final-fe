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
        <NotificationPanel />

        <!-- User menu -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" class="flex items-center space-x-2 px-2 sm:px-3">
              <Avatar class="w-8 h-8">
                <AvatarImage :src="''" :alt="user?.name || 'User'"/>
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
import NotificationPanel from '@/components/admin/NotificationPanel.vue'
import {
  Menu,
  Search,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Palette,
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

const toggleTheme = () => {
  // Implement theme toggle functionality
  console.log('Toggle theme')
}

const goToProfile = () => {
  router.push('/profile')
}

const goToSettings = () => {
  router.push('/admin/settings')
}

const handleLogout = async () => {
  await useAuth().logout()
  router.push('/login')
}
</script>
