<template>
  <Button
    :variant="variant"
    :size="size"
    :disabled="isRetrying || disabled"
    @click="handleRetry"
    :class="containerClass"
  >
    <RefreshCw class="w-4 h-4 mr-2" :class="{ 'animate-spin': isRetrying }" />
    {{ isRetrying ? retryingText : retryText }}
  </Button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

interface Props {
  onRetry: () => Promise<void> | void
  retryText?: string
  retryingText?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
  containerClass?: string
  showSuccessToast?: boolean
  showErrorToast?: boolean
  successMessage?: string
  errorMessage?: string
}

interface Emits {
  (e: 'retry-start'): void
  (e: 'retry-success'): void
  (e: 'retry-error', error: Error): void
}

const props = withDefaults(defineProps<Props>(), {
  retryText: 'Try Again',
  retryingText: 'Retrying...',
  variant: 'outline',
  size: 'default',
  disabled: false,
  containerClass: '',
  showSuccessToast: true,
  showErrorToast: true,
  successMessage: 'Operation completed successfully',
  errorMessage: 'Retry failed. Please try again.',
})

const emit = defineEmits<Emits>()

const isRetrying = ref(false)

const handleRetry = async () => {
  if (isRetrying.value || props.disabled) return

  try {
    isRetrying.value = true
    emit('retry-start')

    await props.onRetry()

    emit('retry-success')

    if (props.showSuccessToast) {
      toast.success(props.successMessage)
    }
  } catch (error) {
    console.error('Retry failed:', error)

    const retryError = error instanceof Error ? error : new Error('Retry failed')
    emit('retry-error', retryError)

    if (props.showErrorToast) {
      toast.error(props.errorMessage)
    }
  } finally {
    isRetrying.value = false
  }
}
</script>
