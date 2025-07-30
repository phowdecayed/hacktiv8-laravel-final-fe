<script setup lang="ts">
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Upload, Loader2, Eye, Trash2, AlertCircle } from 'lucide-vue-next'

export interface ImageFile {
  id: string
  file: File
  url: string
  name: string
  size: number
  loading: boolean
  error: boolean
}

interface Props {
  modelValue?: File[]
  multiple?: boolean
  maxFiles?: number
  maxFileSize?: number
  acceptedTypes?: string[]
  disabled?: boolean
  uploadText?: string
  supportText?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  multiple: false,
  maxFiles: 10,
  maxFileSize: 5 * 1024 * 1024,
  acceptedTypes: () => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  disabled: false,
  uploadText: 'Click to upload or drag and drop',
  supportText: 'PNG, JPG, GIF up to 5MB',
})

const emit = defineEmits<{
  'update:modelValue': [files: File[]]
  upload: [files: File[]]
  remove: [file: File, index: number]
  error: [message: string]
}>()

// State
const fileInput = ref<HTMLInputElement>()
const isDragOver = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const error = ref('')
const showPreview = ref(false)
const previewImageData = ref<ImageFile | null>(null)
const previewImages = ref<ImageFile[]>([])

// Methods
const openFileDialog = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files) {
    processFiles(Array.from(files))
  }
}

const processFiles = (files: File[]) => {
  error.value = ''
  const validFiles = files.filter((file) => {
    if (!props.acceptedTypes.includes(file.type)) {
      error.value = `File type ${file.type} is not supported`
      return false
    }
    if (file.size > props.maxFileSize) {
      error.value = `File size exceeds limit`
      return false
    }
    return true
  })

  if (validFiles.length === 0) return

  const currentFiles = props.modelValue || []
  const updatedFiles = [...currentFiles, ...validFiles]
  emit('update:modelValue', updatedFiles)
  emit('upload', validFiles)
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<template>
  <div class="space-y-4">
    <!-- Upload Area -->
    <div
      class="border-2 border-dashed rounded-lg p-6 text-center transition-colors"
      :class="[
        isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
        error ? 'border-destructive' : '',
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:border-muted-foreground/50 cursor-pointer',
      ]"
      @click="!disabled && openFileDialog()"
    >
      <div class="flex flex-col items-center space-y-2">
        <Upload class="h-8 w-8 text-muted-foreground" />
        <div>
          <p class="text-sm font-medium">{{ uploadText }}</p>
          <p class="text-xs text-muted-foreground">{{ supportText }}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          :disabled="disabled"
          @click.stop="openFileDialog"
        >
          Choose Files
        </Button>
      </div>
    </div>

    <!-- File Input -->
    <input
      ref="fileInput"
      type="file"
      :multiple="multiple"
      :accept="acceptedTypes.join(',')"
      :disabled="disabled"
      class="hidden"
      @change="handleFileSelect"
    />

    <!-- Error Message -->
    <p v-if="error" class="text-sm text-destructive">
      {{ error }}
    </p>

    <!-- Upload Progress -->
    <div v-if="uploading" class="space-y-2">
      <div class="flex items-center justify-between text-sm">
        <span>Uploading...</span>
        <span>{{ Math.round(uploadProgress) }}%</span>
      </div>
      <Progress :value="uploadProgress" class="w-full" />
    </div>
  </div>
</template>
