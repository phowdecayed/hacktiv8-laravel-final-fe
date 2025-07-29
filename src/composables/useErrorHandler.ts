import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import ApiErrorHandler, { type ApiException } from '@/lib/errors'

export interface ErrorState {
  hasError: boolean
  error: Error | ApiException | null
  errorType: 'network' | 'api' | 'validation' | 'auth' | 'unknown'
  retryCount: number
  maxRetries: number
  isRetrying: boolean
}

export interface RetryConfig {
  maxRetries?: number
  retryDelay?: number
  exponentialBackoff?: boolean
  retryCondition?: (error: Error | ApiException) => boolean
}

export const useErrorHandler = (config?: RetryConfig) => {
  const router = useRouter()

  const defaultConfig: Required<RetryConfig> = {
    maxRetries: 3,
    retryDelay: 1000,
    exponentialBackoff: true,
    retryCondition: (error) => {
      // Retry on network errors and 5xx server errors
      if (ApiErrorHandler.isNetworkError(error)) return true
      if ('status' in error && error.status >= 500) return true
      return false
    },
    ...config,
  }

  const errorState = ref<ErrorState>({
    hasError: false,
    error: null,
    errorType: 'unknown',
    retryCount: 0,
    maxRetries: defaultConfig.maxRetries,
    isRetrying: false,
  })

  // Computed properties
  const hasError = computed(() => errorState.value.hasError)
  const error = computed(() => errorState.value.error)
  const errorType = computed(() => errorState.value.errorType)
  const canRetry = computed(
    () =>
      errorState.value.retryCount < errorState.value.maxRetries &&
      errorState.value.error &&
      defaultConfig.retryCondition(errorState.value.error),
  )
  const isRetrying = computed(() => errorState.value.isRetrying)

  // Error classification
  const classifyError = (error: Error | ApiException): ErrorState['errorType'] => {
    if (ApiErrorHandler.isNetworkError(error)) {
      return 'network'
    }

    if ('status' in error) {
      if (ApiErrorHandler.isAuthError(error)) {
        return 'auth'
      }
      if (error.status === 422) {
        return 'validation'
      }
      return 'api'
    }

    return 'unknown'
  }

  // Handle different types of errors
  const handleError = async (
    error: Error | ApiException,
    options?: {
      showToast?: boolean
      customMessage?: string
      silent?: boolean
      redirect?: string
    },
  ) => {
    const { showToast = true, customMessage, silent = false, redirect } = options || {}

    console.error('Error handled:', error)

    const errorType = classifyError(error)

    errorState.value = {
      hasError: true,
      error,
      errorType,
      retryCount: 0,
      maxRetries: defaultConfig.maxRetries,
      isRetrying: false,
    }

    if (!silent) {
      const message = customMessage || getErrorMessage(error, errorType)

      if (showToast) {
        switch (errorType) {
          case 'auth':
            toast.error(message)
            // Redirect to login for auth errors
            if (!redirect) {
              await router.push('/login')
            }
            break
          case 'validation':
            toast.error(message)
            break
          case 'network':
            toast.error(message, {
              action: canRetry.value
                ? {
                    label: 'Retry',
                    onClick: () => retry(),
                  }
                : undefined,
            })
            break
          default:
            toast.error(message)
        }
      }

      if (redirect) {
        await router.push(redirect)
      }
    }

    return errorState.value
  }

  // Get user-friendly error message
  const getErrorMessage = (error: Error | ApiException, type: ErrorState['errorType']): string => {
    if ('status' in error) {
      return ApiErrorHandler.handle(error)
    }

    switch (type) {
      case 'network':
        return 'Network error. Please check your connection and try again.'
      case 'auth':
        return 'Authentication required. Please log in to continue.'
      case 'validation':
        return 'Please check your input and try again.'
      default:
        return error.message || 'An unexpected error occurred.'
    }
  }

  // Retry mechanism with exponential backoff
  const retry = async (retryFn?: () => Promise<void>): Promise<boolean> => {
    if (!canRetry.value || errorState.value.isRetrying) {
      return false
    }

    errorState.value.isRetrying = true
    errorState.value.retryCount++

    try {
      // Calculate delay with exponential backoff
      const delay = defaultConfig.exponentialBackoff
        ? defaultConfig.retryDelay * Math.pow(2, errorState.value.retryCount - 1)
        : defaultConfig.retryDelay

      await new Promise((resolve) => setTimeout(resolve, delay))

      if (retryFn) {
        await retryFn()
      }

      // Clear error state on successful retry
      clearError()
      toast.success('Operation completed successfully')
      return true
    } catch (retryError) {
      console.error('Retry failed:', retryError)

      if (errorState.value.retryCount >= errorState.value.maxRetries) {
        toast.error('Maximum retry attempts reached. Please try again later.')
      } else {
        toast.error(
          `Retry ${errorState.value.retryCount} failed. ${errorState.value.maxRetries - errorState.value.retryCount} attempts remaining.`,
        )
      }

      return false
    } finally {
      errorState.value.isRetrying = false
    }
  }

  // Clear error state
  const clearError = () => {
    errorState.value = {
      hasError: false,
      error: null,
      errorType: 'unknown',
      retryCount: 0,
      maxRetries: defaultConfig.maxRetries,
      isRetrying: false,
    }
  }

  // Async operation wrapper with error handling
  const withErrorHandling = async <T>(
    operation: () => Promise<T>,
    options?: {
      showToast?: boolean
      customMessage?: string
      silent?: boolean
      redirect?: string
      retryFn?: () => Promise<void>
    },
  ): Promise<T | null> => {
    try {
      clearError()
      return await operation()
    } catch (error) {
      await handleError(error as Error | ApiException, options)

      // Auto-retry if conditions are met
      if (canRetry.value && options?.retryFn) {
        const retrySuccess = await retry(options.retryFn)
        if (retrySuccess) {
          try {
            return await operation()
          } catch (retryError) {
            await handleError(retryError as Error | ApiException, { ...options, showToast: false })
          }
        }
      }

      return null
    }
  }

  // Get validation errors for forms
  const getValidationErrors = (): Record<string, string[]> | null => {
    if (errorState.value.error && 'status' in errorState.value.error) {
      return ApiErrorHandler.getValidationErrors(errorState.value.error)
    }
    return null
  }

  // Check if specific field has validation error
  const hasFieldError = (fieldName: string): boolean => {
    const validationErrors = getValidationErrors()
    return !!(validationErrors && validationErrors[fieldName])
  }

  // Get field-specific error message
  const getFieldError = (fieldName: string): string | null => {
    const validationErrors = getValidationErrors()
    if (validationErrors && validationErrors[fieldName]) {
      return validationErrors[fieldName][0] // Return first error message
    }
    return null
  }

  return {
    // State
    hasError,
    error,
    errorType,
    canRetry,
    isRetrying,

    // Methods
    handleError,
    retry,
    clearError,
    withErrorHandling,

    // Validation helpers
    getValidationErrors,
    hasFieldError,
    getFieldError,

    // Utilities
    getErrorMessage,
    classifyError,
  }
}
