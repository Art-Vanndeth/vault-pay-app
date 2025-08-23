"use client"

import React, {useEffect, useState} from "react"
import { Bell, BellRing, Trash2, Sparkles, Check } from "lucide-react"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { formatRelativeTime } from "@/utils/format"
import { ScrollArea } from "@/components/ui/scroll-area"
import { notificationService } from "@/lib/api-client"
import { WebSocketService } from "@/lib/websocket"
import type { Notification } from "@/types/notification"


export const NotificationBell = React.memo(() => {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isConnected, setIsConnected] = useState(false)
    const [deletePopoverOpen, setDeletePopoverOpen] = useState<string | null>(null)

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

    // Handle delete button click - open confirmation popover
    const handleDeleteClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        setDeletePopoverOpen(id)
    }

    // Confirm delete notification
    const confirmDeleteNotification = async (id: string) => {
        try {
            await notificationService.removeNotification(id)
            setNotifications(notifications =>
                notifications.filter(n => n.id !== id)
            )
        } catch (error) {
            console.error("Failed to delete notification:", error)
        } finally {
            setDeletePopoverOpen(null)
        }
    }

    // Cancel delete
    const cancelDelete = () => {
        setDeletePopoverOpen(null)
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
                    className="relative group hover:bg-pink-50 dark:hover:bg-pink-950/20 transition-all duration-200 rounded-xl h-10 w-10"
                >
                    {unreadCount > 0 ? (
                        <BellRing className="h-5 w-5 text-pink-600 animate-pulse" />
                    ) : (
                        <Bell className="h-5 w-5 text-muted-foreground group-hover:text-pink-600 transition-colors" />
                    )}

                    {unreadCount > 0 && (
                        <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 text-xs font-bold bg-gradient-to-r from-pink-500 to-pink-600 border-2 border-white dark:border-gray-900 shadow-lg animate-bounce">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                    )}

                    {!isConnected && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse shadow-sm border border-white dark:border-gray-900" />
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="w-96 shadow-2xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl p-0 overflow-hidden"
                align="end"
                sideOffset={8}
                forceMount
            >
                {/* Modern header with gradient */}
                <div className="bg-gradient-to-r from-pink-500 to-pink-600 p-4 text-white">
                    <DropdownMenuLabel className="flex items-center justify-between p-0 text-white">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5" />
                            <span className="font-semibold">Notifications</span>
                            {unreadCount > 0 && (
                                <Badge className="bg-white/20 text-white border-white/30 font-medium">{unreadCount} new</Badge>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={markAllNotificationsAsRead}
                                className="text-white hover:bg-white/20 text-xs h-8 px-3 rounded-lg font-medium transition-all duration-200"
                            >
                                Mark all read
                            </Button>
                        )}
                    </DropdownMenuLabel>
                </div>

                {/* Notifications list */}
                {recentNotifications.length > 0 ? (
                    <ScrollArea className="h-80 p-2">
                        <div className="space-y-1">
                            {recentNotifications.map((notification, index) => (
                                <DropdownMenuItem
                                    key={notification.id}
                                    className="p-0 focus:bg-transparent"
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    <div className={`w-full p-4 rounded-xl cursor-pointer transition-all duration-200 group relative overflow-hidden ${
                                        !notification.isRead 
                                            ? "bg-gradient-to-r from-pink-50 to-pink-25 dark:from-pink-950/20 dark:to-pink-900/10 hover:from-pink-100 hover:to-pink-50 border border-pink-200/50 shadow-sm" 
                                            : "hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent"
                                    }`}>
                                        {/* Unread indicator line */}
                                        {!notification.isRead && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-500 to-pink-600 rounded-r-full" />
                                        )}

                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3 flex-1">
                                                {/* Icon */}
                                                <div className={`p-2 rounded-xl shadow-sm transition-all duration-200 ${
                                                    !notification.isRead
                                                        ? "bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-lg"
                                                        : "bg-gray-100 dark:bg-gray-800 text-muted-foreground"
                                                }`}>
                                                    <Bell className="h-4 w-4" />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className={`text-sm font-semibold leading-tight truncate ${
                                                            !notification.isRead ? "text-gray-900 dark:text-white" : "text-muted-foreground"
                                                        }`}>
                                                            {notification.title}
                                                        </h4>
                                                    </div>

                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-xs px-2 py-0.5 bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-full font-medium"
                                                        >
                                                            {notification.type}
                                                        </Badge>
                                                    </div>

                                                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-2">
                                                        {notification.message}
                                                    </p>

                                                    <span className="text-xs text-muted-foreground font-medium bg-gray-50/80 dark:bg-gray-800/50 px-2 py-1 rounded-md inline-block">
                                                        {formatRelativeTime(notification.timestamp)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Action buttons and indicator */}
                                            <div className="flex flex-col items-end gap-1 ml-2">
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                                    {!notification.isRead && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                markAsRead(notification.id)
                                                            }}
                                                            className="h-8 w-8 p-0 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/20 rounded-xl transition-all duration-200"
                                                            title="Mark as read"
                                                        >
                                                            <Check className="h-3.5 w-3.5" />
                                                        </Button>
                                                    )}

                                                    <Popover open={deletePopoverOpen === notification.id} onOpenChange={(open) => {
                                                        if (!open) {
                                                            setDeletePopoverOpen(null)
                                                        }
                                                    }}>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(e) => handleDeleteClick(notification.id, e)}
                                                                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 rounded-xl transition-all duration-200"
                                                                title="Delete notification"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent
                                                            className="w-72 p-4 rounded-2xl shadow-lg border bg-white dark:bg-gray-900"
                                                            side="left"
                                                            align="center"
                                                            sideOffset={8}
                                                            onOpenAutoFocus={(e) => e.preventDefault()}
                                                            onCloseAutoFocus={(e) => e.preventDefault()}
                                                        >
                                                            <div className="space-y-3">
                                                                <div>
                                                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                                                        Delete Notification
                                                                    </h4>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        Are you sure you want to delete this notification? This action cannot be undone.
                                                                    </p>
                                                                </div>
                                                                <div className="flex justify-end gap-2">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={cancelDelete}
                                                                        className="h-8 px-3 text-xs rounded-md"
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                    <Button
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        onClick={() => confirmDeleteNotification(notification.id)}
                                                                        className="h-8 px-3 text-xs rounded-md"
                                                                    >
                                                                        Delete
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>

                                                {!notification.isRead && (
                                                    <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full animate-pulse shadow-sm mr-4" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center">
                            <Bell className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">All caught up!</p>
                        <p className="text-xs text-muted-foreground">No new notifications</p>
                    </div>
                )}

                {/* Footer */}
                {recentNotifications.length > 0 && (
                    <>
                        <DropdownMenuSeparator className="border-gray-200 dark:border-gray-700" />
                        <div className="border-t bg-gray-50/50 dark:bg-gray-800/50 p-3">
                            <Button
                                variant="ghost"
                                onClick={handleViewAllNotifications}
                                className="w-full h-10 text-sm font-medium text-pink-600 hover:text-pink-700 hover:bg-pink-50 dark:hover:bg-pink-950/20 rounded-xl transition-all duration-200"
                            >
                                View all notifications →
                            </Button>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
})

NotificationBell.displayName = "NotificationBell"
