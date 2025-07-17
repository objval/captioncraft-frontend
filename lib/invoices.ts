import { generatePrintHeshSignature } from './hypay-crypto'

export function generatePrintHeshUrl(transId: string): string {
  const baseUrl = process.env.HYPAY_BASE_URL || 'https://pay.hyp.co.il/p/'
  const masof = process.env.HYPAY_MASOF!
  const apiKey = process.env.HYPAY_API_KEY!
  
  // Generate signature according to Hypay docs: PrintHesh${masof}${transId}EZCOUNT${apiKey}
  const signature = generatePrintHeshSignature(masof, transId, apiKey)
  
  const params = new URLSearchParams({
    action: 'PrintHesh',
    Masof: masof,
    TransId: transId,
    type: 'EZCOUNT',
    signature: signature
  })
  
  return `${baseUrl}?${params.toString()}`
}
