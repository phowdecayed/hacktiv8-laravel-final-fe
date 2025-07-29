<template>
  <AlertDialog :open="isOpen" @update:open="handleOpenChange">
    <AlertDialogContent class="sm:max-w-md">
      <AlertDialogHeader>
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            :class="iconBackgroundClass"
          >
            <component :is="iconComponent" class="w-5 h-5" :class="iconColorClass" />
          </div>
          <div class="flex-1 min-w-0">
            <AlertDialogTitle class="text-left">
              {{ title }}
            </AlertDialogTitle>
            <AlertDialogDescription v-if="description" class="text-left mt-1">
              {{ description }}
            </AlertDialogDescription>
          </div>
        </div>
      </AlertDialogHeader>

      <div v-if="details" class="px-6 py-2">
        <p class="text-sm text-muted-foreground">
          {{ details }}
        </p>
      </div>

      <AlertDialogFooter class="flex-col sm:flex-row gap-2">
        <AlertDialogCancel @click="handleCancel" :disabled="isLoading" class="w-full sm:w-auto">
          {{ cancelText }}
        </AlertDialogCancel>
        <AlertDialogAction
          @click="handleConfirm"
          :disabled="isLoading"
          :class="confirmButtonClass"
          class="w-full sm:w-auto"
        >
          <Loader2 v-if="isLoading" class="w-4 h-4 mr-2 animate-spin" />
          {{ isLoading ? loadingText : confirmText }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  AlertTriangle,
  Trash2,
  LogOut,
  AlertCircle,
  Info,
  Loader2,
  type LucideIcon,
} from 'lucide-vue-next'

interface Props {
  isOpen: boolean
  title: string
  description?: string
  details?: string
  confirmText?: string
  cancelText?: string
  loadingText?: string
  variant?: 'default' | 'destructive' | 'warning' | 'info'
  onConfirm?: () => Promise<void> | void
  onCancel?: () => void
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  details: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  loadingText: 'Processing...',
  variant: 'default',
})

const emit = defineEmits<Emits>()

const isLoading = ref(false)

const iconComponent = computed((): LucideIcon => {
  switch (props.variant) {
    case 'destructive':
      return Trash2
    case 'warning':
      return AlertTriangle
    case 'info':
      return Info
    default:
      return AlertCircle
  }
})

const iconBackgroundClass = computed(() => {
  switch (props.variant) {
    case 'destructive':
      return 'bg-red-100 dark:bg-red-900/20'
    case 'warning':
      return 'bg-yellow-100 dark:bg-yellow-900/20'
    case 'info':
      return 'bg-blue-100 dark:bg-blue-900/20'
    default:
      return 'bg-gray-100 dark:bg-gray-900/20'
  }
})

const iconColorClass = computed(() => {
  switch (props.variant) {
    case 'destructive':
      return 'text-red-600 dark:text-red-400'
    case 'warning':
      return 'text-yellow-600 dark:text-yellow-400'
    case 'info':
      return 'text-blue-600 dark:text-blue-400'
    default:
      return 'text-gray-600 dark:text-gray-400'
  }
})

const confirmButtonClass = computed(() => {
  switch (props.variant) {
    case 'destructive':
      return 'bg-red-600 hover:bg-red-700 text-white'
    case 'warning':
      return 'bg-yellow-600 hover:bg-yellow-700 text-white'
    default:
      return ''
  }
})

const handleOpenChange = (open: boolean) => {
  if (!isLoading.value) {
    emit('update:open', open)
  }
}

const handleConfirm = async () => {
  if (isLoading.value) return

  try {
    isLoading.value = true

    if (props.onConfirm) {
      await props.onConfirm()
    }

    emit('confirm')
    emit('update:open', false)
  } catch (error) {
    console.error('Confirmation action failed:', error)
    // Don't close dialog on error, let parent handle it
  } finally {
    isLoading.value = false
  }
}

const handleCancel = () => {
  if (isLoading.value) return

  if (props.onCancel) {
    props.onCancel()
  }

  emit('cancel')
  emit('update:open', false)
}
</script>
