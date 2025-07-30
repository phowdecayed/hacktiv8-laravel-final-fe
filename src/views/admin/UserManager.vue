<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">User Management</h1>
        <p class="text-gray-600">Manage user accounts and roles</p>
      </div>
      <Button @click="openCreateDialog">
        <Plus class="w-4 h-4 mr-2" />
        Add User
      </Button>
    </div>

    <!-- Filters -->
    <Card>
      <CardContent class="p-4">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex-1 min-w-64 relative">
            <Search
              class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
            />
            <Input
              v-model="searchQuery"
              placeholder="Search users by name or email..."
              class="w-full pl-10"
              @input="handleSearch"
            />
          </div>

          <Select v-model="selectedRole" @update:model-value="handleRoleFilter">
            <SelectTrigger class="w-40">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
            </SelectContent>
          </Select>

          <Select v-model="verifiedFilter" @update:model-value="handleVerifiedFilter">
            <SelectTrigger class="w-40">
              <SelectValue placeholder="All Users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Users</SelectItem>
              <SelectItem value="true">Verified</SelectItem>
              <SelectItem value="false">Unverified</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" @click="clearFilters">
            <X class="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Users Table -->
    <Card>
      <CardContent class="p-0">
        <DataTable
          :data="users"
          :columns="tableColumns"
          :loading="isLoading"
          :actions="tableActions"
          :bulk-actions="bulkActions"
          selectable
          @action="handleAction"
          @bulk-action="handleBulkAction"
          @export="handleExport"
        >
          <!-- Custom cell renderers -->
          <template #cell-role="{ value }">
            <Badge :variant="getRoleVariant(value)">
              {{ getRoleLabel(value) }}
            </Badge>
          </template>

          <template #cell-email_verified_at="{ value }">
            <div class="flex items-center space-x-2">
              <div :class="['w-2 h-2 rounded-full', value ? 'bg-green-500' : 'bg-red-500']" />
              <span class="text-sm">
                {{ value ? 'Verified' : 'Unverified' }}
              </span>
            </div>
          </template>

          <template #cell-statistics="{ item }">
            <div class="text-sm space-y-1">
              <div>Products: {{ item.statistics?.total_products || 0 }}</div>
              <div>Transactions: {{ item.statistics?.total_transactions || 0 }}</div>
            </div>
          </template>

          <template #cell-created_at="{ value }">
            <span class="text-sm text-muted-foreground">
              {{ formatDate(value) }}
            </span>
          </template>
        </DataTable>
      </CardContent>
    </Card>

    <!-- Create/Edit User Dialog -->
    <Dialog v-model:open="showUserDialog">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {{ editingUser ? 'Edit User' : 'Create New User' }}
          </DialogTitle>
          <DialogDescription>
            {{
              editingUser ? 'Update user information and role.' : 'Add a new user to the system.'
            }}
          </DialogDescription>
        </DialogHeader>

        <FormBuilder
          :schema="userFormSchema"
          :initial-values="userFormData"
          :loading="isSubmitting"
          @submit="handleUserSubmit"
          @cancel="closeUserDialog"
        />
      </DialogContent>
    </Dialog>

    <!-- User Details Dialog -->
    <Dialog v-model:open="showDetailsDialog">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription> View detailed information about this user. </DialogDescription>
        </DialogHeader>

        <div v-if="selectedUser" class="space-y-6">
          <!-- Basic Information -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="text-sm font-medium text-muted-foreground">Name</Label>
              <p class="text-sm">{{ selectedUser.name }}</p>
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground">Email</Label>
              <p class="text-sm">{{ selectedUser.email }}</p>
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground">Role</Label>
              <Badge :variant="getRoleVariant(selectedUser.role)">
                {{ getRoleLabel(selectedUser.role) }}
              </Badge>
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground">Status</Label>
              <div class="flex items-center space-x-2">
                <div
                  :class="[
                    'w-2 h-2 rounded-full',
                    selectedUser.email_verified_at ? 'bg-green-500' : 'bg-red-500',
                  ]"
                />
                <span class="text-sm">
                  {{ selectedUser.email_verified_at ? 'Verified' : 'Unverified' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Statistics -->
          <div v-if="selectedUser.statistics">
            <Label class="text-sm font-medium text-muted-foreground">Statistics</Label>
            <div class="grid grid-cols-2 gap-4 mt-2">
              <div class="bg-muted/50 p-3 rounded-lg">
                <p class="text-2xl font-bold">{{ selectedUser.statistics.total_products }}</p>
                <p class="text-sm text-muted-foreground">Products Created</p>
              </div>
              <div class="bg-muted/50 p-3 rounded-lg">
                <p class="text-2xl font-bold">{{ selectedUser.statistics.total_transactions }}</p>
                <p class="text-sm text-muted-foreground">Transactions</p>
              </div>
              <div class="bg-muted/50 p-3 rounded-lg">
                <p class="text-2xl font-bold">{{ selectedUser.statistics.total_categories }}</p>
                <p class="text-sm text-muted-foreground">Categories Created</p>
              </div>
              <div class="bg-muted/50 p-3 rounded-lg">
                <p class="text-2xl font-bold">${{ selectedUser.statistics.total_revenue || 0 }}</p>
                <p class="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </div>

          <!-- Permissions -->
          <div v-if="selectedUser.permissions && selectedUser.permissions.length > 0">
            <Label class="text-sm font-medium text-muted-foreground">Permissions</Label>
            <div class="flex flex-wrap gap-2 mt-2">
              <Badge
                v-for="permission in selectedUser.permissions"
                :key="permission"
                variant="outline"
              >
                {{ permission }}
              </Badge>
            </div>
          </div>

          <!-- Timestamps -->
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label class="text-sm font-medium text-muted-foreground">Created</Label>
              <p>{{ formatDate(selectedUser.created_at) }}</p>
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground">Last Updated</Label>
              <p>{{ formatDate(selectedUser.updated_at) }}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="closeDetailsDialog">Close</Button>
          <Button @click="editUser(selectedUser!)">Edit User</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Confirmation Dialog -->
    <ConfirmationDialog
      v-model:open="showConfirmDialog"
      :title="confirmDialog.title"
      :description="confirmDialog.description"
      :confirm-text="confirmDialog.confirmText"
      :variant="confirmDialog.variant"
      @confirm="confirmDialog.onConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { format } from 'date-fns'
import { debounce } from 'lodash-es'
import { useUsersStore } from '@/stores/users'
import { useNotifications } from '@/composables/useNotifications'
import type { User, UserRole, CreateUserRequest, UpdateUserRequest } from '@/types'
import type { TableColumn, TableAction } from '@/components/admin/DataTable.vue'
import type { FormSchema } from '@/components/admin/FormBuilder.vue'

// Components
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
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
import DataTable from '@/components/admin/DataTable.vue'
import FormBuilder from '@/components/admin/FormBuilder.vue'
import ConfirmationDialog from '@/components/admin/ConfirmationDialog.vue'

// Icons
import {
  Plus,
  Search,
  X,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
  UserCheck,
  UserX,
  Download,
} from 'lucide-vue-next'

// Store and composables
const usersStore = useUsersStore()
const { success: showSuccess, error: showError } = useNotifications()

// Reactive state
const searchQuery = ref('')
const selectedRole = ref<string>('')
const verifiedFilter = ref<string>('')
const showUserDialog = ref(false)
const showDetailsDialog = ref(false)
const showConfirmDialog = ref(false)
const editingUser = ref<User | null>(null)
const selectedUser = ref<User | null>(null)
const isSubmitting = ref(false)

// Computed properties
const users = computed(() => usersStore.users)
const isLoading = computed(() => usersStore.isLoading)

const userFormData = computed(() => {
  if (editingUser.value) {
    return {
      name: editingUser.value.name,
      email: editingUser.value.email,
      password: '',
      role: editingUser.value.role || 'customer',
    }
  }
  return {
    name: '',
    email: '',
    password: '',
    role: 'customer' as UserRole,
  }
})

// Table configuration
const tableColumns: TableColumn[] = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
  },
  {
    key: 'email',
    label: 'Email',
    sortable: true,
  },
  {
    key: 'role',
    label: 'Role',
    sortable: true,
  },
  {
    key: 'email_verified_at',
    label: 'Status',
    sortable: true,
  },
  {
    key: 'statistics',
    label: 'Activity',
  },
  {
    key: 'created_at',
    label: 'Created',
    sortable: true,
  },
]

