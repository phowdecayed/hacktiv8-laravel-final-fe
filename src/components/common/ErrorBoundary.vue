<template>
  <div v-if="hasError" class="flex flex-col items-center justify-center min-h-[400px] p-8">
    <div class="text-center space-y-4 max-w-md">
      <!-- Error Icon -->
      <div
        class="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
        :class="errorIconClasses"
      >
        <component :is="errorIcon" class="w-8 h-8" :class="errorIconColor" />
      </div>

      <!-- Error Message -->
      <div class="space-y-2">
        <h2 class="text-xl font-semibold" :class="errorTitleColor">
          {{ computedErrorTitle }}
        </h2>
        <p class="text-muted-foreground">
          {{ computedErrorMessage }}
        </p>
        <details v-if="showDetails && errorDetails" class="text-left">
          <summary class="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
            Show technical details
          </summary>
          <pre class="mt-2 p-3 bg-muted rounded-md text-xs overflow-auto">{{ errorDetails }}</pre>
        </details>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-2 justify-center">
        <Button
          v-if="showRetryButton"
          @click="handleRetry"
          :disabled="isRetrying"
          :variant="retryButtonVariant"
        >
          <RefreshCw class="w-4 h-4 mr-2" :class="{ 'animate-spin': isRetrying }" />
          {{ isRetrying ? 'Retrying...' : 'Try Again' }}
        </Button>
        <Button variant="outline" @click="handleGoHome">
          <Home class="w-4 h-4 mr-2" />
          Go Home
        </Button>
        <Button v-if="showReportButton" variant="outline" @click="handleReport">
          <Bug class="w-4 h-4 mr-2" />
          Report Issue
        </Button>
      </div>
    </div>
  </div>

  <slot v-else />
</template>

<script setup lang="ts">
import { ref, computed, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Bug,
  Wifi,
  Shield,
  AlertCircle,
  XCircle,
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useErrorHandler } from '@/composables/useErrorHandler'
import type { ApiException } from '@/lib/errors'

interface Props {
  errorTitle?: string
  errorMessage?: string
  showDetails?: boolean
  showReportButton?: boolean
  showRetryButton?: boolean
  onRetry?: () => void | Promise<void>
  fallbackComponent?: string
}

interface Emits {
  (e: 'error', error: Error): void
  (e: 'retry'): void
  (e: 'report', error: Error): void
  (e: 'recover'): void
}

const props = withDefaults(defineProps<Props>(), {
  errorTitle: '',
  errorMessage: '',
  showDetails: false,
  showReportButton: false,
  showRetryButton: true,
})

const emit = defineEmits<Emits>()

const router = useRouter()
const errorHandler = useErrorHandler()

const hasError = ref(false)
const errorDetails = ref<string>('')
const isRetrying = ref(false)
const currentError = ref<Error | ApiException | null>(null)
const errorType = ref<'network' | 'api' | 'validation' | 'auth' | 'unknown'>('unknown')

// Computed properties for dynamic error display
const computedErrorTitle = computed(() => {
  if (props.errorTitle) return props.errorTitle

  switch (errorType.value) {
    case 'network':
      return 'Connection Problem'
    case 'auth':
      return 'Authentication Required'
    case 'validation':
      return 'Invalid Input'
    case 'api':
      return 'Server Error'
    default:
      return 'Something went wrong'
  }
})

const computedErrorMessage = computed(() => {
  if (props.errorMessage) return props.errorMessage

  if (currentError.value) {
    return errorHandler.getErrorMessage(currentError.value, errorType.value)
  }

  return 'An unexpected error occurred. Please try again or contact support if the problem persists.'
})

const errorIcon = computed(() => {
  switch (errorType.value) {
    case 'network':
      return Wifi
    case 'auth':
      return Shield
    case 'validation':
      return AlertCircle
    case 'api':
      return XCircle
    default:
      return AlertTriangle
  }
})

const errorIconClasses = computed(() => {
  switch (errorType.value) {
    case 'network':
      return 'bg-blue-100 dark:bg-blue-900/20'
    case 'auth':
      return 'bg-yellow-100 dark:bg-yellow-900/20'
    case 'validation':
      return 'bg-orange-100 dark:bg-orange-900/20'
    case 'api':
      return 'bg-red-100 dark:bg-red-900/20'
    default:
      return 'bg-destructive/10'
  }
})

const errorIconColor = computed(() => {
  switch (errorType.value) {
    case 'network':
      return 'text-blue-600 dark:text-blue-400'
    case 'auth':
      return 'text-yellow-600 dark:text-yellow-400'
    case 'validation':
      return 'text-orange-600 dark:text-orange-400'
    case 'api':
      return 'text-red-600 dark:text-red-400'
    default:
      return 'text-destructive'
  }
})

const errorTitleColor = computed(() => {
  switch (errorType.value) {
    case 'network':
      return 'text-blue-700 dark:text-blue-300'
    case 'auth':
      return 'text-yellow-700 dark:text-yellow-300'
    case 'validation':
      return 'text-orange-700 dark:text-orange-300'
    case 'api':
      return 'text-red-700 dark:text-red-300'
    default:
      return 'text-destructive'
  }
})

const retryButtonVariant = computed(() => {
  return errorType.value === 'network' ? 'default' : 'outline'
})

const canRetry = computed(() => {
  if (!props.showRetryButton) return false
  if (!currentError.value) return false

  // Allow retry for network errors and 5xx server errors
  if (errorType.value === 'network') return true
  if ('status' in currentError.value && currentError.value.status >= 500) return true

  return false
})

// Capture errors from child components
onErrorCaptured((error: Error) => {
  console.error('ErrorBoundary caught error:', error)

  triggerError(error)
  emit('error', error)

  // Prevent the error from propagating further
  return false
})

const triggerError = (error: Error | ApiException) => {
  hasError.value = true
  currentError.value = error
  errorDetails.value = 'stack' in error ? error.stack || error.message : error.message
  errorType.value = errorHandler.classifyError(error)
}

const handleRetry = async () => {
  if (isRetrying.value || !canRetry.value) return

  try {
    isRetrying.value = true

    if (props.onRetry) {
      await props.onRetry()
    }

    // Reset error state
    clearError()
    emit('retry')
    emit('recover')
    toast.success('Successfully recovered from error')
  } catch (retryError) {
    console.error('Retry failed:', retryError)
    toast.error('Retry failed. Please try again.')

    // Update error with retry error
    triggerError(retryError as Error)
  } finally {
    isRetrying.value = false
  }
}

const handleGoHome = () => {
  router.push('/')
}

const handleReport = () => {
  if (currentError.value) {
    const errorToReport = currentError.value instanceof Error ? currentError.value : new Error(JSON.stringify(currentError.value));
    emit('report', errorToReport)

    // You could integrate with error reporting services here
    // For now, just show a toast
    toast.success('Error report sent. Thank you for helping us improve!')
  }
}

const clearError = () => {
  hasError.value = false
  currentError.value = null
  errorDetails.value = ''
  errorType.value = 'unknown'
}

// Expose methods for manual error handling
defineExpose({
  triggerError,
  clearError,
  hasError: computed(() => hasError.value),
  errorType: computed(() => errorType.value),
})
</script>
