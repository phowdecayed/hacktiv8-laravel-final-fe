import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authGuard, guestGuard } from './guards'
import { adminRoutes } from './admin'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      beforeEnter: guestGuard,
      meta: {
        requiresGuest: true,
        title: 'Login',
      },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      beforeEnter: guestGuard,
      meta: {
        requiresGuest: true,
        title: 'Register',
      },
    },
    // Protected customer routes
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      beforeEnter: authGuard,
      meta: {
        requiresAuth: true,
        title: 'Profile',
      },
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('../views/CartView.vue'),
      beforeEnter: authGuard,
      meta: {
        requiresAuth: true,
        title: 'Shopping Cart',
      },
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('../views/OrdersView.vue'),
      beforeEnter: authGuard,
      meta: {
        requiresAuth: true,
        title: 'My Orders',
      },
    },
    {
      path: '/orders/:id',
      name: 'order-detail',
      component: () => import('../views/OrderDetailView.vue'),
      beforeEnter: authGuard,
      meta: {
        requiresAuth: true,
        title: 'Order Detail',
      },
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('../views/CheckoutView.vue'),
      beforeEnter: authGuard,
      meta: {
        requiresAuth: true,
        title: 'Checkout',
      },
    },
    // Public routes
    {
      path: '/products',
      name: 'products',
      component: () => import('../views/ProductsView.vue'),
      meta: {
        title: 'Products',
      },
    },
    {
      path: '/products/:id',
      name: 'product-detail',
      component: () => import('../views/ProductDetailView.vue'),
      meta: {
        title: 'Product Detail',
      },
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../views/ContactView.vue'),
      meta: {
        title: 'Contact Us',
      },
    },
    // Admin routes
    ...adminRoutes,
    // 404 catch-all route
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
      meta: {
        title: 'Page Not Found',
      },
    },
  ],
})

// Global route guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Wait for auth initialization if not already done
  if (!authStore.isInitialized) {
    await authStore.checkAuth()
  }

  // Set document title
  if (to.meta.title) {
    document.title = `${to.meta.title} - Admin Panel`
  }

  next()
})

// After each route change
router.afterEach((to, from) => {
  // You can add analytics tracking here
  // Example: gtag('config', 'GA_MEASUREMENT_ID', { page_path: to.path })
})

export default router
