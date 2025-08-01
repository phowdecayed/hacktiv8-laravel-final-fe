<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Toaster } from '@/components/ui/sonner'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import MobileNavigation from '@/components/layout/MobileNavigation.vue'
import ErrorBoundary from '@/components/common/ErrorBoundary.vue'
import GlobalLoading from '@/components/common/GlobalLoading.vue'
import 'vue-sonner/style.css' // vue-sonner v2 requires this import

const authStore = useAuthStore()
const route = useRoute()

onMounted(async () => {
  await authStore.checkAuth()
})

// Global loading state
const isGlobalLoading = ref(false)
const globalLoadingMessage = ref('Loading...')
const isMobileSearchOpen = ref(false)

// Check if we're in admin routes
const isAdminRoute = computed(() => {
  return route.path.startsWith('/admin')
})

// Expose global loading control
declare global {
  interface Window {
    showGlobalLoading: (message?: string) => void
    hideGlobalLoading: () => void
  }
}

window.showGlobalLoading = (message = 'Loading...') => {
  globalLoadingMessage.value = message
  isGlobalLoading.value = true
}

window.hideGlobalLoading = () => {
  isGlobalLoading.value = false
}
</script>

<template>
  <ErrorBoundary>
    <div class="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <AppHeader v-if="!isAdminRoute" @mobile-search-toggled="isMobileSearchOpen = $event" />
      <main
        class="flex-1"
        :class="{
          'container mx-auto px-4 pb-20 md:pb-10': !isAdminRoute,
          'pt-16': !isAdminRoute && !isMobileSearchOpen,
          'pt-32': !isAdminRoute && isMobileSearchOpen,
          'p-0': isAdminRoute,
        }"
      >
        <ErrorBoundary>
          <RouterView />
        </ErrorBoundary>
      </main>
      <AppFooter v-if="!isAdminRoute" class="hidden md:block" />
      <MobileNavigation v-if="!isAdminRoute" />
      <Toaster rich-colors position="top-center" class="w-full" />
      <GlobalLoading :is-visible="isGlobalLoading" :message="globalLoadingMessage" />
    </div>
  </ErrorBoundary>
</template>
