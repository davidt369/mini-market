// components/ui/sonner.tsx
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps, toast } from "sonner"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

type ToastVariant = "default" | "success" | "warning" | "error" | "info" | "loading"

interface CustomToastProps {
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
  showCloseButton?: boolean
  showIcon?: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Sonner
        theme={theme as ToasterProps["theme"]}
        className="toaster group"
        {...props}
      />
    )
  }

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      {...props}
    />
  )
}

// Función personalizada con soporte para actions
const customToast = ({
  title,
  description,
  variant = "default",
  duration = 4000,
  showCloseButton = true,
  showIcon = true,
  action,
}: CustomToastProps) => {
  return toast.custom((t) => (
    <div
      className={cn(
        "group relative flex flex-col p-4 pr-8 w-full max-w-sm rounded-lg border shadow-lg transition-all duration-200",
        "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none",
        // Colores para cada variante - Light mode
        {
          // Success - Verde
          "bg-green-50 border-green-200 text-green-900 dark:bg-green-950 dark:border-green-800 dark:text-green-100": variant === "success",

          // Error - Rojo
          "bg-red-50 border-red-200 text-red-900 dark:bg-red-950 dark:border-red-800 dark:text-red-100": variant === "error",

          // Warning - Naranja/Ámbar
          "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-100": variant === "warning",

          // Info - Azul
          "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100": variant === "info",

          // Loading - Gris
          "bg-gray-50 border-gray-200 text-gray-900 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-100": variant === "loading",

          // Default
          "bg-white border-gray-200 text-gray-900 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-100": variant === "default",
        }
      )}
    >
      <div className="flex items-start gap-3">
        {showIcon && (
          <div className="flex-shrink-0 mt-0.5">
            {variant === "success" && <CircleCheckIcon className="size-5 text-green-600 dark:text-green-400" />}
            {variant === "info" && <InfoIcon className="size-5 text-blue-600 dark:text-blue-400" />}
            {variant === "warning" && <TriangleAlertIcon className="size-5 text-amber-600 dark:text-amber-400" />}
            {variant === "error" && <OctagonXIcon className="size-5 text-red-600 dark:text-red-400" />}
            {variant === "loading" && <Loader2Icon className="size-5 text-gray-600 dark:text-gray-400 animate-spin" />}
            {variant === "default" && <InfoIcon className="size-5 text-gray-600 dark:text-gray-400" />}
          </div>
        )}

        <div className="flex-1 space-y-1">
          {title && (
            <div className={cn(
              "text-sm font-semibold leading-none",
              {
                "text-green-900 dark:text-green-100": variant === "success",
                "text-amber-900 dark:text-amber-100": variant === "warning",
                "text-red-900 dark:text-red-100": variant === "error",
                "text-blue-900 dark:text-blue-100": variant === "info",
                "text-gray-900 dark:text-gray-100": variant === "loading" || variant === "default",
              }
            )}>
              {title}
            </div>
          )}
          {description && (
            <div className={cn(
              "text-sm opacity-90",
              {
                "text-green-800 dark:text-green-200": variant === "success",
                "text-amber-800 dark:text-amber-200": variant === "warning",
                "text-red-800 dark:text-red-200": variant === "error",
                "text-blue-800 dark:text-blue-200": variant === "info",
                "text-gray-800 dark:text-gray-200": variant === "loading" || variant === "default",
              }
            )}>
              {description}
            </div>
          )}
        </div>

        {showCloseButton && (
          <button
            onClick={() => toast.dismiss(t)}
            className={cn(
              "absolute right-2 top-2 rounded-md p-1 transition-opacity hover:opacity-70 focus:outline-none focus:ring-2",
              {
                "text-green-600 hover:bg-green-100 focus:ring-green-200 dark:text-green-400 dark:hover:bg-green-900": variant === "success",
                "text-amber-600 hover:bg-amber-100 focus:ring-amber-200 dark:text-amber-400 dark:hover:bg-amber-900": variant === "warning",
                "text-red-600 hover:bg-red-100 focus:ring-red-200 dark:text-red-400 dark:hover:bg-red-900": variant === "error",
                "text-blue-600 hover:bg-blue-100 focus:ring-blue-200 dark:text-blue-400 dark:hover:bg-blue-900": variant === "info",
                "text-gray-600 hover:bg-gray-100 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-800": variant === "loading" || variant === "default",
              }
            )}
          >
            <XIcon className="size-4" />
          </button>
        )}
      </div>

      {action && (
        <div className="flex justify-end mt-3">
          <button
            onClick={() => {
              action.onClick()
              toast.dismiss(t)
            }}
            className={cn(
              "text-xs font-medium px-3 py-1 rounded-md transition-colors hover:opacity-90",
              {
                "bg-green-600 text-white dark:bg-green-500": variant === "success",
                "bg-amber-600 text-white dark:bg-amber-500": variant === "warning",
                "bg-red-600 text-white dark:bg-red-500": variant === "error",
                "bg-blue-600 text-white dark:bg-blue-500": variant === "info",
                "bg-gray-600 text-white dark:bg-gray-500": variant === "loading" || variant === "default",
              }
            )}
          >
            {action.label}
          </button>
        </div>
      )}
    </div>
  ), {
    duration: variant === "loading" ? Infinity : duration,
  })
}

// Funciones específicas con soporte para action
const toastSuccess = (title: string, description?: string, options?: Omit<CustomToastProps, 'title' | 'description' | 'variant'>) =>
  customToast({ title, description, variant: "success", ...options })

const toastError = (title: string, description?: string, options?: Omit<CustomToastProps, 'title' | 'description' | 'variant'>) =>
  customToast({ title, description, variant: "error", ...options })

const toastWarning = (title: string, description?: string, options?: Omit<CustomToastProps, 'title' | 'description' | 'variant'>) =>
  customToast({ title, description, variant: "warning", ...options })

const toastInfo = (title: string, description?: string, options?: Omit<CustomToastProps, 'title' | 'description' | 'variant'>) =>
  customToast({ title, description, variant: "info", ...options })

const toastLoading = (title: string, description?: string, options?: Omit<CustomToastProps, 'title' | 'description' | 'variant'>) =>
  customToast({ title, description, variant: "loading", ...options })

// Exportar tanto el Toaster como las funciones de toast
export {
  Toaster,
  customToast,
  toastSuccess,
  toastError,
  toastWarning,
  toastInfo,
  toastLoading
}