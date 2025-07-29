import { toast, type ExternalToast } from 'vue-sonner'
import { ref, computed } from 'vue'

export interface NotificationOptions extends ExternalToast {
  title?: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  cancel?: {
    label: string
    onClick?: () => void
  }
  persistent?: boolean
  position?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'
}

export interface LoadingToastOptions {
  title?: string
  description?: string
  successMessage?: string
  errorMessage?: string
}

export const useNotifications = () => {
  const activeToasts = ref<Set<string | number>>(new Set())
  const loadingToasts = ref<Map<string, string | number>>(new Map())

  // Basic notification methods
  const showSuccess = (message: string, options?: NotificationOptions) => {
    const toastId = toast.success(message, {
      duration: options?.persistent ? Infinity : options?.duration || 4000,
      ...options,
    })

    if (toastId) {
      activeToasts.value.add(toastId)
    }

    return toastId
  }

  const showError = (message: string, options?: NotificationOptions) => {
    const toastId = toast.error(message, {
      duration: options?.persistent ? Infinity : options?.duration || 6000,
      ...options,
    })

    if (toastId) {
      activeToasts.value.add(toastId)
    }

    return toastId
  }

  const showWarning = (message: string, options?: NotificationOptions) => {
    const toastId = toast.warning(message, {
      duration: options?.persistent ? Infinity : options?.duration || 5000,
      ...options,
    })

    if (toastId) {
      activeToasts.value.add(toastId)
    }

    return toastId
  }

  const showInfo = (message: string, options?: NotificationOptions) => {
    const toastId = toast.info(message, {
      duration: options?.duration || 4000,
      ...options,
    })

    if (toastId) {
      activeToasts.value.add(toastId)
    }

    return toastId
  }

  const showCustom = (message: string, options?: NotificationOptions) => {
    const toastId = toast(message, {
      duration: options?.duration || 4000,
      ...options,
    })

    if (toastId) {
      activeToasts.value.add(toastId)
    }

    return toastId
  }

  // Loading toast methods
  const showLoading = (message: string, options?: LoadingToastOptions) => {
    const toastId = toast.loading(message, {
      duration: Infinity,
      description: options?.description,
    })

    if (toastId) {
      activeToasts.value.add(toastId)
    }

    return toastId
  }

  const updateLoadingToast = (
    toastId: string | number,
    type: 'success' | 'error',
    message: string,
    options?: NotificationOptions,
  ) => {
    if (type === 'success') {
      toast.success(message, {
        id: toastId,
        duration: options?.duration || 4000,
        ...options,
      })
    } else {
      toast.error(message, {
        id: toastId,
        duration: options?.duration || 6000,
        ...options,
      })
    }
  }

  // Promise-based loading toast
  const showPromiseToast = async <T>(
    promise: Promise<T>,
    options: LoadingToastOptions & {
      loadingMessage: string
    },
  ): Promise<T> => {
    const {
      loadingMessage,
      successMessage = 'Operation completed successfully',
      errorMessage = 'Operation failed',
      ...toastOptions
    } = options

    return toast.promise(promise, {
      loading: loadingMessage,
      success: successMessage,
      error: errorMessage,
      ...toastOptions,
    })
  }

  // Batch operations
  const showBatchSuccess = (messages: string[], options?: NotificationOptions) => {
    if (messages.length === 1) {
      return showSuccess(messages[0], options)
    }

    const title = options?.title || `${messages.length} operations completed`
    const description = messages.join(', ')

    return showSuccess(title, {
      ...options,
      description,
    })
  }

  const showBatchError = (messages: string[], options?: NotificationOptions) => {
    if (messages.length === 1) {
      return showError(messages[0], options)
    }

    const title = options?.title || `${messages.length} operations failed`
    const description = messages.join(', ')

    return showError(title, {
      ...options,
      description,
    })
  }

  // Specialized notification methods
  const showValidationErrors = (errors: Record<string, string[]>) => {
    const errorMessages = Object.entries(errors).flatMap(([field, messages]) =>
      messages.map((message) => `${field}: ${message}`),
    )

    if (errorMessages.length === 1) {
      return showError(errorMessages[0])
    }

    return showError('Please fix the following errors:', {
      description:
        errorMessages.slice(0, 3).join(', ') +
        (errorMessages.length > 3 ? ` and ${errorMessages.length - 3} more...` : ''),
      duration: 8000,
    })
  }

  const showNetworkError = (retryFn?: () => void) => {
    return showError('Network error. Please check your connection.', {
      action: retryFn
        ? {
            label: 'Retry',
            onClick: retryFn,
          }
        : undefined,
      duration: 8000,
    })
  }

  const showAuthError = () => {
    return showError('Authentication required. Please log in to continue.', {
      duration: 6000,
    })
  }

  const showMaintenanceNotice = () => {
    return showWarning('System maintenance in progress. Some features may be unavailable.', {
      persistent: true,
      action: {
        label: 'Dismiss',
        onClick: () => {}, // Will auto-dismiss
      },
    })
  }

  // Toast management
  const dismissToast = (toastId: string | number) => {
    toast.dismiss(toastId)
    activeToasts.value.delete(toastId)
    loadingToasts.value.delete(String(toastId))
  }

  const dismissAllToasts = () => {
    toast.dismiss()
    activeToasts.value.clear()
    loadingToasts.value.clear()
  }

  // Computed properties
  const hasActiveToasts = computed(() => activeToasts.value.size > 0)
  const activeToastCount = computed(() => activeToasts.value.size)
  const hasLoadingToasts = computed(() => loadingToasts.value.size > 0)

  // Utility methods
  const createActionToast = (
    message: string,
    actionLabel: string,
    actionFn: () => void,
    options?: NotificationOptions,
  ) => {
    return showInfo(message, {
      ...options,
      action: {
        label: actionLabel,
        onClick: actionFn,
      },
      duration: options?.duration || 8000,
    })
  }

  const createConfirmationToast = (
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    options?: NotificationOptions,
  ) => {
    return showWarning(message, {
      ...options,
      action: {
        label: 'Confirm',
        onClick: onConfirm,
      },
      cancel: {
        label: 'Cancel',
        onClick: onCancel,
      },
      duration: options?.duration || 10000,
    })
  }

  return {
    // Basic methods
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showCustom,
    showLoading,
    updateLoadingToast,
    showPromiseToast,

    // Batch methods
    showBatchSuccess,
    showBatchError,

    // Specialized methods
    showValidationErrors,
    showNetworkError,
    showAuthError,
    showMaintenanceNotice,

    // Management methods
    dismissToast,
    dismissAllToasts,

    // Utility methods
    createActionToast,
    createConfirmationToast,

    // State
    hasActiveToasts,
    activeToastCount,
    hasLoadingToasts,
  }
}
