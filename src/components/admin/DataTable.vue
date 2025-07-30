<template>
  <div class="space-y-4">
    <!-- Table Controls -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <!-- Search -->
        <div class="relative">
          <Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            v-model="searchQuery"
            placeholder="Search..."
            class="pl-8 w-64"
            @input="handleSearch"
          />
        </div>

        <!-- Bulk Actions -->
        <div v-if="selectedRows.length > 0" class="flex items-center space-x-2">
          <Badge variant="secondary">{{ selectedRows.length }} selected</Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Bulk Actions
                <ChevronDown class="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                v-for="action in bulkActions"
                :key="action.key"
                @click="handleBulkAction(action.key)"
                :class="action.variant === 'destructive' ? 'text-destructive' : ''"
              >
                <component :is="action.icon" class="mr-2 h-4 w-4" />
                {{ action.label }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <!-- Export Button -->
      <Button variant="outline" size="sm" @click="handleExport" :disabled="loading">
        <Download class="mr-2 h-4 w-4" />
        Export
      </Button>
    </div>

    <!-- Table -->
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <!-- Select All Checkbox -->
            <TableHead v-if="selectable" class="w-12">
              <Checkbox
                :checked="isAllSelected"
                :indeterminate="isIndeterminate"
                @update:checked="toggleSelectAll"
              />
            </TableHead>

            <!-- Column Headers -->
            <TableHead
              v-for="column in columns"
              :key="column.key"
              :class="[
                column.class,
                column.sortable ? 'cursor-pointer hover:bg-muted/50' : '',
                column.align === 'center' ? 'text-center' : '',
                column.align === 'right' ? 'text-right' : '',
              ]"
              @click="column.sortable ? handleSort(column.key) : null"
            >
              <div class="flex items-center space-x-2">
                <span>{{ column.label }}</span>
                <div v-if="column.sortable" class="flex flex-col">
                  <ChevronUp
                    :class="[
                      'h-3 w-3',
                      sortBy === column.key && sortOrder === 'asc'
                        ? 'text-foreground'
                        : 'text-muted-foreground',
                    ]"
                  />
                  <ChevronDown
                    :class="[
                      'h-3 w-3 -mt-1',
                      sortBy === column.key && sortOrder === 'desc'
                        ? 'text-foreground'
                        : 'text-muted-foreground',
                    ]"
                  />
                </div>
              </div>
            </TableHead>

            <!-- Actions Column -->
            <TableHead v-if="actions.length > 0" class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <!-- Loading State -->
          <TableRow v-if="loading">
            <TableCell :colspan="totalColumns" class="text-center py-8">
              <div class="flex items-center justify-center space-x-2">
                <Loader2 class="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            </TableCell>
          </TableRow>

          <!-- Empty State -->
          <TableRow v-else-if="filteredData.length === 0">
            <TableCell :colspan="totalColumns" class="text-center py-8">
              <div class="text-muted-foreground">
                {{ searchQuery ? 'No results found' : 'No data available' }}
              </div>
            </TableCell>
          </TableRow>

          <!-- Data Rows -->
          <TableRow
            v-else
            v-for="(item, index) in paginatedData"
            :key="getRowKey(item, index)"
            :class="[
              'hover:bg-muted/50',
              selectedRows.includes(getRowKey(item, index)) ? 'bg-muted/50' : '',
            ]"
          >
            <!-- Select Checkbox -->
            <TableCell v-if="selectable">
              <Checkbox
                :checked="selectedRows.includes(getRowKey(item, index))"
                @update:checked="toggleRowSelection(getRowKey(item, index))"
              />
            </TableCell>

            <!-- Data Cells -->
            <TableCell
              v-for="column in columns"
              :key="column.key"
              :class="[
                column.class,
                column.align === 'center' ? 'text-center' : '',
                column.align === 'right' ? 'text-right' : '',
              ]"
            >
              <!-- Custom Cell Renderer -->
              <slot
                v-if="$slots[`cell-${column.key}`]"
                :name="`cell-${column.key}`"
                :item="item"
                :value="getNestedValue(item, column.key)"
              />

              <!-- Default Cell Content -->
              <span v-else>{{ formatCellValue(item, column) }}</span>
            </TableCell>

            <!-- Actions Cell -->
            <TableCell v-if="actions.length > 0" class="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal class="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    v-for="action in actions"
                    :key="action.key"
                    @click="handleAction(action.key, item)"
                    :class="action.variant === 'destructive' ? 'text-destructive' : ''"
                  >
                    <component :is="action.icon" class="mr-2 h-4 w-4" />
                    {{ action.label }}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between">
      <div class="text-sm text-muted-foreground">
        Page {{ currentPage }} of {{ totalPages }}
      </div>

      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          <ChevronLeft class="h-4 w-4" />
          Previous
        </Button>

        <div class="flex items-center space-x-1">
          <Button
            v-for="page in visiblePages"
            :key="page"
            :variant="page === currentPage ? 'default' : 'outline'"
            size="sm"
            @click="goToPage(page)"
            class="w-8"
          >
            {{ page }}
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          Next
          <ChevronRight class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { debounce } from 'lodash-es'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Download,
  Loader2,
} from 'lucide-vue-next'

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  class?: string
  formatter?: (value: any, item: any) => string
}

