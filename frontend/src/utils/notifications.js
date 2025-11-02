import { toast } from "@/components/ui/sonner"

export function showNotification(type, message, opts = {}) {
  const duration = opts.duration ?? 4000
  const description = opts.description
  const action = opts.action
  const base = {
    duration,
    description,
    action,
    className: opts.className ?? 'text-base',
    style: { fontSize: '1rem', ...(opts.style || {}) },
  }

  switch (type) {
    case 'success':
      return toast.success(message, base)
    case 'info':
      return toast.message(message, base)
    case 'warning':
      return toast.warning(message, base)
    case 'error':
      return toast.error(message, base)
    default:
      return toast(message, base)
  }
}
