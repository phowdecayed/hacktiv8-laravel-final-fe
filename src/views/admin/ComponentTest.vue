<template>
  <div class="container mx-auto p-6 space-y-8">
    <h1 class="text-3xl font-bold">Admin Components Test</h1>

    <!-- DataTable Test -->
    <section class="space-y-4">
      <h2 class="text-2xl font-semibold">DataTable Component</h2>
      <DataTable
        :data="tableData"
        :columns="tableColumns"
        :loading="tableLoading"
        :selectable="true"
        :actions="tableActions"
        :bulk-actions="bulkActions"
        @action="handleTableAction"
        @bulk-action="handleBulkAction"
        @sort="handleSort"
        @search="handleSearch"
        @export="handleExport"
      />
    </section>

    <!-- FormBuilder Test -->
    <section class="space-y-4">
      <h2 class="text-2xl font-semibold">FormBuilder Component</h2>
      <div class="max-w-2xl">
        <FormBuilder
          :schema="formSchema"
          :initial-values="formInitialValues"
          :loading="formLoading"
          @submit="handleFormSubmit"
          @cancel="handleFormCancel"
          @change="handleFormChange"
        />
      </div>
    </section>

    <!-- ImageUpload Test -->
    <section class="space-y-4">
      <h2 class="text-2xl font-semibold">ImageUpload Component</h2>
      <div class="max-w-2xl">
        <ImageUpload
          v-model="uploadedFiles"
          :multiple="true"
          :max-files="5"
          @upload="handleImageUpload"
          @remove="handleImageRemove"
          @error="handleImageError"
        />
      </div>
    </section>

    <!-- ConfirmationDialog Test -->
    <section class="space-y-4">
      <h2 class="text-2xl font-semibold">ConfirmationDialog Component</h2>
      <div class="space-x-2">
        <Button @click="showDeleteDialog = true" variant="destructive"> Show Delete Dialog </Button>
        <Button @click="showWarningDialog = true" variant="outline"> Show Warning Dialog </Button>
        <Button @click="showConfirmationDialog = true"> Show Confirmation Dialog </Button>
      </div>

      <ConfirmationDialog
        v-model:open="showDeleteDialog"
        title="Delete Item"
        description="Are you sure you want to delete this item?"
        :details="['This action cannot be undone', 'All related data will be removed']"
        variant="destructive"
        icon="delete"
        confirm-label="Delete"
        :require-confirmation="true"
        confirmation-text="DELETE"
        @confirm="handleDeleteConfirm"
        @cancel="handleDeleteCancel"
      />

      <ConfirmationDialog
        v-model:open="showWarningDialog"
        title="Warning"
        description="This action may have unintended consequences."
        variant="default"
        icon="warning"
        @confirm="handleWarningConfirm"
        @cancel="handleWarningCancel"
      />

      <ConfirmationDialog
        v-model:open="showConfirmationDialog"
        title="Confirm Action"
        description="Please confirm you want to proceed."
        variant="default"
        icon="info"
        :show-warning="false"
        @confirm="handleConfirmationConfirm"
        @cancel="handleConfirmationCancel"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import DataTable from '@/components/admin/DataTable.vue'
import FormBuilder from '@/components/admin/FormBuilder.vue'
import ImageUpload from '@/components/admin/ImageUpload.vue'
import ConfirmationDialog from '@/components/admin/ConfirmationDialog.vue'
import { Edit, Trash2, Eye } from 'lucide-vue-next'

// DataTable test data
const tableLoading = ref(false)
const tableData = ref([
  { id: 1, name: 'Product 1', price: 29.99, stock: 100, category: 'Electronics' },
  { id: 2, name: 'Product 2', price: 49.99, stock: 50, category: 'Clothing' },
  { id: 3, name: 'Product 3', price: 19.99, stock: 200, category: 'Books' },
  { id: 4, name: 'Product 4', price: 99.99, stock: 25, category: 'Electronics' },
  { id: 5, name: 'Product 5', price: 39.99, stock: 75, category: 'Home' },
])

