<template>
  <div class="admin-layout bg-gray-50">
    <!-- Mobile sidebar overlay -->
    <div
      v-if="isMobile() && !sidebarCollapsed"
      class="mobile-sidebar-overlay lg:hidden"
      @click="closeMobileSidebar"
    />

    <!-- Sidebar -->
    <div
      class="admin-sidebar-container"
      :class="{
        'admin-sidebar-expanded': !sidebarCollapsed || !isMobile(),
        'admin-sidebar-collapsed': sidebarCollapsed && isMobile(),
      }"
    >
      <AdminSidebar
        :collapsed="sidebarCollapsed"
        :is-mobile="isMobile()"
        @toggle-collapse="toggleSidebar"
        @nav-click="handleNavClick"
      />
    </div>

    <!-- Main content wrapper -->
    <div
      class="admin-main-content"
      :class="{
        'admin-main-content-mobile': isMobile(),
        'admin-main-content-collapsed': !isMobile() && sidebarCollapsed,
        'admin-main-content-expanded': !isMobile() && !sidebarCollapsed,
      }"
    >
      <!-- Header -->
      <AdminHeader
        @toggle-sidebar="toggleSidebar"
        @logout="handleLogout"
        :is-mobile="isMobile()"
        class="admin-header"
      />

      <!-- Page content -->
      <main class="admin-content-area p-4 sm:p-6">
        <!-- Breadcrumb -->
        <AdminBreadcrumb v-if="showBreadcrumb" class="mb-4 sm:mb-6" />

        <!-- Router view with error boundary -->
        <Suspense>
          <template #default>
            <RouterView />
          </template>
          <template #fallback>
            <div class="flex items-center justify-center py-12">
              <div class="text-center">
                <div
                  class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"
                ></div>
                <p class="text-gray-600">Loading page...</p>
              </div>
            </div>
          </template>
        </Suspense>
      </main>
    </div>

    <!-- Global loading overlay -->
    <div
      v-if="isLoading"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 flex items-center space-x-4 shadow-xl">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="text-gray-700">Loading...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, Suspense } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useResponsive } from '@/composables/useResponsive'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminBreadcrumb from '@/components/admin/AdminBreadcrumb.vue'

const route = useRoute()
const { logout, isLoading, requireBackendAccess } = useAuth()
const { isMobile } = useResponsive()

// Sidebar state
const sidebarCollapsed = ref(false)

// Computed properties
const showBreadcrumb = computed(() => {
  return route.meta.breadcrumb || route.name !== 'admin-dashboard'
})

// Methods
const toggleSidebar = () => {
  if (isMobile()) {
    // On mobile, toggle means show/hide sidebar
    sidebarCollapsed.value = !sidebarCollapsed.value
  } else {
    // On desktop, toggle means collapse/expand
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
}

const closeMobileSidebar = () => {
  if (isMobile()) {
    sidebarCollapsed.value = true
  }
}

const handleNavClick = () => {
  // Close mobile sidebar when navigation item is clicked
  if (isMobile()) {
    sidebarCollapsed.value = true
  }
}

const handleLogout = async () => {
  await logout('/login')
}

// Watch for mobile/desktop changes
watch(
  isMobile,
  (newIsMobile) => {
    if (newIsMobile) {
      // When switching to mobile, hide sidebar
      sidebarCollapsed.value = true
    } else {
      // When switching to desktop, show sidebar in collapsed state
      sidebarCollapsed.value = false
    }
  },
  { immediate: false },
)

// Lifecycle
onMounted(() => {
  // Ensure user has backend access
  requireBackendAccess()

  // Set initial sidebar state based on screen size
  sidebarCollapsed.value = isMobile()
})
</script>
