'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center px-4">
          <div className="text-center max-w-2xl mx-auto">
            {/* Error Icon */}
            <div className="mb-8">
              <div className="h-24 w-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="h-12 w-12 text-red-600" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
                Something went wrong!
              </h1>
              <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
                We're sorry, but something unexpected happened. Our team has been notified and is working to fix this issue.
              </p>
            </div>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-left">
                <h3 className="font-semibold text-red-800 mb-2">Error Details (Development Mode)</h3>
                <code className="text-sm text-red-700 break-all">
                  {error.message}
                </code>
                {error.digest && (
                  <div className="mt-2 text-xs text-red-600">
                    Digest: {error.digest}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg" 
                onClick={reset}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Link href="/">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-300 hover:border-slate-400">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </Link>
            </div>

            {/* Support Information */}
            <div className="bg-white/80 backdrop-blur-xl rounded-xl p-6 border border-slate-200/60 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Need Help?</h3>
              <p className="text-slate-600 mb-4">
                If this error persists, please contact our support team with the following information:
              </p>
              <ul className="text-sm text-slate-600 space-y-1 mb-4">
                <li>• What you were doing when the error occurred</li>
                <li>• The time when the error happened</li>
                <li>• Your browser and operating system</li>
                {error.digest && <li>• Error ID: {error.digest}</li>}
              </ul>
              <Button variant="outline" className="border-blue-300 hover:border-blue-400 text-blue-700 hover:bg-blue-50">
                Contact Support
              </Button>
            </div>

            {/* Branding */}
            <div className="mt-8 flex items-center justify-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="font-bold text-lg text-slate-800 tracking-tight">Kalil</span>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}