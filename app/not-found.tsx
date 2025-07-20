'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Home, Search, Video } from 'lucide-react'

export default function NotFound() {
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
              <Link href="/auth/login">
                <Button variant="ghost" className="text-slate-600 hover:text-slate-800">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 404 Content */}
      <div className="flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-2xl mx-auto">
          {/* Large 404 */}
          <div className="mb-8">
            <div className="text-[120px] sm:text-[200px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 leading-none">
              404
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4">
              Page Not Found
            </div>
            <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
              Sorry, we couldn&apos;t find the page you&apos;re looking for. The page might have been moved, deleted, or you may have mistyped the URL.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-300 hover:border-slate-400">
                <Video className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
            </Link>
          </div>

          {/* Helpful Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-white/80 backdrop-blur-xl rounded-xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                <Video className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Video Gallery</h3>
              <p className="text-slate-600 text-sm mb-4">
                View all your uploaded videos and their transcription status
              </p>
              <Link href="/dashboard/gallery">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  Browse Videos
                </Button>
              </Link>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Help Center</h3>
              <p className="text-slate-600 text-sm mb-4">
                Find answers to common questions and learn how to use Kalil
              </p>
              <Link href="/help">
                <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                  Get Help
                </Button>
              </Link>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <ArrowLeft className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Go Back</h3>
              <p className="text-slate-600 text-sm mb-4">
                Return to the previous page you were visiting
              </p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                onClick={() => window.history.back()}
              >
                Previous Page
              </Button>
            </div>
          </div>

          {/* Contact Support */}
          <div className="mt-16 p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200/50">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Still need help?</h3>
            <p className="text-slate-600 mb-4">
              If you believe this is an error or need assistance, please contact our support team.
            </p>
            <Button variant="outline" className="border-blue-300 hover:border-blue-400 text-blue-700 hover:bg-blue-50">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}