import { createPlatformConnection, getAllConnections } from '@/lib/db/platform-connections'

async function testDB() {
  const newConn = await createPlatformConnection({
    org_id: 'org_001',
    platform_type: 'google_sheets',
    platform_name: 'Google Sheets',
    auth_config: { api_key: 'demo' },
  })

  console.log('✅ Created:', newConn)

  const all = await getAllConnections()
  console.log('📦 All connections:', all)
}

testDB()