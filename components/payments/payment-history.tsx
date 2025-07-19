"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/components/providers/auth-provider"
import { getUserPayments } from "@/lib/payments"
import { StatusBadge, StatusIcon } from "@/components/shared/StatusBadge"
import { 
  Search, 
  Filter, 
  Download, 
  Eye,
  Receipt,
  Calendar,
  DollarSign,
  CreditCard,
  ExternalLink,
  RefreshCw
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import type { Payment } from "@/lib/api"
import toast from "react-hot-toast"

interface PaymentFilters {
  status: string
  dateRange: string
  creditPack: string
  amountRange: string
}

export default function PaymentHistory() {
  const { user } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<PaymentFilters>({
    status: "all",
    dateRange: "all",
    creditPack: "all",
    amountRange: "all"
  })

  useEffect(() => {
    const loadPayments = async () => {
      if (!user?.id) return

      try {
        setLoading(true)
        const paymentsData = await getUserPayments()
        setPayments(paymentsData)
        setFilteredPayments(paymentsData)
      } catch (error) {
        console.error("Failed to load payment history:", error)
        toast.error("Failed to load payment history")
      } finally {
        setLoading(false)
      }
    }

    loadPayments()
  }, [user?.id])

  useEffect(() => {
    applyFilters()
  }, [searchTerm, filters, payments])

  const applyFilters = () => {
    let filtered = [...payments]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(payment => 
        payment.hypay_transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.credit_packs?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.invoices?.[0]?.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(payment => payment.status === filters.status)
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const now = new Date()
      const filterDate = new Date()
      
      switch (filters.dateRange) {
        case "7d":
          filterDate.setDate(now.getDate() - 7)
          break
        case "30d":
          filterDate.setDate(now.getDate() - 30)
          break
        case "90d":
          filterDate.setDate(now.getDate() - 90)
          break
        case "1y":
          filterDate.setFullYear(now.getFullYear() - 1)
          break
      }
      
      filtered = filtered.filter(payment => 
        new Date(payment.created_at) >= filterDate
      )
    }

    // Credit pack filter
    if (filters.creditPack !== "all") {
      filtered = filtered.filter(payment => 
        payment.credit_packs?.name === filters.creditPack
      )
    }

    // Amount range filter
    if (filters.amountRange !== "all") {
      filtered = filtered.filter(payment => {
        const amount = payment.amount
        switch (filters.amountRange) {
          case "0-50":
            return amount <= 50
          case "50-100":
            return amount > 50 && amount <= 100
          case "100-200":
            return amount > 100 && amount <= 200
          case "200+":
            return amount > 200
          default:
            return true
        }
      })
    }

    setFilteredPayments(filtered)
  }

  // Status helpers are now imported from shared utilities

  const downloadInvoice = async (payment: Payment) => {
    const invoice = payment.invoices?.[0]
    if (!invoice?.invoice_url) {
      toast.error("Invoice not available for this payment")
      return
    }

    try {
      // Open invoice URL in new tab
      window.open(invoice.invoice_url, '_blank')
      toast.success("Invoice opened in new tab")
    } catch (error) {
      toast.error("Failed to open invoice")
    }
  }

  const retryPayment = async (payment: Payment) => {
    if (payment.status !== 'failed') return

    try {
      toast.loading("Redirecting to payment page...")
      
      // Re-initiate payment for the same credit pack
      const { api } = await import("@/lib/api")
      const response = await api.initiatePayment(payment.credit_pack_id)
      
      window.location.href = response.paymentPageUrl
    } catch (error) {
      toast.error("Failed to retry payment")
    }
  }

  const exportHistory = () => {
    if (!filteredPayments.length) {
      toast.error("No payment data to export")
      return
    }

    const csvData = filteredPayments.map(payment => ({
      Date: format(new Date(payment.created_at), 'yyyy-MM-dd HH:mm:ss'),
      'Credit Pack': payment.credit_packs?.name || 'N/A',
      'Amount (₪)': payment.amount,
      Credits: payment.credit_packs?.credits_amount || 0,
      Status: payment.status,
      'Transaction ID': payment.hypay_transaction_id || 'N/A',
      'Invoice Number': payment.invoices?.[0]?.invoice_number || 'N/A',
      'Invoice Status': payment.invoices?.[0]?.status || 'N/A'
    }))

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => 
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payment-history-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success("Payment history exported successfully")
  }

  const clearFilters = () => {
    setSearchTerm("")
    setFilters({
      status: "all",
      dateRange: "all",
      creditPack: "all",
      amountRange: "all"
    })
  }

  const uniqueCreditPacks = Array.from(
    new Set(payments.map(p => p.credit_packs?.name).filter(Boolean))
  )

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Loading your payment history...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse flex space-x-4 p-4 border rounded">
                <div className="rounded-full bg-gray-300 h-10 w-10"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Payment History
          </CardTitle>
          <CardDescription>
            Manage and view all your payment transactions and invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by transaction ID, credit pack, or invoice..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={exportHistory}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Select value={filters.status} onValueChange={(value) => 
                setFilters(prev => ({ ...prev, status: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="succeeded">Succeeded</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.dateRange} onValueChange={(value) => 
                setFilters(prev => ({ ...prev, dateRange: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.creditPack} onValueChange={(value) => 
                setFilters(prev => ({ ...prev, creditPack: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Credit Pack" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Packs</SelectItem>
                  {uniqueCreditPacks.map(pack => (
                    <SelectItem key={pack} value={pack!}>{pack}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.amountRange} onValueChange={(value) => 
                setFilters(prev => ({ ...prev, amountRange: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Amount" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Amounts</SelectItem>
                  <SelectItem value="0-50">₪0 - ₪50</SelectItem>
                  <SelectItem value="50-100">₪50 - ₪100</SelectItem>
                  <SelectItem value="100-200">₪100 - ₪200</SelectItem>
                  <SelectItem value="200+">₪200+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(searchTerm || Object.values(filters).some(f => f !== "all")) && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
                <span className="text-sm text-muted-foreground">
                  Showing {filteredPayments.length} of {payments.length} payments
                </span>
              </div>
            )}
          </div>

          {/* Payments Table */}
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No payments found</h3>
              <p className="text-muted-foreground">
                {searchTerm || Object.values(filters).some(f => f !== "all")
                  ? "Try adjusting your search criteria"
                  : "You haven't made any payments yet"
                }
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Credit Pack</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {format(new Date(payment.created_at), 'MMM dd, yyyy')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(payment.created_at), 'HH:mm')}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {payment.credit_packs?.name || 'Unknown'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {payment.credit_packs?.credits_amount} credits
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="font-semibold">₪{payment.amount.toFixed(2)}</div>
                      </TableCell>
                      
                      <TableCell>
                        <StatusBadge status={payment.status} showIcon={true} />
                      </TableCell>
                      
                      <TableCell>
                        {payment.invoices?.[0] ? (
                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              {payment.hypay_transaction_id ? `#${payment.hypay_transaction_id}` : 'Available'}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {payment.invoices[0].status || 'Generated'}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No invoice</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {payment.invoices?.[0]?.invoice_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadInvoice(payment)}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {payment.status === 'failed' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => retryPayment(payment)}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              toast.success(`Transaction ID: ${payment.hypay_transaction_id || 'N/A'}`)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
