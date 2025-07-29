// Simple test to verify auth store functionality
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

// Set up Pinia for testing
setActivePinia(createPinia())

const authStore = useAuthStore()

console.log('Auth Store Test:')
console.log('Initial state:')
console.log('- isAuthenticated:', authStore.isAuthenticated)
console.log('- user:', authStore.user)
console.log('- token:', authStore.token)
console.log('- isLoading:', authStore.isLoading)
console.log('- isInitialized:', authStore.isInitialized)

// Test checkAuth method
console.log('\nTesting checkAuth...')
authStore
  .checkAuth()
  .then(() => {
    console.log('After checkAuth:')
    console.log('- isInitialized:', authStore.isInitialized)
    console.log('- isAuthenticated:', authStore.isAuthenticated)
  })
  .catch(console.error)

export default authStore
