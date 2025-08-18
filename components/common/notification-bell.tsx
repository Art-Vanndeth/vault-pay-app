"use client"

import React, {useEffect, useState} from "react"
import { Bell, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatRelativeTime } from "@/utils/format"
import { ScrollArea } from "@/components/ui/scroll-area"
import { notificationService } from "@/lib/api-client"
import { WebSocketService } from "@/lib/websocket"
import type { Notification } from "@/types/notification"


export const NotificationBell = React.memo(() => {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isConnected, setIsConnected] = useState(false)

    // Simple unread count - decreases only when notifications are actually marked as read
    const unreadCount = notifications.filter(n => !n.isRead).length

    // Mark a single notification as read
    const markAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id, true)
            setNotifications(notifications =>
                notifications.map(n =>
                    n.id === id ? { ...n, isRead: true } : n
                )
            )
        } catch (error) {
            console.error("Failed to mark notification as read:", error)
        }
    }

    // Delete a single notification
    const deleteNotification = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        try {
            await notificationService.removeNotification(id)
            setNotifications(notifications =>
                notifications.filter(n => n.id !== id)
            )
        } catch (error) {
            console.error("Failed to delete notification:", error)
        }
    }

    // Mark all notifications as read
    const markAllNotificationsAsRead = async () => {
        try {
            await notificationService.markAllNotificationsAsRead()
            setNotifications(notifications =>
                notifications.map(n => ({ ...n, isRead: true }))
            )
        } catch (error) {
            console.error("Failed to mark all notifications as read:", error)
        }
    }

    // Handle "View all notifications" click
    const handleViewAllNotifications = () => {
        window.location.href = "/admin/notifications"
    }

    useEffect(() => {
        const wsService = new WebSocketService()

        wsService.onNotification((notification: Notification) => {
            setNotifications(prev => [notification, ...prev])
        })

        wsService.onConnect(() => {
            console.log('Connected to WebSocket')
            setIsConnected(true)
        })

        wsService.onDisconnect(() => {
            console.log('Disconnected from WebSocket')
            setIsConnected(false)
        })

        wsService.connect()

        wsService.fetchInitialNotifications("desc").then((initialNotifications: Notification[]) => {
            setNotifications(initialNotifications)
        }).catch((error) => {
            console.error("Failed to fetch initial notifications:", error)
        })

        return () => {
            wsService.disconnect()
        }
    }, [])

    const recentNotifications = React.useMemo(() => notifications.slice(0, 5), [notifications])

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="relative h-10 w-10 rounded-full hover:bg-gray-100 transition-colors duration-200"
                >
                    <Bell className="h-5 w-5 text-slate-600" />
                    {unreadCount > 0 && (
                        <Badge
                            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-semibold bg-pink-500 hover:bg-pink-500 text-white border-2 border-white shadow-lg animate-pulse"
                        >
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </Badge>
                    )}
                    {!isConnected && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white animate-pulse" />
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl p-0 overflow-hidden"
                align="end"
                sideOffset={8}
                forceMount
            >
                {/* Modern header with accent */}
                <div className="relative">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-pink-500 to-rose-500" />
                    <DropdownMenuLabel className="px-6 py-5 bg-white border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                                    <Bell className="h-4 w-4 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                            </div>
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={markAllNotificationsAsRead}
                                    className="h-8 px-3 text-xs font-medium text-pink-600 hover:text-pink-700 hover:bg-pink-50 rounded-lg transition-all duration-200"
                                >
                                    Mark all read ({unreadCount})
                                </Button>
                            )}
                        </div>
                    </DropdownMenuLabel>
                </div>

                {/* Notifications list */}
                {recentNotifications.length > 0 ? (
                    <ScrollArea className="max-h-96">
                        <div className="p-2 space-y-1">
                            {recentNotifications.map((notification) => (
                                <DropdownMenuItem
                                    key={notification.id}
                                    className="p-0 focus:bg-transparent"
                                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                                >
                                    <div className={`w-full p-4 rounded-xl cursor-pointer transition-all duration-200 group relative overflow-hidden ${
                                        !notification.isRead 
                                            ? "bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 border border-pink-200" 
                                            : "bg-gray-50 hover:bg-gray-100"
                                    }`}>
                                        {/* Unread indicator line */}
                                        {!notification.isRead && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-500 to-rose-500 rounded-r-full" />
                                        )}

                                        <div className="flex items-start space-x-3">
                                            {/* Status dot */}
                                            <div className="flex-shrink-0 mt-1.5">
                                                <div className={`w-2.5 h-2.5 rounded-full ${
                                                    !notification.isRead 
                                                        ? "bg-pink-500 shadow-lg shadow-pink-500/50" 
                                                        : "bg-gray-300"
                                                }`} />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className={`text-sm font-semibold leading-tight mb-1 ${
                                                            !notification.isRead ? "text-gray-900" : "text-gray-600"
                                                        }`}>
                                                            {notification.title}
                                                        </h4>
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <Badge
                                                                variant="secondary"
                                                                className="text-xs px-2 py-0.5 bg-white/80 text-gray-600 border border-gray-200 rounded-full font-medium"
                                                            >
                                                                {notification.type}
                                                            </Badge>
                                                            <span className="text-xs text-gray-500 font-medium">
                                                                {formatRelativeTime(notification.timestamp)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Delete button */}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => deleteNotification(notification.id, e)}
                                                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 text-gray-400 hover:text-pink-500 hover:bg-pink-100 rounded-lg ml-2"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                                                    {notification.message}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="p-12 text-center">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                            <Bell className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-2">All caught up!</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">No new notifications to show</p>
                    </div>
                )}

                {/* Footer */}
                {recentNotifications.length > 0 && (
                    <>
                        <DropdownMenuSeparator className="border-gray-200" />
                        <div className="p-3">
                            <Button
                                variant="ghost"
                                onClick={handleViewAllNotifications}
                                className="w-full h-10 text-sm font-medium text-gray-700 hover:text-pink-600 hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 rounded-xl transition-all duration-200"
                            >
                                View all notifications
                            </Button>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
})

NotificationBell.displayName = "NotificationBell"
