"use client"

import { useState } from "react"
import { Navbar } from "@/components/common/navbar"
import { AccountDisplay } from "@/components/payment/account-display"
import { PaymentForm } from "@/components/payment/payment-form"
import { PaymentSummaryModal } from "@/components/payment/payment-summary-modal"
import { Button } from "@/components/ui/button"
import { QrCode, CreditCard } from "lucide-react"
import Link from "next/link"
import type { PaymentSuccessResponse } from "@/types/payment"

export default function HomePage() {
  const [paymentSuccess, setPaymentSuccess] = useState<PaymentSuccessResponse | null>(null)

  const handlePaymentSuccess = (response: PaymentSuccessResponse) => {
    setPaymentSuccess(response)
  }

  const handleCloseModal = () => {
    setPaymentSuccess(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Account Display Section */}
          <AccountDisplay />

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/qr-payment">
              <Button variant="outline" className="w-full h-16 text-left justify-start bg-transparent">
                <QrCode className="mr-3 h-6 w-6" />
                <div>
                  <div className="font-medium">QR Code Payment</div>
                  <div className="text-sm text-muted-foreground">Generate or scan QR codes</div>
                </div>
              </Button>
            </Link>

            <Link href="/visa-pos">
              <Button variant="outline" className="w-full h-16 text-left justify-start bg-transparent">
                <CreditCard className="mr-3 h-6 w-6" />
                <div>
                  <div className="font-medium">Visa/POS Payment</div>
                  <div className="text-sm text-muted-foreground">Pay with card or POS</div>
                </div>
              </Button>
            </Link>
          </div>

          {/* Payment Form Section */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Send Payment</h2>
              <p className="text-muted-foreground">Transfer money securely to any account</p>
            </div>

            <PaymentForm onSuccess={handlePaymentSuccess} />
          </div>
        </div>
      </main>

      {/* Payment Success Modal */}
      {paymentSuccess && <PaymentSummaryModal isOpen={true} onClose={handleCloseModal} paymentData={paymentSuccess} />}
    </div>
  )
}
