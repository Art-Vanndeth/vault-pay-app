import { NotificationItem} from "@/components/Notification/NotificationItem";
import type { Notification, NotificationActions} from "@/types/notification";
import { Card, CardContent } from "@/components/ui/card"
import { Bell } from "lucide-react"

interface NotificationListProps {
    notifications: Notification[]
    actions: NotificationActions
}

export function NotificationList({ notifications, actions }: NotificationListProps) {
    return (
        <div className="space-y-4">
            {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                    <NotificationItem
                        key={notification.id}
                        notification={notification}
                        actions={actions}
                        isFirst={index === 0}
                    />
                ))
            ) : (
                <Card>
                    <CardContent className="p-8 text-center">
                        <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No notifications</h3>
                        <p className="text-muted-foreground">You're all caught up!</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
