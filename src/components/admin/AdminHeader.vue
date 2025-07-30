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
        <UserMenu />
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
import NotificationPanel from '@/components/admin/NotificationPanel.vue'
import UserMenu from '@/components/admin/UserMenu.vue'
import { Menu, Search } from 'lucide-vue-next'

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

const handleLogout = async () => {
  await useAuth().logout()
  router.push('/login')
}
</script>
