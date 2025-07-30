import axios from 'axios'
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import { config } from '@/lib/config'
import type { ApiError, StockValidationResponse } from '@/types/api'

export class ApiService {
  private axiosInstance: AxiosInstance
  private token: string | null = null

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      withCredentials: true, // Send cookies with requests
      withXSRFToken: true, // Include XSRF-TOKEN header
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })

    this.loadToken()
    this.setupInterceptors()
  }

  private loadToken(): void {
    this.token = localStorage.getItem('auth_token')
    if (this.token) {
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
    }
  }

  setToken(token: string): void {
    this.token = token
    localStorage.setItem('auth_token', token)
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
  }

  clearToken(): void {
    this.token = null
    localStorage.removeItem('auth_token')
    delete this.axiosInstance.defaults.headers.common['Authorization']
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          const errorData = error.response.data as ApiError
          const apiError: ApiError = {
            message: errorData.message || 'An unexpected error occurred',
            errors: errorData.errors,
          }
          throw {
            ...apiError,
            status: error.response.status,
            statusText: error.response.statusText,
          }
        } else if (error.request) {
          throw {
            message: 'No response received from server',
            status: 0,
            statusText: 'Network Error',
          }
        } else {
          throw {
            message: error.message,
            status: 0,
            statusText: 'Client Error',
          }
        }
      },
    )
  }

  // Fetch CSRF cookie
  async getCsrfCookie(): Promise<void> {
    await this.axiosInstance.get('/sanctum/csrf-cookie')
  }

  async get<T>(endpoint: string, params?: Record<string, any>, options?: any): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.get(endpoint, {
      params,
      ...options,
    })
    console.log(`API GET ${endpoint}:`, response.data)
    return response.data
  }

  async post<T>(endpoint: string, data?: any, options?: any): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.post(endpoint, data, options)
    return response.data
  }

  async put<T>(endpoint: string, data?: any, options?: any): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.put(endpoint, data, options)
    return response.data
  }

  async patch<T>(endpoint: string, data?: any, options?: any): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.patch(endpoint, data, options)
    return response.data
  }

  async delete<T>(endpoint: string, options?: any): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.delete(endpoint, options)
    return response.data
  }

  async validateStock(): Promise<StockValidationResponse> {
    return this.get('/cart/validate-stock')
  }
}

// Create and export a singleton instance
const apiService = new ApiService(config.api.baseUrl)

export default apiService
