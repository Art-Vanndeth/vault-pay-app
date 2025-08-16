import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { notificationService} from "@/lib/api-client";
import type { Notification } from '@/types/notification';

export class WebSocketService {
  private client: Client;
  private subscriptionCallback: ((notification: Notification) => void) | null = null;

  constructor(wsUrl: string = 'http://localhost:8888/ws') {

    this.client = new Client({
        webSocketFactory: () => new SockJS(wsUrl),
      onConnect: () => {
        console.log('Connected to WebSocket');
        this.subscribe();
      },
      onStompError: (frame) => {
        console.error('STOMP error', frame);
      }
    });
  }

    async fetchInitialNotifications(order: 'asc' | 'desc' = 'asc'): Promise<Notification[]> {
        try {
            const notifications = await notificationService.getNotifications();
            return notifications.sort((a: Notification, b: Notification) => {
                if (order === 'asc') {
                    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
                } else {
                    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
                }
            });
        } catch (error) {
            console.error('Failed to fetch initial notifications:', error);
            // Return empty array when API is not available
            return [];
        }
    }

  connect(): void {
    this.client.activate();
  }

  disconnect(): void {
    this.client.deactivate();
  }

  onNotification(callback: (notification: Notification) => void): void {
    this.subscriptionCallback = callback;
    if (this.client.connected) {
      this.subscribe();
    }
  }

  private subscribe(): void {
    if (this.subscriptionCallback) {
      this.client.subscribe(`/topic/notifications`, (message) => {
        const notification = JSON.parse(message.body) as Notification;
        this.subscriptionCallback!(notification);
      });
    }
  }
}