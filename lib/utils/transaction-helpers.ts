export function formatTransactionReason(reason: string | null): string {
  if (!reason) return 'Video Processing'
  
  // Map of transaction reasons to user-friendly text
  const reasonMap: Record<string, string> = {
    'credit_purchase': 'Credit Purchase',
    'welcome_bonus': 'Welcome Bonus',
    'video_processing': 'Video Processing',
    'video_upload': 'Video Upload',
    'caption_burning': 'Caption Burning',
    'transcription': 'Transcription',
    'refund': 'Refund',
    'bonus': 'Bonus Credits',
    'promo': 'Promotional Credits',
    'referral': 'Referral Bonus',
    'subscription': 'Subscription Credits',
    'trial': 'Trial Credits'
  }
  
  // Convert snake_case to readable format if not in map
  const formatted = reasonMap[reason.toLowerCase()] || 
    reason
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  
  return formatted
}

export function getTransactionIcon(reason: string | null, amount: number) {
  // Positive amounts (credits added)
  if (amount > 0) {
    if (!reason) return 'TrendingUp'
    
    const reason_lower = reason.toLowerCase()
    if (reason_lower.includes('purchase')) return 'CreditCard'
    if (reason_lower.includes('bonus')) return 'Gift'
    if (reason_lower.includes('welcome')) return 'Sparkles'
    if (reason_lower.includes('refund')) return 'RefreshCcw'
    if (reason_lower.includes('referral')) return 'Users'
    if (reason_lower.includes('promo')) return 'Tag'
    return 'TrendingUp'
  }
  
  // Negative amounts (credits used)
  if (!reason) return 'Video'
  
  const reason_lower = reason.toLowerCase()
  if (reason_lower.includes('video') || reason_lower.includes('processing')) return 'Video'
  if (reason_lower.includes('caption') || reason_lower.includes('burning')) return 'Captions'
  if (reason_lower.includes('transcription')) return 'FileText'
  return 'TrendingDown'
}