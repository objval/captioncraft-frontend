import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { DateDisplay } from "@/components/shared/DateDisplay"
import { EmptyState } from "@/components/shared/EmptyState"
import { CreditCard, Receipt, FileText } from "lucide-react"
import type { Payment } from "@/lib/api"

interface PaymentHistoryProps {
  payments: Payment[]
  loadingPayments: boolean
  onBuyCredits?: () => void
}

export function PaymentHistory({ payments, loadingPayments, onBuyCredits }: PaymentHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-slate-600" />
          Purchase History
        </CardTitle>
        <CardDescription>Your recent credit purchases</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {loadingPayments ? (
            // Loading state for payments
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-slate-200" />
                  <div>
                    <div className="h-4 w-28 bg-slate-200 rounded mb-1" />
                    <div className="h-3 w-20 bg-slate-200 rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="h-4 w-16 bg-slate-200 rounded mb-1" />
                    <div className="h-3 w-20 bg-slate-200 rounded" />
                  </div>
                  <div className="h-6 w-16 bg-slate-200 rounded-full" />
                </div>
              </div>
            ))
          ) : payments.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No purchases yet"
              description="Your purchase history will appear here after your first credit purchase"
              action={onBuyCredits ? {
                label: "Buy Credits",
                onClick: onBuyCredits,
                variant: "outline"
              } : undefined}
              className="py-8"
            />
          ) : (
            payments.slice(0, 5).map((payment) => {
              const invoice = payment.invoices?.[0]
              const hasInvoice = invoice?.invoice_url && payment.status === 'succeeded'
              
              return (
                <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100">
                      <CreditCard className="h-4 w-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {payment.credit_pack?.name || 'Credit Purchase'}
                      </p>
                      <DateDisplay date={payment.created_at} format="relative" className="text-xs text-slate-500" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="font-semibold">₪{payment.amount.toFixed(2)}</p>
                      <p className="text-xs text-slate-500">
                        {payment.credit_pack?.credits_amount || 0} credits
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <StatusBadge status={payment.status} showIcon={false} className="text-xs" />
                      {hasInvoice && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(invoice.invoice_url, '_blank')
                          }}
                          title="View Invoice"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}