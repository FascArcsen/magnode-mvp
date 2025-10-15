// ==========================================
// lib/db/platform-connections.ts
// CRUD operations for platform_connections
// ==========================================

import { prisma } from '../prisma'

// CREATE
export async function createPlatformConnection(data: {
  org_id: string
  platform_type: string
  platform_name: string
  auth_config?: any
  connector_config?: any
  sync_frequency_minutes?: number
}) {
  try {
    const connection = await prisma.platform_connections.create({
      data: {
        org_id: data.org_id,
        platform_type: data.platform_type,
        platform_name: data.platform_name,
        auth_config: data.auth_config ?? {},
        connector_config: data.connector_config ?? {},
        sync_frequency_minutes: data.sync_frequency_minutes ?? 60,
        status: 'active',
      },
    })
    return connection
  } catch (error) {
    console.error('❌ Error creating platform connection:', error)
    throw new Error('Failed to create platform connection.')
  }
}

// READ (all)
export async function getAllConnections() {
  try {
    const connections = await prisma.platform_connections.findMany({
      orderBy: { created_at: 'desc' },
    })
    return connections
  } catch (error) {
    console.error('❌ Error fetching connections:', error)
    throw new Error('Failed to fetch connections.')
  }
}

// READ (by ID)
export async function getConnectionById(connection_id: string) {
  try {
    const connection = await prisma.platform_connections.findUnique({
      where: { connection_id },
    })
    return connection
  } catch (error) {
    console.error('❌ Error fetching connection by ID:', error)
    throw new Error('Failed to fetch connection.')
  }
}

// UPDATE
export async function updateConnection(
  connection_id: string,
  data: Partial<{
    status: string
    last_sync_at: Date
    next_sync_at: Date
    total_records_synced: number
    total_audit_logs_created: number
    error_message: string | null
  }>
) {
  try {
    const updated = await prisma.platform_connections.update({
      where: { connection_id },
      data,
    })
    return updated
  } catch (error) {
    console.error('❌ Error updating connection:', error)
    throw new Error('Failed to update connection.')
  }
}

// DELETE
export async function deleteConnection(connection_id: string) {
  try {
    const deleted = await prisma.platform_connections.delete({
      where: { connection_id },
    })
    return deleted
  } catch (error) {
    console.error('❌ Error deleting connection:', error)
    throw new Error('Failed to delete connection.')
  }
}