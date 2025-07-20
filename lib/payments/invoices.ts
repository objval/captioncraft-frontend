/**
 * Generate PrintHesh URL by requesting signature from Hypay's APISign service
 * According to Hypay docs, the signature must be obtained via APISign request
 */
export async function generatePrintHeshUrl(transId: string): Promise<string> {
  // PrintHesh requires the yaadpay3ds.pl endpoint, not the generic /p/ endpoint
  const baseUrl = 'https://pay.hyp.co.il/cgi-bin/yaadpay/yaadpay3ds.pl'
  const masof = process.env.HYPAY_MASOF!
  const apiKey = process.env.HYPAY_API_KEY!
  const passP = process.env.HYPAY_PASS_P!
  
  // Step 1: Request signature from Hypay's APISign service
  const signatureRequestParams = new URLSearchParams({
    action: 'APISign',
    What: 'SIGN',
    Masof: masof,
    KEY: apiKey,
    PassP: passP,
    TransId: transId,
    type: 'EZCOUNT',
    ACTION: 'PrintHesh' // Note: uppercase for ACTION parameter
  })
  
  const signatureUrl = `${baseUrl}?${signatureRequestParams.toString()}`
  
  try {
    // Requesting PrintHesh signature
    const response = await fetch(signatureUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const responseText = await response.text()
    // PrintHesh signature response received
    
    // Step 2: Parse the response to get the signature
    const responseParams = new URLSearchParams(responseText)
    const signature = responseParams.get('signature')
    
    if (!signature) {
      throw new Error('No signature returned from PrintHesh request')
    }
    
    // Step 3: Build the final PrintHesh URL
    const printHeshParams = new URLSearchParams({
      action: 'PrintHesh',
      Masof: masof,
      TransId: transId,
      type: 'EZCOUNT',
      signature: signature
    })
    
    return `${baseUrl}?${printHeshParams.toString()}`
    
  } catch (error) {
    // Error generating PrintHesh URL - will be caught by caller
    throw new Error(`Failed to generate PrintHesh URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
