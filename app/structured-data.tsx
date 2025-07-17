import { Metadata } from 'next'

export const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Kalil',
  description: 'AI-powered video captioning and transcription platform for creators, educators, and businesses.',
  url: 'https://kalil.pro',
  applicationCategory: 'VideoEditing',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free trial available'
  },
  creator: {
    '@type': 'Organization',
    name: 'Kalil',
    url: 'https://kalil.pro'
  },
  screenshot: 'https://kalil.pro/screenshot.png',
  featureList: [
    'AI-powered video transcription',
    'Caption burning',
    'Real-time editing',
    'Multiple format support',
    'Batch processing'
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '1250',
    bestRating: '5'
  }
}

export const organizationData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Kalil',
  url: 'https://kalil.pro',
  logo: 'https://kalil.pro/logo.png',
  description: 'AI-powered video captioning and transcription platform',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    url: 'https://kalil.pro/contact'
  },
  sameAs: [
    'https://twitter.com/kalil_ai',
    'https://linkedin.com/company/kalil-ai'
  ]
}

export const faqData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What video formats does Kalil support?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Kalil supports all major video formats including MP4, MOV, AVI, WMV, and more. Our AI can process videos up to 4K resolution.'
      }
    },
    {
      '@type': 'Question',
      name: 'How accurate is the AI transcription?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Our AI achieves 99%+ accuracy for clear audio in English, with support for multiple languages and accents.'
      }
    },
    {
      '@type': 'Question',
      name: 'Can I edit the generated captions?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Kalil includes a powerful editor where you can refine transcripts, adjust timing, and customize styling before burning captions.'
      }
    }
  ]
}

export function generateStructuredData() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationData)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqData)
        }}
      />
    </>
  )
}