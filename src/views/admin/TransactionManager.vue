<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Transaction Management</h1>
        <p class="text-gray-600">Process and manage customer orders</p>
      </div>
      <div class="flex items-center gap-3">
        <Button variant="outline" @click="refreshTransactions" :disabled="isLoading">
          <RefreshCw class="h-4 w-4 mr-2" :class="{ 'animate-spin': isLoading }" />
          Refresh
        </Button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Transactions</p>
              <p class="text-2xl font-bold text-gray-900">{{ pagination?.total || 0 }}</p>
            </div>
            <div class="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart class="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Pending</p>
              <p class="text-2xl font-bold text-yellow-600">{{ pendingTransactions.length }}</p>
            </div>
            <div class="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock class="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Processing</p>
              <p class="text-2xl font-bold text-blue-600">{{ processingTransactions.length }}</p>
            </div>
            <div class="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Settings class="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Completed</p>
              <p class="text-2xl font-bold text-green-600">{{ completedTransactions.length }}</p>
            </div>
            <div class="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle class="h-4 w-4 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Filters -->
    <Card>
      <CardContent class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Status Filter -->
          <div class="space-y-2">
            <Label for="status-filter">Status</Label>
            <Select
              v-model="filters.status"
              @update:model-value="
                updateFilters({
                  status: $event === 'all' ? undefined : ($event as TransactionStatus),
                })
              "
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Customer Search -->
          <div class="space-y-2">
            <Label for="customer-search">Customer</Label>
            <Input
              id="customer-search"
              v-model="filters.customer_search"
              placeholder="Search by customer name or email"
              @input="debouncedSearch"
            />
          </div>

          <!-- Date From -->
          <div class="space-y-2">
            <Label for="date-from">Date From</Label>
            <Input
              id="date-from"
              type="date"
              v-model="filters.date_from"
              @change="updateFilters({ date_from: $event.target.value })"
            />
          </div>

          <!-- Date To -->
          <div class="space-y-2">
            <Label for="date-to">Date To</Label>
            <Input
              id="date-to"
              type="date"
              v-model="filters.date_to"
              @change="updateFilters({ date_to: $event.target.value })"
            />
          </div>
        </div>

        <div class="flex items-center justify-between mt-4">
          <div class="flex items-center gap-2">
            <Button variant="outline" size="sm" @click="clearFilters">
              <X class="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
          <div class="flex items-center gap-2">
            <Label for="per-page">Show:</Label>
            <Select
              v-model="filters.per_page"
              @update:model-value="updateFilters({ per_page: parseInt($event as string) })"
            >
              <SelectTrigger class="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="10">10</SelectItem>
                <SelectItem :value="25">25</SelectItem>
                <SelectItem :value="50">50</SelectItem>
                <SelectItem :value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Transactions Table -->
    <Card>
      <CardContent class="p-6">
        <DataTable
          :data="transactions"
          :columns="tableColumns"
          :loading="isLoading"
          :selectable="false"
          :actions="tableActions"
          @action="handleAction"
        >
          <!-- Custom cell renderers -->
          <template #cell-id="{ item }">
            <span class="font-medium">#{{ item.id }}</span>
          </template>

          <template #cell-customer="{ item }">
            <div>
              <p class="font-medium">{{ item.user.name }}</p>
              <p class="text-sm text-muted-foreground">{{ item.user.email }}</p>
            </div>
          </template>

          <template #cell-items="{ item }">
            <span>{{ getTransactionItemCount(item) }} items</span>
          </template>

          <template #cell-total_amount="{ item }">
            <span class="font-medium">{{ formatCurrency(item.total_amount) }}</span>
          </template>

          <template #cell-status="{ item }">
            <Badge :class="getStatusInfo(item.status).color">
              {{ getStatusInfo(item.status).icon }}
              {{ getStatusInfo(item.status).label }}
            </Badge>
          </template>

          <template #cell-created_at="{ item }">
            {{ formatDate(item.created_at) }}
          </template>
        </DataTable>
      </CardContent>
    </Card>

    <!-- Status Update Dialog -->
    <Dialog v-model:open="statusUpdateDialog.show">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Transaction Status</DialogTitle>
          <DialogDescription>
            Change the status of transaction #{{ statusUpdateDialog.transaction?.id }} to
            {{ getStatusInfo(statusUpdateDialog.newStatus).label }}.
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="status-notes">Notes (optional)</Label>
            <Textarea
              id="status-notes"
              v-model="statusUpdateDialog.notes"
              placeholder="Add any notes about this status change..."
              rows="3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="statusUpdateDialog.show = false">Cancel</Button>
          <Button @click="confirmStatusUpdate" :disabled="isUpdating">
            <Loader2 v-if="isUpdating" class="h-4 w-4 mr-2 animate-spin" />
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Cancel Dialog -->
    <Dialog v-model:open="cancelDialog.show">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Transaction</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel transaction #{{ cancelDialog.transaction?.id }}? This
            action will restore product stock.
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="cancel-reason">Cancellation Reason</Label>
            <Textarea
              id="cancel-reason"
              v-model="cancelDialog.reason"
              placeholder="Please provide a reason for cancellation..."
              rows="3"
              required
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="cancelDialog.show = false">Keep Transaction</Button>
          <Button variant="destructive" @click="confirmCancel" :disabled="isUpdating">
            <Loader2 v-if="isUpdating" class="h-4 w-4 mr-2 animate-spin" />
            Cancel Transaction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Refund Dialog -->
    <Dialog v-model:open="refundDialog.show">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Refund Transaction</DialogTitle>
          <DialogDescription>
            Process a refund for transaction #{{ refundDialog.transaction?.id }}. This will restore
            product stock and mark the transaction as refunded.
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="refund-reason">Refund Reason</Label>
            <Textarea
              id="refund-reason"
              v-model="refundDialog.reason"
              placeholder="Please provide a reason for the refund..."
              rows="3"
              required
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="refundDialog.show = false">Cancel</Button>
          <Button variant="destructive" @click="confirmRefund" :disabled="isUpdating">
            <Loader2 v-if="isUpdating" class="h-4 w-4 mr-2 animate-spin" />
            Process Refund
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTransactions } from '@/composables/useTransactions'
import { debounce } from 'lodash-es'
import type { Transaction, TransactionStatus, TableColumn, TableAction } from '@/types'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import DataTable from '@/components/admin/DataTable.vue'

