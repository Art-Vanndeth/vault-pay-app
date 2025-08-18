"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Trash2, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { formatRelativeTime } from "@/utils/format"
import type { Notification, NotificationActions } from "@/types/notification"

const typeConfig = {
  info: {
    colors: "bg-gradient-to-r from-pink-50 to-pink-25 text-pink-700 border-pink-200/50",
    icon: Info,
    iconBg: "bg-gradient-to-br from-pink-500 to-pink-600",
  },
  success: {
    colors: "bg-gradient-to-r from-emerald-50 to-emerald-25 text-emerald-700 border-emerald-200/50",
    icon: CheckCircle,
    iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
  },
  warning: {
    colors: "bg-gradient-to-r from-orange-50 to-orange-25 text-orange-700 border-orange-200/50",
    icon: AlertTriangle,
    iconBg: "bg-gradient-to-br from-orange-500 to-orange-600",
  },
  error: {
    colors: "bg-gradient-to-r from-red-50 to-red-25 text-red-700 border-red-200/50",
    icon: AlertCircle,
    iconBg: "bg-gradient-to-br from-red-500 to-red-600",
  },
}

interface NotificationItemProps {
  notification: Notification
  actions: NotificationActions
  isFirst?: boolean
}

export function NotificationItem({ notification, actions, isFirst = false }: NotificationItemProps) {
  const config = typeConfig[notification.type] || typeConfig.info
  const IconComponent = config.icon
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleDeleteConfirm = () => {
    actions.remove(notification.id)
    setDeleteDialogOpen(false)
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
  }

  return (
    <Card
      className={`group transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 rounded-2xl border-0 shadow-sm ${
        !notification.isRead
          ? "bg-gradient-to-r from-pink-50 to-pink-25 dark:from-pink-950/20 dark:to-pink-900/10 ring-2 ring-pink-200/50 shadow-pink-100/50"
          : "bg-white dark:bg-gray-900 hover:shadow-gray-200/50 dark:hover:shadow-gray-800/50"
      } ${isFirst && !notification.isRead ? "animate-pulse" : ""}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div
              className={`p-3 rounded-xl shadow-sm transition-all duration-200 ${
                !notification.isRead
                  ? `${config.iconBg} text-white shadow-lg`
                  : "bg-gray-100 dark:bg-gray-800 text-muted-foreground group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
              }`}
            >
              <IconComponent className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3
                  className={`font-semibold text-base leading-tight ${
                    !notification.isRead ? "text-gray-900 dark:text-white" : "text-muted-foreground"
                  }`}
                >
                  {notification.title}
                </h3>

                <Badge
                  variant="outline"
                  className={`${config.colors} font-medium px-2 py-1 text-xs rounded-lg shadow-sm`}
                >
                  {notification.type}
                </Badge>

                {!notification.isRead && (
                  <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full animate-pulse shadow-sm" />
                )}
              </div>

              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{notification.message}</p>

              <p className="text-xs font-medium text-muted-foreground bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg inline-block">
                {formatRelativeTime(notification.timestamp)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
            {!notification.isRead && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => actions.markAsRead(notification.id, true)}
                className="hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/20 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="sm:max-w-[425px]">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-lg font-semibold">
                    Delete Notification
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-sm text-muted-foreground">
                    Are you sure you want to delete this notification? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="flex justify-end gap-2">
                  <AlertDialogCancel asChild>
                    <Button
                      variant="outline"
                      onClick={handleDeleteCancel}
                      className="h-10 px-4 rounded-md"
                    >
                      Cancel
                    </Button>
                  </AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteConfirm}
                      className="h-10 px-4 rounded-md"
                    >
                      Delete
                    </Button>
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
