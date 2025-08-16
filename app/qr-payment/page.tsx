"use client"

import { useState } from "react"
import { Navbar } from "@/components/common/navbar"
import { QRCodeGenerator } from "@/components/payment/qr-code-generator"
import { QRCodeScanner } from "@/components/payment/qr-code-scanner"
import { PaymentForm } from "@/components/payment/payment-form"
import { PaymentSummaryModal } from "@/components/payment/payment-summary-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { QrCode, Scan, Send } from "lucide-react"
import type { PaymentSuccessResponse } from "@/types/payment"
import toast from "react-hot-toast"

type ScannedPaymentData = {
  type: string
  recipientAccount: string
  amount: number
  currency: string
  description: string
  reference: string
  timestamp: string
}

export default function QRPaymentPage() {
  const [paymentSuccess, setPaymentSuccess] = useState<PaymentSuccessResponse | null>(null)
  const [scannedData, setScannedData] = useState<ScannedPaymentData | null>(null)
  const [activeTab, setActiveTab] = useState("generate")

  const handlePaymentSuccess = (response: PaymentSuccessResponse) => {
    setPaymentSuccess(response)
  }

  const handleCloseModal = () => {
    setPaymentSuccess(null)
  }

  const handleScanSuccess = (data: ScannedPaymentData) => {
    setScannedData(data)
    setActiveTab("pay")
    toast.success("QR Code scanned successfully! Review payment details below.")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">QR Code Payment</h1>
          <p className="text-muted-foreground">Generate QR codes to receive payments or scan to send payments</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="scan" className="flex items-center gap-2">
              <Scan className="h-4 w-4" />
              Scan
            </TabsTrigger>
            <TabsTrigger value="pay" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Pay
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            <QRCodeGenerator />
          </TabsContent>

          <TabsContent value="scan">
            <QRCodeScanner onScanSuccess={handleScanSuccess} />
          </TabsContent>

          <TabsContent value="pay">
            <Card>
              <CardContent className="p-6">
                {scannedData ? (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-semibold text-foreground mb-2">Complete Payment</h2>
                      <p className="text-muted-foreground">Review the scanned payment details and confirm</p>
                    </div>

                    {/* Scanned Payment Details */}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <h3 className="font-medium mb-3">Scanned Payment Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Recipient Account:</span>
                            <p className="font-mono">{scannedData.recipientAccount}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Amount:</span>
                            <p className="font-medium">
                              {scannedData.amount} {scannedData.currency}
                            </p>
                          </div>
                          <div className="md:col-span-2">
                            <span className="text-muted-foreground">Description:</span>
                            <p>{scannedData.description}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Reference:</span>
                            <p className="font-mono text-xs">{scannedData.reference}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Pre-filled Payment Form */}
                    <PaymentForm
                      onSuccess={handlePaymentSuccess}
                      initialData={{
                        recipientAccountNumber: scannedData.recipientAccount,
                        amount: scannedData.amount,
                        currency: scannedData.currency,
                        description: scannedData.description,
                        paymentMethod: "digital_wallet",
                      }}
                    />
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Scan className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No QR Code Scanned</h3>
                    <p className="text-muted-foreground">
                      Please scan a payment QR code first, or use the regular payment form
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Payment Success Modal */}
      {paymentSuccess && <PaymentSummaryModal isOpen={true} onClose={handleCloseModal} paymentData={paymentSuccess} />}
    </div>
  )
}
