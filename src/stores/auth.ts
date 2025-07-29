import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import type { User, AuthResponse, LoginCredentials, RegisterData } from '@/types/api'
import apiService from '@/lib/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const isInitialized = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!user.value && !!token.value)

  // Actions
  const setAuth = (authData: AuthResponse) => {
    user.value = authData.user
    token.value = authData.token
    apiService.setToken(authData.token)
    localStorage.setItem('auth_token', authData.token)
  }

  const clearAuth = () => {
    user.value = null
    token.value = null
    apiService.clearToken()
    localStorage.removeItem('auth_token')
  }

  const login = async (credentials: LoginCredentials): Promise<void> => {
    isLoading.value = true
    try {
      const response = await apiService.post<AuthResponse>('/login', credentials)
      setAuth(response)
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData: RegisterData): Promise<void> => {
    isLoading.value = true
    try {
      const response = await apiService.post<AuthResponse>('/register', userData)
      setAuth(response)
    } finally {
      isLoading.value = false
    }
  }

  const logout = async (): Promise<void> => {
    isLoading.value = true
    try {
      // Call logout endpoint if authenticated
      if (isAuthenticated.value) {
        await apiService.post('/logout')
      }
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error)
    } finally {
      clearAuth()
      isLoading.value = false
    }
  }

  const refreshUser = async (): Promise<void> => {
    if (!token.value) return

    isLoading.value = true
    try {
      const userResponse = await apiService.get<User>('/user')
      user.value = userResponse
    } catch (error) {
      // If user fetch fails, clear auth
      clearAuth()
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const checkAuth = async (): Promise<void> => {
    if (isInitialized.value) return

    // Load token from storage
    const storedToken = localStorage.getItem('auth_token')
    if (storedToken) {
      token.value = storedToken
      apiService.setToken(storedToken)

      try {
        await refreshUser()
      } catch (error) {
        // Token is invalid, clear it
        clearAuth()
      }
    }

    isInitialized.value = true
  }

  const refreshToken = async (): Promise<void> => {
    if (!token.value) return

    isLoading.value = true
    try {
      const response = await apiService.post<AuthResponse>('/refresh')
      setAuth(response)
    } catch (error) {
      // If refresh fails, clear auth
      clearAuth()
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    user: readonly(user),
    token: readonly(token),
    isLoading: readonly(isLoading),
    isInitialized: readonly(isInitialized),

    // Getters
    isAuthenticated,

    // Actions
    login,
    register,
    logout,
    refreshUser,
    checkAuth,
    refreshToken,
    clearAuth,
  }
})
