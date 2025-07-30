<template>
  <div class="space-y-6">
    <!-- Welcome section -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Welcome back, {{ user?.name }}!</h2>
      <p class="text-gray-600">
        Here's what's happening with your {{ user?.role }} dashboard today.
      </p>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card v-for="stat in statsCards" :key="stat.title">
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">{{ stat.title }}</p>
              <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
              <p class="text-sm mt-1" :class="stat.change >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ stat.change >= 0 ? '+' : '' }}{{ stat.change }}% from last month
              </p>
            </div>
            <div
              class="w-12 h-12 rounded-lg flex items-center justify-center"
              :class="stat.bgColor"
            >
              <component :is="stat.icon" class="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Quick actions -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent activity -->
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest actions in your system</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div
              v-for="activity in recentActivity"
              :key="activity.id"
              class="flex items-start space-x-3"
            >
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                :class="activity.bgColor"
              >
                <component :is="activity.icon" class="w-4 h-4 text-white" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-900">{{ activity.description }}</p>
                <p class="text-xs text-gray-500">{{ activity.time }}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Quick actions -->
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for your role</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-2 gap-4">
            <Button
              v-for="action in quickActions"
              :key="action.name"
              @click="action.action"
              variant="outline"
              class="h-auto p-4 flex flex-col items-center space-y-2"
            >
              <component :is="action.icon" class="w-6 h-6" />
              <span class="text-sm">{{ action.name }}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-3 text-gray-600">Loading dashboard data...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useAnalytics } from '@/composables/useAnalytics'
import { useAuditTrail } from '@/composables/useAuditTrail'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  Plus,
  FileText,
  Settings,
  BarChart3,
  UserPlus,
  PackagePlus,
} from 'lucide-vue-next'

const router = useRouter()
const { user } = useAuth()
const { stats, isLoading, fetchDashboardStats, formatCurrency } = useAnalytics()
const { entries: auditEntries, fetchEntries: fetchAuditEntries } = useAuditTrail()

// Computed properties
const statsCards = computed(() => {
  if (!stats.value) return []
  return [
    {
      title: 'Total Users',
      value: stats.value.total_users.toLocaleString(),
      change: 12, // Placeholder
      icon: Users,
      bgColor: 'bg-blue-500',
    },
    {
      title: 'Products',
      value: stats.value.total_products.toLocaleString(),
      change: 8, // Placeholder
      icon: Package,
      bgColor: 'bg-green-500',
    },
    {
      title: 'Orders',
      value: stats.value.total_transactions.toLocaleString(),
      change: -3, // Placeholder
      icon: ShoppingCart,
      bgColor: 'bg-yellow-500',
    },
    {
      title: 'Revenue',
      value: formatCurrency(stats.value.total_sales),
      change: 15, // Placeholder
      icon: DollarSign,
      bgColor: 'bg-purple-500',
    },
  ]
})

const recentActivity = computed(() => {
  return auditEntries.slice(0, 5).map((entry: any) => ({
    id: entry.id,
    description: entry.description,
    time: new Date(entry.created_at).toLocaleString(),
    icon: UserPlus, // Placeholder
    bgColor: 'bg-blue-500', // Placeholder
  }))
})

// Computed properties
const quickActions = computed(() => {
  const actions = []

  if (user?.role === 'admin') {
    actions.push(
      {
        name: 'Add User',
        icon: UserPlus,
        action: () => router.push('/admin/users'),
      },
      {
        name: 'View Analytics',
        icon: BarChart3,
        action: () => router.push('/admin/analytics'),
      },
      {
        name: 'Settings',
        icon: Settings,
        action: () => router.push('/admin/settings'),
      },
      {
        name: 'Audit Trail',
        icon: FileText,
        action: () => router.push('/admin/audit'),
      },
    )
  }

  if (user?.role === 'editor' || user?.role === 'admin') {
    actions.push(
      {
        name: 'Add Product',
        icon: PackagePlus,
        action: () => router.push('/admin/products'),
      },
      {
        name: 'Manage Storage',
        icon: Package,
        action: () => router.push('/admin/storage'),
      },
    )
  }

  if (user?.role === 'moderator' || user?.role === 'admin') {
    actions.push({
      name: 'View Orders',
      icon: ShoppingCart,
      action: () => router.push('/admin/transactions'),
    })
  }

  return actions.slice(0, 4) // Limit to 4 actions for layout
})

// Methods
const loadDashboardData = async () => {
  await Promise.all([fetchDashboardStats(), fetchAuditEntries()])
}

// Lifecycle
onMounted(() => {
  loadDashboardData()
})
</script>
