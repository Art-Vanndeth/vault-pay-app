"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Copy, Download } from "lucide-react"
import { formatCurrency, formatDate } from "@/utils/format"
import type { PaymentSuccessResponse } from "@/types/payment"
import toast from "react-hot-toast"

type PaymentSummaryModalProps = {
    isOpen: boolean
    onClose: () => void
    paymentData: PaymentSuccessResponse
}

export function PaymentSummaryModal({ isOpen, onClose, paymentData }: PaymentSummaryModalProps) {
    const handleCopyReference = async () => {
        try {
            await navigator.clipboard.writeText(paymentData.reference)
            toast.success("Reference number copied to clipboard")
        } catch (error) {
            toast.error("Failed to copy reference number")
        }
    }

    const handleDownloadReceipt = () => {
        // Mock download functionality
        toast.success("Receipt download started")
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-success">
                        <CheckCircle className="h-5 w-5" />
                        Payment Successful
                    </DialogTitle>
                </DialogHeader>

                <DialogDescription className="text-sm text-muted-foreground text-center mb-4">
                    Thank you for your payment. Your transaction has been successfully processed.
                </DialogDescription>

                <div className="space-y-4">
                    <Card className="bg-success/10 border-success/20">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-success mb-1">
                                {formatCurrency(paymentData.amount, paymentData.currency)}
                            </div>
                            <p className="text-sm text-muted-foreground">has been sent successfully</p>
                        </CardContent>
                    </Card>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-sm text-muted-foreground">Transaction ID</span>
                            <span className="text-sm font-mono">{paymentData.transactionId}</span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-sm text-muted-foreground">Reference</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-mono">{paymentData.reference}</span>
                                <Button variant="ghost" size="sm" onClick={handleCopyReference}>
                                    <Copy className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-sm text-muted-foreground">Date & Time</span>
                            <span className="text-sm">{formatDate(paymentData.timestamp)}</span>
                        </div>

                        <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-muted-foreground">Status</span>
                            <span className="text-sm text-success font-medium">Completed</span>
                        </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button variant="outline" onClick={handleDownloadReceipt} className="flex-1 bg-transparent">
                            <Download className="mr-2 h-4 w-4" />
                            Download Receipt
                        </Button>
                        <Button onClick={onClose} className="flex-1">
                            Done
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