export interface TableAction {
  key: string
  label: string
  icon: any
  variant?: 'default' | 'destructive'
}

interface Props {
  data: any[]
  columns: TableColumn[]
  loading?: boolean
  selectable?: boolean
  actions?: TableAction[]
  bulkActions?: TableAction[]
  pageSize?: number
  rowKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  loading: false,
  selectable: false,
  actions: () => [],
  bulkActions: () => [],
  pageSize: 10,
  rowKey: 'id',
})

console.log('DataTable received data:', props.data)

const emit = defineEmits<{
  sort: [{ column: string; order: 'asc' | 'desc' }]
  search: [query: string]
  action: [{ action: string; item: any }]
  bulkAction: [{ action: string; items: any[] }]
  export: []
}>()

// Search and filtering
const searchQuery = ref('')
const sortBy = ref<string>('')
const sortOrder = ref<'asc' | 'desc'>('asc')

// Selection
const selectedRows = ref<string[]>([])

// Pagination
const currentPage = ref(1)

// Computed properties
const filteredData = computed(() => {
  // Ensure props.data is an array
  const dataArray = Array.isArray(props.data) ? props.data : []

  let filtered = [...dataArray]

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((item) =>
      props.columns.some((column) => {
        const value = getNestedValue(item, column.key)
        return String(value).toLowerCase().includes(query)
      }),
    )
  }

  // Apply sorting
  if (sortBy.value) {
    filtered.sort((a, b) => {
      const aValue = getNestedValue(a, sortBy.value)
      const bValue = getNestedValue(b, sortBy.value)

      if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredData.value.length / props.pageSize))

const startIndex = computed(() => (currentPage.value - 1) * props.pageSize)
const endIndex = computed(() =>
  Math.min(startIndex.value + props.pageSize, filteredData.value.length),
)

const paginatedData = computed(() => {
  if (!Array.isArray(filteredData.value)) {
    return []
  }
  return filteredData.value.slice(startIndex.value, endIndex.value)
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

const totalColumns = computed(() => {
  let count = props.columns.length
  if (props.selectable) count++
  if (props.actions.length > 0) count++
  return count
})

const isAllSelected = computed(() => {
  if (!Array.isArray(paginatedData.value) || paginatedData.value.length === 0) {
    return false
  }
  const currentPageKeys = paginatedData.value.map((item, index) => getRowKey(item, index))
  return (
    currentPageKeys.length > 0 && currentPageKeys.every((key) => selectedRows.value.includes(key))
  )
})

const isIndeterminate = computed(() => {
  if (!Array.isArray(paginatedData.value) || paginatedData.value.length === 0) {
    return false
  }
  const currentPageKeys = paginatedData.value.map((item, index) => getRowKey(item, index))
  const selectedCount = currentPageKeys.filter((key) => selectedRows.value.includes(key)).length
  return selectedCount > 0 && selectedCount < currentPageKeys.length
})

// Methods
const getRowKey = (item: any, index: number): string => {
  return item[props.rowKey] || `row-${index}`
}

const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

const formatCellValue = (item: any, column: TableColumn): string => {
  const value = getNestedValue(item, column.key)

  if (column.formatter) {
    return column.formatter(value, item)
  }

  if (value === null || value === undefined) {
    return '-'
  }

  return String(value)
}

const handleSearch = debounce(() => {
  currentPage.value = 1
  emit('search', searchQuery.value)
}, 300)

const handleSort = (column: string) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortOrder.value = 'asc'
  }

  emit('sort', { column, order: sortOrder.value })
}

const toggleSelectAll = () => {
  const currentPageKeys = paginatedData.value.map((item, index) => getRowKey(item, index))

  if (isAllSelected.value) {
    selectedRows.value = selectedRows.value.filter((key) => !currentPageKeys.includes(key))
  } else {
    selectedRows.value = [...new Set([...selectedRows.value, ...currentPageKeys])]
  }
}

const toggleRowSelection = (key: string) => {
  const index = selectedRows.value.indexOf(key)
  if (index > -1) {
    selectedRows.value.splice(index, 1)
  } else {
    selectedRows.value.push(key)
  }
}

const handleAction = (action: string, item: any) => {
  emit('action', { action, item })
}

const handleBulkAction = (action: string) => {
  const selectedItems = props.data.filter((item, index) =>
    selectedRows.value.includes(getRowKey(item, index)),
  )
  emit('bulkAction', { action, items: selectedItems })
  selectedRows.value = []
}

const handleExport = () => {
  emit('export')
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Watch for data changes to reset pagination
watch(
  () => props.data,
  () => {
    currentPage.value = 1
    selectedRows.value = []
  },
)
</script>
