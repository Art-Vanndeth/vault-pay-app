"use client"

import {Button} from "@/components/ui/button"
import {CheckCheck} from "lucide-react"
import type {Notification} from "@/types/notification"
import {useEffect, useState} from "react";
import {notificationService} from "@/lib/api-client"
import {NotificationList} from "@/components/Notification/NotificationList"
import {WebSocketService} from "@/lib/websocket";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Helper functions for notification actions
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAsRead = async (id: string, status: boolean) => {
        try {
            await notificationService.markAsRead(id, status);
            setNotifications(notifications =>
                notifications.map(n =>
                    n.id === id ? {...n, isRead: status} : n
                )
            );
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            await notificationService.removeNotification(id);
            setNotifications(notifications =>
                notifications.filter(n => n.id !== id)
            );
        } catch (error) {
            console.error("Failed to delete notification:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationService.markAllNotificationsAsRead();
            setNotifications(notifications =>
                notifications.map(n => ({...n, isRead: true}))
            );
        } catch (error) {
            console.error("Failed to mark all notifications as read:", error);
        }
    };

    useEffect(() => {
        const wsService = new WebSocketService();

        wsService.onNotification((notification) => {
            setNotifications((prev) => [notification, ...prev]); // Add new notification at the top
        });

        wsService.connect();

        // Fetch initial notifications
        wsService.fetchInitialNotifications("desc").then((initialNotifications) => {
            setNotifications(initialNotifications);
        });

        return () => {
            wsService.disconnect();
        };
    }, [1]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
                    </div>
                </div>

                {unreadCount > 0 && (
                    <Button onClick={markAllAsRead} variant="outline">
                        <CheckCheck className="mr-2 h-4 w-4"/>
                        Mark All Read
                    </Button>
                )}
            </div>

            <NotificationList
                notifications={notifications}
                actions={{
                    markAsRead: markAsRead,
                    remove: deleteNotification
                }}
            />
        </div>
    )
}
