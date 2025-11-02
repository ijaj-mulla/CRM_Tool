import { useEffect } from "react"
import { getSocket } from "@/utils/socket"
import { showNotification } from "@/utils/notifications"

export default function AutomationNotifications() {
  useEffect(() => {
    const socket = getSocket()
    const onConnect = () => console.log('[socket] connected', socket.id)
    const onDisconnect = (r) => console.log('[socket] disconnected', r)
    const onError = (e) => console.warn('[socket] error', e?.message || e)
    const handler = (payload) => {
      const { type = 'info', message = 'Automation event', meta } = payload || {}
      showNotification(type, message, { description: meta ? undefined : undefined })
    }
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('connect_error', onError)
    socket.on('automation:notification', handler)
    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('connect_error', onError)
      socket.off('automation:notification', handler)
    }
  }, [])
  return null
}
