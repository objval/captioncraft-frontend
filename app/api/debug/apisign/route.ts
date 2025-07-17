import { NextResponse } from 'next/server'
import { getHypayConfig } from '@/lib/hypay-test-utils'

export async function GET(request: Request) {
  try {
    const config = getHypayConfig()
    
    // Test APISign request with exact parameters from docs
    const testParams = {
      Order: '12345678910',
      Info: 'test-api',
      Amount: '10',
      UTF8: 'True',
      UTF8out: 'True',
      UserId: '203269535',
      ClientName: 'Israel',
      ClientLName: 'Isareli',
      street: 'levanon 3',
      city: 'netanya',
      zip: '42361',
      phone: '098610338',
      cell: '050555555555',
      email: 'test@yaad.net',
      Tash: '2',
      FixTash: 'False',
      ShowEngTashText: 'False',
      Coin: '1',
      Postpone: 'False',
      J5: 'False',
      Sign: 'True',
      MoreData: 'True',
      sendemail: 'True',
      SendHesh: 'True',
      heshDesc: '[0~Item 1~1~8][0~Item 2~2~1]',
      Pritim: 'True',
      PageLang: 'HEB',
      tmp: '1'
    }
    
    const signParams = new URLSearchParams({
      action: 'APISign',
      What: 'SIGN',
      Masof: config.masof,
      KEY: config.apiKey,
      PassP: config.passP,
      ...testParams
    })

    const signUrl = `${config.baseUrl}?${signParams.toString()}`
    
    console.log('Testing APISign request to:', signUrl)
    
    const response = await fetch(signUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'CaptionCraft-Payment-System/1.0'
      }
    })

    const responseText = await response.text()
    
    console.log('APISign response status:', response.status)
    console.log('APISign response headers:', Object.fromEntries(response.headers.entries()))
    console.log('APISign response text:', responseText)
    
    // Try to parse as URLSearchParams
    let parsedParams = null
    try {
      const urlParams = new URLSearchParams(responseText)
      parsedParams = Object.fromEntries(urlParams.entries())
    } catch (e) {
      console.log('Failed to parse as URLSearchParams:', e)
    }
    
    return NextResponse.json({
      config: {
        testMode: config.testMode,
        masof: config.masof,
        userId: config.userId,
        baseUrl: config.baseUrl
      },
      request: {
        url: signUrl,
        params: testParams
      },
      response: {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        text: responseText,
        length: responseText.length
      },
      parsed: parsedParams
    })
  } catch (error) {
    console.error('APISign test failed:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}