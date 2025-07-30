<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <Button variant="outline" @click="goBack">
          <ArrowLeft class="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Transaction #{{ transactionId }}</h1>
          <p class="text-gray-600">View and manage transaction details</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <Button variant="outline" @click="refreshTransaction" :disabled="isLoading">
          <RefreshCw class="h-4 w-4 mr-2" :class="{ 'animate-spin': isLoading }" />
          Refresh
        </Button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && !currentTransaction" class="space-y-6">
      <Card>
        <CardContent class="p-6">
          <div class="animate-pulse space-y-4">
            <div class="h-6 bg-gray-200 rounded w-1/4"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
            <div class="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Error State -->
    <Card v-else-if="error && !currentTransaction">
      <CardContent class="p-6">
        <div class="text-center py-12">
          <AlertCircle class="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">Failed to Load Transaction</h3>
          <p class="text-gray-600 mb-4">{{ error }}</p>
          <Button @click="refreshTransaction">Try Again</Button>
        </div>
      </CardContent>
    </Card>

    <!-- Transaction Details -->
    <div v-else-if="currentTransaction" class="space-y-6">
      <!-- Transaction Overview -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Transaction Info -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Transaction Header -->
          <Card>
            <CardContent class="p-6">
              <div class="flex items-start justify-between mb-6">
                <div>
                  <h2 class="text-xl font-semibold text-gray-900 mb-2">
                    Transaction #{{ currentTransaction.id }}
                  </h2>
                  <div class="flex items-center gap-4 text-sm text-gray-600">
                    <span>Created: {{ formatDate(currentTransaction.created_at) }}</span>
                    <span>•</span>
                    <span>Updated: {{ formatDate(currentTransaction.updated_at) }}</span>
                  </div>
                </div>
                <Badge :class="getStatusInfo(currentTransaction.status).color" class="text-sm">
                  {{ getStatusInfo(currentTransaction.status).icon }}
                  {{ getStatusInfo(currentTransaction.status).label }}
                </Badge>
              </div>

              <!-- Transaction Notes -->
              <div v-if="currentTransaction.notes" class="mb-6">
                <h3 class="text-sm font-medium text-gray-900 mb-2">Notes</h3>
                <p class="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {{ currentTransaction.notes }}
                </p>
              </div>

              <!-- Status Actions -->
              <div class="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button :disabled="isUpdating">
                      <Loader2 v-if="isUpdating" class="h-4 w-4 mr-2 animate-spin" />
                      <Settings v-else class="h-4 w-4 mr-2" />
                      Update Status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      v-for="status in getAvailableStatusTransitions(currentTransaction.status)"
                      :key="status"
                      @click="showStatusUpdateDialog(currentTransaction, status)"
                    >
                      <span class="mr-2">{{ getStatusInfo(status).icon }}</span>
                      Mark as {{ getStatusInfo(status).label }}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator v-if="canCancelOrRefund(currentTransaction.status)" />
                    <DropdownMenuItem
                      v-if="
                        currentTransaction.status !== 'cancelled' &&
                        currentTransaction.status !== 'refunded'
                      "
                      @click="showCancelDialog(currentTransaction)"
                      class="text-red-600"
                    >
                      <X class="h-4 w-4 mr-2" />
                      Cancel Transaction
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      v-if="['delivered', 'completed'].includes(currentTransaction.status)"
                      @click="showRefundDialog(currentTransaction)"
                      class="text-orange-600"
                    >
                      <RefreshCw class="h-4 w-4 mr-2" />
                      Refund Transaction
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>

          <!-- Order Items -->
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>
                {{ getTransactionItemCount(currentTransaction) }} items in this order
              </CardDescription>
            </CardHeader>
            <CardContent class="p-0">
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gray-50 border-b">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Product
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Price
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Quantity
                      </th>
                      <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                    <tr
                      v-for="item in currentTransaction.items"
                      :key="item.id"
                      class="hover:bg-gray-50"
                    >
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                          <div
                            class="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center"
                          >
                            <Package class="h-6 w-6 text-gray-400" />
                          </div>
                          <div>
                            <p class="text-sm font-medium text-gray-900">{{ item.product.name }}</p>
                            <p class="text-xs text-gray-500">ID: {{ item.product.id }}</p>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm text-gray-900">{{ formatCurrency(item.price) }}</span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm text-gray-900">{{ item.quantity }}</span>
                      </td>
                      <td class="px-6 py-4 text-right">
                        <span class="text-sm font-medium text-gray-900">
                          {{ formatCurrency(item.total) }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-gray-50">
                    <tr>
                      <td
                        colspan="3"
                        class="px-6 py-4 text-right text-sm font-medium text-gray-900"
                      >
                        Total Amount:
                      </td>
                      <td class="px-6 py-4 text-right text-lg font-bold text-gray-900">
                        {{ formatCurrency(currentTransaction.total_amount) }}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Customer Information -->
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User class="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">
                    {{ currentTransaction.user.name }}
                  </p>
                  <p class="text-xs text-gray-500">{{ currentTransaction.user.email }}</p>
                </div>
              </div>
              <div class="pt-4 border-t">
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p class="text-gray-500">Customer ID</p>
                    <p class="font-medium">{{ currentTransaction.user.id }}</p>
                  </div>
                  <div>
                    <p class="text-gray-500">Role</p>
                    <p class="font-medium capitalize">
                      {{ currentTransaction.user.role || 'Customer' }}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Transaction Summary -->
          <Card>
            <CardHeader>
              <CardTitle>Transaction Summary</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="space-y-3">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Transaction ID</span>
                  <span class="font-medium">#{{ currentTransaction.id }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Items Count</span>
                  <span class="font-medium">{{ getTransactionItemCount(currentTransaction) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Status</span>
                  <Badge :class="getStatusInfo(currentTransaction.status).color" class="text-xs">
                    {{ getStatusInfo(currentTransaction.status).label }}
                  </Badge>
                </div>
                <div class="flex justify-between text-sm pt-3 border-t">
                  <span class="text-gray-500">Total Amount</span>
                  <span class="font-bold text-lg">{{
                    formatCurrency(currentTransaction.total_amount)
                  }}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Quick Actions -->
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent class="space-y-3">
              <Button
                variant="outline"
                class="w-full justify-start"
                @click="viewCustomer(currentTransaction.user.id)"
              >
                <User class="h-4 w-4 mr-2" />
                View Customer Profile
              </Button>
              <Button
                variant="outline"
                class="w-full justify-start"
                @click="viewCustomerOrders(currentTransaction.user.id)"
              >
                <ShoppingCart class="h-4 w-4 mr-2" />
                Customer's Other Orders
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

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
import { onMounted, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTransactions } from '@/composables/useTransactions'
import type { Transaction, TransactionStatus } from '@/types'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

// Icons
import {
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Settings,
  X,
  User,
  Package,
  ShoppingCart,
  Loader2,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

// Get transaction ID from route
const transactionId = computed(() => parseInt(route.params.id as string))

// Composables
const {
  currentTransaction,
  isLoading,
  isUpdating,
  error,
  fetchTransaction,
  updateTransactionStatus,
  cancelTransaction,
  refundTransaction,
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

// Methods
const goBack = () => {
  router.push('/admin/transactions')
}

const refreshTransaction = () => {
  fetchTransaction(transactionId.value)
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
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const viewCustomer = (userId: number) => {
  router.push(`/admin/users/${userId}`)
}

const viewCustomerOrders = (userId: number) => {
  router.push(`/admin/transactions?customer=${userId}`)
}

// Initialize
onMounted(() => {
  if (transactionId.value) {
    fetchTransaction(transactionId.value)
  }
})
</script>
