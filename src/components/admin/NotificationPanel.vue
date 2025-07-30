<template>
  <div class="relative">
    <Button variant="ghost" size="sm" @click="togglePanel" class="relative">
      <Bell class="h-5 w-5" />
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </Button>

    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50"
      v-click-outside="closePanel"
    >
      <div class="p-4 border-b">
        <div class="flex items-center justify-between">
          <h3 class="font-medium">Notifications</h3>
          <Button v-if="unreadCount > 0" variant="ghost" size="sm" @click="markAllAsRead">
            Mark all as read
          </Button>
        </div>
      </div>

      <div class="max-h-96 overflow-y-auto">
        <div v-if="notifications.length === 0" class="p-8 text-center text-gray-500">
          <Bell class="h-8 w-8 mx-auto mb-2" />
          <p>No notifications</p>
        </div>

        <div v-else class="divide-y">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="p-4 hover:bg-gray-50 cursor-pointer"
            :class="{ 'bg-blue-50': !notification.read }"
            @click="handleNotificationClick(notification)"
          >
            <div class="flex items-start gap-3">
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                :class="getNotificationColor(notification.type)"
              >
                <component
                  :is="getNotificationIcon(notification.type)"
                  class="h-4 w-4 text-white"
                />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900">
                  {{ notification.title }}
                </p>
                <p class="text-sm text-gray-600 mt-1">
                  {{ notification.message }}
                </p>
                <p class="text-xs text-gray-500 mt-2">
                  {{ formatTime(notification.created_at) }}
                </p>
              </div>
              <Button
                v-if="!notification.read"
                variant="ghost"
                size="sm"
                @click.stop="markAsRead(notification.id)"
              >
                <Check class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="notifications.length > 0" class="p-2 border-t text-center">
        <Button variant="ghost" size="sm" class="w-full" @click="viewAll">
          View all notifications
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Bell, Check, AlertCircle, ShoppingCart, Package, User, FileText } from 'lucide-vue-next'

// Define notification types
interface Notification {
  id: number
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  read: boolean
  created_at: string
  link?: string
}

// Reactive state
const isOpen = ref(false)
const notifications = ref<Notification[]>([
  {
    id: 1,
    title: 'New Order',
    message: 'Order #1234 has been placed',
    type: 'info',
    read: false,
    created_at: new Date().toISOString(),
    link: '/admin/transactions/1234',
  },
  {
    id: 2,
    title: 'Low Stock Alert',
    message: 'Product "Widget A" is running low',
    type: 'warning',
    read: false,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    link: '/admin/products/567',
  },
  {
    id: 3,
    title: 'New User Registration',
    message: 'John Doe has registered',
    type: 'success',
    read: true,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    link: '/admin/users/890',
  },
])

const router = useRouter()

// Computed properties
const unreadCount = computed(() => {
  return notifications.value.filter((n) => !n.read).length
})

// Methods
const togglePanel = () => {
  isOpen.value = !isOpen.value
}

const closePanel = () => {
  isOpen.value = false
}

const markAsRead = (id: number) => {
  const notification = notifications.value.find((n) => n.id === id)
  if (notification) {
    notification.read = true
  }
}

const markAllAsRead = () => {
  notifications.value.forEach((n) => {
    n.read = true
  })
}

const handleNotificationClick = (notification: Notification) => {
  markAsRead(notification.id)
  if (notification.link) {
    router.push(notification.link)
    closePanel()
  }
}

const viewAll = () => {
  router.push('/admin/notifications')
  closePanel()
}

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'info':
      return 'bg-blue-500'
    case 'warning':
      return 'bg-yellow-500'
    case 'success':
      return 'bg-green-500'
    case 'error':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'info':
      return ShoppingCart
    case 'warning':
      return AlertCircle
    case 'success':
      return User
    case 'error':
      return AlertCircle
    default:
      return Bell
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

// Click outside directive
const vClickOutside = {
  beforeMount: (el: HTMLElement, binding: any) => {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted: (el: any) => {
    document.removeEventListener('click', el.clickOutsideEvent)
  },
}

// Simulate real-time notifications
let notificationInterval: NodeJS.Timeout

onMounted(() => {
  // Simulate receiving new notifications
  notificationInterval = setInterval(() => {
    // In a real app, this would come from a WebSocket or polling
    // For demo purposes, we'll randomly add notifications
    if (Math.random() > 0.99) {
      const newNotification: Notification = {
        id: Date.now(),
        title: 'System Update',
        message: 'A new system update is available',
        type: 'info',
        read: false,
        created_at: new Date().toISOString(),
      }
      notifications.value.unshift(newNotification)

      // Keep only the last 20 notifications
      if (notifications.value.length > 20) {
        notifications.value.pop()
      }
    }
  }, 5000)
})

onUnmounted(() => {
  if (notificationInterval) {
    clearInterval(notificationInterval)
  }
})
</script>
