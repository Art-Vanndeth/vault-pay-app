export type Notification = {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  isRead: boolean
  timestamp: string
  actionUrl?: string
}
export interface NotificationActions {
    markAsRead: (id: string, status: boolean) => Promise<void>;
    remove: (id: string) => Promise<void>;
}