import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { notificationService} from "@/lib/api-client";
import type { Notification } from '@/types/notification';

export class WebSocketService {
  private client: Client;
  private subscriptionCallback: ((notification: Notification) => void) | null = null;
  private connectCallback: (() => void) | null = null;
  private disconnectCallback: (() => void) | null = null;
  private paymentSuccessCallback: ((paymentData: any) => void) | null = null;
  private paymentReceivedCallback: ((paymentData: any) => void) | null = null;

  constructor(wsUrl: string = 'http://localhost:8888/ws') {

    this.client = new Client({
        webSocketFactory: () => new SockJS(wsUrl),
      onConnect: () => {
        console.log('Connected to WebSocket');
        this.connectCallback?.();
        this.subscribe();
      },
      onDisconnect: () => {
        console.log('Disconnected from WebSocket');
        this.disconnectCallback?.();
      },
      onStompError: (frame) => {
        console.error('STOMP error', frame);
        this.disconnectCallback?.();
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

  onConnect(callback: () => void): void {
    this.connectCallback = callback;
  }

  onDisconnect(callback: () => void): void {
    this.disconnectCallback = callback;
  }

  // Payment event handlers
  onPaymentSuccess(callback: (paymentData: any) => void): void {
    this.paymentSuccessCallback = callback;
    if (this.client.connected) {
      this.subscribeToPayments();
    }
  }

  onPaymentReceived(callback: (paymentData: any) => void): void {
    this.paymentReceivedCallback = callback;
    if (this.client.connected) {
      this.subscribeToPayments();
    }
  }

  private subscribe(): void {
    if (this.subscriptionCallback) {
      this.client.subscribe(`/topic/notifications`, (message) => {
        const notification = JSON.parse(message.body) as Notification;
        this.subscriptionCallback!(notification);
      });
    }
    this.subscribeToPayments();
  }

  private subscribeToPayments(): void {
    if (this.paymentSuccessCallback) {
      this.client.subscribe(`/topic/payments/success`, (message) => {
        const paymentData = JSON.parse(message.body);
        this.paymentSuccessCallback!(paymentData);
      });
    }

    if (this.paymentReceivedCallback) {
      this.client.subscribe(`/topic/payments/received`, (message) => {
        const paymentData = JSON.parse(message.body);
        this.paymentReceivedCallback!(paymentData);
      });
    }
  }

  get isConnected(): boolean {
    return this.client.connected;
  }
}