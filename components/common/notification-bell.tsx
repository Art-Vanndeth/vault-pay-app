"use client"

import React from "react"
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
import { useNotificationsWS } from "@/hooks/use-notifications-ws"
import { formatRelativeTime } from "@/utils/format"
import { ScrollArea } from "@/components/ui/scroll-area"

// Mock initial data - would come from API
const mockInitialNotifications = [
  {
    id: "notif_001",
    title: "New Transaction Alert",
    message: "Large transaction of $5,000 detected",
    type: "warning" as const,
    isRead: false,
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: "notif_002",
    title: "Account Frozen",
    message: "Account has been frozen due to suspicious activity",
    type: "error" as const,
    isRead: false,
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: "notif_003",
    title: "System Maintenance",
    message: "Scheduled maintenance tonight",
    type: "info" as const,
    isRead: true,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
]

export const NotificationBell = React.memo(() => {
  const { notifications, unreadCount, isConnected, markAsRead, markAllAsRead } =
    useNotificationsWS(mockInitialNotifications)

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
