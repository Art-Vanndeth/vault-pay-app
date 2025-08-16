export type Account = {
    accountNumber: string;
    accountHolderName: string;
    balance: number;
    availableBalance: number;
    status: 'ACTIVE' | 'FROZEN' | 'SUSPENDED' | 'CLOSED';
    type: 'SAVINGS' | 'CURRENT' | 'BUSINESS' | 'JOINT'
    currency: string;
    updatedAt: string;
    message?: string;
}
