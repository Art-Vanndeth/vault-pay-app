// "use client"
//
// import { useEffect, useState, useCallback, useRef } from "react"
// import { WebSocketService } from "@/lib/websocket-service"
// import type { Notification } from "@/types/notification"
// import toast from "react-hot-toast"
//
// type UseNotificationsWSReturn = {
//   notifications: Notification[]
//   unreadCount: number
//   connectionStatus: string
//   isConnected: boolean
//   markAsRead: (id: string) => void
//   markAllAsRead: () => void
//   deleteNotification: (id: string) => void
// }
//
// export function useNotificationsWS(initialNotifications: Notification[] = []): UseNotificationsWSReturn {
//   const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
//   const [connectionStatus, setConnectionStatus] = useState<string>("disconnected")
//   const wsServiceRef = useRef<WebSocketService | null>(null)
//
//   useEffect(() => {
//     const wsService = WebSocketService.getInstance()
//     wsServiceRef.current = wsService
//
//     const loadNotifications = async () => {
//       try {
//         const data = await wsService.fetchInitialNotifications()
//         const transformedNotifications = data.map((item: any) => ({
//           id: item.id,
//           title: item.type?.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase()) || "Notification",
//           message: item.message,
//           type: item.status === "INITIATED" ? "info" : "success",
//           isRead: item.isRead,
//           timestamp: new Date(item.timestamp).toISOString(),
//         }))
//         setNotifications(transformedNotifications)
//       } catch (error) {
//         console.warn("[v0] Failed to load notifications from API, using demo mode")
//       }
//     }
//
//     // Set up WebSocket listeners
//     const unsubscribeNotification = wsService.onNotification((notification) => {
//       const newNotification: Notification = {
//         id: notification.id || `ws_${Date.now()}`,
//         title:
//           notification.type?.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase()) || "New Notification",
//         message: notification.message,
//         type: notification.status === "INITIATED" ? "info" : "success",
//         isRead: false,
//         timestamp: new Date(notification.timestamp || Date.now()).toISOString(),
//       }
//
//       setNotifications((prev) => [newNotification, ...prev])
//
//       // Show toast notification
//       const toastConfig = {
//         info: { icon: "ℹ️", style: { background: "#3b82f6", color: "white" } },
//         success: { icon: "✅", style: { background: "#10b981", color: "white" } },
//         warning: { icon: "⚠️", style: { background: "#f59e0b", color: "white" } },
//         error: { icon: "❌", style: { background: "#ef4444", color: "white" } },
//       }
//
//       const config = toastConfig[newNotification.type]
//       toast(newNotification.title, {
//         ...config,
//         duration: 5000,
//       })
//     })
//
//     const unsubscribeStatus = wsService.onStatusChange((status) => {
//       setConnectionStatus(status)
//     })
//
//     // Connect and load data
//     wsService.connect()
//     loadNotifications()
//
//     return () => {
//       unsubscribeNotification()
//       unsubscribeStatus()
//     }
//   }, [])
//
//   const markAsRead = useCallback(async (id: string) => {
//     try {
//       setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif)))
//     } catch (error) {
//       console.error("Error marking notification as read:", error)
//       setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, isRead: false } : notif)))
//     }
//   }, [])
//
//   const markAllAsRead = useCallback(async () => {
//     try {
//       setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })))
//     } catch (error) {
//       console.error("Error marking all notifications as read:", error)
//     }
//   }, [])
//
//   const deleteNotification = useCallback(async (id: string) => {
//     const confirmed = window.confirm("Are you sure you want to delete this notification? This action cannot be undone.")
//     if (!confirmed) return
//
//     try {
//       setNotifications((prev) => prev.filter((notif) => notif.id !== id))
//       toast.success("Notification deleted successfully")
//     } catch (error) {
//       console.error("Error deleting notification:", error)
//       toast.error("Failed to delete notification")
//     }
//   }, [])
//
//   const unreadCount = notifications.filter((n) => !n.isRead).length
//   const isConnected = connectionStatus === "connected"
//
//   return {
//     notifications,
//     unreadCount,
//     connectionStatus,
//     isConnected,
//     markAsRead,
//     markAllAsRead,
//     deleteNotification,
//   }
// }
