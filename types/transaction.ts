export type Transaction = {
    transactionId: string;
    paymentId: string;
    paymentMethod: string; // e.g., "CARD", "BANK_TRANSFER", "PAYPAL"
    fromAccountNumber: string;
    toAccountNumber: string;
    amount: number;
    transactionReference: string;
    currency: string;
    transactionType: 'DEBIT' | 'CREDIT';
    status: 'INITIATED' | 'COMPLETED' | 'FAILED' | 'PENDING';
    description?: string;
    updatedAt: [number, number, number, number, number, number, number];
    // Example: [2025, 8, 16, 22, 44, 9, 819000000]
    createdBy: string; // e.g., "payment-service"
    metadata?: Record<string, any>; // Additional metadata if needed

}