const tableActions: TableAction[] = [
  {
    key: 'view',
    label: 'View Details',
    icon: Eye,
  },
  {
    key: 'edit',
    label: 'Edit',
    icon: Edit,
  },
  {
    key: 'delete',
    label: 'Delete',
    icon: Trash2,
    variant: 'destructive',
  },
  {
    key: 'restore',
    label: 'Restore',
    icon: RotateCcw,
  },
]

const bulkActions: TableAction[] = [
  {
    key: 'delete',
    label: 'Delete Selected',
    icon: Trash2,
    variant: 'destructive',
  },
  {
    key: 'verify',
    label: 'Mark as Verified',
    icon: UserCheck,
  },
  {
    key: 'unverify',
    label: 'Mark as Unverified',
    icon: UserX,
  },
]

// Form schema
const userFormSchema: FormSchema = {
  fields: [
    {
      name: 'name',
      type: 'input',
      label: 'Full Name',
      placeholder: 'Enter user full name',
      required: true,
    },
    {
      name: 'email',
      type: 'input',
      inputType: 'email',
      label: 'Email Address',
      placeholder: 'Enter email address',
      required: true,
    },
    {
      name: 'password',
      type: 'input',
      inputType: 'password',
      label: editingUser.value ? 'New Password (leave blank to keep current)' : 'Password',
      placeholder: 'Enter password',
      required: !editingUser.value,
    },
    {
      name: 'role',
      type: 'select',
      label: 'Role',
      required: true,
      options: [
        { label: 'Customer', value: 'customer' },
        { label: 'Editor', value: 'editor' },
        { label: 'Moderator', value: 'moderator' },
        { label: 'Admin', value: 'admin' },
      ],
    },
  ],
}

