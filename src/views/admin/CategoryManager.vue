<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Category Management</h1>
        <p class="text-gray-600">Organize your product categories</p>
      </div>
      <Button @click="openCreateDialog">
        <Plus class="w-4 h-4 mr-2" />
        Add Category
      </Button>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent class="p-4">
          <div class="flex items-center space-x-2">
            <div class="p-2 bg-primary/10 rounded-lg">
              <FolderOpen class="h-4 w-4 text-primary" />
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground">Total Categories</p>
              <p class="text-2xl font-bold">{{ totalCategories }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-4">
          <div class="flex items-center space-x-2">
            <div class="p-2 bg-green-100 rounded-lg">
              <Package class="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground">Categories with Products</p>
              <p class="text-2xl font-bold">{{ categoriesWithProducts }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-4">
          <div class="flex items-center space-x-2">
            <div class="p-2 bg-orange-100 rounded-lg">
              <AlertCircle class="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground">Empty Categories</p>
              <p class="text-2xl font-bold">{{ emptyCategories }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Categories Table -->
    <Card>
      <CardContent class="p-6">
        <DataTable
          :data="categories"
          :columns="tableColumns"
          :loading="isLoading"
          :actions="tableActions"
          :bulk-actions="bulkActions"
          selectable
          @action="handleTableAction"
          @bulk-action="handleBulkAction"
          @search="handleSearch"
          @export="handleExport"
        >
          <!-- Custom cell renderers -->
          <template #cell-name="{ item }">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <FolderOpen class="h-4 w-4 text-primary" />
              </div>
              <div>
                <p class="font-medium">{{ item.name }}</p>
                <p v-if="item.description" class="text-sm text-muted-foreground truncate max-w-xs">
                  {{ item.description }}
                </p>
              </div>
            </div>
          </template>

          <template #cell-products_count="{ item }">
            <div class="flex items-center space-x-2">
              <Badge :variant="item.products?.length > 0 ? 'default' : 'secondary'">
                {{ item.products?.length || 0 }} products
              </Badge>
              <Button
                v-if="item.products?.length > 0"
                variant="ghost"
                size="sm"
                @click="viewCategoryProducts(item)"
              >
                <Eye class="h-3 w-3" />
              </Button>
            </div>
          </template>

          <template #cell-created_at="{ item }">
            <div class="text-sm">
              <p>{{ formatDate(item.created_at) }}</p>
              <p class="text-muted-foreground">by {{ item.user?.name }}</p>
            </div>
          </template>

          <template #cell-status="{ item }">
            <Badge :variant="item.deleted_at ? 'destructive' : 'default'">
              {{ item.deleted_at ? 'Deleted' : 'Active' }}
            </Badge>
          </template>
        </DataTable>
      </CardContent>
    </Card>

    <!-- Create/Edit Category Dialog -->
    <Dialog v-model:open="showCategoryDialog">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {{ editingCategory ? 'Edit Category' : 'Create New Category' }}
          </DialogTitle>
          <DialogDescription>
            {{
              editingCategory
                ? 'Update category information'
                : 'Add a new category to organize your products'
            }}
          </DialogDescription>
        </DialogHeader>

        <FormBuilder
          :schema="categoryFormSchema"
          :initial-values="categoryFormData"
          :loading="isSubmitting"
          submit-label="Save Category"
          @submit="handleCategorySubmit"
          @cancel="closeCategoryDialog"
        />
      </DialogContent>
    </Dialog>

    <!-- Product Assignment Dialog -->
    <Dialog v-model:open="showProductDialog">
      <DialogContent class="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Products in "{{ selectedCategory?.name }}"</DialogTitle>
          <DialogDescription> Manage products assigned to this category </DialogDescription>
        </DialogHeader>

        <div class="space-y-4">
          <!-- Product List -->
          <div
            v-if="selectedCategory?.products && selectedCategory.products.length > 0"
            class="space-y-2"
          >
            <div
              v-for="product in selectedCategory.products"
              :key="product.id"
              class="flex items-center justify-between p-3 border rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <Package class="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p class="font-medium">{{ product.name }}</p>
                  <p class="text-sm text-muted-foreground">
                    ${{ product.price }} • Stock: {{ product.stock }}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                @click="removeProductFromCategory(product.id)"
                :disabled="isSubmitting"
              >
                <X class="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div v-else class="text-center py-8 text-muted-foreground">
            <Package class="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No products assigned to this category</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="closeProductDialog">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <ConfirmationDialog
      v-model:open="showDeleteDialog"
      :title="deleteDialogTitle"
      :description="deleteDialogDescription"
      :details="deleteDialogDetails"
      variant="destructive"
      icon="delete"
      confirm-label="Delete Category"
      :loading="isSubmitting"
      :require-confirmation="selectedCategories.length > 0 && hasProductsInSelectedCategories"
      confirmation-text="DELETE"
      @confirm="confirmDelete"
      @cancel="closeDeleteDialog"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { format } from 'date-fns'
import { useCategories } from '@/composables/useCategories'
import { useNotifications } from '@/composables/useNotifications'
import { adminApiService } from '@/services/api/admin'
import type { Category, TableColumn, TableAction, FormSchema } from '@/types'
import { categorySchema, type CategoryFormData } from '@/lib/validationSchemas'

// Components
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  FolderOpen,
  Package,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  X,
  RotateCcw,
} from 'lucide-vue-next'

// Composables
const {
  categories,
  isLoading,
  totalCategories,
  categoriesWithProducts,
  emptyCategories,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  restoreCategory,
  setFilters,
} = useCategories()
const { success: showSuccess, error: showError } = useNotifications()

// Reactive state
const showCategoryDialog = ref(false)
const showProductDialog = ref(false)
const showDeleteDialog = ref(false)
const editingCategory = ref<Category | null>(null)
const selectedCategory = ref<Category | null>(null)
const selectedCategories = ref<Category[]>([])
const isSubmitting = ref(false)

const hasProductsInSelectedCategories = computed(() =>
  selectedCategories.value.some((cat) => cat.products && cat.products.length > 0),
)

const deleteDialogTitle = computed(() => {
  if (selectedCategories.value.length === 1) {
    return `Delete "${selectedCategories.value[0].name}"?`
  }
  return `Delete ${selectedCategories.value.length} Categories?`
})

const deleteDialogDescription = computed(() => {
  if (selectedCategories.value.length === 1) {
    const category = selectedCategories.value[0]
    const productCount = category.products?.length || 0
    return productCount > 0
      ? `This category contains ${productCount} product(s). Deleting it will remove the category assignment from these products.`
      : 'This category will be permanently deleted.'
  }
  return 'These categories will be permanently deleted. Products in these categories will have their category assignment removed.'
})

const deleteDialogDetails = computed(() => {
  const details: string[] = []
  selectedCategories.value.forEach((cat) => {
    const productCount = cat.products?.length || 0
    if (productCount > 0) {
      details.push(`${cat.name}: ${productCount} product(s) will be unassigned`)
    } else {
      details.push(`${cat.name}: No products affected`)
    }
  })
  return details
})

// Form data
const categoryFormData = ref<Partial<CategoryFormData>>({})

const categoryFormSchema: FormSchema = {
  fields: [
    {
      name: 'name',
      type: 'input',
      label: 'Category Name',
      placeholder: 'Enter category name',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      placeholder: 'Enter category description (optional)',
      rows: 3,
    },
  ],
}

// Table configuration
const tableColumns: TableColumn[] = [
  {
    key: 'name',
    label: 'Category',
    sortable: true,
  },
  {
    key: 'products_count',
    label: 'Products',
    align: 'center',
  },
  {
    key: 'created_at',
    label: 'Created',
    sortable: true,
  },
  {
    key: 'status',
    label: 'Status',
    align: 'center',
  },
]

const tableActions: TableAction[] = [
  {
    key: 'edit',
    label: 'Edit',
    icon: Edit,
  },
  {
    key: 'view-products',
    label: 'View Products',
    icon: Eye,
  },
  {
    key: 'restore',
    label: 'Restore',
    icon: RotateCcw,
  },
  {
    key: 'delete',
    label: 'Delete',
    icon: Trash2,
    variant: 'destructive',
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
    key: 'restore',
    label: 'Restore Selected',
    icon: RotateCcw,
  },
]

// Methods
const loadCategories = async () => {
  try {
    await fetchCategories()
  } catch (error) {
    showError('Failed to load categories')
  }
}

const openCreateDialog = () => {
  editingCategory.value = null
  categoryFormData.value = {}
  showCategoryDialog.value = true
}

const openEditDialog = (category: Category) => {
  editingCategory.value = category
  categoryFormData.value = {
    name: category.name,
    description: category.description || '',
  }
  showCategoryDialog.value = true
}

const closeCategoryDialog = () => {
  showCategoryDialog.value = false
  editingCategory.value = null
  categoryFormData.value = {}
}

const handleCategorySubmit = async (formData: Record<string, any>) => {
  isSubmitting.value = true

  try {
    if (editingCategory.value) {
      await updateCategory(editingCategory.value.id, formData as CategoryFormData)
      showSuccess('Category updated successfully')
    } else {
      await createCategory(formData as CategoryFormData)
      showSuccess('Category created successfully')
    }

    closeCategoryDialog()
    await loadCategories()
  } catch (error: any) {
    showError(error.message || 'Failed to save category')
  } finally {
    isSubmitting.value = false
  }
}

const viewCategoryProducts = (category: Category) => {
  selectedCategory.value = category
  showProductDialog.value = true
}

const closeProductDialog = () => {
  showProductDialog.value = false
  selectedCategory.value = null
}

const removeProductFromCategory = async (productId: number) => {
  if (!selectedCategory.value) return

  isSubmitting.value = true
  try {
    // Use the bulk update API to remove category assignment (set to null)
    await adminApiService.bulkUpdateProductCategory([productId], null)

    // Update the local state
    if (selectedCategory.value.products) {
      selectedCategory.value.products = selectedCategory.value.products.filter(
        (p) => p.id !== productId,
      )
    }

    // Refresh categories to get updated counts
    await loadCategories()
    showSuccess('Product removed from category')
  } catch (error) {
    showError('Failed to remove product from category')
  } finally {
    isSubmitting.value = false
  }
}

const handleTableAction = async ({ action, item }: { action: string; item: Category }) => {
  switch (action) {
    case 'edit':
      openEditDialog(item)
      break
    case 'view-products':
      viewCategoryProducts(item)
      break
    case 'delete':
      selectedCategories.value = [item]
      showDeleteDialog.value = true
      break
    case 'restore':
      await restoreCategoryById(item.id)
      break
  }
}

const handleBulkAction = ({ action, items }: { action: string; items: Category[] }) => {
  selectedCategories.value = items

  switch (action) {
    case 'delete':
      showDeleteDialog.value = true
      break
    case 'restore':
      restoreSelectedCategories()
      break
  }
}

const confirmDelete = async () => {
  isSubmitting.value = true

  try {
    for (const category of selectedCategories.value) {
      await deleteCategory(category.id)
    }

    const count = selectedCategories.value.length
    showSuccess(`${count} ${count === 1 ? 'category' : 'categories'} deleted successfully`)

    closeDeleteDialog()
    await loadCategories()
  } catch (error: any) {
    showError(error.message || 'Failed to delete categories')
  } finally {
    isSubmitting.value = false
  }
}

const closeDeleteDialog = () => {
  showDeleteDialog.value = false
  selectedCategories.value = []
}

const restoreCategoryById = async (id: number) => {
  try {
    await restoreCategory(id)
    showSuccess('Category restored successfully')
    await loadCategories()
  } catch (error: any) {
    showError(error.message || 'Failed to restore category')
  }
}

const restoreSelectedCategories = async () => {
  try {
    for (const category of selectedCategories.value) {
      await restoreCategory(category.id)
    }

    const count = selectedCategories.value.length
    showSuccess(`${count} ${count === 1 ? 'category' : 'categories'} restored successfully`)

    selectedCategories.value = []
    await loadCategories()
  } catch (error: any) {
    showError(error.message || 'Failed to restore categories')
  }
}

const handleSearch = (query: string) => {
  setFilters({ search: query })
  loadCategories()
}

const handleExport = () => {
  // Export functionality would be implemented here
  showSuccess('Export feature coming soon')
}

const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'MMM dd, yyyy')
}

// Lifecycle
onMounted(() => {
  loadCategories()
})
</script>
