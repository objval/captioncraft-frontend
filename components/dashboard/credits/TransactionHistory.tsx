import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DateDisplay } from "@/components/shared/DateDisplay"
import { EmptyState } from "@/components/shared/EmptyState"
import { formatTransactionReason } from "@/lib/utils/transaction-helpers"
import { 
  Coins, 
  CreditCard, 
  TrendingUp,
  TrendingDown,
  Gift,
  RefreshCcw,
  Users,
  Tag,
  Video,
  Captions,
  FileText,
  Sparkles
} from "lucide-react"
import type { Transaction } from "@/lib/api/api"

interface TransactionHistoryProps {
  transactions: Transaction[]
  transactionsLoading: boolean
}

export function TransactionHistory({ transactions, transactionsLoading }: TransactionHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-muted-foreground" />
          Recent Credit Usage
        </CardTitle>
        <CardDescription>Your latest video processing activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactionsLoading ? (
            // Loading state for transactions
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted" />
                  <div>
                    <div className="h-4 w-32 bg-muted rounded mb-1" />
                    <div className="h-3 w-20 bg-muted rounded" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 w-12 bg-muted rounded mb-1" />
                  <div className="h-3 w-20 bg-muted rounded" />
                </div>
              </div>
            ))
          ) : transactions.length === 0 ? (
            <EmptyState
              icon={Coins}
              title="No transactions yet"
              description="Your credit usage will appear here when you process videos"
              className="py-8"
            />
          ) : (
            transactions.slice(0, 5).map((transaction) => {
              const reason = transaction.reason?.toLowerCase() || ''
              const isCredit = transaction.amount_changed > 0
              
              // Determine icon based on transaction type
              let Icon = isCredit ? TrendingUp : Video
              if (isCredit) {
                if (reason.includes('purchase')) Icon = CreditCard
                else if (reason.includes('bonus')) Icon = Gift
                else if (reason.includes('welcome')) Icon = Sparkles
                else if (reason.includes('refund')) Icon = RefreshCcw
                else if (reason.includes('referral')) Icon = Users
                else if (reason.includes('promo')) Icon = Tag
              } else {
                if (reason.includes('caption') || reason.includes('burning')) Icon = Captions
                else if (reason.includes('transcription')) Icon = FileText
              }
              
              return (
                <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isCredit
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {formatTransactionReason(transaction.reason, transaction.amount_changed)}
                      </p>
                      <DateDisplay date={transaction.created_at} format="relative" className="text-xs text-muted-foreground" />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      isCredit ? 'text-green-600' : 'text-foreground'
                    }`}>
                      {isCredit ? '+' : ''}{transaction.amount_changed}
                    </p>
                    <p className="text-xs text-muted-foreground">Balance: {transaction.balance_after}</p>
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