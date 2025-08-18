import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Check, Trash2 } from "lucide-react"
import { formatRelativeTime } from "@/utils/format"
import type { Notification, NotificationActions } from "@/types/notification"

const typeColors = {
  info: "bg-blue-50 text-blue-700 border-blue-200",
  success: "bg-green-50 text-green-700 border-green-200",
  warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
  error: "bg-red-50 text-red-700 border-red-200",
}

interface NotificationItemProps {
  notification: Notification
  actions: NotificationActions
  isFirst?: boolean
}

export function NotificationItem({ notification, actions, isFirst = false }: NotificationItemProps) {
  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      !notification.isRead ? "border-l-4 border-l-blue-500 shadow-sm" : "border-gray-200"
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            !notification.isRead ? "bg-blue-50" : "bg-gray-100"
          }`}>
            <Bell className={`h-5 w-5 ${
              !notification.isRead ? "text-blue-600" : "text-gray-400"
            }`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3 className={`font-semibold text-base ${
                  !notification.isRead ? "text-gray-900" : "text-gray-600"
                }`}>
                  {notification.title}
                </h3>
                <Badge variant="outline" className={`text-xs ${typeColors[notification.type]}`}>
                  {notification.type}
                </Badge>
              </div>

              {/* Status indicator */}
              {!notification.isRead && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
              )}
            </div>

            <p className="text-sm text-gray-700 mb-3 leading-relaxed">
              {notification.message}
            </p>

            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 font-medium">
                {formatRelativeTime(notification.timestamp)}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {!notification.isRead && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => actions.markAsRead(notification.id, true)}
                    className="h-8 px-3 text-xs hover:bg-blue-50 hover:border-blue-300"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Mark as read
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => actions.remove(notification.id)}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
