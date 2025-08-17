"use client"

import React, {useEffect, useState} from "react"
import { Bell } from "lucide-react"
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

    // Count unread notifications
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

    // Mark all notifications as read
    const markAllAsRead = async () => {
        try {
            await notificationService.markAllNotificationsAsRead()
            setNotifications(notifications =>
                notifications.map(n => ({ ...n, isRead: true }))
            )
        } catch (error) {
            console.error("Failed to mark all notifications as read:", error)
        }
    }

    useEffect(() => {
        const wsService = new WebSocketService()

        // Set up WebSocket event handlers
        wsService.onNotification((notification: Notification) => {
            setNotifications(prev => [notification, ...prev])
        })

        // Handle connection status
        wsService.onConnect(() => {
            console.log('Connected to WebSocket')
            setIsConnected(true)
        })

        wsService.onDisconnect(() => {
            console.log('Disconnected from WebSocket')
            setIsConnected(false)
        })

        // Connect to WebSocket
        wsService.connect()

        // Fetch initial notifications
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
                <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </Badge>
                    )}
                    {!isConnected && (
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-80" align="end" forceMount>
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-6">
                            Mark all read
                        </Button>
                    )}
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {recentNotifications.length > 0 ? (
                    <ScrollArea className="h-80">
                        {recentNotifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className="flex flex-col items-start p-3 cursor-pointer"
                                onClick={() => !notification.isRead && markAsRead(notification.id)}
                            >
                                <div className="flex items-start justify-between w-full">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`font-medium text-sm ${!notification.isRead ? "text-foreground" : "text-muted-foreground"}`}
                                            >
                                                {notification.title}
                                            </span>
                                            {!notification.isRead && <div className="w-2 h-2 bg-primary rounded-full" />}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{formatRelativeTime(notification.timestamp)}</p>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </ScrollArea>
                ) : (
                    <div className="p-4 text-center text-muted-foreground">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No notifications</p>
                    </div>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem className="text-center justify-center">
                    <a href="/admin/notifications" className="text-sm text-primary">
                        View all notifications
                    </a>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
})

NotificationBell.displayName = "NotificationBell"
