import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Check, Trash2 } from "lucide-react"
import { formatRelativeTime } from "@/utils/format"
import type { Notification, NotificationActions } from "@/types/notification"

const typeColors = {
  info: "bg-blue-50 text-blue-700 border-blue-200",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
  error: "bg-destructive/10 text-destructive border-destructive/20",
}

interface NotificationItemProps {
  notification: Notification
  actions: NotificationActions
  isFirst?: boolean
}

export function NotificationItem({ notification, actions, isFirst = false }: NotificationItemProps) {
  return (
    <Card
      className={`${!notification.isRead ? "border-primary/50" : ""} ${
        isFirst && !notification.isRead ? "animate-pulse bg-primary/5" : ""
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-full ${!notification.isRead ? "bg-primary/10" : "bg-muted"}`}>
              <Bell className={`h-4 w-4 ${!notification.isRead ? "text-primary" : "text-muted-foreground"}`} />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3
                  className={`font-medium ${!notification.isRead ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {notification.title}
                </h3>
                <Badge variant="outline" className={typeColors[notification.type]}>
                  {notification.type}
                </Badge>
                {!notification.isRead && <div className="w-2 h-2 bg-primary rounded-full" />}
              </div>

              <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>

              <p className="text-xs text-muted-foreground">{formatRelativeTime(notification.timestamp)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!notification.isRead && (
              <Button variant="ghost" size="sm" onClick={() => actions.markAsRead(notification.id, true)}>
                <Check className="h-4 w-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => actions.remove(notification.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
