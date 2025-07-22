"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, AlertCircle, Loader2, ArrowLeft } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import toast from "@/lib/utils/toast"

export default function PaymentFailureClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const processFailure = async () => {
      try {
        // Get payment parameters from URL (Hypay redirect parameters)
        if (!searchParams) {
          throw new Error("Missing search parameters")
        }
        
        // Hypay sends these parameters on failure:
        // CCode: Error code (not '0')
        // ErrMsg: Error message from Hypay
        // Order: Payment ID (our internal payment ID)
        const ccode = searchParams.get('CCode')
        const errorMessage = searchParams.get('ErrMsg')
        const orderId = searchParams.get('Order') // Our payment ID
        
        console.log('Hypay Failure Redirect Params:', {
          CCode: ccode,
          ErrMsg: errorMessage,
          Order: orderId
        })
        
        if (!orderId) {
          throw new Error("Missing payment information")
        }

        // The backend failure endpoint should have already processed this failure
        // when Hypay redirected here, so we just show the failure message
        let displayMessage = "Your payment was not processed successfully."
        
        if (errorMessage) {
          displayMessage = decodeURIComponent(errorMessage)
        } else if (ccode) {
          // Map common error codes to user-friendly messages
          switch (ccode) {
            case "1":
              displayMessage = "Card declined. Please try a different payment method."
              break
            case "2":
              displayMessage = "Insufficient funds. Please check your account balance and try again."
              break
            case "3":
              displayMessage = "Invalid card information. Please check your details and try again."
              break
            case "4":
              displayMessage = "Your card has expired. Please use a different card."
              break
            case "5":
              displayMessage = "Transaction timeout. Please try again."
              break
            case "6":
              displayMessage = "Transaction was cancelled."
              break
            default:
              displayMessage = `Payment failed with error code: ${ccode}. Please try again or contact support.`
          }
        }
        
        setError(displayMessage)
        toast.error("Payment failed")
        
      } catch (error) {
        console.error("Payment failure processing error:", error)
        setError("Payment failed. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    processFailure()
  }, [searchParams])

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
              <CardTitle>Processing...</CardTitle>
            </>
          ) : (
            <>
              <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-red-600">Payment Failed</CardTitle>
            </>
          )}
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          {loading ? (
            <p className="text-muted-foreground">
              Please wait while we process the payment information...
            </p>
          ) : (
            <>
              <p className="text-muted-foreground">
                {error || "Your payment could not be processed. Please try again or contact support."}
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