import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package } from "lucide-react"
import type { CreditPack } from "@/lib/api/api"

interface CreditPacksGridProps {
  creditPacks: CreditPack[]
  loadingPacks: boolean
  purchasing: string | null
  onPurchase: (pack: CreditPack) => void
}

export function CreditPacksGrid({
  creditPacks,
  loadingPacks,
  purchasing,
  onPurchase,
}: CreditPacksGridProps) {
  return (
    <div id="buy-credits">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Buy Credits</h2>
        <p className="text-sm text-muted-foreground">1 credit = 1 video upload</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingPacks ? (
          // Loading state for credit packs
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-5 w-5 bg-muted rounded" />
                  <div className="h-5 w-24 bg-muted rounded" />
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="h-8 w-20 bg-muted rounded mb-1" />
                    <div className="h-4 w-16 bg-muted rounded" />
                  </div>
                  <div className="pt-3 border-t border-border">
                    <div className="h-7 w-16 bg-muted rounded mb-1" />
                    <div className="h-3 w-24 bg-muted rounded" />
                  </div>
                  <div className="h-10 w-full bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          creditPacks.map((pack) => {
            const isPopular = pack.credits_amount === 100
            const pricePerCredit = pack.price_nis / pack.credits_amount
            
            return (
              <Card 
                key={pack.id} 
                className={`relative overflow-hidden transition-all hover:shadow-lg hover:scale-105 cursor-pointer ${
                  isPopular ? 'ring-2 ring-blue-500 shadow-lg' : ''
                }`}
                onClick={() => onPurchase(pack)}
              >
                {isPopular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
                    POPULAR
                  </div>
                )}
                
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold text-lg">{pack.name}</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-3xl font-bold text-foreground">{pack.credits_amount}</p>
                      <p className="text-sm text-muted-foreground">credits</p>
                    </div>
                    
                    <div className="pt-3 border-t border-border">
                      <p className="text-2xl font-bold text-foreground">₪{pack.price_nis}</p>
                      <p className="text-xs text-muted-foreground">₪{pricePerCredit.toFixed(2)} per credit</p>
                    </div>
                    
                    <Button 
                      className="w-full"
                      variant={isPopular ? "default" : "outline"}
                      disabled={purchasing === pack.id}
                    >
                      {purchasing === pack.id ? (
                        <span className="flex items-center gap-2">
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        <>Purchase</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}