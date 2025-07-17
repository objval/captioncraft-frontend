"use client"

import { useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { checkProfileCompleteness, ensureWelcomeCredits } from "@/lib/profile-creation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/utils/supabase/client"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"

export default function DebugProfilePage() {
  const { user } = useAuth()
  const [profileStatus, setProfileStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [rawProfile, setRawProfile] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])

  const checkProfile = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const status = await checkProfileCompleteness(user.id)
      setProfileStatus(status)
      
      // Also fetch raw profile data
      const supabase = createClient()
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (error) {
        console.error('Error fetching raw profile:', error)
        setRawProfile({ error: error.message })
      } else {
        setRawProfile(profile)
      }
      
      // Fetch transactions
      const { data: transactionData, error: transactionError } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (transactionError) {
        console.error('Error fetching transactions:', transactionError)
      } else {
        setTransactions(transactionData || [])
      }
    } catch (error) {
      console.error('Error checking profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const addWelcomeCredits = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const success = await ensureWelcomeCredits(user.id)
      if (success) {
        alert('Welcome credits added successfully!')
        checkProfile() // Refresh the data
      } else {
        alert('Failed to add welcome credits')
      }
    } catch (error) {
      console.error('Error adding welcome credits:', error)
      alert('Error adding welcome credits')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Debug Profile</CardTitle>
            <CardDescription>Please log in to debug profile issues</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Debug Tool</CardTitle>
          <CardDescription>
            Debug profile creation and credit issues for user: {user.email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={checkProfile} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                'Check Profile Status'
              )}
            </Button>
            
            {profileStatus && (
              <div className="space-y-4">
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Profile Exists</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        {profileStatus.exists ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span>{profileStatus.exists ? 'Yes' : 'No'}</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Profile Complete</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        {profileStatus.complete ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span>{profileStatus.complete ? 'Yes' : 'No'}</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Credits</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{profileStatus.credits}</Badge>
                        <span>credits</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {!profileStatus.complete && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Profile is incomplete. Missing fields will be shown in raw data below.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
            
            {rawProfile && (
              <div className="space-y-4">
                <Separator />
                <h3 className="font-semibold">Raw Profile Data</h3>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
                  {JSON.stringify(rawProfile, null, 2)}
                </pre>
              </div>
            )}
            
            {transactions.length > 0 && (
              <div className="space-y-4">
                <Separator />
                <h3 className="font-semibold">Credit Transactions</h3>
                <div className="space-y-2">
                  {transactions.map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{transaction.reason}</div>
                        <div className="text-sm text-gray-500">{new Date(transaction.created_at).toLocaleString()}</div>
                      </div>
                      <Badge variant={transaction.amount_changed > 0 ? "default" : "secondary"}>
                        {transaction.amount_changed > 0 ? '+' : ''}{transaction.amount_changed}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="pt-4">
              <Button onClick={addWelcomeCredits} variant="outline" disabled={loading}>
                Add Welcome Credits (if missing)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
