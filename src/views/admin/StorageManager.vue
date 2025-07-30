<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Storage Management</h1>
        <p class="text-gray-600">Manage files and media assets</p>
      </div>
      <Button @click="openUploadDialog">
        <Plus class="w-4 h-4 mr-2" />
        Upload Files
      </Button>
    </div>

    <!-- Filters -->
    <Card>
      <CardHeader>
        <CardTitle class="text-lg">Filters</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Search Filter -->
          <div class="space-y-2">
            <Label for="search-filter">Search</Label>
            <Input
              id="search-filter"
              v-model="filters.search"
              placeholder="Search files..."
              @keyup.enter="applyFilters"
            />
          </div>

          <!-- Type Filter -->
          <div class="space-y-2">
            <Label for="type-filter">File Type</Label>
            <Select v-model="filters.type">
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
                <SelectItem value="archive">Archives</SelectItem>
                <SelectItem value="text">Text files</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- User Filter -->
          <div class="space-y-2">
            <Label for="user-filter">User</Label>
            <Select v-model="filters.user_id">
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

    <!-- Files Grid -->
    <Card>
      <CardHeader>
        <CardTitle class="text-lg">Files</CardTitle>
        <CardDescription> {{ totalFiles }} total files </CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="isLoading && !hasFiles" class="flex justify-center py-12">
          <div class="flex items-center gap-2">
            <RefreshCw class="h-4 w-4 animate-spin" />
            <span>Loading files...</span>
          </div>
        </div>

        <div v-else-if="!hasFiles" class="text-center py-12">
          <FileSearch class="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">No files found</h3>
          <p class="text-gray-500">Try adjusting your filters or upload some files.</p>
          <Button @click="openUploadDialog" class="mt-4">
            <Upload class="h-4 w-4 mr-2" />
            Upload Files
          </Button>
        </div>

        <div v-else>
          <div
            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          >
            <div
              v-for="file in files"
              :key="file.id"
              class="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div class="aspect-square bg-gray-100 flex items-center justify-center relative">
                <img
                  v-if="isImageFile(file)"
                  :src="file.file_url"
                  :alt="file.original_name"
                  class="object-cover w-full h-full"
                />
                <File v-else class="h-12 w-12 text-gray-400" />
                <div
                  v-if="file.deleted_at"
                  class="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded"
                >
                  Deleted
                </div>
              </div>
              <div class="p-3">
                <h3 class="font-medium text-sm truncate" :title="file.original_name">
                  {{ file.original_name }}
                </h3>
                <p class="text-xs text-gray-500 mt-1">
                  {{ formatFileSize(file.size) }} • {{ formatDate(file.created_at) }}
                </p>
                <div class="flex justify-between items-center mt-2">
                  <Badge variant="secondary" class="text-xs">
                    {{ getFileType(file.mime_type) }}
                  </Badge>
                  <div class="flex gap-1">
                    <Button
                      v-if="!file.deleted_at"
                      variant="ghost"
                      size="sm"
                      @click="downloadFile(file)"
                    >
                      <Download class="h-3 w-3" />
                    </Button>
                    <Button
                      v-if="!file.deleted_at"
                      variant="ghost"
                      size="sm"
                      @click="deleteFile(file.id)"
                    >
                      <Trash2 class="h-3 w-3" />
                    </Button>
                    <Button v-else variant="ghost" size="sm" @click="restoreFile(file.id)">
                      <RotateCcw class="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="hasFiles && pagination.last_page > 1" class="mt-6">
            <div class="flex items-center justify-between">
              <div class="text-sm text-gray-500">
                Showing {{ (pagination.current_page - 1) * pagination.per_page + 1 }} to
                {{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }} of
                {{ pagination.total }} files
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
        </div>
      </CardContent>
    </Card>

    <!-- Upload Dialog -->
    <Dialog v-model:open="showUploadDialog">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription> Select files to upload to the storage system </DialogDescription>
        </DialogHeader>

        <div class="space-y-4">
          <div
            class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
            @click="triggerFileInput"
            @drop.prevent="handleDrop"
            @dragover.prevent
          >
            <Upload class="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p class="text-sm font-medium text-gray-900">Drag and drop files here</p>
            <p class="text-xs text-gray-500 mt-1">or click to browse</p>
            <input ref="fileInput" type="file" multiple class="hidden" @change="handleFileSelect" />
          </div>

          <div v-if="selectedFiles.length > 0" class="space-y-2">
            <div
              v-for="(file, index) in selectedFiles"
              :key="index"
              class="flex items-center justify-between p-2 border rounded"
            >
              <div class="flex items-center gap-2">
                <File class="h-4 w-4 text-gray-400" />
                <div>
                  <p class="text-sm font-medium">{{ file.name }}</p>
                  <p class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" @click="removeSelectedFile(index)">
                <X class="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div class="flex justify-end gap-2">
            <Button variant="outline" @click="closeUploadDialog">Cancel</Button>
            <Button
              @click="uploadSelectedFiles"
              :disabled="selectedFiles.length === 0 || isUploading"
            >
              <Upload class="h-4 w-4 mr-2" :class="{ 'animate-spin': isUploading }" />
              {{ isUploading ? 'Uploading...' : 'Upload' }}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStorage } from '@/composables/useStorage'
