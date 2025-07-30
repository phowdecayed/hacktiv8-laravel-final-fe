import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue-sonner'
import type { UserRole } from '@/types/api'

/**
 * Authentication guard - requires user to be logged in
 */
export const authGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  const authStore = useAuthStore()

  // Wait for auth initialization if not already done
  if (!authStore.isInitialized) {
    await authStore.checkAuth()
  }

  if (!authStore.isAuthenticated) {
    toast.error('Please log in to access this page')
    next({
      name: 'login',
      query: { redirect: to.fullPath },
    })
    return
  }

  next()
}

/**
 * Guest guard - redirects authenticated users away from guest-only pages
 */
export const guestGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  const authStore = useAuthStore()

  // Wait for auth initialization if not already done
  if (!authStore.isInitialized) {
    await authStore.checkAuth()
  }

  if (authStore.isAuthenticated) {
    // Redirect based on user role
    const user = authStore.user
    if (user?.role && ['admin', 'editor', 'moderator'].includes(user.role)) {
      next({ name: 'admin-dashboard' })
    } else {
      next({ name: 'home' })
    }
    return
  }

  next()
}

/**
 * Role-based guard - requires specific role(s)
 */
export const roleGuard = (allowedRoles: UserRole | UserRole[]) => {
  return async (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext,
  ) => {
    const authStore = useAuthStore()

    // Wait for auth initialization if not already done
    if (!authStore.isInitialized) {
      await authStore.checkAuth()
    }

    if (!authStore.isAuthenticated) {
      toast.error('Please log in to access this page')
      next({
        name: 'login',
        query: { redirect: to.fullPath },
      })
      return
    }

    const userRole = authStore.user?.role
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]

    if (!userRole || !roles.includes(userRole)) {
      toast.error('You do not have permission to access this page')
      // Redirect to appropriate page based on user role
      if (userRole === 'customer') {
        next({ name: 'home' })
      } else {
        next({ name: 'admin-dashboard' })
      }
      return
    }

    next()
  }
}

/**
 * Admin guard - requires admin, editor, or moderator role
 */
export const adminGuard = roleGuard(['admin', 'editor', 'moderator'])

/**
 * Super admin guard - requires admin role only
 */
export const superAdminGuard = roleGuard('admin')

/**
 * Permission-based guard - requires specific permission(s)
 */
export const permissionGuard = (requiredPermissions: string | string[]) => {
  return async (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext,
  ) => {
    const authStore = useAuthStore()

    // Wait for auth initialization if not already done
    if (!authStore.isInitialized) {
      await authStore.checkAuth()
    }

    if (!authStore.isAuthenticated) {
      toast.error('Please log in to access this page')
      next({
        name: 'login',
        query: { redirect: to.fullPath },
      })
      return
    }

    const userPermissions = authStore.user?.permissions || []
    const permissions = Array.isArray(requiredPermissions)
      ? requiredPermissions
      : [requiredPermissions]

    const hasPermission = permissions.some((permission) => userPermissions.includes(permission))

    if (!hasPermission) {
      toast.error('You do not have permission to access this page')
      // Redirect to appropriate page based on user role
      const userRole = authStore.user?.role
      if (userRole === 'customer') {
        next({ name: 'home' })
      } else {
        next({ name: 'admin-dashboard' })
      }
      return
    }

    next()
  }
}
