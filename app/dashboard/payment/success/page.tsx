"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, Loader2, ArrowLeft } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import toast from "@/lib/utils/toast"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Get payment parameters from URL (Hypay redirect parameters)
        if (!searchParams) {
          throw new Error("Missing search parameters")
        }
        
        // Hypay sends these parameters on success:
        // Id: Hypay transaction ID
        // CCode: '0' for success
        // Amount: Payment amount
        // Order: Payment ID (our internal payment ID)
        // Hesh: Invoice number from EzCount
        const hypayTransactionId = searchParams.get('Id')
        const ccode = searchParams.get('CCode')
        const amount = searchParams.get('Amount')
        const orderId = searchParams.get('Order') // Our payment ID
        const invoiceNumber = searchParams.get('Hesh') // EzCount invoice number
        
        console.log('Hypay Success Redirect Params:', {
          Id: hypayTransactionId,
          CCode: ccode,
          Amount: amount,
          Order: orderId,
          Hesh: invoiceNumber
        })

        if (ccode !== '0') {
          throw new Error(`Payment completed with status code: ${ccode}`)
        }

        if (!orderId) {
          throw new Error("Missing payment information")
        }

        // The backend success endpoint should have already processed this payment
        // when Hypay redirected here, so we just show success
        setSuccess(true)
        
        let successMessage = "Payment successful! Your credits have been added to your account."
        if (invoiceNumber) {
          successMessage += ` Invoice number: ${invoiceNumber}.`
        }
        
        toast.success(successMessage)
        
        
        
      } catch (error) {
        console.error("Payment processing error:", error)
        setError(error instanceof Error ? error.message : "Payment processing failed")
        toast.error("There was an issue processing your payment")
      } finally {
        setLoading(false)
      }
    }

    processPayment()
  }, [searchParams, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            </div>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Checking authentication status...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-600">Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Please sign in to view your payment status.
            </p>
            <Button onClick={() => router.push("/auth/login")} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {loading ? (
            <>
              <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              </div>
              <CardTitle>Processing Payment...</CardTitle>
            </>
          ) : success ? (
            <>
              <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-green-600">Payment Successful!</CardTitle>
            </>
          ) : (
            <>
              <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-red-600">Payment Error</CardTitle>
            </>
          )}
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          {loading ? (
            <p className="text-muted-foreground">
              Please wait while we process your payment...
            </p>
          ) : success ? (
            <>
              <p className="text-muted-foreground">
                Your credits have been successfully added to your account. You will be redirected to the credits page shortly.
              </p>
              <div className="space-y-2">
                <Button onClick={() => router.push("/dashboard/credits")} className="w-full">
                  View Credits
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push("/dashboard")} 
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">
                {error || "There was an issue processing your payment. Please contact support if this persists."}
              </p>
              <div className="space-y-2">
                <Button onClick={() => router.push("/dashboard/credits")} className="w-full">
                  Try Again
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push("/dashboard")} 
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
