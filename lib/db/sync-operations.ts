// ==========================================
// lib/db/sync-operations.ts
// Manage raw data ingestion and sync results
// ==========================================

import { prisma } from '../prisma'

// Save raw data payload
export async function saveRawPlatformData(data: {
  connection_id: string
  endpoint_id: string
  raw_payload: any
  processed?: boolean
  mapped_to_audit_log?: boolean
  audit_log_ids?: string[]
  processing_errors?: any
}) {
  try {
    const record = await prisma.raw_platform_data.create({
      data: {
        connection_id: data.connection_id,
        endpoint_id: data.endpoint_id,
        raw_payload: data.raw_payload,
        processed: data.processed ?? false,
        mapped_to_audit_log: data.mapped_to_audit_log ?? false,
        audit_log_ids: data.audit_log_ids ?? [],
        processing_errors: data.processing_errors ?? {},
      },
    })
    return record
  } catch (error) {
    console.error('❌ Error saving raw platform data:', error)
    throw new Error('Failed to save raw platform data.')
  }
}

// Save sync result
export async function saveSyncResult(data: {
  connection_id: string
  duration_ms: number
  status: string
  stats?: any
  errors?: any
}) {
  try {
    const result = await prisma.sync_results.create({
      data: {
        connection_id: data.connection_id,
        duration_ms: data.duration_ms,
        status: data.status,
        stats: data.stats ?? {},
        errors: data.errors ?? {},
      },
    })
    return result
  } catch (error) {
    console.error('❌ Error saving sync result:', error)
    throw new Error('Failed to save sync result.')
  }
}

// Get last N syncs for a connection
export async function getLastSyncResults(connection_id: string, limit = 10) {
  try {
    const results = await prisma.sync_results.findMany({
      where: { connection_id },
      orderBy: { started_at: 'desc' },
      take: limit,
    })
    return results
  } catch (error) {
    console.error('❌ Error fetching sync results:', error)
    throw new Error('Failed to fetch sync results.')
  }
}