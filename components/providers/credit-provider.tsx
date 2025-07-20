"use client"

import React, { createContext, useContext } from "react"
import { useCreditBalance } from "@/hooks/credits"

interface CreditContextType {
  credits: number
  loading: boolean
  error: string | null
  refreshCredits: () => Promise<void>
}

const CreditContext = createContext<CreditContextType | undefined>(undefined)

export function CreditProvider({ 
  children, 
  userId,
  initialCredits 
}: { 
  children: React.ReactNode
  userId?: string
  initialCredits?: number
}) {
  const creditData = useCreditBalance(userId, { initialCredits })
  
  return (
    <CreditContext.Provider value={creditData}>
      {children}
    </CreditContext.Provider>
  )
}

export function useCredits() {
  const context = useContext(CreditContext)
  if (!context) {
    throw new Error("useCredits must be used within a CreditProvider")
  }
  return context
}