// Icons
import {
  RefreshCw,
  ShoppingCart,
  Clock,
  Settings,
  CheckCircle,
  X,
  Eye,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trash2,
} from 'lucide-vue-next'

const router = useRouter()

// Composables
const {
  transactions,
  isLoading,
  isUpdating,
  error,
  pagination,
  filters,
  hasTransactions,
  pendingTransactions,
  processingTransactions,
  completedTransactions,
  fetchTransactions,
  updateTransactionStatus,
  cancelTransaction,
  refundTransaction,
  deleteTransaction,
  updateFilters,
  clearFilters,
  goToPage,
  getStatusInfo,
  formatCurrency,
  getTransactionItemCount,
  getAvailableStatusTransitions,
} = useTransactions()

// Dialog states
const statusUpdateDialog = reactive({
  show: false,
  transaction: null as Transaction | null,
  newStatus: '' as TransactionStatus,
  notes: '',
})

const cancelDialog = reactive({
  show: false,
  transaction: null as Transaction | null,
  reason: '',
})

const refundDialog = reactive({
  show: false,
  transaction: null as Transaction | null,
  reason: '',
})

// Table configuration
const tableColumns: TableColumn[] = [
  { key: 'id', label: 'Transaction', sortable: true },
  { key: 'customer', label: 'Customer', sortable: true },
  { key: 'items', label: 'Items', sortable: false },
  { key: 'total_amount', label: 'Total', sortable: true, align: 'right' },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'created_at', label: 'Date', sortable: true },
]

const tableActions: TableAction[] = [
  { key: 'view', label: 'View Details', icon: Eye },
  { key: 'delete', label: 'Delete', icon: Trash2, variant: 'destructive' },
]

// Methods
const refreshTransactions = () => {
  fetchTransactions()
}

const debouncedSearch = debounce(() => {
  updateFilters({ customer_search: filters.customer_search })
}, 500)

const viewTransaction = (id: number) => {
  router.push(`/admin/transactions/${id}`)
}

const handleAction = async ({ action, item }: { action: string; item: Transaction }) => {
  switch (action) {
    case 'view':
      viewTransaction(item.id)
      break
    case 'delete':
      await deleteTransaction(item.id)
      break
  }
}

const showStatusUpdateDialog = (transaction: Transaction, newStatus: TransactionStatus) => {
  statusUpdateDialog.transaction = transaction
  statusUpdateDialog.newStatus = newStatus
  statusUpdateDialog.notes = ''
  statusUpdateDialog.show = true
}

const showCancelDialog = (transaction: Transaction) => {
  cancelDialog.transaction = transaction
  cancelDialog.reason = ''
  cancelDialog.show = true
}

const showRefundDialog = (transaction: Transaction) => {
  refundDialog.transaction = transaction
  refundDialog.reason = ''
  refundDialog.show = true
}

const confirmStatusUpdate = async () => {
  if (!statusUpdateDialog.transaction) return

  const success = await updateTransactionStatus(
    statusUpdateDialog.transaction.id,
    statusUpdateDialog.newStatus,
    statusUpdateDialog.notes || undefined,
  )

  if (success) {
    statusUpdateDialog.show = false
    statusUpdateDialog.transaction = null
    statusUpdateDialog.notes = ''
  }
}

const confirmCancel = async () => {
  if (!cancelDialog.transaction || !cancelDialog.reason.trim()) return

  const success = await cancelTransaction(cancelDialog.transaction.id, cancelDialog.reason)

  if (success) {
    cancelDialog.show = false
    cancelDialog.transaction = null
    cancelDialog.reason = ''
  }
}

const confirmRefund = async () => {
  if (!refundDialog.transaction || !refundDialog.reason.trim()) return

  const success = await refundTransaction(refundDialog.transaction.id, refundDialog.reason)

  if (success) {
    refundDialog.show = false
    refundDialog.transaction = null
    refundDialog.reason = ''
  }
}

const canCancelOrRefund = (status: TransactionStatus): boolean => {
  return !['cancelled', 'refunded'].includes(status)
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Initialize
onMounted(() => {
  fetchTransactions()
})
</script>
