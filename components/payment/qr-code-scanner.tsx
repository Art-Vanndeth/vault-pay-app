"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Scan, Camera, CameraOff, AlertCircle } from "lucide-react"
import { QrReader } from "react-qr-reader"

type ScannedPaymentData = {
  type: string
  recipientAccount: string
  amount: number
  currency: string
  description: string
  reference: string
  timestamp: string
}

type QRCodeScannerProps = {
  onScanSuccess: (data: ScannedPaymentData) => void
}

export function QRCodeScanner({ onScanSuccess }: QRCodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

  const handleScan = (result: any, error: any) => {
    if (error) {
      console.error("QR Scan Error:", error)
      return
    }

    if (result) {
      try {
        const data = JSON.parse(result.text)

        // Validate the QR code data structure
        if (data.type === "payment_request" && data.recipientAccount && data.amount) {
          onScanSuccess(data)
          setIsScanning(false)
          setError(null)
        } else {
          setError("Invalid payment QR code format")
        }
      } catch (parseError) {
        setError("Unable to parse QR code data")
      }
    }
  }

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      setHasPermission(true)
      setIsScanning(true)
      setError(null)
      // Clean up the stream immediately as QrReader will handle camera access
      stream.getTracks().forEach((track) => track.stop())
    } catch (err) {
      setHasPermission(false)
      setError("Camera permission denied. Please allow camera access to scan QR codes.")
    }
  }

  const stopScanning = () => {
    setIsScanning(false)
    setError(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scan className="h-5 w-5" />
          Scan Payment QR Code
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isScanning ? (
            <div className="text-center space-y-4">
              <div className="w-48 h-48 mx-auto bg-muted rounded-lg flex items-center justify-center">
                <Camera className="h-16 w-16 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Click the button below to start scanning QR codes for payments</p>
              <Button onClick={startScanning} className="w-full">
                <Camera className="mr-2 h-4 w-4" />
                Start Camera
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <QrReader
                  onResult={handleScan}
                  constraints={{ facingMode: "environment" }}
                  containerStyle={{
                    width: "100%",
                    maxWidth: "400px",
                    margin: "0 auto",
                  }}
                  videoContainerStyle={{
                    paddingTop: "100%",
                    position: "relative",
                  }}
                  videoStyle={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
                <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none">
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-primary"></div>
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-primary"></div>
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-primary"></div>
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-primary"></div>
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Position the QR code within the frame to scan</p>
                <Button variant="outline" onClick={stopScanning} className="w-full bg-transparent">
                  <CameraOff className="mr-2 h-4 w-4" />
                  Stop Scanning
                </Button>
              </div>
            </div>
          )}

          {hasPermission === false && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Camera access is required to scan QR codes. Please enable camera permissions in your browser settings.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
