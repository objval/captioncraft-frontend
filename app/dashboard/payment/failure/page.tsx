import { Suspense } from "react"
import PaymentFailureClient from "./payment-failure-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

function PaymentFailureLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
          </div>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            Please wait while we load the payment information...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentFailurePage() {
  return (
    <Suspense fallback={<PaymentFailureLoading />}>
      <PaymentFailureClient />
    </Suspense>
  )
}