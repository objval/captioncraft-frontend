import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/providers/auth-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    template: '%s | Kalil - AI Video Captioning',
    default: 'Kalil - AI Video Captioning & Transcription Platform'
  },
  description: 'Transform your videos with AI-powered transcription and seamlessly burn captions directly into your content. Professional video captioning service for content creators, educators, and businesses.',
  keywords: [
    'video transcription',
    'ai captioning',
    'caption burning',
    'video subtitles',
    'automatic transcription',
    'content creation',
    'video editing',
    'accessibility',
    'kalil',
    'ai video processing'
  ],
  authors: [{ name: 'Kalil Team' }],
  creator: 'Kalil',
  publisher: 'Kalil',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://kalil.pro'),
  alternates: {
    canonical: 'https://kalil.pro',
  },
  openGraph: {
    title: 'Kalil - AI Video Captioning & Transcription Platform',
    description: 'Transform your videos with AI-powered transcription and seamlessly burn captions directly into your content. Professional video captioning service for content creators, educators, and businesses.',
    url: 'https://kalil.pro',
    siteName: 'Kalil',
    images: [
      {
        url: 'https://kalil.pro/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Kalil - AI Video Captioning Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kalil - AI Video Captioning & Transcription Platform',
    description: 'Transform your videos with AI-powered transcription and seamlessly burn captions directly into your content.',
    images: ['https://kalil.pro/og-image.jpg'],
    creator: '@kalil_ai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  category: 'technology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster richColors position="top-center" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
