<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Product Management</h1>
        <p class="text-gray-600">Manage your product catalog</p>
      </div>
      <Button @click="openCreateDialog">
        <Plus class="w-4 h-4 mr-2" />
        Add Product
      </Button>
    </div>

    <!-- Filters -->
    <Card>
      <CardContent class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search -->
          <div class="space-y-2">
            <Label>Search Products</Label>
            <div class="relative">
              <Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                v-model="searchQuery"
                placeholder="Search by name..."
                class="pl-8"
                @input="debouncedSearch"
              />
            </div>
          </div>

          <!-- Category Filter -->
          <div class="space-y-2">
            <Label>Category</Label>
            <Select v-model="selectedCategory" @update:model-value="applyFilters">
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.id.toString()"
                >
                  {{ category.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Stock Filter -->
          <div class="space-y-2">
            <Label>Stock Status</Label>
            <Select v-model="stockFilter" @update:model-value="applyFilters">
              <SelectTrigger>
                <SelectValue placeholder="All Products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="low_stock">Low Stock (≤10)</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Sort -->
          <div class="space-y-2">
            <Label>Sort By</Label>
            <Select v-model="sortBy" @update:model-value="applyFilters">
              <SelectTrigger>
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                <SelectItem value="price_asc">Price (Low to High)</SelectItem>
                <SelectItem value="price_desc">Price (High to Low)</SelectItem>
                <SelectItem value="stock_asc">Stock (Low to High)</SelectItem>
                <SelectItem value="stock_desc">Stock (High to Low)</SelectItem>
                <SelectItem value="created_at_desc">Newest First</SelectItem>
                <SelectItem value="created_at_asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Products Table -->
    <Card>
      <CardContent class="p-0">
        <DataTable
          :data="products"
          :columns="tableColumns"
          :loading="isLoading"
          :selectable="true"
          :actions="tableActions"
          :bulk-actions="bulkActions"
          @action="handleAction"
          @bulk-action="handleBulkAction"
          @export="handleExport"
        >
          <!-- Custom cell renderers -->
          <template #cell-image="{ item }">
            <div class="flex items-center space-x-2">
              <img
                v-if="item.images && item.images.length > 0"
                :src="item.images[0].image_path"
                :alt="item.name"
                class="w-10 h-10 rounded object-cover"
              />
              <div v-else class="w-10 h-10 rounded bg-muted flex items-center justify-center">
                <ImageIcon class="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </template>

          <template #cell-name="{ item }">
            <div>
              <p class="font-medium">{{ item.name }}</p>
              <p v-if="item.description" class="text-sm text-muted-foreground truncate max-w-xs">
                {{ item.description }}
              </p>
            </div>
          </template>

          <template #cell-price="{ item }">
            <span class="font-medium">{{ formatPrice(item.price) }}</span>
          </template>

          <template #cell-stock="{ item }">
            <Badge
              :variant="
                item.stock === 0 ? 'destructive' : item.stock <= 10 ? 'secondary' : 'default'
              "
            >
              {{ item.stock }} {{ item.stock === 1 ? 'unit' : 'units' }}
            </Badge>
          </template>

          <template #cell-category="{ item }">
            <span v-if="item.category">{{ item.category.name }}</span>
            <span v-else class="text-muted-foreground">Uncategorized</span>
          </template>

          <template #cell-status="{ item }">
            <Badge :variant="item.deleted_at ? 'destructive' : 'default'">
              {{ item.deleted_at ? 'Deleted' : 'Active' }}
            </Badge>
          </template>

          <template #cell-created_at="{ item }">
            {{ formatDate(item.created_at) }}
          </template>
        </DataTable>
      </CardContent>
    </Card>

    <!-- Create/Edit Product Dialog -->
    <Dialog v-model:open="showProductDialog">
      <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {{ editingProduct ? 'Edit Product' : 'Create New Product' }}
          </DialogTitle>
        </DialogHeader>

        <FormBuilder
          :schema="productFormSchema"
          :initial-values="productFormData"
          :loading="submitting"
          @submit="handleProductSubmit"
          @cancel="closeProductDialog"
        >
          <!-- Custom image upload field -->
          <template #field-images="{ field, value, updateValue }">
            <div class="space-y-4">
              <Label>Product Images</Label>
              <ImageUpload
                :model-value="value || []"
                :multiple="true"
                :max-files="5"
                @update:model-value="updateValue"
              />
              <p class="text-sm text-muted-foreground">
                Upload up to 5 images. First image will be used as the main product image.
              </p>
            </div>
          </template>
        </FormBuilder>
      </DialogContent>
    </Dialog>

    <!-- Bulk Stock Update Dialog -->
    <Dialog v-model:open="showBulkStockDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Stock for {{ selectedProducts.length }} Products</DialogTitle>
        </DialogHeader>

        <div class="space-y-4">
          <div class="space-y-2">
            <Label>Stock Operation</Label>
            <Select v-model="bulkStockOperation">
              <SelectTrigger>
                <SelectValue placeholder="Select operation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="set">Set stock to specific value</SelectItem>
                <SelectItem value="add">Add to current stock</SelectItem>
                <SelectItem value="subtract">Subtract from current stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>Stock Value</Label>
            <Input
              v-model.number="bulkStockValue"
              type="number"
              min="0"
              placeholder="Enter stock value"
            />
          </div>

          <div class="flex justify-end space-x-2">
            <Button variant="outline" @click="closeBulkStockDialog">Cancel</Button>
            <Button @click="handleBulkStockUpdate" :disabled="!bulkStockValue">
              Update Stock
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Bulk Category Update Dialog -->
    <Dialog v-model:open="showBulkCategoryDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Category for {{ selectedProducts.length }} Products</DialogTitle>
        </DialogHeader>

        <div class="space-y-4">
          <div class="space-y-2">
            <Label>New Category</Label>
            <Select v-model="bulkCategoryId">
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Category</SelectItem>
                <SelectItem
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.id.toString()"
                >
                  {{ category.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex justify-end space-x-2">
            <Button variant="outline" @click="closeBulkCategoryDialog">Cancel</Button>
            <Button @click="handleBulkCategoryUpdate">Update Category</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <ConfirmationDialog
      v-model:open="showDeleteDialog"
      :title="deleteDialogTitle"
      :description="deleteDialogDescription"
      :loading="deleting"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { debounce } from 'lodash-es'
import { format } from 'date-fns'
import { useProducts } from '@/composables/useProducts'
import { useNotifications } from '@/composables/useNotifications'
import { useCart } from '@/composables/useCart'
import { adminApiService } from '@/services/api/admin'
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  TableColumn,
  TableAction,
  FormSchema,
} from '@/types'

// UI Components
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Admin Components
import DataTable from '@/components/admin/DataTable.vue'
import FormBuilder from '@/components/admin/FormBuilder.vue'
import ImageUpload from '@/components/admin/ImageUpload.vue'
import ConfirmationDialog from '@/components/admin/ConfirmationDialog.vue'

// Icons
import { Plus, Search, Edit, Trash2, Eye, Package, ImageIcon, Copy } from 'lucide-vue-next'

// Composables
const { products, categories, isLoading, fetchProducts, fetchCategories } = useProducts()
const { success, error: showError } = useNotifications()
const { formatPrice } = useCart()

// State
const searchQuery = ref('')
const selectedCategory = ref('all')
const stockFilter = ref('all')
const sortBy = ref('created_at_desc')

// Dialog states
const showProductDialog = ref(false)
const showBulkStockDialog = ref(false)
const showBulkCategoryDialog = ref(false)
const showDeleteDialog = ref(false)

// Form states
const editingProduct = ref<Product | null>(null)
const productFormData = ref<any>({})
const submitting = ref(false)

// Bulk operation states
const selectedProducts = ref<Product[]>([])
const bulkStockOperation = ref('')
const bulkStockValue = ref<number>(0)
const bulkCategoryId = ref('')

// Delete states
const deleting = ref(false)
const deleteTarget = ref<{ type: 'single' | 'bulk'; items: Product[] }>({
  type: 'single',
  items: [],
})

// Table configuration
const tableColumns: TableColumn[] = [
  { key: 'image', label: 'Image', sortable: false },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'price', label: 'Price', sortable: true, align: 'right' },
  { key: 'stock', label: 'Stock', sortable: true, align: 'center' },
  { key: 'category', label: 'Category', sortable: false },
  { key: 'status', label: 'Status', sortable: false },
  { key: 'created_at', label: 'Created', sortable: true },
]

const tableActions: TableAction[] = [
  { key: 'view', label: 'View Details', icon: Eye },
  { key: 'edit', label: 'Edit', icon: Edit },
  { key: 'duplicate', label: 'Duplicate', icon: Copy },
  { key: 'delete', label: 'Delete', icon: Trash2, variant: 'destructive' },
]

const bulkActions: TableAction[] = [
  { key: 'update_stock', label: 'Update Stock', icon: Package },
  { key: 'update_category', label: 'Update Category', icon: Edit },
  { key: 'delete', label: 'Delete Selected', icon: Trash2, variant: 'destructive' },
]

// Product form schema
const productFormSchema = computed(
  (): FormSchema => ({
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
        rows: 3,
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
        name: 'stock',
        type: 'number' as const,
        label: 'Stock Quantity',
        placeholder: '0',
        required: true,
        min: 0,
      },
      {
        name: 'min_stock',
        type: 'number' as const,
        label: 'Minimum Stock Alert',
        placeholder: '0',
        min: 0,
        optional: true,
      },
      {
        name: 'category_id',
        type: 'select' as const,
        label: 'Category',
        placeholder: 'Select a category',
        options: [
          { label: 'No Category', value: 'none' },
          ...categories.value.map((cat) => ({ label: cat.name, value: cat.id.toString() })),
        ],
      },
      {
        name: 'images',
        type: 'custom' as const,
        label: 'Product Images',
      },
    ],
  }),
)

