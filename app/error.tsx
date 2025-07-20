'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

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
        <div className="text-center max-w-2xl mx-auto">
          {/* Error Icon */}
          <div className="mb-8">
            <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
              Oops! Something went wrong
            </h1>
            <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
              We encountered an unexpected error. Don&apos;t worry, our team has been notified and is working to fix this issue.
            </p>
          </div>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-left">
              <h3 className="font-semibold text-red-800 mb-2">Error Details (Development Mode)</h3>
              <code className="text-sm text-red-700 break-all block">
                {error.message}
              </code>
              {error.digest && (
                <div className="mt-2 text-xs text-red-600">
                  Error ID: {error.digest}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              onClick={() => reset()}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-300 hover:border-slate-400">
                <Home className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-white/80 backdrop-blur-xl rounded-xl p-6 border border-slate-200/60 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Need Help?</h3>
              <p className="text-slate-600 text-sm mb-4">
                Contact our support team if this error persists
              </p>
              <Button variant="outline" size="sm" className="border-blue-300 hover:border-blue-400 text-blue-700 hover:bg-blue-50">
                Contact Support
              </Button>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-xl p-6 border border-slate-200/60 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Report Bug</h3>
              <p className="text-slate-600 text-sm mb-4">
                Help us improve by reporting this issue
              </p>
              <Button variant="outline" size="sm" className="border-purple-300 hover:border-purple-400 text-purple-700 hover:bg-purple-50">
                Report Issue
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}