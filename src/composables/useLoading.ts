import { ref, computed, reactive } from 'vue'

export interface LoadingState {
  isLoading: boolean
  message: string
  progress?: number
  isIndeterminate: boolean
  startTime: number
  error?: Error | null
}

export interface LoadingOptions {
  message?: string
  showProgress?: boolean
  isIndeterminate?: boolean
  timeout?: number
  onTimeout?: () => void
}

export const useLoading = (initialState = false) => {
  const loadingStates = reactive<Map<string, LoadingState>>(new Map())
  const globalLoading = ref(initialState)
  const globalMessage = ref('Loading...')

  // Global loading state
  const isGlobalLoading = computed(() => globalLoading.value)
  const hasAnyLoading = computed(
    () =>
      globalLoading.value || Array.from(loadingStates.values()).some((state) => state.isLoading),
  )

  // Global loading methods
  const startGlobalLoading = (message = 'Loading...') => {
    globalLoading.value = true
    globalMessage.value = message
  }

  const stopGlobalLoading = () => {
    globalLoading.value = false
  }

  const updateGlobalMessage = (message: string) => {
    globalMessage.value = message
  }

  // Scoped loading methods
  const startLoading = (key: string, options: LoadingOptions = {}) => {
    const { message = 'Loading...', isIndeterminate = true, timeout, onTimeout } = options

    const state: LoadingState = {
      isLoading: true,
      message,
      isIndeterminate,
      startTime: Date.now(),
      error: null,
    }

    loadingStates.set(key, state)

    // Set timeout if specified
    if (timeout && onTimeout) {
      setTimeout(() => {
        const currentState = loadingStates.get(key)
        if (currentState?.isLoading) {
          onTimeout()
        }
      }, timeout)
    }

    return key
  }

  const stopLoading = (key: string, error?: Error) => {
    const state = loadingStates.get(key)
    if (state) {
      state.isLoading = false
      state.error = error || null

      // Remove state after a short delay to allow for transitions
      setTimeout(() => {
        loadingStates.delete(key)
      }, 300)
    }
  }

  const updateLoadingMessage = (key: string, message: string) => {
    const state = loadingStates.get(key)
    if (state) {
      state.message = message
    }
  }

  const updateLoadingProgress = (key: string, progress: number) => {
    const state = loadingStates.get(key)
    if (state) {
      state.progress = Math.max(0, Math.min(100, progress))
      state.isIndeterminate = false
    }
  }

  const setLoadingIndeterminate = (key: string, isIndeterminate = true) => {
    const state = loadingStates.get(key)
    if (state) {
      state.isIndeterminate = isIndeterminate
      if (isIndeterminate) {
        state.progress = undefined
      }
    }
  }

  // Query methods
  const isLoading = (key: string): boolean => {
    return loadingStates.get(key)?.isLoading ?? false
  }

  const getLoadingState = (key: string): LoadingState | undefined => {
    return loadingStates.get(key)
  }

  const getLoadingMessage = (key: string): string => {
    return loadingStates.get(key)?.message ?? ''
  }

  const getLoadingProgress = (key: string): number | undefined => {
    return loadingStates.get(key)?.progress
  }

  const getLoadingDuration = (key: string): number => {
    const state = loadingStates.get(key)
    return state ? Date.now() - state.startTime : 0
  }

  const getAllLoadingStates = (): Array<[string, LoadingState]> => {
    return Array.from(loadingStates.entries()).filter(([, state]) => state.isLoading)
  }

  // Utility methods
  const clearAllLoading = () => {
    loadingStates.clear()
    globalLoading.value = false
  }

  const withLoading = async <T>(
    key: string,
    operation: () => Promise<T>,
    options: LoadingOptions = {},
  ): Promise<T> => {
    try {
      startLoading(key, options)
      const result = await operation()
      stopLoading(key)
      return result
    } catch (error) {
      stopLoading(key, error as Error)
      throw error
    }
  }

  const withGlobalLoading = async <T>(
    operation: () => Promise<T>,
    message = 'Loading...',
  ): Promise<T> => {
    try {
      startGlobalLoading(message)
      const result = await operation()
      stopGlobalLoading()
      return result
    } catch (error) {
      stopGlobalLoading()
      throw error
    }
  }

  // Progress tracking utilities
  const createProgressTracker = (key: string, totalSteps: number) => {
    let currentStep = 0

    const nextStep = (message?: string) => {
      currentStep = Math.min(currentStep + 1, totalSteps)
      const progress = (currentStep / totalSteps) * 100

      updateLoadingProgress(key, progress)

      if (message) {
        updateLoadingMessage(key, message)
      }

      return {
        step: currentStep,
        progress,
        isComplete: currentStep >= totalSteps,
      }
    }

    const setStep = (step: number, message?: string) => {
      currentStep = Math.max(0, Math.min(step, totalSteps))
      const progress = (currentStep / totalSteps) * 100

      updateLoadingProgress(key, progress)

      if (message) {
        updateLoadingMessage(key, message)
      }

      return {
        step: currentStep,
        progress,
        isComplete: currentStep >= totalSteps,
      }
    }

    return {
      nextStep,
      setStep,
      getCurrentStep: () => currentStep,
      getTotalSteps: () => totalSteps,
      getProgress: () => (currentStep / totalSteps) * 100,
      isComplete: () => currentStep >= totalSteps,
    }
  }

  // Batch operations
  const startBatchLoading = (keys: string[], message = 'Loading...') => {
    keys.forEach((key) => startLoading(key, { message }))
  }

  const stopBatchLoading = (keys: string[]) => {
    keys.forEach((key) => stopLoading(key))
  }

  const updateBatchMessage = (keys: string[], message: string) => {
    keys.forEach((key) => updateLoadingMessage(key, message))
  }

  return {
    // Global state
    isGlobalLoading,
    globalMessage: computed(() => globalMessage.value),
    hasAnyLoading,

    // Global methods
    startGlobalLoading,
    stopGlobalLoading,
    updateGlobalMessage,

    // Scoped methods
    startLoading,
    stopLoading,
    updateLoadingMessage,
    updateLoadingProgress,
    setLoadingIndeterminate,

    // Query methods
    isLoading,
    getLoadingState,
    getLoadingMessage,
    getLoadingProgress,
    getLoadingDuration,
    getAllLoadingStates,

    // Utility methods
    clearAllLoading,
    withLoading,
    withGlobalLoading,
    createProgressTracker,

    // Batch methods
    startBatchLoading,
    stopBatchLoading,
    updateBatchMessage,
  }
}
