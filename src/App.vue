<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import { Toaster } from '@/components/ui/sonner'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import MobileNavigation from '@/components/layout/MobileNavigation.vue'
import ErrorBoundary from '@/components/common/ErrorBoundary.vue'
import GlobalLoading from '@/components/common/GlobalLoading.vue'
import 'vue-sonner/style.css' // vue-sonner v2 requires this import

// Global loading state
const isGlobalLoading = ref(false)
const globalLoadingMessage = ref('Loading...')

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
      <AppHeader />
      <main class="flex-1 container mx-auto px-4 py-8 pb-20 md:pb-8 min-h-[calc(100vh-theme('spacing.16')-theme('spacing.16'))]">
        <ErrorBoundary>
          <RouterView />
        </ErrorBoundary>
      </main>
      <AppFooter class="hidden md:block" />
      <MobileNavigation />
      <Toaster />
      <GlobalLoading :is-visible="isGlobalLoading" :message="globalLoadingMessage" />
    </div>
  </ErrorBoundary>
</template>
