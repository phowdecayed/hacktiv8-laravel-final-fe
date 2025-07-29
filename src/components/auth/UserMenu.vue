<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" class="relative h-8 w-8 rounded-full">
        <Avatar class="h-8 w-8">
          <AvatarImage :src="avatarUrl" :alt="user?.name" />
          <AvatarFallback>{{ userInitials }}</AvatarFallback>
        </Avatar>
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent class="w-56" align="end" :side-offset="5">
      <DropdownMenuLabel class="font-normal">
        <div class="flex flex-col space-y-1">
          <p class="text-sm font-medium leading-none">{{ user?.name }}</p>
          <p class="text-xs leading-none text-muted-foreground">
            {{ user?.email }}
          </p>
        </div>
      </DropdownMenuLabel>

      <DropdownMenuSeparator />

      <DropdownMenuItem @click="goToProfile" class="cursor-pointer">
        <User class="mr-2 h-4 w-4" />
        <span>Profile</span>
      </DropdownMenuItem>

      <DropdownMenuItem @click="goToOrders" class="cursor-pointer">
        <ShoppingBag class="mr-2 h-4 w-4" />
        <span>My Orders</span>
      </DropdownMenuItem>

      <DropdownMenuItem @click="goToCart" class="cursor-pointer">
        <ShoppingCart class="mr-2 h-4 w-4" />
        <span>Shopping Cart</span>
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        @click="handleLogout"
        class="cursor-pointer text-red-600 focus:text-red-600"
      >
        <LogOut class="mr-2 h-4 w-4" />
        <span>Log out</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, ShoppingBag, ShoppingCart, LogOut } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'

const { user, logout } = useAuth()
const router = useRouter()

const userInitials = computed(() => {
  if (!user?.name) return 'U'
  return user.name
    .split(' ')
    .map((name: string) => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const avatarUrl = computed(() => {
  // For now, return empty string to use initials
  // In the future, this could be user?.avatar_url
  return ''
})

const goToProfile = () => {
  router.push('/profile')
}

const goToOrders = () => {
  router.push('/orders')
}

const goToCart = () => {
  router.push('/cart')
}

const handleLogout = async () => {
  await logout()
}
</script>
