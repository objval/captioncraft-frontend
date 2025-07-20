import { useEffect, useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { createClient } from "@/lib/database/supabase/client"

export function useAdmin() {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user?.id) {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      try {
        // Always check the database - never trust client storage for security
        const supabase = createClient()
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()

        if (error) {
          console.error("Error checking admin role:", error)
          setIsAdmin(false)
        } else {
          setIsAdmin(data?.role === "admin")
        }
      } catch (error) {
        console.error("Error checking admin role:", error)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    checkAdminRole()
  }, [user?.id])

  return { isAdmin, loading }
}