"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Send } from "lucide-react"
import { paymentService } from "@/lib/api-client"
import { generateReference, generateCardToken, getRandomPaymentGateway } from "@/utils/random"
import { convertCurrency, formatCurrency, type SupportedCurrency } from "@/utils/currency"
import type { PaymentSuccessResponse } from "@/types/payment"
import toast from "react-hot-toast"

const paymentSchema = z.object({
    recipientAccountNumber: z.string().min(9, "Account number must be at least 9 digits"),
    amount: z.number().min(0.01, "Amount must be greater than 0"),
    currency: z.enum(["USD", "KHR"]),
    paymentMethod: z.string().min(1, "Please select a payment method"),
    description: z.string().optional(),
})

type PaymentFormData = z.infer<typeof paymentSchema>

type PaymentFormProps = {
    onSuccess: (response: PaymentSuccessResponse) => void
    initialData?: Partial<PaymentFormData>
}

const mockAccountNumber = "001001001" // Mock account number for demonstration

export function PaymentForm({ onSuccess, initialData }: PaymentFormProps) {
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<PaymentFormData>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            currency: "USD",
            paymentMethod: "DIGITAL_WALLET",
            ...initialData,
        },
    })

    const watchedValues = watch()

    useEffect(() => {
        if (initialData) {
            Object.entries(initialData).forEach(([key, value]) => {
                if (value !== undefined) {
                    setValue(key as keyof PaymentFormData, value)
                }
            })
        }
    }, [initialData, setValue])

    const onSubmit = async (data: PaymentFormData) => {
        setIsLoading(true)

        try {
            const paymentRequest = {
                accountNumber: mockAccountNumber,
                recipientAccountNumber: data.recipientAccountNumber,
                amount: data.amount,
                currency: data.currency,
                paymentMethod: data.paymentMethod,
                description: data.description || "",
                reference: generateReference(),
                cardToken: generateCardToken(),
                paymentGateway: getRandomPaymentGateway(),
            }

            const response = await paymentService.processPayment(paymentRequest)

            if (response.paymentId) {
                toast.success(response.message || "Payment processed successfully!")
                onSuccess({
                    success: true,
                    transactionId: response.paymentId, // Map paymentId to transactionId
                    reference: response.transactionReference || paymentRequest.reference, // Use API reference or fallback to request reference
                    amount: response.amount,
                    currency: response.currency,
                    timestamp: response.timestamp || new Date().toISOString(), // Use API timestamp or current time
                    message: response.message,
                })
                reset()
            } else {
                toast.error(response.responseMessage || "Payment failed")
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.responseMessage || "Payment failed. Please try again."
            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recipient Account */}
                <div className="space-y-2">
                    <Label htmlFor="recipientAccountNumber">Recipient Account Number</Label>
                    <Input
                        id="recipientAccountNumber"
                        placeholder="Enter recipient account number"
                        {...register("recipientAccountNumber")}
                        className={errors.recipientAccountNumber ? "border-destructive" : ""}
                    />
                    {errors.recipientAccountNumber && (
                        <p className="text-sm text-destructive">{errors.recipientAccountNumber.message}</p>
                    )}
                </div>

                {/* Amount */}
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
                    {watchedValues.amount > 0 && (
                        <p className="text-xs text-muted-foreground">
                            ≈ {formatCurrency(equivalentAmount, watchedValues.currency === "USD" ? "KHR" : "USD")}
                        </p>
                    )}
                </div>

                {/* Currency */}
                <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={watchedValues.currency} onValueChange={(value) => setValue("currency", value)}>
                        <SelectTrigger className={errors.currency ? "border-destructive" : ""}>
                            <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="USD">USD - ($)</SelectItem>
                            <SelectItem value="KHR">KHR - (៛)</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.currency && <p className="text-sm text-destructive">{errors.currency.message}</p>}
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select value={watchedValues.paymentMethod} onValueChange={(value) => setValue("paymentMethod", value)}>
                        <SelectTrigger className={errors.paymentMethod ? "border-destructive" : ""}>
                            <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                            <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                            <SelectItem value="DIGITAL_WALLET">Digital Wallet</SelectItem>
                            <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                            <SelectItem value="PAYPAL">PayPal</SelectItem>
                            <SelectItem value="STRIPE">Stripe</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.paymentMethod && <p className="text-sm text-destructive">{errors.paymentMethod.message}</p>}
                </div>
            </div>

            {/* Description - now optional */}
            <div className="space-y-2">
                <Label htmlFor="description">
                    Description <span className="text-muted-foreground">(Optional)</span>
                </Label>
                <Textarea
                    id="description"
                    placeholder="Enter payment description or reference (optional)"
                    rows={3}
                    {...register("description")}
                    className={errors.description ? "border-destructive" : ""}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>

            {/* Payment Summary */}
            {watchedValues.amount > 0 && (
                <Card className="bg-muted/50">
                    <CardContent className="p-4">
                        <h3 className="font-medium mb-2">Payment Summary</h3>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span>Amount:</span>
                                <span className="font-medium">
                  {formatCurrency(watchedValues.amount, watchedValues.currency as SupportedCurrency)}
                </span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Equivalent:</span>
                                <span>{formatCurrency(equivalentAmount, watchedValues.currency === "USD" ? "KHR" : "USD")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Fee:</span>
                                <span className="font-medium">Free</span>
                            </div>
                            <div className="flex justify-between border-t pt-1 font-medium">
                                <span>Total:</span>
                                <span>{formatCurrency(watchedValues.amount, watchedValues.currency as SupportedCurrency)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Submit Button */}
            <Button type="submit" disabled={isLoading} className="w-full" size="lg">
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing Payment...
                    </>
                ) : (
                    <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Payment
                    </>
                )}
            </Button>
        </form>
    )
}
