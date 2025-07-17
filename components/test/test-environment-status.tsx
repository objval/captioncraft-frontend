'use client'

import { useState, useEffect } from 'react'

interface EnvironmentStatus {
  success: boolean
  environment?: {
    testMode: boolean
    nodeEnv: string
    hypayTestMode: string
    masof: string
    userId: string
  }
  validation?: {
    isValid: boolean
    issues: string[]
  }
  testCard?: {
    number: string
    cvv: string
    expiry: string
    testIds: string[]
  }
  status?: string
  message?: string
  error?: string
}

export function TestEnvironmentStatus() {
  const [status, setStatus] = useState<EnvironmentStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/test/environment')
      .then(res => res.json())
      .then(data => {
        setStatus(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Failed to check environment:', error)
        setStatus({ success: false, error: error.message })
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <p>Checking test environment...</p>
      </div>
    )
  }

  if (!status?.success) {
    return (
      <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
        <h3 className="font-bold text-red-800">Environment Check Failed</h3>
        <p className="text-red-700">{status?.error || 'Unknown error'}</p>
      </div>
    )
  }

  const isTestMode = status.environment?.testMode

  return (
    <div className={`p-4 border rounded-lg ${
      isTestMode ? 'bg-yellow-50 border-yellow-300' : 'bg-red-50 border-red-300'
    }`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{isTestMode ? '🧪' : '💳'}</span>
        <h3 className={`font-bold ${
          isTestMode ? 'text-yellow-800' : 'text-red-800'
        }`}>
          {status.status?.replace('_', ' ')}
        </h3>
      </div>

      <p className={`mb-4 ${
        isTestMode ? 'text-yellow-700' : 'text-red-700'
      }`}>
        {status.message}
      </p>

      <div className="space-y-2 text-sm">
        <div>
          <strong>Environment:</strong> {status.environment?.nodeEnv}
        </div>
        <div>
          <strong>Test Mode Flag:</strong> {status.environment?.hypayTestMode}
        </div>
        <div>
          <strong>Terminal:</strong> {status.environment?.masof}
        </div>
        <div>
          <strong>User ID:</strong> {status.environment?.userId}
        </div>
      </div>

      {isTestMode && status.testCard && (
        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded">
          <h4 className="font-bold text-yellow-800 mb-2">Test Card Details:</h4>
          <div className="space-y-1 text-sm text-yellow-700">
            <div><strong>Card:</strong> {status.testCard.number}</div>
            <div><strong>CVV:</strong> {status.testCard.cvv}</div>
            <div><strong>Expiry:</strong> {status.testCard.expiry}</div>
            <div><strong>Test IDs:</strong> {status.testCard.testIds.join(', ')}</div>
          </div>
        </div>
      )}

      {status.validation && !status.validation.isValid && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded">
          <h4 className="font-bold text-red-800 mb-2">Validation Issues:</h4>
          <ul className="list-disc list-inside text-sm text-red-700">
            {status.validation.issues.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {status.validation?.isValid && (
        <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded">
          <p className="text-green-800 font-medium">✅ Environment validation passed</p>
        </div>
      )}
    </div>
  )
}