// Computed properties
const deleteDialogTitle = computed(() => {
  if (deleteTarget.value.type === 'bulk') {
    return `Delete ${deleteTarget.value.items.length} Products`
  }
  return `Delete Product`
})

const deleteDialogDescription = computed(() => {
  if (deleteTarget.value.type === 'bulk') {
    return `Are you sure you want to delete ${deleteTarget.value.items.length} selected products? This action cannot be undone.`
  }
  const product = deleteTarget.value.items[0]
  return `Are you sure you want to delete "${product?.name}"? This action cannot be undone.`
})

// Methods
const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'MMM dd, yyyy')
}

const debouncedSearch = debounce(() => {
  applyFilters()
}, 300)

const applyFilters = async () => {
  const filters: any = {}

  if (searchQuery.value) {
    filters.search = searchQuery.value
  }

  if (selectedCategory.value && selectedCategory.value !== 'all') {
    filters.category_id = parseInt(selectedCategory.value)
  }

  if (stockFilter.value && stockFilter.value !== 'all') {
    switch (stockFilter.value) {
      case 'in_stock':
        filters.min_stock = 1
        break
      case 'low_stock':
        filters.max_stock = 10
        filters.min_stock = 1
        break
      case 'out_of_stock':
        filters.max_stock = 0
        break
    }
  }

  if (sortBy.value) {
    const [field, order] = sortBy.value.split('_')
    filters.sort = field
    filters.order = order
  }

  await fetchProducts(filters)
}