// Confirmation dialog state
const confirmDialog = ref({
  title: '',
  description: '',
  confirmText: '',
  variant: 'default' as 'default' | 'destructive',
  onConfirm: () => {},
})

// Methods
const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'MMM dd, yyyy')
}

const getRoleVariant = (role?: UserRole) => {
  switch (role) {
    case 'admin':
      return 'destructive'
    case 'editor':
      return 'default'
    case 'moderator':
      return 'secondary'
    default:
      return 'outline'
  }
}

const getRoleLabel = (role?: UserRole) => {
  switch (role) {
    case 'admin':
      return 'Admin'
    case 'editor':
      return 'Editor'
    case 'moderator':
      return 'Moderator'
    case 'customer':
      return 'Customer'
    default:
      return 'Unknown'
  }
}

const handleSearch = debounce(() => {
  fetchUsers()
}, 300)

const handleRoleFilter = () => {
  fetchUsers()
}

const handleVerifiedFilter = () => {
  fetchUsers()
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedRole.value = ''
  verifiedFilter.value = ''
  fetchUsers()
}

const fetchUsers = async () => {
  try {
    const filters: any = {}

    if (searchQuery.value) {
      filters.search = searchQuery.value
    }

    if (selectedRole.value) {
      filters.role = selectedRole.value
    }

    if (verifiedFilter.value) {
      filters.verified = verifiedFilter.value === 'true'
    }

    await usersStore.fetchUsers(filters)
  } catch (error: any) {
    showError(error.message || 'Failed to fetch users')
  }
}

const openCreateDialog = () => {
  editingUser.value = null
  showUserDialog.value = true
}

const editUser = (user: User) => {
  editingUser.value = user
  showUserDialog.value = true
  showDetailsDialog.value = false
}

const closeUserDialog = () => {
  showUserDialog.value = false
  editingUser.value = null
}

const viewUser = async (user: User) => {
  try {
    selectedUser.value = await usersStore.fetchUser(user.id)
    showDetailsDialog.value = true
  } catch (error: any) {
    showError(error.message || 'Failed to fetch user details')
  }
}

const closeDetailsDialog = () => {
  showDetailsDialog.value = false
  selectedUser.value = null
}

const handleUserSubmit = async (formData: any) => {
  isSubmitting.value = true

  try {
    if (editingUser.value) {
      // Update user
      const updateData: UpdateUserRequest = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      }

      if (formData.password) {
        updateData.password = formData.password
      }

      await usersStore.updateUser(editingUser.value.id, updateData)
      showSuccess('User updated successfully')
    } else {
      // Create user
      const createData: CreateUserRequest = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      }

      await usersStore.createUser(createData)
      showSuccess('User created successfully')
    }

    closeUserDialog()
    fetchUsers()
  } catch (error: any) {
    showError(error.message || 'Failed to save user')
  } finally {
    isSubmitting.value = false
  }
}

const deleteUser = (user: User) => {
  confirmDialog.value = {
    title: 'Delete User',
    description: `Are you sure you want to delete "${user.name}"? This action cannot be undone.`,
    confirmText: 'Delete',
    variant: 'destructive',
    onConfirm: async () => {
      try {
        await usersStore.deleteUser(user.id)
        showSuccess('User deleted successfully')
        fetchUsers()
      } catch (error: any) {
        showError(error.message || 'Failed to delete user')
      }
    },
  }
  showConfirmDialog.value = true
}

const restoreUser = async (user: User) => {
  try {
    await usersStore.restoreUser(user.id)
    showSuccess('User restored successfully')
    fetchUsers()
  } catch (error: any) {
    showError(error.message || 'Failed to restore user')
  }
}

const handleAction = ({ action, item }: { action: string; item: User }) => {
  switch (action) {
    case 'view':
      viewUser(item)
      break
    case 'edit':
      editUser(item)
      break
    case 'delete':
      deleteUser(item)
      break
    case 'restore':
      restoreUser(item)
      break
  }
}

const handleBulkAction = ({ action, items }: { action: string; items: User[] }) => {
  switch (action) {
    case 'delete':
      confirmDialog.value = {
        title: 'Delete Users',
        description: `Are you sure you want to delete ${items.length} users? This action cannot be undone.`,
        confirmText: 'Delete All',
        variant: 'destructive',
        onConfirm: async () => {
          try {
            await Promise.all(items.map((user) => usersStore.deleteUser(user.id)))
            showSuccess(`${items.length} users deleted successfully`)
            fetchUsers()
          } catch (error: any) {
            showError(error.message || 'Failed to delete users')
          }
        },
      }
      showConfirmDialog.value = true
      break
    case 'verify':
      // This would require a bulk verify endpoint
      showError('Bulk verification not implemented yet')
      break
    case 'unverify':
      // This would require a bulk unverify endpoint
      showError('Bulk unverification not implemented yet')
      break
  }
}

const handleExport = () => {
  // Export functionality would be implemented here
  showError('Export functionality not implemented yet')
}

// Lifecycle
onMounted(() => {
  fetchUsers()
})
</script>
