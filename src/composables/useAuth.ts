import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useNotifications } from '@/composables/useNotifications'
import { toast } from 'vue-sonner'
import type { LoginCredentials, RegisterData } from '@/types/api'

export const useAuth = () => {
  const authStore = useAuthStore()
  const router = useRouter()
  const errorHandler = useErrorHandler()
  // Inisialisasi toast dari useNotifications
  // const { toast } = useNotifications() // Ini tidak diperlukan jika toast diimpor langsung dari vue-sonner

  const login = async (credentials: LoginCredentials, redirectTo?: string) => {
    return await errorHandler.withErrorHandling(
      async () => {
        await authStore.login(credentials)
        toast.success('Successfully logged in!')

        // Redirect to intended page or home
        const redirect = redirectTo || (router.currentRoute.value.query.redirect as string) || '/'
        await router.push(redirect)
      },
      {
        customMessage: 'Login failed. Please check your credentials.',
        retryFn: () => authStore.login(credentials),
      },
    )
  }

  const register = async (userData: RegisterData, redirectTo?: string) => {
    return await errorHandler.withErrorHandling(
      async () => {
        await authStore.register(userData)
        toast.success('Account created successfully!')

        // Redirect to intended page or home
        const redirect = redirectTo || '/'
        await router.push(redirect)
      },
      {
        customMessage: 'Registration failed. Please try again.',
        retryFn: () => authStore.register(userData),
      },
    )
  }

  const logout = async (redirectTo?: string) => {
    return await errorHandler.withErrorHandling(
      async () => {
        await authStore.logout()
        toast.success('Successfully logged out!')

        // Redirect to login or home
        const redirect = redirectTo || '/'
        await router.push(redirect)
      },
      {
        customMessage: 'Logout completed',
        silent: false,
      },
    )
  }

  const refreshUser = async () => {
    return await errorHandler.withErrorHandling(
      async () => {
        await authStore.refreshUser()
      },
      {
        customMessage: 'Failed to refresh user data',
        retryFn: () => authStore.refreshUser(),
      },
    )
  }

  const refreshToken = async () => {
    return await errorHandler.withErrorHandling(
      async () => {
        await authStore.refreshToken()
      },
      {
        customMessage: 'Session expired. Please log in again.',
        redirect: '/login',
      },
    )
  }

  const checkAuth = async () => {
    return await errorHandler.withErrorHandling(
      async () => {
        await authStore.checkAuth()
      },
      {
        silent: true, // Silent fail for auth check
        showToast: false,
      },
    )
  }

  return {
    // Store state (reactive)
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    isLoading: authStore.isLoading,
    isInitialized: authStore.isInitialized,

    // Actions
    login,
    register,
    logout,
    refreshUser,
    refreshToken,
    checkAuth,

    // Error handling
    hasError: errorHandler.hasError,
    error: errorHandler.error,
    errorType: errorHandler.errorType,
    canRetry: errorHandler.canRetry,
    isRetrying: errorHandler.isRetrying,
    retry: errorHandler.retry,
    clearError: errorHandler.clearError,
    getValidationErrors: errorHandler.getValidationErrors,
    hasFieldError: errorHandler.hasFieldError,
    getFieldError: errorHandler.getFieldError,
  }
}
