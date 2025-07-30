<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
        <p class="text-gray-600">View business insights and performance metrics</p>
      </div>
      <div class="flex gap-2">
        <Button @click="refreshData" :disabled="isLoading">
          <RefreshCw class="h-4 w-4 mr-2" :class="{ 'animate-spin': isLoading }" />
          Refresh
        </Button>
        <Button variant="outline">
          <Download class="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>
    </div>

    <!-- Key Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card v-for="stat in statsCards" :key="stat.title">
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">{{ stat.title }}</p>
              <p class="text-2xl font-bold mt-1">{{ stat.value }}</p>
              <p class="text-xs mt-1" :class="stat.change >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ stat.change >= 0 ? '+' : '' }}{{ stat.change }}% from last period
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

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Sales Chart -->
      <Card>
        <CardHeader>
          <CardTitle class="text-lg">Sales Overview</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="h-80 flex items-center justify-center" v-if="isLoading">
            <RefreshCw class="h-6 w-6 animate-spin text-gray-400" />
          </div>
          <div
            v-else-if="salesData.length === 0"
            class="h-80 flex flex-col items-center justify-center text-gray-500"
          >
            <BarChart class="h-12 w-12 mb-2" />
            <p>No sales data available</p>
          </div>
          <div v-else class="h-80">
            <!-- Chart placeholder - would be replaced with actual chart component -->
            <div class="h-full bg-gray-50 rounded flex items-center justify-center">
              <p class="text-gray-500">Sales chart visualization would appear here</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Top Products -->
      <Card>
        <CardHeader>
          <CardTitle class="text-lg">Top Products</CardTitle>
          <CardDescription>By revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="h-80 flex items-center justify-center" v-if="isLoading">
            <RefreshCw class="h-6 w-6 animate-spin text-gray-400" />
          </div>
          <div
            v-else-if="!stats?.topProducts || stats.topProducts.length === 0"
            class="h-80 flex flex-col items-center justify-center text-gray-500"
          >
            <Package class="h-12 w-12 mb-2" />
            <p>No product data available</p>
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="(product, index) in stats.topProducts.slice(0, 5)"
              :key="product.id"
              class="flex items-center justify-between p-3 border rounded-lg"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span class="text-sm font-medium text-blue-600">#{{ index + 1 }}</span>
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ product.name }}</p>
                  <p class="text-sm text-gray-500">{{ product.category?.name }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-medium text-gray-900">{{ formatCurrency(product.price) }}</p>
                <p class="text-sm text-gray-500">{{ product.sales_count || 0 }} sold</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Inventory & Users Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Low Stock Items -->
      <Card>
        <CardHeader>
          <CardTitle class="text-lg">Low Stock Items</CardTitle>
          <CardDescription>Products with stock below threshold</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="h-80 flex items-center justify-center" v-if="isLoading">
            <RefreshCw class="h-6 w-6 animate-spin text-gray-400" />
          </div>
          <div
            v-else-if="!stats?.lowStockProducts || stats.lowStockProducts.length === 0"
            class="h-80 flex flex-col items-center justify-center text-gray-500"
          >
            <Package class="h-12 w-12 mb-2" />
            <p>All products are well stocked</p>
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="product in stats.lowStockProducts.slice(0, 5)"
              :key="product.id"
              class="flex items-center justify-between p-3 border rounded-lg"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Package class="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ product.name }}</p>
                  <p class="text-sm text-gray-500">{{ product.category?.name }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-medium text-red-600">{{ product.stock }} in stock</p>
                <p class="text-sm text-gray-500">Threshold: {{ product.min_stock ?? 10 }}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- User Activity -->
      <Card>
        <CardHeader>
          <CardTitle class="text-lg">User Activity</CardTitle>
          <CardDescription>Registration trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="h-80 flex items-center justify-center" v-if="isLoading">
            <RefreshCw class="h-6 w-6 animate-spin text-gray-400" />
          </div>
          <div
            v-else-if="userData.length === 0"
            class="h-80 flex flex-col items-center justify-center text-gray-500"
          >
            <Users class="h-12 w-12 mb-2" />
            <p>No user data available</p>
          </div>
          <div v-else class="h-80">
            <!-- Chart placeholder - would be replaced with actual chart component -->
            <div class="h-full bg-gray-50 rounded flex items-center justify-center">
              <p class="text-gray-500">User activity chart visualization would appear here</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Recent Transactions -->
    <Card>
      <CardHeader>
        <CardTitle class="text-lg">Recent Transactions</CardTitle>
        <CardDescription>Latest completed orders</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="h-80 flex items-center justify-center" v-if="isLoading">
          <RefreshCw class="h-6 w-6 animate-spin text-gray-400" />
        </div>
        <div
          v-else-if="!stats?.recentTransactions || stats.recentTransactions.length === 0"
          class="h-80 flex flex-col items-center justify-center text-gray-500"
        >
          <ShoppingCart class="h-12 w-12 mb-2" />
          <p>No recent transactions</p>
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="transaction in stats.recentTransactions.slice(0, 5)"
            :key="transaction.id"
            class="flex items-center justify-between p-3 border rounded-lg"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart class="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p class="font-medium text-gray-900">Order #{{ transaction.id }}</p>
                <p class="text-sm text-gray-500">{{ transaction.user?.name }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="font-medium text-gray-900">
                {{ formatCurrency(transaction.total_amount) }}
              </p>
              <p class="text-sm text-gray-500">{{ formatDate(transaction.created_at) }}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAnalytics } from '@/composables/useAnalytics'
import type { AdminDashboardStats } from '@/types/admin'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Icons
import {
  RefreshCw,
  Download,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  BarChart,
  AlertTriangle,
} from 'lucide-vue-next'

// Composables
const { stats, salesData, userData, isLoading, fetchDashboardStats, formatCurrency } =
  useAnalytics()

// Reactive state
const currentDate = new Date()

// Computed properties
const statsCards = computed(() => {
  if (!stats?.value) {
    console.warn('Stats data is null, returning empty array for statsCards.')
    return []
  }

  const defaultChange = 0 // Or any other default value you deem appropriate

  return [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.value.totalRevenue || 0),
      change: 12.5,
      icon: DollarSign,
      bgColor: 'bg-green-500',
    },
    {
      title: 'Total Users',
      value: (stats.value.totalUsers || 0).toLocaleString(),
      change: 8.2,
      icon: Users,
      bgColor: 'bg-blue-500',
    },
    {
      title: 'Total Products',
      value: (stats.value.totalProducts || 0).toLocaleString(),
      change: 5.7,
      icon: Package,
      bgColor: 'bg-purple-500',
    },
    {
      title: 'Total Transactions',
      value: (stats.value.totalTransactions || 0).toLocaleString(),
      change: -2.3 || defaultChange,
      icon: ShoppingCart,
      bgColor: 'bg-orange-500',
    },
  ]
})

// Methods
const refreshData = async () => {
  try {
    await fetchDashboardStats()
  } catch (error) {
    console.error('Failed to refresh dashboard data:', error)
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

// Lifecycle
onMounted(() => {
  refreshData()
})
</script>
