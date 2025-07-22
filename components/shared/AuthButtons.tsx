"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { User } from "@supabase/supabase-js"

interface AuthButtonsProps {
  user: User | null
}

export function AuthButtons({ user }: AuthButtonsProps) {
  return (
    <div className="flex items-center space-x-3 sm:space-x-4">
      {user ? (
        <Link href="/dashboard">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
            Go to Dashboard
          </Button>
        </Link>
      ) : (
        <>
          <Link href="/auth/login">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-accent">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
              Get Started
            </Button>
          </Link>
        </>
      )}
    </div>
  )
}

export function HeroAuthButtons({ user }: AuthButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
      {user ? (
        <Link href="/dashboard">
          <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg text-lg px-8 py-6">
            Go to Dashboard
          </Button>
        </Link>
      ) : (
        <Link href="/auth/signup">
          <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg text-lg px-8 py-6">
            Start Free Trial
          </Button>
        </Link>
      )}
      <Button size="lg" variant="outline" className="w-full sm:w-auto bg-card/80 border-border hover:bg-card hover:border-border text-lg px-8 py-6">
        <Play className="h-5 w-5 mr-2" />
        Watch Demo
      </Button>
    </div>
  )
}

import { Play } from "lucide-react"

export function CTAAuthButtons({ user }: AuthButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      {user ? (
        <Link href="/dashboard">
          <Button size="lg" className="w-full sm:w-auto bg-background text-primary hover:bg-primary/10 shadow-lg text-lg px-8 py-6">
            Go to Dashboard
          </Button>
        </Link>
      ) : (
        <Link href="/auth/signup">
          <Button size="lg" className="w-full sm:w-auto bg-background text-primary hover:bg-primary/10 shadow-lg text-lg px-8 py-6">
            Start Free Trial
          </Button>
        </Link>
      )}
      <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6">
        Talk to Sales
      </Button>
    </div>
  )
}