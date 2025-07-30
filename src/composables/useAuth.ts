import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useNotifications } from '@/composables/useNotifications'
import { toast } from 'vue-sonner'
import { computed } from 'vue'
import type { LoginCredentials, RegisterData, UserRole } from '@/types/api'
import apiService from '@/lib/api'

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
        await apiService.getCsrfCookie() // Fetch CSRF cookie
        await authStore.checkAuth()
      },
      {
        silent: true, // Silent fail for auth check
        showToast: false,
      },
    )
  }

  // Role-based access control
  const hasRole = (role: UserRole): boolean => {
    return authStore.user?.role === role
  }

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.some((role) => hasRole(role))
  }

  const hasPermission = (permission: string): boolean => {
    return authStore.user?.permissions?.includes(permission) ?? false
  }

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some((permission) => hasPermission(permission))
  }

  const isAdmin = computed(() => hasRole('admin'))
  const isEditor = computed(() => hasRole('editor'))
  const isModerator = computed(() => hasRole('moderator'))
  const isCustomer = computed(() => hasRole('customer'))

  const isBackendUser = computed(() => hasAnyRole(['admin', 'editor', 'moderator']))

  const canManageUsers = computed(() => hasRole('admin'))

  const canManageProducts = computed(() => hasAnyRole(['admin', 'editor']))

  const canManageCategories = computed(() => hasAnyRole(['admin', 'editor']))

  const canManageTransactions = computed(() => hasAnyRole(['admin', 'moderator']))

  const canViewAuditTrail = computed(() => hasAnyRole(['admin', 'moderator']))

  const canManageStorage = computed(() => hasAnyRole(['admin', 'editor']))

  const requireAuth = () => {
    if (!authStore.isAuthenticated) {
      router.push('/login')
      return false
    }
    return true
  }

  const requireRole = (role: UserRole) => {
    if (!requireAuth()) return false

    if (!hasRole(role)) {
      toast.error('You do not have permission to access this page')
      router.push('/')
      return false
    }
    return true
  }

  const requireAnyRole = (roles: UserRole[]) => {
    if (!requireAuth()) return false

    if (!hasAnyRole(roles)) {
      toast.error('You do not have permission to access this page')
      router.push('/')
      return false
    }
    return true
  }

  const requireBackendAccess = () => {
    return requireAnyRole(['admin', 'editor', 'moderator'])
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

    // Role-based access control
    hasRole,
    hasAnyRole,
    hasPermission,
    hasAnyPermission,
    isAdmin,
    isEditor,
    isModerator,
    isCustomer,
    isBackendUser,
    canManageUsers,
    canManageProducts,
    canManageCategories,
    canManageTransactions,
    canViewAuditTrail,
    canManageStorage,
    requireAuth,
    requireRole,
    requireAnyRole,
    requireBackendAccess,

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
