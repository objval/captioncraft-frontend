import { createClient } from '@/utils/supabase/server'
import { paymentLogger } from './payment-logger'

export interface IdempotencyRecord {
  id?: string
  key: string // Using 'key' to match your existing table
  user_id?: string
  payment_id?: string
  request_hash: string
  response_data: any
  status: 'pending' | 'completed' | 'failed'
  created_at: string
  updated_at: string
  expires_at: string
}

export class IdempotencyService {
  private supabase: Awaited<ReturnType<typeof createClient>>

  private constructor(supabaseClient: Awaited<ReturnType<typeof createClient>>) {
    this.supabase = supabaseClient
  }

  static async create() {
    const supabase = await createClient()
    return new IdempotencyService(supabase)
  }

  static async create() {
    const supabase = await createClient()
    return new IdempotencyService(supabase)
  }

  /**
   * Generate a hash of the request parameters for idempotency checking
   */
  private generateRequestHash(params: Record<string, any>): string {
    const crypto = require('crypto')
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key]
        return result
      }, {} as Record<string, any>)
    
    const paramString = JSON.stringify(sortedParams)
    return crypto.createHash('sha256').update(paramString).digest('hex')
  }

  /**
   * Check if a request with the same idempotency key already exists
   */
  async checkIdempotency(
    idempotencyKey: string,
    requestParams: Record<string, any>
  ): Promise<{
    exists: boolean
    record?: IdempotencyRecord
    shouldRetry: boolean
  }> {
    try {
      const requestHash = this.generateRequestHash(requestParams)
      
      const { data: existingRecord, error } = await this.supabase
        .from('idempotency_keys')
        .select('*')
        .eq('key', idempotencyKey)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error
      }

      if (!existingRecord) {
        return { exists: false, shouldRetry: false }
      }

      // Check if the request parameters match
      if (existingRecord.request_hash !== requestHash) {
        paymentLogger.log('error', 'idempotency_key_collision', {
          idempotencyKey,
          existingHash: existingRecord.request_hash,
          newHash: requestHash,
          metadata: { 
            existingRecordId: existingRecord.id || existingRecord.key,
            status: existingRecord.status
          }
        })

        throw new Error('Idempotency key collision: same key used for different request parameters')
      }

      // Check if the record has expired
      if (new Date(existingRecord.expires_at) < new Date()) {
        paymentLogger.log('info', 'idempotency_key_expired', {
          idempotencyKey,
          metadata: { 
            recordId: existingRecord.id,
            expiresAt: existingRecord.expires_at
          }
        })

        // Remove expired record
        await this.supabase
          .from('idempotency_keys')
          .delete()
          .eq('id', existingRecord.id)

        return { exists: false, shouldRetry: false }
      }

      // Determine if we should retry based on status
      const shouldRetry = existingRecord.status === 'pending'

      return { 
        exists: true, 
        record: existingRecord, 
        shouldRetry 
      }

    } catch (error) {
      paymentLogger.log('error', 'idempotency_check_failed', {
        idempotencyKey,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      })
      throw error
    }
  }

  /**
   * Create a new idempotency record
   */
  async createIdempotencyRecord(
    idempotencyKey: string,
    requestParams: Record<string, any>,
    userId: string,
    expiresInMinutes: number = 60
  ): Promise<string> {
    try {
      const requestHash = this.generateRequestHash(requestParams)
      const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000)

      const { data, error } = await this.supabase
        .from('idempotency_keys')
        .insert({
          key: idempotencyKey,
          user_id: userId,
          request_hash: requestHash,
          status: 'pending',
          expires_at: expiresAt.toISOString()
        })
        .select('id')
        .single()

      if (error) {
        throw error
      }

      paymentLogger.log('info', 'idempotency_record_created', {
        idempotencyKey,
        recordId: data.id,
        metadata: { 
          requestHash,
          expiresAt: expiresAt.toISOString()
        }
      })

      return data.id

    } catch (error) {
      paymentLogger.log('error', 'idempotency_record_creation_failed', {
        idempotencyKey,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      })
      throw error
    }
  }

  /**
   * Update idempotency record with response data
   */
  async updateIdempotencyRecord(
    idempotencyKey: string,
    status: 'completed' | 'failed',
    responseData: any
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('idempotency_keys')
        .update({
          status,
          response_data: responseData,
          updated_at: new Date().toISOString()
        })
        .eq('key', idempotencyKey)

      if (error) {
        throw error
      }

      paymentLogger.log('info', 'idempotency_record_updated', {
        idempotencyKey,
        status,
        metadata: { 
          responseDataSize: JSON.stringify(responseData).length
        }
      })

    } catch (error) {
      paymentLogger.log('error', 'idempotency_record_update_failed', {
        idempotencyKey,
        status,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      })
      throw error
    }
  }

  /**
   * Generate a unique idempotency key
   */
  static generateIdempotencyKey(): string {
    const crypto = require('crypto')
    const timestamp = Date.now().toString()
    const randomBytes = crypto.randomBytes(16).toString('hex')
    return `${timestamp}-${randomBytes}`
  }

  /**
   * Validate transaction ID format
   */
  static validateTransactionId(transactionId: string): boolean {
    // Transaction IDs should be UUIDs or similar format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const numericRegex = /^\d{8,}$/ // At least 8 digits for Hypay transaction IDs
    
    return uuidRegex.test(transactionId) || numericRegex.test(transactionId)
  }

  /**
   * Clean up expired idempotency records (should be run periodically)
   */
  async cleanupExpiredRecords(): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('idempotency_keys')
        .delete()
        .lt('expires_at', new Date().toISOString())
        .select('id')

      if (error) {
        throw error
      }

      const cleanedCount = data?.length || 0
      
      paymentLogger.log('info', 'idempotency_cleanup_completed', {
        cleanedCount,
        metadata: { 
          cleanupTime: new Date().toISOString()
        }
      })

      return cleanedCount

    } catch (error) {
      paymentLogger.log('error', 'idempotency_cleanup_failed', {
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      })
      throw error
    }
  }
}

/**
 * Middleware function to handle idempotency for payment requests
 */
export async function withIdempotency<T>(
  idempotencyKey: string,
  requestParams: Record<string, any>,
  operation: () => Promise<T>
): Promise<T> {
  const idempotencyService = await IdempotencyService.create()
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Authentication required for idempotency operation')
  }

  // Check if this request already exists
  const { exists, record, shouldRetry } = await idempotencyService.checkIdempotency(
    idempotencyKey,
    requestParams
  )

  if (exists && record) {
    if (record.status === 'completed') {
      // Return cached response
      paymentLogger.log('info', 'idempotency_cache_hit', {
        idempotencyKey,
        metadata: { 
          recordId: record.id,
          cachedAt: record.updated_at
        }
      })
      return record.response_data
    }

    if (record.status === 'failed') {
      // Re-throw the cached error
      throw new Error(record.response_data?.error || 'Previous request failed')
    }

    if (shouldRetry) {
      // Request is still pending, wait a bit and retry
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await withIdempotency(idempotencyKey, requestParams, operation)
    }
  }

  // Create new idempotency record
  await idempotencyService.createIdempotencyRecord(idempotencyKey, requestParams, user.id)

  try {
    // Execute the operation
    const result = await operation()

    // Mark as completed
    await idempotencyService.updateIdempotencyRecord(
      idempotencyKey,
      'completed',
      result
    )

    return result

  } catch (error) {
    // Mark as failed
    await idempotencyService.updateIdempotencyRecord(
      idempotencyKey,
      'failed',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    )

    throw error
  }
}