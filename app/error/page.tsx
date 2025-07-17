import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react'

export default function ErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Header */}
      <header className="border-b border-slate-200/60 bg-white/95 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-base">K</span>
              </div>
              <span className="font-bold text-xl text-slate-800 tracking-tight">Kalil</span>
            </Link>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="text-slate-600 hover:text-slate-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Content */}
      <div className="flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-8">
            <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-4">
              Authentication Error
            </h1>
            <p className="text-lg text-slate-600 mb-8">
              Sorry, there was an issue with your authentication. This could be due to an expired link, invalid token, or other authentication issue.
            </p>
          </div>

          <div className="space-y-4">
            <Link href="/auth/login">
              <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                Back to Login
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="lg" variant="outline" className="w-full border-slate-300 hover:border-slate-400">
                Create New Account
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="ghost" className="w-full text-slate-600 hover:text-slate-800">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Need help?</strong> Contact our support team if you continue to experience authentication issues.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
