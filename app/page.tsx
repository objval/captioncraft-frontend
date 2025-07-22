import { createClient } from "@/lib/database/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Play, Zap, Edit, Download, Sparkles, Shield, Globe, Users } from "lucide-react"
import { generateStructuredData } from "./structured-data"
import { AuthButtons, HeroAuthButtons, CTAAuthButtons } from "@/components/shared/AuthButtons"

export default async function HomePage() {
  // Get user on server side
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-background">
      {generateStructuredData()}
      {/* Header */}
      <header className="border-b border-border bg-card/95 backdrop-blur-xl supports-[backdrop-filter]:bg-card/90 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-base">K</span>
              </div>
              <span className="font-bold text-xl text-foreground tracking-tight">Kalil</span>
            </Link>

            <AuthButtons user={user} />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-[1600px] mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full shadow-sm mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">AI-Powered Video Captioning</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
            Transform Your Videos with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              AI Captioning
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Kalil delivers professional AI-powered video transcription and caption burning.
            Perfect for content creators, educators, and businesses who want to make their videos more accessible and engaging.
          </p>

          <HeroAuthButtons user={user} />

          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
              <span className="text-sm font-medium">SOC2 Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">99.9% Uptime</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-accent-foreground" />
              <span className="text-sm font-medium">10k+ Creators</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card/50">
        <div className="max-w-[1600px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Everything you need for professional captions</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              From upload to final video, Kalil handles the entire transcription and caption burning process with industry-leading AI technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:bg-primary/20">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">AI-Powered Transcription</h3>
              <p className="text-muted-foreground leading-relaxed">
                Advanced AI technology provides 99%+ accurate transcriptions with speaker identification, timestamps, and natural language processing
              </p>
            </div>

            <div className="text-center group">
              <div className="h-16 w-16 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:bg-accent/20">
                <Edit className="h-8 w-8 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Intuitive Editor</h3>
              <p className="text-muted-foreground leading-relaxed">
                Powerful editor with real-time preview, timeline sync, and collaborative features. Perfect every caption with precision tools
              </p>
            </div>

            <div className="text-center group">
              <div className="h-16 w-16 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:bg-emerald-500/20 dark:group-hover:bg-emerald-500/30">
                <Download className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Professional Caption Burning</h3>
              <p className="text-muted-foreground leading-relaxed">
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

            <CTAAuthButtons user={user} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 bg-muted/50">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link href="/" className="flex items-center space-x-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">K</span>
                </div>
                <span className="font-bold text-lg text-foreground">Kalil</span>
              </Link>
              <p className="text-muted-foreground text-sm">
                AI-powered video captioning and transcription platform for creators, educators, and businesses.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/features" className="hover:text-foreground">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
                <li><Link href="/api" className="hover:text-foreground">API</Link></li>
                <li><Link href="/integrations" className="hover:text-foreground">Integrations</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground">About</Link></li>
                <li><Link href="/blog" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-foreground">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/help" className="hover:text-foreground">Help Center</Link></li>
                <li><Link href="/docs" className="hover:text-foreground">Documentation</Link></li>
                <li><Link href="/status" className="hover:text-foreground">Status</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground">Privacy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              &copy; 2024 Kalil. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <Link href="/terms" className="text-muted-foreground hover:text-foreground text-sm">Terms</Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground text-sm">Privacy</Link>
              <Link href="/cookies" className="text-muted-foreground hover:text-foreground text-sm">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}