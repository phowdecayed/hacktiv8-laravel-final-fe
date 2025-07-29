<template>
  <header
    class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
  >
    <div class="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
      <!-- Logo and Brand -->
      <div class="flex items-center gap-6">
        <RouterLink to="/" class="flex items-center gap-2">
          <img alt="Logo" src="@/assets/logo.svg" class="h-8 w-8" />
          <span class="font-bold text-lg">E-Commerce</span>
        </RouterLink>

        <!-- Main Navigation -->
        <nav class="hidden md:flex items-center gap-6">
          <RouterLink
            to="/"
            class="text-sm font-medium transition-colors hover:text-primary"
            active-class="text-primary"
          >
            Home
          </RouterLink>
          <RouterLink
            to="/products"
            class="text-sm font-medium transition-colors hover:text-primary"
            active-class="text-primary"
          >
            Products
          </RouterLink>
        </nav>
      </div>

      <!-- Search Bar (Desktop) -->
      <div class="hidden md:flex flex-1 max-w-md mx-6">
        <div class="relative w-full">
          <SearchBar />
          <Button
            variant="ghost"
            size="sm"
            class="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 px-2 text-xs text-muted-foreground"
            @click="openGlobalSearch"
          >
            ⌘K
          </Button>
        </div>
      </div>

      <!-- Right Side Actions -->
      <div class="flex items-center gap-2">
        <!-- Search Button (Mobile) -->
        <Button variant="ghost" size="sm" class="md:hidden" @click="toggleMobileSearch">
          <Search class="h-4 w-4" />
        </Button>

        <!-- Cart Drawer -->
        <CartDrawer />

        <!-- User Menu -->
        <UserMenu v-if="isAuthenticated" />

        <!-- Auth Buttons -->
        <div v-else class="flex items-center gap-2">
          <Button variant="ghost" size="sm" @click="$router.push('/login')"> Login </Button>
          <Button size="sm" @click="$router.push('/register')"> Sign Up </Button>
        </div>

        <!-- Mobile Menu -->
        <Sheet v-model:open="isMobileMenuOpen">
          <SheetTrigger as-child>
            <Button variant="ghost" size="sm" class="md:hidden">
              <Menu class="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav class="flex flex-col gap-4 mt-6">
              <RouterLink
                to="/"
                class="text-sm font-medium transition-colors hover:text-primary"
                active-class="text-primary"
                @click="isMobileMenuOpen = false"
              >
                Home
              </RouterLink>
              <RouterLink
                to="/products"
                class="text-sm font-medium transition-colors hover:text-primary"
                active-class="text-primary"
                @click="isMobileMenuOpen = false"
              >
                Products
              </RouterLink>

              <!-- Authenticated User Links -->
              <template v-if="isAuthenticated">
                <Separator class="my-2" />
                <RouterLink
                  to="/cart"
                  class="text-sm font-medium transition-colors hover:text-primary"
                  active-class="text-primary"
                  @click="isMobileMenuOpen = false"
                >
                  Shopping Cart
                </RouterLink>
                <RouterLink
                  to="/orders"
                  class="text-sm font-medium transition-colors hover:text-primary"
                  active-class="text-primary"
                  @click="isMobileMenuOpen = false"
                >
                  Order History
                </RouterLink>
                <RouterLink
                  to="/profile"
                  class="text-sm font-medium transition-colors hover:text-primary"
                  active-class="text-primary"
                  @click="isMobileMenuOpen = false"
                >
                  Profile
                </RouterLink>
              </template>

              <!-- Auth Buttons -->
              <Separator class="my-2" />
              <div v-if="!isAuthenticated" class="flex flex-col gap-2">
                <Button variant="outline" @click="goToLogin"> Login </Button>
                <Button @click="goToRegister"> Sign Up </Button>
              </div>
              <div v-else class="flex flex-col gap-2">
                <Button variant="outline" @click="logout"> Logout </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>

    <!-- Mobile Search Bar -->
    <div v-if="showMobileSearch" class="border-t p-4">
      <SearchBar />
    </div>

    <!-- Global Search Dialog -->
    <GlobalSearch ref="globalSearchRef" />
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Search, Menu } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import CartDrawer from '@/components/cart/CartDrawer.vue'
import UserMenu from '@/components/auth/UserMenu.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import GlobalSearch from '@/components/common/GlobalSearch.vue'

const authStore = useAuthStore()
const emit = defineEmits(['mobile-search-toggled'])
const isAuthenticated = computed(() => authStore.isAuthenticated)
const router = useRouter()

const isMobileMenuOpen = ref(false)
const showMobileSearch = ref(false)

const toggleMobileSearch = () => {
  showMobileSearch.value = !showMobileSearch.value
  emit('mobile-search-toggled', showMobileSearch.value)
}

const goToLogin = () => {
  router.push('/login')
  isMobileMenuOpen.value = false
}

const goToRegister = () => {
  router.push('/register')
  isMobileMenuOpen.value = false
}

const logout = async () => {
  try {
    await authStore.logout()
    router.push('/')
    isMobileMenuOpen.value = false
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

const globalSearchRef = ref<InstanceType<typeof GlobalSearch> | null>(null)

const openGlobalSearch = () => {
  globalSearchRef.value?.open()
}
</script>