const openCreateDialog = () => {
  editingProduct.value = null
  productFormData.value = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category_id: '',
    images: [],
  }
  showProductDialog.value = true
}

const openEditDialog = (product: Product) => {
  editingProduct.value = product
  productFormData.value = {
    name: product.name,
    description: product.description || '',
    price: parseFloat(product.price),
    stock: product.stock,
    min_stock: product.min_stock || undefined,
    category_id: product.category_id ? product.category_id.toString() : 'none',
    images: [],
  }
  showProductDialog.value = true
}



const closeProductDialog = () => {
  showProductDialog.value = false
  editingProduct.value = null
  productFormData.value = {}
}

const handleProductSubmit = async (formData: any) => {
  try {
    submitting.value = true

    const productData: CreateProductRequest | UpdateProductRequest = {
      name: formData.name,
      description: formData.description || undefined,
      price: formData.price,
      stock: formData.stock,
      min_stock: formData.min_stock || undefined,
      category_id: formData.category_id && formData.category_id !== 'none' ? parseInt(formData.category_id) : undefined,
      images: formData.images || [],
    }

    if (editingProduct.value) {
      await adminApiService.updateProduct(
        editingProduct.value.id,
        productData as UpdateProductRequest,
      )
      success('Product updated successfully')
    } else {
      await adminApiService.createProduct(productData as CreateProductRequest)
      success('Product created successfully')
    }

    closeProductDialog()
    await applyFilters()
  } catch (err: any) {
    showError(err.message || 'Failed to save product')
  } finally {
    submitting.value = false
  }
}

