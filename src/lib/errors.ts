import type { ApiError } from '@/types/api'

export interface ApiException extends ApiError {
  status: number
  statusText: string
}

export class ApiErrorHandler {
  static handle(error: ApiException): string {
    switch (error.status) {
      case 400:
        return error.message || 'Bad request. Please check your input.'
      case 401:
        return 'You are not authenticated. Please log in.'
      case 403:
        return 'You do not have permission to perform this action.'
      case 404:
        return 'The requested resource was not found.'
      case 422:
        return error.message || 'Validation failed. Please check your input.'
      case 429:
        return 'Too many requests. Please try again later.'
      case 500:
        return 'Server error. Please try again later.'
      case 503:
        return 'Service temporarily unavailable. Please try again later.'
      default:
        return error.message || 'An unexpected error occurred.'
    }
  }

  static getValidationErrors(error: ApiException): Record<string, string[]> | null {
    if (error.status === 422 && error.errors) {
      return error.errors
    }
    return null
  }

  static isNetworkError(error: any): boolean {
    return error instanceof TypeError && error.message.includes('fetch')
  }

  static isAuthError(error: ApiException): boolean {
    return error.status === 401 || error.status === 403
  }
}

export default ApiErrorHandler
