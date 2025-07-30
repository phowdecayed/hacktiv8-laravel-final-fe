import type { RouteRecordRaw } from 'vue-router'
import { adminGuard, roleGuard, permissionGuard } from './guards'

/**
 * Admin routes with role-based access control and lazy loading
 */
export const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/admin',
    name: 'admin',
    redirect: '/admin/dashboard',
    component: () => import('@/views/admin/AdminLayout.vue'),
    beforeEnter: adminGuard,
    meta: {
      requiresAuth: true,
      requiresRole: ['admin', 'editor', 'moderator'],
      title: 'Admin Panel',
    },
    children: [
      // Dashboard
      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: () => import('@/views/admin/Dashboard.vue'),
        meta: {
          title: 'Dashboard',
          breadcrumb: 'Dashboard',
        },
      },

      // User Management (Admin only)
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('@/views/admin/UserManager.vue'),
        beforeEnter: roleGuard('admin'),
        meta: {
          title: 'User Management',
          breadcrumb: 'Users',
          requiresRole: ['admin'],
        },
      },

      // Product Management (Admin & Editor)
      {
        path: 'products',
        name: 'admin-products',
        component: () => import('@/views/admin/ProductManager.vue'),
        beforeEnter: roleGuard(['admin', 'editor']),
        meta: {
          title: 'Product Management',
          breadcrumb: 'Products',
          requiresRole: ['admin', 'editor'],
        },
      },

      // Category Management (Admin & Editor)
      {
        path: 'categories',
        name: 'admin-categories',
        component: () => import('@/views/admin/CategoryManager.vue'),
        beforeEnter: roleGuard(['admin', 'editor']),
        meta: {
          title: 'Category Management',
          breadcrumb: 'Categories',
          requiresRole: ['admin', 'editor'],
        },
      },

      // Transaction Management (Admin & Moderator)
      {
        path: 'transactions',
        name: 'admin-transactions',
        component: () => import('@/views/admin/TransactionManager.vue'),
        beforeEnter: roleGuard(['admin', 'moderator']),
        meta: {
          title: 'Transaction Management',
          breadcrumb: 'Transactions',
          requiresRole: ['admin', 'moderator'],
        },
      },

      // Transaction Detail
      {
        path: 'transactions/:id',
        name: 'admin-transaction-detail',
        component: () => import('@/views/admin/TransactionDetail.vue'),
        beforeEnter: roleGuard(['admin', 'moderator']),
        meta: {
          title: 'Transaction Detail',
          breadcrumb: 'Transaction Detail',
          requiresRole: ['admin', 'moderator'],
        },
      },

      // Audit Trail (Admin & Moderator)
      {
        path: 'audit',
        name: 'admin-audit',
        component: () => import('@/views/admin/AuditTrailViewer.vue'),
        beforeEnter: roleGuard(['admin', 'moderator']),
        meta: {
          title: 'Audit Trail',
          breadcrumb: 'Audit Trail',
          requiresRole: ['admin', 'moderator'],
        },
      },

      // Storage Management (Admin & Editor)
      {
        path: 'storage',
        name: 'admin-storage',
        component: () => import('@/views/admin/StorageManager.vue'),
        beforeEnter: roleGuard(['admin', 'editor']),
        meta: {
          title: 'Storage Management',
          breadcrumb: 'Storage',
          requiresRole: ['admin', 'editor'],
        },
      },

      // Analytics & Reports (Admin only)
      {
        path: 'analytics',
        name: 'admin-analytics',
        component: () => import('@/views/admin/Analytics.vue'),
        beforeEnter: roleGuard('admin'),
        meta: {
          title: 'Analytics & Reports',
          breadcrumb: 'Analytics',
          requiresRole: ['admin'],
        },
      },

      // Settings (Admin only)
      {
        path: 'settings',
        name: 'admin-settings',
        component: () => import('@/views/admin/Settings.vue'),
        beforeEnter: roleGuard('admin'),
        meta: {
          title: 'Settings',
          breadcrumb: 'Settings',
          requiresRole: ['admin'],
        },
      },
    ],
  },
]

export interface AdminNavigationItem {
  name: string
  path: string
  icon: string
  roles: string[]
  badge?: string | number
}

/**
 * Get admin navigation items based on user role
 */
export const getAdminNavigation = (userRole: string): AdminNavigationItem[] => {
  const baseNavigation: AdminNavigationItem[] = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: 'LayoutDashboard',
      roles: ['admin', 'editor', 'moderator'],
    },
  ]

  const navigationItems: AdminNavigationItem[] = [
    {
      name: 'Users',
      path: '/admin/users',
      icon: 'Users',
      roles: ['admin'],
    },
    {
      name: 'Products',
      path: '/admin/products',
      icon: 'Package',
      roles: ['admin', 'editor'],
    },
    {
      name: 'Categories',
      path: '/admin/categories',
      icon: 'Tags',
      roles: ['admin', 'editor'],
    },
    {
      name: 'Transactions',
      path: '/admin/transactions',
      icon: 'ShoppingCart',
      roles: ['admin', 'moderator'],
    },
    {
      name: 'Audit Trail',
      path: '/admin/audit',
      icon: 'FileText',
      roles: ['admin', 'moderator'],
    },
    {
      name: 'Storage',
      path: '/admin/storage',
      icon: 'HardDrive',
      roles: ['admin', 'editor'],
    },
    {
      name: 'Analytics',
      path: '/admin/analytics',
      icon: 'BarChart3',
      roles: ['admin'],
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: 'Settings',
      roles: ['admin'],
    },
  ]

  return [...baseNavigation, ...navigationItems.filter((item) => item.roles.includes(userRole))]
}
