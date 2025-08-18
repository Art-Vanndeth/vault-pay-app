// import { Client } from "@stomp/stompjs"
// import type { Transaction } from "@/types/transaction"
// import type { Notification } from "@/types/notification"
//
// export class WebSocketService {
//   private static instance: WebSocketService
//   private client: Client | null = null
//   private wsUrl: string
//   private notificationCallbacks: Set<(notification: Notification) => void> = new Set()
//   private transactionCallbacks: Set<(transaction: Transaction) => void> = new Set()
//   private connectionStatus: "connecting" | "connected" | "disconnected" = "disconnected"
//   private statusCallbacks: Set<(status: string) => void> = new Set()
//
//   private constructor() {
//     const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8888"
//
//     if (baseUrl.startsWith("http://")) {
//       this.wsUrl = baseUrl.replace("http://", "ws://") + "/ws"
//     } else if (baseUrl.startsWith("https://")) {
//       this.wsUrl = baseUrl.replace("https://", "wss://") + "/ws"
//     } else {
//       this.wsUrl = "ws://localhost:8888/ws"
//     }
//   }
//
//   static getInstance(): WebSocketService {
//     if (!WebSocketService.instance) {
//       WebSocketService.instance = new WebSocketService()
//     }
//     return WebSocketService.instance
//   }
//
//   connect(): void {
//     if (this.connectionStatus === "disconnected") {
//       this.connectionStatus = "connecting"
//       this.notifyStatusChange("connecting")
//
//       try {
//         this.client = new Client({
//           brokerURL: this.wsUrl,
//           onConnect: () => {
//             console.log("[v0] Connected to WebSocket")
//             this.connectionStatus = "connected"
//             this.notifyStatusChange("connected")
//             this.subscribe()
//           },
//           onStompError: (frame) => {
//             this.connectionStatus = "disconnected"
//             this.notifyStatusChange("disconnected")
//           },
//           onDisconnect: () => {
//             this.connectionStatus = "disconnected"
//             this.notifyStatusChange("disconnected")
//           },
//           onWebSocketError: (error) => {
//             this.connectionStatus = "disconnected"
//             this.notifyStatusChange("disconnected")
//           },
//           reconnectDelay: 0,
//           heartbeatIncoming: 4000,
//           heartbeatOutgoing: 4000,
//         })
//
//         this.client.activate()
//       } catch (error) {
//         this.connectionStatus = "disconnected"
//         this.notifyStatusChange("disconnected")
//       }
//     }
//   }
//
//   disconnect(): void {
//     if (this.client) {
//       this.client.deactivate()
//     }
//     this.connectionStatus = "disconnected"
//     this.notifyStatusChange("disconnected")
//   }
//
//   private subscribe(): void {
//     if (!this.client) return
//
//     try {
//       this.client.subscribe("/topic/notifications", (message) => {
//         try {
//           const notification = JSON.parse(message.body) as Notification
//           this.notificationCallbacks.forEach((callback) => callback(notification))
//         } catch (error) {}
//       })
//
//       this.client.subscribe("/topic/transactions", (message) => {
//         try {
//           const transaction = JSON.parse(message.body) as Transaction
//           this.transactionCallbacks.forEach((callback) => callback(transaction))
//         } catch (error) {}
//       })
//     } catch (error) {}
//   }
//
//   onNotification(callback: (notification: Notification) => void): () => void {
//     this.notificationCallbacks.add(callback)
//     return () => this.notificationCallbacks.delete(callback)
//   }
//
//   onTransaction(callback: (transaction: Transaction) => void): () => void {
//     this.transactionCallbacks.add(callback)
//     return () => this.transactionCallbacks.delete(callback)
//   }
//
//   onStatusChange(callback: (status: string) => void): () => void {
//     this.statusCallbacks.add(callback)
//     return () => this.statusCallbacks.delete(callback)
//   }
//
//   private notifyStatusChange(status: string): void {
//     this.statusCallbacks.forEach((callback) => callback(status))
//   }
//
//   getConnectionStatus(): string {
//     return this.connectionStatus
//   }
//
//   async fetchInitialNotifications(): Promise<Notification[]> {
//     try {
//       const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8888"
//       const response = await fetch(`${baseUrl}/api/notifications`)
//
//       if (response.ok) {
//         const notifications = await response.json()
//         return Array.isArray(notifications) ? notifications : []
//       } else {
//         return []
//       }
//     } catch (error) {
//       return []
//     }
//   }
//
//   async fetchInitialTransactions(): Promise<Transaction[]> {
//     try {
//       const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8888"
//       const response = await fetch(`${baseUrl}/api/transactions`)
//
//       if (response.ok) {
//         const transactions = await response.json()
//         return Array.isArray(transactions) ? transactions : []
//       } else {
//         return []
//       }
//     } catch (error) {
//       return []
//     }
//   }
// }
