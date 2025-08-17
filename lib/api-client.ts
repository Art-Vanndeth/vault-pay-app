import axios from "axios"

export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
})

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        // Add auth token if available (only in browser environment)
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("auth_token")
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    },
)

// Response interceptor
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access (only in browser environment)
            if (typeof window !== "undefined") {
                localStorage.removeItem("auth_token")
                window.location.href = "/login"
            }
        }
        return Promise.reject(error)
    },
)

export const paymentService = {
    async processPayment(paymentData: {
        accountNumber: string
        amount: number
        currency: "USD" | "KHR"
        paymentMethod: string
        recipientAccountNumber: string
        description?: string
        reference: string
        cardToken: string
        paymentGateway: string
    }) {
        const response = await apiClient.post("/api/payments/pay", paymentData)
        return response.data
    },
}

export const accountService = {

    async getAccountDetails(accountNumber: string) {
        const response = await apiClient.get(`/api/accounts/${accountNumber}`)
        return response.data
    },

    async getAllAccounts() {
        const response = await apiClient.get("/api/accounts")
        return response.data
    },

    async freezeAccount(accountNumber: string) {
        const response = await apiClient.patch(`/api/accounts/${accountNumber}/freeze`)
        return response.data
    },

    async unfreezeAccount(accountNumber: string) {
        const response = await apiClient.patch(`/api/accounts/${accountNumber}/unfreeze`)
        return response.data
    },
}

export const transactionService = {
    async getAllTransactions() {
        const response = await apiClient.get("/api/transactions")
        return response.data
    },
}

export const notificationService = {
    async getNotifications() {
        const response = await apiClient.get("/api/notifications")
        return response.data
    },

    // async markAsRead(id: string, status: boolean) {
    //     await apiClient.patch(`/api/notifications/${id}/status`, {read: status})
    // },

    async markAsRead(id: string, status: boolean) {
        await apiClient.patch(`/api/notifications/${id}/status?read=${status}`)
    },

    async removeNotification(id: string) {
        await apiClient.delete(`/api/notifications/${id}`)
    },

    async markAllNotificationsAsRead() {
        await apiClient.patch(`/api/notifications/mark-all-read`)
    },
}
