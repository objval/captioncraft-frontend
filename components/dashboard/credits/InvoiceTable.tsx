import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { DateDisplay } from "@/components/shared/DateDisplay"
import { Receipt, FileText, ExternalLink } from "lucide-react"
import type { Payment } from "@/lib/api/api"

interface InvoiceTableProps {
  payments: Payment[]
}

export function InvoiceTable({ payments }: InvoiceTableProps) {
  const successfulPayments = payments.filter(p => p.status === 'succeeded')
  
  if (payments.length <= 5) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-slate-600" />
            Complete Purchase History
          </span>
          <span className="text-sm font-normal text-slate-600">
            {successfulPayments.length} successful purchases
          </span>
        </CardTitle>
        <CardDescription>All your credit purchases with downloadable invoices</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-sm text-slate-700">Date</th>
                <th className="text-left py-3 px-4 font-medium text-sm text-slate-700">Package</th>
                <th className="text-right py-3 px-4 font-medium text-sm text-slate-700">Credits</th>
                <th className="text-right py-3 px-4 font-medium text-sm text-slate-700">Amount</th>
                <th className="text-center py-3 px-4 font-medium text-sm text-slate-700">Status</th>
                <th className="text-center py-3 px-4 font-medium text-sm text-slate-700">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => {
                const invoice = payment.invoices?.[0]
                const hasInvoice = invoice?.invoice_url && payment.status === 'succeeded'
                
                return (
                  <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <DateDisplay date={payment.created_at} format="smart" className="text-sm text-slate-600" />
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-sm">{payment.credit_pack?.name || 'Credit Purchase'}</p>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <p className="text-sm font-medium">{payment.credit_pack?.credits_amount || 0}</p>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <p className="font-semibold text-sm">₪{payment.amount.toFixed(2)}</p>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={payment.status} showIcon={true} className="text-xs" />
                    </td>
                    <td className="py-3 px-4 text-center">
                      {hasInvoice ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1"
                          onClick={() => window.open(invoice.invoice_url, '_blank')}
                        >
                          <FileText className="h-3 w-3" />
                          <span className="hidden sm:inline">Invoice</span>
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}