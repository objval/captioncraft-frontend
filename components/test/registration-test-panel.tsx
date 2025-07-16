/**
 * Testing utility for registration credit system
 * Use this component temporarily to test the automatic credit system
 */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/providers/auth-provider"
import { 
  verifyWelcomeCredits, 
  manuallyAddWelcomeCredits, 
  getUserCreditHistory,
  checkRegistrationSystem 
} from "@/lib/registration-utils"
import { Check, X, AlertTriangle, RefreshCw } from "lucide-react"

export default function RegistrationTestPanel() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [verification, setVerification] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [systemStatus, setSystemStatus] = useState<any>(null)

  const handleVerifyCredits = async () => {
    if (!user?.id) return
    
    setLoading(true)
    try {
      const result = await verifyWelcomeCredits(user.id)
      setVerification(result)
      
      const creditHistory = await getUserCreditHistory(user.id)
      setHistory(creditHistory)
    } catch (error) {
      console.error("Error verifying credits:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleManualAdd = async () => {
    if (!user?.id) return
    
    setLoading(true)
    try {
      const success = await manuallyAddWelcomeCredits(user.id)
      if (success) {
        // Re-verify after manual addition
        await handleVerifyCredits()
      }
    } catch (error) {
      console.error("Error adding manual credits:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckSystem = async () => {
    setLoading(true)
    try {
      const status = await checkRegistrationSystem()
      setSystemStatus(status)
    } catch (error) {
      console.error("Error checking system:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Registration Credit System Test</CardTitle>
          <CardDescription>Please log in to test the credit system</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Registration Credit System Test Panel</CardTitle>
          <CardDescription>
            Test the automatic 50 credit welcome bonus system for user: {user.email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={handleVerifyCredits} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Verify Credits
            </Button>
            <Button onClick={handleCheckSystem} variant="outline" disabled={loading}>
              Check System Status
            </Button>
            {verification && !verification.hasWelcomeTransaction && (
              <Button onClick={handleManualAdd} variant="secondary" disabled={loading}>
                Add Manual Credits
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {systemStatus && (
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {systemStatus.triggerExists ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span>Database Trigger: {systemStatus.triggerExists ? 'Active' : 'Missing'}</span>
              </div>
              <div className="flex items-center gap-2">
                {systemStatus.functionExists ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span>Database Function: {systemStatus.functionExists ? 'Active' : 'Missing'}</span>
              </div>
              <Badge variant={systemStatus.status === 'Ready' ? 'default' : 'destructive'}>
                {systemStatus.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {verification && (
        <Card>
          <CardHeader>
            <CardTitle>Credit Verification Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {verification.hasCredits ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span>Has Credits: {verification.creditAmount} credits</span>
              </div>
              <div className="flex items-center gap-2">
                {verification.hasWelcomeTransaction ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                )}
                <span>Welcome Transaction: {verification.hasWelcomeTransaction ? 'Found' : 'Missing'}</span>
              </div>
              {!verification.hasWelcomeTransaction && (
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Welcome transaction not found. This might indicate the automatic system isn't working.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Credit Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history.map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div>
                    <span className="font-medium">{transaction.reason}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <Badge variant={transaction.amount_changed > 0 ? 'default' : 'destructive'}>
                    {transaction.amount_changed > 0 ? '+' : ''}{transaction.amount_changed}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
