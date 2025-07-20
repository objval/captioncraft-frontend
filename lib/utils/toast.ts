import { toast as sonnerToast } from 'sonner'

// Type definitions
type ToastOptions = {
  id?: string | number
  icon?: React.ReactNode
  style?: React.CSSProperties
  className?: string
  duration?: number
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center'
}

type ToastMessage = string | React.ReactNode

// Wrapper to maintain compatibility with react-hot-toast API
export const toast = Object.assign(
  (message: ToastMessage, options?: ToastOptions) => {
    return sonnerToast(message, options)
  },
  {
    success: (message: ToastMessage, options?: ToastOptions) => {
      return sonnerToast.success(message, options)
    },
    error: (message: ToastMessage, options?: ToastOptions) => {
      return sonnerToast.error(message, options)
    },
    loading: (message: ToastMessage, options?: ToastOptions) => {
      return sonnerToast.loading(message, options)
    },
    warning: (message: ToastMessage, options?: ToastOptions) => {
      return sonnerToast.warning(message, options)
    },
    info: (message: ToastMessage, options?: ToastOptions) => {
      return sonnerToast.info(message, options)
    },
    promise: <T,>(
      promise: Promise<T>,
      messages: {
        loading: ToastMessage
        success: ToastMessage | ((data: T) => ToastMessage)
        error: ToastMessage | ((error: any) => ToastMessage)
      }
    ) => {
      return sonnerToast.promise(promise, messages)
    },
    custom: (message: React.ReactNode, options?: ToastOptions) => {
      return sonnerToast(message, options)
    },
    dismiss: (toastId?: string | number) => {
      return sonnerToast.dismiss(toastId)
    },
  }
)

export default toast