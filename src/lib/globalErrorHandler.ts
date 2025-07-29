import type { Router } from 'vue-router'
import { toast } from 'vue-sonner'
import ApiErrorHandler, { type ApiException } from '@/lib/errors'

export interface GlobalErrorHandlerOptions {
  enableConsoleLogging?: boolean
  enableErrorReporting?: boolean
  errorReportingEndpoint?: string
  showToastNotifications?: boolean
  redirectOnAuthError?: boolean
}

class GlobalErrorHandler {
  private router: Router | null = null
  private options: Required<GlobalErrorHandlerOptions>

  constructor(options: GlobalErrorHandlerOptions = {}) {
    this.options = {
      enableConsoleLogging: true,
      enableErrorReporting: false,
      errorReportingEndpoint: '',
      showToastNotifications: true,
      redirectOnAuthError: true,
      ...options,
    }
  }

  install(app: App, router: Router) {
    this.router = router

    // Handle Vue errors
    app.config.errorHandler = (error: unknown, instance, info) => {
      this.handleVueError(error as Error, instance, info)
    }

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleUnhandledRejection(event)
    })

    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleGlobalError(event)
    })

    // Provide global error handler to app
    app.provide('globalErrorHandler', this)
  }

  private handleVueError(error: Error, instance: any, info: string) {
    if (this.options.enableConsoleLogging) {
      console.error('Vue Error:', error)
      console.error('Component:', instance)
      console.error('Info:', info)
    }

    this.processError(error, {
      context: 'vue',
      component: instance?.$options?.name || 'Unknown',
      info,
    })
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent) {
    if (this.options.enableConsoleLogging) {
      console.error('Unhandled Promise Rejection:', event.reason)
    }

    // Prevent default browser behavior
    event.preventDefault()

    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason))

    this.processError(error, {
      context: 'promise',
      type: 'unhandled_rejection',
    })
  }

  private handleGlobalError(event: ErrorEvent) {
    if (this.options.enableConsoleLogging) {
      console.error('Global Error:', event.error)
    }

    this.processError(event.error || new Error(event.message), {
      context: 'global',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
  }

  private async processError(error: Error | ApiException, metadata: Record<string, any> = {}) {
    // Classify error type
    const errorType = this.classifyError(error)

    // Handle different error types
    switch (errorType) {
      case 'auth':
        await this.handleAuthError(error as ApiException)
        break
      case 'network':
        this.handleNetworkError(error)
        break
      case 'validation':
        this.handleValidationError(error as ApiException)
        break
      case 'api':
        this.handleApiError(error as ApiException)
        break
      default:
        this.handleGenericError(error)
    }

    // Report error if enabled
    if (this.options.enableErrorReporting) {
      await this.reportError(error, { ...metadata, errorType })
    }
  }

  private classifyError(error: Error | ApiException): string {
    if (ApiErrorHandler.isNetworkError(error)) {
      return 'network'
    }

    if ('status' in error) {
      if (ApiErrorHandler.isAuthError(error)) {
        return 'auth'
      }
      if (error.status === 422) {
        return 'validation'
      }
      return 'api'
    }

    return 'generic'
  }

  private async handleAuthError(error: ApiException) {
    const message = ApiErrorHandler.handle(error)

    if (this.options.showToastNotifications) {
      toast.error(message)
    }

    if (this.options.redirectOnAuthError && this.router) {
      // Clear any stored auth tokens
      localStorage.removeItem('auth_token')

      // Redirect to login page
      await this.router.push('/login')
    }
  }

  private handleNetworkError(error: Error) {
    const message = 'Network error. Please check your connection and try again.'

    if (this.options.showToastNotifications) {
      toast.error(message, {
        duration: 5000,
        action: {
          label: 'Retry',
          onClick: () => {
            // Trigger a page reload as a simple retry mechanism
            window.location.reload()
          },
        },
      })
    }
  }

  private handleValidationError(error: ApiException) {
    const message = ApiErrorHandler.handle(error)

    if (this.options.showToastNotifications) {
      toast.error(message)
    }
  }

  private handleApiError(error: ApiException) {
    const message = ApiErrorHandler.handle(error)

    if (this.options.showToastNotifications) {
      toast.error(message)
    }
  }

  private handleGenericError(error: Error) {
    const message = error.message || 'An unexpected error occurred'

    if (this.options.showToastNotifications) {
      toast.error(message)
    }
  }

  private async reportError(error: Error | ApiException, metadata: Record<string, any>) {
    if (!this.options.errorReportingEndpoint) {
      return
    }

    try {
      const errorReport = {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        metadata,
      }

      await fetch(this.options.errorReportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorReport),
      })
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError)
    }
  }

  // Public methods for manual error handling
  public handleError(
    error: Error | ApiException,
    options?: { showToast?: boolean; redirect?: string },
  ) {
    const { showToast = true, redirect } = options || {}

    if (!showToast) {
      const originalShowToast = this.options.showToastNotifications
      this.options.showToastNotifications = false
      this.processError(error)
      this.options.showToastNotifications = originalShowToast
    } else {
      this.processError(error)
    }

    if (redirect && this.router) {
      this.router.push(redirect)
    }
  }

  public reportManualError(error: Error | ApiException, metadata?: Record<string, any>) {
    if (this.options.enableErrorReporting) {
      this.reportError(error, metadata || {})
    }
  }
}

// Create singleton instance
const globalErrorHandler = new GlobalErrorHandler()

export default globalErrorHandler
export { GlobalErrorHandler }
