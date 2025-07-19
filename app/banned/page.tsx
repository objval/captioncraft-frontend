import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldAlert, Mail, Home } from "lucide-react"
import Link from "next/link"

export default function BannedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-orange-50/50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-0 shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-4 rounded-full bg-red-100">
            <ShieldAlert className="h-12 w-12 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            Account Suspended
          </CardTitle>
          <CardDescription className="text-base">
            Your account has been suspended due to a violation of our terms of service.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              If you believe this is an error or would like to appeal this decision, 
              please contact our support team with your account details.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button className="w-full" variant="outline" asChild>
              <Link href="mailto:support@kalil.com">
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </Link>
            </Button>
            
            <Button className="w-full" variant="ghost" asChild>
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Return to Homepage
              </Link>
            </Button>
          </div>
          
          <p className="text-xs text-center text-slate-500">
            Reference your email address when contacting support
          </p>
        </CardContent>
      </Card>
    </div>
  )
}