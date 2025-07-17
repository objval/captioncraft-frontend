export function generatePrintHeshUrl(transId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_HYPAY_BASE_URL || 'https://pay.hyp.co.il/p/'
  const masof = process.env.NEXT_PUBLIC_HYPAY_MASOF_ID || '4501961334'
  const params = new URLSearchParams({
    action: 'PrintHesh',
    Masof: masof,
    TransId: transId,
    type: 'EZCOUNT'
  })
  return `${baseUrl}?${params.toString()}`
}
