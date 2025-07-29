import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import globalErrorHandler from '@/lib/globalErrorHandler'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Install global error handler
globalErrorHandler.install(app, router)

// Initialize authentication and cart on app startup
const initializeApp = async () => {
  try {
    const authStore = useAuthStore()
    const cartStore = useCartStore()

    await authStore.checkAuth()
    await cartStore.initializeCart()

    app.mount('#app')
  } catch (error) {
    console.error('Failed to initialize app:', error)

    // Handle initialization errors gracefully
    globalErrorHandler.handleError(error as Error, {
      showToast: true,
    })

    // Still mount the app even if initialization fails
    app.mount('#app')
  }
}

initializeApp()
