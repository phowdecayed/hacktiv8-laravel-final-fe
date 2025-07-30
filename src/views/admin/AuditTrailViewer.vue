<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Audit Trail</h1>
        <p class="text-gray-600">Monitor system activities and changes</p>
      </div>
      <div class="flex gap-2">
        <Button @click="exportAuditTrail" :disabled="isExporting" variant="outline">
          <Download class="h-4 w-4 mr-2" />
          {{ isExporting ? 'Exporting...' : 'Export' }}
        </Button>
        <Button @click="refreshData" :disabled="isLoading">
          <RefreshCw class="h-4 w-4 mr-2" :class="{ 'animate-spin': isLoading }" />
          Refresh
        </Button>
      </div>
    </div>

    <!-- Filters -->
    <Card>
      <CardHeader>
        <CardTitle class="text-lg">Filters</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- User Filter -->
          <div class="space-y-2">
            <Label for="user-filter">User</Label>
            <Select v-if="users.length > 0" v-model="filters.user_id">
              <SelectTrigger>
                <SelectValue placeholder="All users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All users</SelectItem>
                <SelectItem v-for="user in users" :key="user.id" :value="user.id.toString()">
                  {{ user.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Model Type Filter -->
          <div class="space-y-2">
            <Label for="model-filter">Model Type</Label>
            <Select v-model="filters.model_type">
              <SelectTrigger>
                <SelectValue placeholder="All models" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All models</SelectItem>
                <SelectItem value="User">User</SelectItem>
                <SelectItem value="Product">Product</SelectItem>
                <SelectItem value="Category">Category</SelectItem>
                <SelectItem value="Transaction">Transaction</SelectItem>
                <SelectItem value="StorageFile">Storage File</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Action Filter -->
          <div class="space-y-2">
            <Label for="action-filter">Action</Label>
            <Select v-model="filters.action">
              <SelectTrigger>
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="updated">Updated</SelectItem>
                <SelectItem value="deleted">Deleted</SelectItem>
                <SelectItem value="restored">Restored</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Date Range -->
          <div class="space-y-2">
            <Label>Date Range</Label>
            <Popover>
              <PopoverTrigger as-child>
                <Button variant="outline" class="w-full justify-start text-left font-normal">
                  <CalendarIcon class="mr-2 h-4 w-4" />
                  {{ dateRangeText }}
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-auto p-0" align="start">
                <Calendar
                  v-model="dateRange"
                  mode="range"
                  :columns="2"
                  @update:model-value="updateDateRange"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div class="flex gap-2">
          <Button @click="applyFilters" :disabled="isLoading">
            <Filter class="h-4 w-4 mr-2" />
            Apply Filters
          </Button>
          <Button @click="clearFilters" variant="outline" :disabled="isLoading">
            <X class="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Audit Trail Timeline -->
    <Card>
      <CardHeader>
        <CardTitle class="text-lg">Activity Timeline</CardTitle>
        <CardDescription> {{ totalEntries }} total entries </CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="isLoading && !hasEntries" class="flex justify-center py-12">
          <div class="flex items-center gap-2">
            <RefreshCw class="h-4 w-4 animate-spin" />
            <span>Loading audit trail...</span>
          </div>
        </div>

        <div v-else-if="!hasEntries" class="text-center py-12">
          <FileSearch class="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">No audit entries found</h3>
          <p class="text-gray-500">Try adjusting your filters or check back later.</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="entry in auditEntries"
            :key="entry.id"
            class="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            @click="selectEntry(entry)"
          >
            <div class="flex items-start justify-between">
              <div class="flex items-start gap-3">
                <div class="flex-shrink-0">
                  <Badge :variant="getActionVariant(entry.action)">
                    {{ entry.action }}
                  </Badge>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-medium text-gray-900">{{ entry.user.name }}</span>
                    <span class="text-gray-500">{{ entry.action }}</span>
                    <span class="font-medium text-gray-900">{{ entry.model_type }}</span>
                    <span class="text-gray-500">#{{ entry.model_id }}</span>
                  </div>
                  <div class="text-sm text-gray-500 mb-2">
                    {{ formatDateTime(entry.created_at) }} • {{ entry.ip_address }}
                  </div>
                  <div v-if="entry.old_values || entry.new_values" class="text-sm">
                    <AuditChangesSummary :entry="entry" />
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <ChevronRight class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="hasEntries && pagination.last_page > 1" class="mt-6">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-500">
              Showing {{ (pagination.current_page - 1) * pagination.per_page + 1 }} to
              {{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }} of
              {{ pagination.total }} entries
            </div>
            <div class="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                :disabled="pagination.current_page <= 1"
                @click="changePage(pagination.current_page - 1)"
              >
                <ChevronLeft class="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                :disabled="pagination.current_page >= pagination.last_page"
                @click="changePage(pagination.current_page + 1)"
              >
                Next
                <ChevronRight class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Audit Entry Detail Dialog -->
    <AuditEntryDetailDialog
      :entry="selectedEntry"
      :open="!!selectedEntry"
      @close="selectedEntry = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuditTrailStore } from '@/stores/auditTrail'
import { adminApiService } from '@/services/api/admin'
import { useNotifications } from '@/composables/useNotifications'
import type { AuditTrail, AuditTrailFilters, User } from '@/types'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

// Icons
import {
  Download,
  RefreshCw,
  Filter,
  X,
  CalendarIcon,
  FileSearch,
  ChevronRight,
  ChevronLeft,
} from 'lucide-vue-next'

// Custom Components
import AuditChangesSummary from '@/components/admin/AuditChangesSummary.vue'
import AuditEntryDetailDialog from '@/components/admin/AuditEntryDetailDialog.vue'

// Store and composables
const auditStore = useAuditTrailStore()
const { showSuccess, showError } = useNotifications()

// Reactive state
const users = ref<User[]>([])
const selectedEntry = ref<AuditTrail | null>(null)
const dateRange = ref<any>(null)

// Filters
const filters = ref<AuditTrailFilters>({
  per_page: 20,
})

// Computed properties
const auditEntries = computed(() => auditStore.auditEntries)
const pagination = computed(() => auditStore.pagination)
const isLoading = computed(() => auditStore.isLoading)
const isExporting = computed(() => auditStore.isExporting)
const hasEntries = computed(() => auditStore.hasEntries)
const totalEntries = computed(() => auditStore.totalEntries)

const dateRangeText = computed(() => {
  if (!dateRange.value) return 'Select date range'
  const { start, end } = dateRange.value
  if (start && end) {
    return `${new Date(start.toString()).toLocaleDateString()} - ${new Date(end.toString()).toLocaleDateString()}`
  } else if (start) {
    return `From ${new Date(start.toString()).toLocaleDateString()}`
  }
  return 'Select date range'
})

// Methods
const loadUsers = async () => {
  try {
    const response = await adminApiService.getUsers({ per_page: 100 })
    users.value = response.data.data
  } catch (error) {
    console.error('Failed to load users:', error)
  }
}

const refreshData = async () => {
  try {
    await auditStore.fetchAuditTrail()
    showSuccess('Audit trail refreshed successfully')
  } catch (error) {
    showError('Failed to refresh audit trail')
  }
}

const applyFilters = async () => {
  try {
    // Clean up empty string values
    const cleanFilters = Object.fromEntries(
      Object.entries(filters.value).filter(
        ([_, value]) => value !== 'all' && value !== null && value !== undefined,
      ),
    )
    await auditStore.fetchAuditTrail(cleanFilters)
  } catch (error) {
    showError('Failed to apply filters')
  }
}

const clearFilters = async () => {
  filters.value = { per_page: 20 }
  dateRange.value = null
  auditStore.clearFilters()
  try {
    await auditStore.fetchAuditTrail()
  } catch (error) {
    showError('Failed to clear filters')
  }
}

const updateDateRange = (range: any) => {
  if (range?.start) {
    filters.value.date_from = new Date(range.start.toString()).toISOString().split('T')[0]
  } else {
    delete filters.value.date_from
  }

  if (range?.end) {
    filters.value.date_to = new Date(range.end.toString()).toISOString().split('T')[0]
  } else {
    delete filters.value.date_to
  }
}

const changePage = async (page: number) => {
  try {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters.value).filter(
        ([_, value]) => value !== 'all' && value !== null && value !== undefined,
      ),
    )
    await auditStore.fetchAuditTrail({ ...cleanFilters, page })
  } catch (error) {
    showError('Failed to load page')
  }
}

const selectEntry = (entry: AuditTrail) => {
  selectedEntry.value = entry
}

const exportAuditTrail = async () => {
  try {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters.value).filter(
        ([_, value]) => value !== 'all' && value !== null && value !== undefined,
      ),
    )
    await auditStore.exportAuditTrail(cleanFilters)
    showSuccess('Audit trail exported successfully')
  } catch (error) {
    showError('Failed to export audit trail')
  }
}

const getActionVariant = (action: string) => {
  switch (action) {
    case 'created':
      return 'default'
    case 'updated':
      return 'secondary'
    case 'deleted':
      return 'destructive'
    case 'restored':
      return 'outline'
    default:
      return 'secondary'
  }
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

// Watchers
watch(
  () => filters.value,
  () => {
    auditStore.setFilters(filters.value)
  },
  { deep: true },
)

// Lifecycle
onMounted(async () => {
  await Promise.all([loadUsers(), refreshData()])
})
</script>
