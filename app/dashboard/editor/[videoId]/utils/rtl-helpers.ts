// Helper function to detect RTL languages
export const isRTLLanguage = (language?: string): boolean => {
  if (!language) return false
  const rtlLanguages = ['ar', 'he', 'fa', 'ur', 'yi', 'iw', 'ji', 'ku', 'ps', 'sd']
  return rtlLanguages.includes(language.toLowerCase().substring(0, 2))
}

// Helper function to get text direction
export const getTextDirection = (language?: string): 'ltr' | 'rtl' => {
  return isRTLLanguage(language) ? 'rtl' : 'ltr'
}