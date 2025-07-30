import { toast } from 'vue-sonner'

export const useNotifications = () => {
  const success = (message: string, options?: any) => {
    toast.success(message, options)
  }

  const error = (message: string, options?: any) => {
    toast.error(message, options)
  }

  const info = (message: string, options?: any) => {
    toast.info(message, options)
  }

  const warning = (message: string, options?: any) => {
    toast.warning(message, options)
  }

  const loading = (message: string, options?: any) => {
    return toast.loading(message, options)
  }

  const dismiss = (toastId?: string | number) => {
    toast.dismiss(toastId)
  }

  return {
    success,
    error,
    info,
    warning,
    loading,
    dismiss,
    // Aliases for consistency
    showSuccess: success,
    showError: error,
    showInfo: info,
    showWarning: warning,
  }
}
