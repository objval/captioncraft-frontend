"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Play, Zap, Edit, Download, Sparkles, Shield, Globe, Users } from "lucide-react"
import { generateStructuredData } from "./structured-data"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Remove automatic redirect - let users see the landing page even if authenticated

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">K</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {generateStructuredData()}
      {/* Header */}
      <header className="border-b border-slate-200/60 bg-white/95 backdrop-blur-xl supports-[backdrop-filter]:bg-white/90 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-base">K</span>
              </div>
              <span className="font-bold text-xl text-slate-800 tracking-tight">Kalil</span>
            </Link>

            <div className="flex items-center space-x-3 sm:space-x-4">
              {user ? (
                // Show dashboard link for authenticated users
                <Link href="/dashboard">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                // Show auth buttons for unauthenticated users
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost" className="text-slate-600 hover:text-slate-800 hover:bg-slate-100">
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
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-[1600px] mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 rounded-full shadow-sm mb-6">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-slate-700">AI-Powered Video Captioning</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
            Transform Your Videos with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              AI Captioning
            </span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Kalil delivers professional AI-powered video transcription and caption burning.
            Perfect for content creators, educators, and businesses who want to make their videos more accessible and engaging.
          </p>

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
            <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/80 border-slate-300 hover:bg-white hover:border-slate-400 text-lg px-8 py-6">
              <Play className="h-5 w-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-slate-600">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-500" />
              <span className="text-sm font-medium">SOC2 Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">99.9% Uptime</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium">10k+ Creators</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/50">
        <div className="max-w-[1600px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800">Everything you need for professional captions</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              From upload to final video, Kalil handles the entire transcription and caption burning process with industry-leading AI technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-slate-800">AI-Powered Transcription</h3>
              <p className="text-slate-600 leading-relaxed">
                Advanced AI technology provides 99%+ accurate transcriptions with speaker identification, timestamps, and natural language processing
              </p>
            </div>

            <div className="text-center group">
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Edit className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-slate-800">Intuitive Editor</h3>
              <p className="text-slate-600 leading-relaxed">
                Powerful editor with real-time preview, timeline sync, and collaborative features. Perfect every caption with precision tools
              </p>
            </div>

            <div className="text-center group">
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Download className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-slate-800">Professional Caption Burning</h3>
              <p className="text-slate-600 leading-relaxed">
                Seamlessly burn captions directly into your video with customizable styling, positioning, and format options
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-[1600px] mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to transform your videos?</h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto text-lg">
              Join thousands of creators who trust Kalil for their video transcription and captioning needs. Start your free trial today!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link href="/dashboard">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 shadow-lg text-lg px-8 py-6">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/signup">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 shadow-lg text-lg px-8 py-6">
                    Start Free Trial
                  </Button>
                </Link>
              )}
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6">
                Talk to Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 py-12 px-4 bg-slate-50/50">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link href="/" className="flex items-center space-x-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">K</span>
                </div>
                <span className="font-bold text-lg text-slate-800">Kalil</span>
              </Link>
              <p className="text-slate-600 text-sm">
                AI-powered video captioning and transcription platform for creators, educators, and businesses.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-800 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="/features" className="hover:text-slate-800">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-slate-800">Pricing</Link></li>
                <li><Link href="/api" className="hover:text-slate-800">API</Link></li>
                <li><Link href="/integrations" className="hover:text-slate-800">Integrations</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-800 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="/about" className="hover:text-slate-800">About</Link></li>
                <li><Link href="/blog" className="hover:text-slate-800">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-slate-800">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-slate-800">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-800 mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="/help" className="hover:text-slate-800">Help Center</Link></li>
                <li><Link href="/docs" className="hover:text-slate-800">Documentation</Link></li>
                <li><Link href="/status" className="hover:text-slate-800">Status</Link></li>
                <li><Link href="/privacy" className="hover:text-slate-800">Privacy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-200 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-slate-600 text-sm">
              &copy; 2024 Kalil. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <Link href="/terms" className="text-slate-600 hover:text-slate-800 text-sm">Terms</Link>
              <Link href="/privacy" className="text-slate-600 hover:text-slate-800 text-sm">Privacy</Link>
              <Link href="/cookies" className="text-slate-600 hover:text-slate-800 text-sm">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
