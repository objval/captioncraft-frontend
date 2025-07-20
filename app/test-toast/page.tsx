"use client"

import { Button } from "@/components/ui/button"
import toast from "@/lib/utils/toast"

export default function TestToastPage() {
  const testToasts = () => {
    // Test basic toasts
    toast.success("Success toast!")
    
    setTimeout(() => {
      toast.error("Error toast!")
    }, 1000)
    
    setTimeout(() => {
      toast.warning("Warning toast!")
    }, 2000)
    
    setTimeout(() => {
      toast.info("Info toast!")
    }, 3000)
    
    // Test loading toast with update
    setTimeout(() => {
      const id = toast.loading("Loading something...", { id: "test-loading" })
      
      setTimeout(() => {
        toast.success("Loading complete!", { id: "test-loading" })
      }, 2000)
    }, 4000)
  }
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Test Toast Notifications</h1>
      <Button onClick={testToasts}>Test All Toast Types</Button>
    </div>
  )
}