const handleAction = async ({ action, item }: { action: string; item: Product }) => {
  switch (action) {
    case 'view':
      // Navigate to product detail view or show details modal
      break
    case 'edit':
      openEditDialog(item)
      break
    case 'duplicate':
      await duplicateProduct(item)
      break
    case 'delete':
      deleteTarget.value = { type: 'single', items: [item] }
      showDeleteDialog.value = true
      break
  }
}

const handleBulkAction = ({ action, items }: { action: string; items: Product[] }) => {
  selectedProducts.value = items

  switch (action) {
    case 'update_stock':
      showBulkStockDialog.value = true
      break
    case 'update_category':
      showBulkCategoryDialog.value = true
      break
    case 'delete':
      deleteTarget.value = { type: 'bulk', items }
      showDeleteDialog.value = true
      break
  }
}

const duplicateProduct = async (product: Product) => {
  try {
    const duplicateData: CreateProductRequest = {
      name: `${product.name} (Copy)`,
      description: product.description || undefined,
      price: parseFloat(product.price),
      stock: 0, // Start with 0 stock for duplicates
      category_id: product.category_id || undefined,
    }

    await adminApiService.createProduct(duplicateData)
    success('Product duplicated successfully')
    await applyFilters()
  } catch (err: any) {
    showError(err.message || 'Failed to duplicate product')
  }
}

const closeBulkStockDialog = () => {
  showBulkStockDialog.value = false
  bulkStockOperation.value = ''
  bulkStockValue.value = 0
}

const handleBulkStockUpdate = async () => {
  if (bulkStockValue.value === null || !bulkStockOperation.value) return

  try {
    // This would need to be implemented in the API
    // For now, we'll update each product individually
    for (const product of selectedProducts.value) {
      let newStock = product.stock

      switch (bulkStockOperation.value) {
        case 'set':
          newStock = bulkStockValue.value
          break
        case 'add':
          newStock = product.stock + bulkStockValue.value
          break
        case 'subtract':
          newStock = Math.max(0, product.stock - bulkStockValue.value)
          break
      }

      await adminApiService.updateProduct(product.id, { stock: newStock })
    }

    success(`Stock updated for ${selectedProducts.value.length} products`)
    closeBulkStockDialog()
    await applyFilters()
  } catch (err: any) {
    showError(err.message || 'Failed to update stock')
  }
}

const closeBulkCategoryDialog = () => {
  showBulkCategoryDialog.value = false
  bulkCategoryId.value = ''
}

const handleBulkCategoryUpdate = async () => {
  try {
    const categoryId = bulkCategoryId.value && bulkCategoryId.value !== 'none' ? parseInt(bulkCategoryId.value) : undefined

    for (const product of selectedProducts.value) {
      await adminApiService.updateProduct(product.id, { category_id: categoryId })
    }

    success(`Category updated for ${selectedProducts.value.length} products`)
    closeBulkCategoryDialog()
    await applyFilters()
  } catch (err: any) {
    showError(err.message || 'Failed to update category')
  }
}

const confirmDelete = async () => {
  try {
    deleting.value = true

    if (deleteTarget.value.type === 'bulk') {
      const ids = deleteTarget.value.items.map((item) => item.id)
      await adminApiService.bulkDeleteProducts(ids)
      success(`${deleteTarget.value.items.length} products deleted successfully`)
    } else {
      const product = deleteTarget.value.items[0]
      await adminApiService.deleteProduct(product.id)
      success('Product deleted successfully')
    }

    showDeleteDialog.value = false
    await applyFilters()
  } catch (err: any) {
    showError(err.message || 'Failed to delete product(s)')
  } finally {
    deleting.value = false
  }
}

const handleExport = () => {
  // Implement CSV export functionality
  const csvContent = products.value.map((product) => ({
    Name: product.name,
    Description: product.description || '',
    Price: product.price,
    Stock: product.stock,
    Category: product.category?.name || 'Uncategorized',
    Created: formatDate(product.created_at),
  }))

  // Convert to CSV and download
  const csv = [
    Object.keys(csvContent[0]).join(','),
    ...csvContent.map((row) => Object.values(row).join(',')),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `products-${format(new Date(), 'yyyy-MM-dd')}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}

// Lifecycle
onMounted(async () => {
  await Promise.all([fetchCategories(), applyFilters()])
})

// Watchers
watch([selectedCategory, stockFilter, sortBy], () => {
  applyFilters()
})
</script>
