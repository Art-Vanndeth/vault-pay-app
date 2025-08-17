"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { QrCode, Copy, Download, Clock } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { generateReference } from "@/utils/random"
import { formatCurrency, convertCurrency, type SupportedCurrency } from "@/utils/currency"
import toast from "react-hot-toast"

const qrGenerateSchema = z.object({
  amount: z.number().min(0, "Amount must be 0 or greater"),
  currency: z.enum(["USD", "KHR"]),
  description: z.string().optional(),
  accountNumber: z.string().min(10, "Account number is required"),
})

type QRGenerateFormData = z.infer<typeof qrGenerateSchema>

const mockAccountNumber = "1234567890123456"

const QR_EXPIRATION_MINUTES = 1 // Dynamic QR codes expire in 15 minutes

export function QRCodeGenerator() {
  const [qrData, setQrData] = useState<string | null>(null)
  const [paymentInfo, setPaymentInfo] = useState<QRGenerateFormData | null>(null)
  const [qrType, setQrType] = useState<"static" | "dynamic">("static")
  const [expirationTime, setExpirationTime] = useState<Date | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<string>("")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<QRGenerateFormData>({
    resolver: zodResolver(qrGenerateSchema),
    defaultValues: {
      currency: "USD",
      accountNumber: mockAccountNumber,
      amount: 0,
    },
  })

  const watchedValues = watch()

  useEffect(() => {
    const amount = watchedValues.amount || 0
    const currency = watchedValues.currency as SupportedCurrency

    // Convert to USD for comparison if needed
    const amountInUSD = currency === "KHR" ? convertCurrency(amount, "KHR", "USD") : amount

    if (amount === 0) {
      setQrType("static")
    } else if (amountInUSD >= 0.1) {
      setQrType("dynamic")
    } else {
      setQrType("static")
    }
  }, [watchedValues.amount, watchedValues.currency])

  useEffect(() => {
    if (qrType === "dynamic" && expirationTime) {
      const interval = setInterval(() => {
        const now = new Date()
        const timeLeft = expirationTime.getTime() - now.getTime()

        if (timeLeft <= 0) {
          setTimeRemaining("Expired")
          setQrData(null) // Clear expired QR code
          toast.error("QR Code has expired. Please generate a new one.")
          clearInterval(interval)
        } else {
          const minutes = Math.floor(timeLeft / 60000)
          const seconds = Math.floor((timeLeft % 60000) / 1000)
          setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, "0")}`)
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [qrType, expirationTime])

  const onSubmit = (data: QRGenerateFormData) => {
    const reference = generateReference()
    const now = new Date()

    const expiration = qrType === "dynamic" ? new Date(now.getTime() + QR_EXPIRATION_MINUTES * 60000) : null

    const qrPaymentData = {
      type: "payment_request",
      qrType,
      recipientAccount: data.accountNumber,
      amount: data.amount,
      currency: data.currency,
      description: data.description || "",
      reference,
      timestamp: now.toISOString(),
      expiresAt: expiration?.toISOString(),
    }

    const qrString = JSON.stringify(qrPaymentData)
    setQrData(qrString)
    setPaymentInfo(data)
    setExpirationTime(expiration)

    if (qrType === "dynamic") {
      setTimeRemaining(`${QR_EXPIRATION_MINUTES}:00`)
    }

    toast.success(`${qrType === "static" ? "Static" : "Dynamic"} QR Code generated successfully!`)
  }

  const handleCopyQRData = async () => {
    if (qrData) {
      try {
        await navigator.clipboard.writeText(qrData)
        toast.success("QR data copied to clipboard")
      } catch (error) {
        toast.error("Failed to copy QR data")
      }
    }
  }

  const handleDownloadQR = () => {
    if (qrData) {
      const svg = document.querySelector("#qr-code-svg")
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg)
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        const img = new Image()

        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          ctx?.drawImage(img, 0, 0)
          const pngFile = canvas.toDataURL("image/png")

          const downloadLink = document.createElement("a")
          downloadLink.download = `payment-qr-${qrType}-${Date.now()}.png`
          downloadLink.href = pngFile
          downloadLink.click()
        }

        img.src = "data:image/svg+xml;base64," + btoa(svgData)
        toast.success("QR Code download started")
      }
    }
  }

  const equivalentAmount =
    watchedValues.amount > 0
      ? convertCurrency(
          watchedValues.amount,
          watchedValues.currency as SupportedCurrency,
          watchedValues.currency === "USD" ? "KHR" : "USD",
        )
      : 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Generate Payment QR Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Your Account Number</Label>
                <Input
                  id="accountNumber"
                  {...register("accountNumber")}
                  className={errors.accountNumber ? "border-destructive" : ""}
                  readOnly
                />
                {errors.accountNumber && <p className="text-sm text-destructive">{errors.accountNumber.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("amount", { valueAsNumber: true })}
                  className={errors.amount ? "border-destructive" : ""}
                />
                {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
                <div className="flex items-center justify-between text-xs">
                  <Badge variant={qrType === "static" ? "secondary" : "default"}>
                    {qrType === "static" ? "Static QR" : "Dynamic QR"}
                  </Badge>
                  {watchedValues.amount > 0 && (
                    <span className="text-muted-foreground">
                      ≈ {formatCurrency(equivalentAmount, watchedValues.currency === "USD" ? "KHR" : "USD")}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={watchedValues.currency} onValueChange={(value) => setValue("currency", value)}>
                  <SelectTrigger className={errors.currency ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar ($)</SelectItem>
                    <SelectItem value="KHR">KHR - Cambodian Riel (៛)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.currency && <p className="text-sm text-destructive">{errors.currency.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Payment Description <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Enter payment description (optional)"
                rows={3}
                {...register("description")}
                className={errors.description ? "border-destructive" : ""}
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>

            <div className="bg-muted/50 p-3 rounded-lg text-sm">
              <p className="font-medium mb-1">QR Code Type:</p>
              <p className="text-muted-foreground">
                {qrType === "static"
                  ? "Static QR - No expiration (for amounts of 0 or less than $0.10)"
                  : `Dynamic QR - Expires in ${QR_EXPIRATION_MINUTES} minutes (for amounts $0.10 and above)`}
              </p>
            </div>

            <Button type="submit" className="w-full">
              <QrCode className="mr-2 h-4 w-4" />
              Generate {qrType === "static" ? "Static" : "Dynamic"} QR Code
            </Button>
          </form>
        </CardContent>
      </Card>

      {qrData && paymentInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated QR Code</span>
              <Badge variant={qrType === "static" ? "secondary" : "default"}>
                {qrType === "static" ? "Static" : "Dynamic"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white p-4 rounded-lg border">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={qrData}
                  size={200}
                  level="M"
                  includeMargin={true}
                  fgColor="#ec4899"
                  bgColor="#ffffff"
                />
              </div>

              {qrType === "dynamic" && timeRemaining && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span
                    className={timeRemaining === "Expired" ? "text-destructive font-medium" : "text-muted-foreground"}
                  >
                    {timeRemaining === "Expired" ? "QR Code Expired" : `Expires in: ${timeRemaining}`}
                  </span>
                </div>
              )}

              <div className="text-center space-y-2">
                <p className="font-medium text-foreground">
                  Payment Request: {formatCurrency(paymentInfo.amount, paymentInfo.currency as SupportedCurrency)}
                </p>
                {paymentInfo.amount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    ≈ {formatCurrency(equivalentAmount, paymentInfo.currency === "USD" ? "KHR" : "USD")}
                  </p>
                )}
                {paymentInfo.description && <p className="text-sm text-muted-foreground">{paymentInfo.description}</p>}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCopyQRData} disabled={timeRemaining === "Expired"}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Data
                </Button>
                <Button variant="outline" onClick={handleDownloadQR} disabled={timeRemaining === "Expired"}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