import { adminApiService } from '@/services/api/admin'
import { useNotifications } from '@/composables/useNotifications'
import type { StorageFile, User } from '@/types'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// Icons
import {
  Plus,
  Upload,
  Download,
  Trash2,
  RotateCcw,
  Filter,
  X,
  CalendarIcon,
  FileSearch,
  File,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-vue-next'

// Composables
const {
  files,
  pagination,
  filters,
  isLoading,
  isUploading,
  hasFiles,
  totalFiles,
  fetchFiles,
  uploadFile,
  deleteFile: deleteStorageFile,
  restoreFile: restoreStorageFile,
} = useStorage()
const { showSuccess, showError } = useNotifications()

// Reactive state
const users = ref<User[]>([])
const showUploadDialog = ref(false)
const selectedFiles = ref<File[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const dateRange = ref<any>(null)

// Computed properties
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
    users.value = response.data
  } catch (error) {
    console.error('Failed to load users:', error)
  }
}

const openUploadDialog = () => {
  showUploadDialog.value = true
  selectedFiles.value = []
}

const closeUploadDialog = () => {
  showUploadDialog.value = false
  selectedFiles.value = []
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) {
    selectedFiles.value = [...selectedFiles.value, ...Array.from(input.files)]
  }
}

const handleDrop = (event: DragEvent) => {
  if (event.dataTransfer?.files) {
    selectedFiles.value = [...selectedFiles.value, ...Array.from(event.dataTransfer.files)]
  }
}

const removeSelectedFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

const uploadSelectedFiles = async () => {
  try {
    for (const file of selectedFiles.value) {
      const formData = new FormData()
      formData.append('file', file)
      await uploadFile({ file })
    }
    showSuccess(`${selectedFiles.value.length} file(s) uploaded successfully`)
    closeUploadDialog()
    await refreshData()
  } catch (error) {
    showError('Failed to upload files')
  }
}

const downloadFile = (file: StorageFile) => {
  const link = document.createElement('a')
  link.href = file.file_url
  link.download = file.original_name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const deleteFile = async (id: number) => {
  if (confirm('Are you sure you want to delete this file?')) {
    try {
      await deleteStorageFile(id)
      showSuccess('File deleted successfully')
      await refreshData()
    } catch (error) {
      showError('Failed to delete file')
    }
  }
}

const restoreFile = async (id: number) => {
  try {
    await restoreStorageFile(id)
    showSuccess('File restored successfully')
    await refreshData()
  } catch (error) {
    showError('Failed to restore file')
  }
}

const refreshData = async () => {
  try {
    await fetchFiles()
  } catch (error) {
    showError('Failed to refresh files')
  }
}

const applyFilters = async () => {
  try {
    // Clean up empty string values
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(
        ([_, value]) => value !== 'all' && value !== null && value !== undefined,
      ),
    )
    await fetchFiles(cleanFilters)
  } catch (error) {
    showError('Failed to apply filters')
  }
}

const clearFilters = async () => {
  filters.search = ''
  filters.type = ''
  filters.user_id = ''
  dateRange.value = null
  try {
    await fetchFiles()
  } catch (error) {
    showError('Failed to clear filters')
  }
}

const updateDateRange = (range: any) => {
  if (range?.start) {
    filters.date_from = new Date(range.start.toString()).toISOString().split('T')[0]
  } else {
    delete filters.date_from
  }

  if (range?.end) {
    filters.date_to = new Date(range.end.toString()).toISOString().split('T')[0]
  } else {
    delete filters.date_to
  }
}

const changePage = async (page: number) => {
  try {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(
        ([_, value]) => value !== 'all' && value !== null && value !== undefined,
      ),
    )
    await fetchFiles({ ...cleanFilters, page })
  } catch (error) {
    showError('Failed to load page')
  }
}

const isImageFile = (file: StorageFile) => {
  return file.mime_type.startsWith('image/')
}

const getFileType = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return 'Image'
  if (mimeType.includes('pdf')) return 'PDF'
  if (mimeType.includes('word')) return 'Document'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'Spreadsheet'
  if (mimeType.includes('zip') || mimeType.includes('rar')) return 'Archive'
  return mimeType.split('/')[1]?.toUpperCase() || 'File'
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

// Lifecycle
onMounted(async () => {
  await Promise.all([loadUsers(), refreshData()])
})
</script>