const tableColumns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'price', label: 'Price', sortable: true, align: 'right' as const },
  { key: 'stock', label: 'Stock', sortable: true, align: 'center' as const },
  { key: 'category', label: 'Category', sortable: true },
]

const tableActions = [
  { key: 'view', label: 'View', icon: Eye },
  { key: 'edit', label: 'Edit', icon: Edit },
  { key: 'delete', label: 'Delete', icon: Trash2, variant: 'destructive' as const },
]

const bulkActions = [
  { key: 'delete', label: 'Delete Selected', icon: Trash2, variant: 'destructive' as const },
]

// FormBuilder test data
const formLoading = ref(false)
const formSchema = {
  fields: [
    {
      name: 'name',
      type: 'input' as const,
      label: 'Product Name',
      placeholder: 'Enter product name',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea' as const,
      label: 'Description',
      placeholder: 'Enter product description',
      rows: 4,
    },
    {
      name: 'price',
      type: 'number' as const,
      label: 'Price',
      placeholder: '0.00',
      required: true,
      min: 0,
      step: 0.01,
    },
    {
      name: 'category',
      type: 'select' as const,
      label: 'Category',
      placeholder: 'Select category',
      required: true,
      options: [
        { label: 'Electronics', value: 'electronics' },
        { label: 'Clothing', value: 'clothing' },
        { label: 'Books', value: 'books' },
        { label: 'Home', value: 'home' },
      ],
    },
    {
      name: 'tags',
      type: 'multiselect' as const,
      label: 'Tags',
      placeholder: 'Select tags',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Popular', value: 'popular' },
        { label: 'Sale', value: 'sale' },
        { label: 'Featured', value: 'featured' },
      ],
    },
    {
      name: 'active',
      type: 'switch' as const,
      label: 'Active',
      switchLabel: 'Product is active',
    },
  ],
}

const formInitialValues = ref({
  name: '',
  description: '',
  price: 0,
  category: '',
  tags: [],
  active: true,
})

// ImageUpload test data
const uploadedFiles = ref<File[]>([])

// ConfirmationDialog test data
const showDeleteDialog = ref(false)
const showWarningDialog = ref(false)
const showConfirmationDialog = ref(false)

// Event handlers
const handleTableAction = ({ action, item }: { action: string; item: any }) => {
  console.log('Table action:', action, item)
}

const handleBulkAction = ({ action, items }: { action: string; items: any[] }) => {
  console.log('Bulk action:', action, items)
}

const handleSort = ({ column, order }: { column: string; order: 'asc' | 'desc' }) => {
  console.log('Sort:', column, order)
}

const handleSearch = (query: string) => {
  console.log('Search:', query)
}

const handleExport = () => {
  console.log('Export data')
}

const handleFormSubmit = (data: Record<string, any>) => {
  console.log('Form submit:', data)
  formLoading.value = true
  setTimeout(() => {
    formLoading.value = false
  }, 2000)
}

const handleFormCancel = () => {
  console.log('Form cancel')
}

const handleFormChange = ({
  field,
  value,
  formData,
}: {
  field: string
  value: any
  formData: Record<string, any>
}) => {
  console.log('Form change:', field, value, formData)
}

const handleImageUpload = (files: File[]) => {
  console.log('Image upload:', files)
}

const handleImageRemove = (file: File, index: number) => {
  console.log('Image remove:', file, index)
}

const handleImageError = (message: string) => {
  console.log('Image error:', message)
}

const handleDeleteConfirm = () => {
  console.log('Delete confirmed')
  showDeleteDialog.value = false
}

const handleDeleteCancel = () => {
  console.log('Delete cancelled')
}

const handleWarningConfirm = () => {
  console.log('Warning confirmed')
  showWarningDialog.value = false
}

const handleWarningCancel = () => {
  console.log('Warning cancelled')
}

const handleConfirmationConfirm = () => {
  console.log('Confirmation confirmed')
  showConfirmationDialog.value = false
}

const handleConfirmationCancel = () => {
  console.log('Confirmation cancelled')
}
</script>
