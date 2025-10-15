import { NextRequest, NextResponse } from 'next/server'
import { ConnectorManager } from '@/lib/connectors/connector-manager'
import { prisma } from '@/lib/prisma'

const connectorManager = new ConnectorManager(process.env.ANTHROPIC_API_KEY || '')

// ==========================================
// POST /api/platforms/llm-assist - Generate config with LLM
// ==========================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { base_url, api_documentation, sample_response, api_description, connection_id } = body

    if (!base_url) {
      return NextResponse.json({ success: false, error: 'base_url is required' }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Missing ANTHROPIC_API_KEY' },
        { status: 503 }
      )
    }

    const llmConfig = await connectorManager.generateConfigWithLLM({
      base_url,
      api_documentation,
      sample_response,
      api_description,
    })

    // ✅ Convert to plain JSON before saving
    const safeConfig = JSON.parse(JSON.stringify(llmConfig))

    const savedConfig = await prisma.llm_assisted_configs.create({
      data: {
        connection_id: connection_id ?? null,
        input: JSON.stringify({ base_url, api_description }),
        suggested_config: safeConfig,
        confidence_score: (safeConfig.confidence as number) ?? null,
        status: 'generated',
        user_approved: false,
        llm_model: 'claude-3-opus',
        prompt_tokens: safeConfig.prompt_tokens ?? 0,
        completion_tokens: safeConfig.completion_tokens ?? 0,
      },
    })

    return NextResponse.json({ success: true, data: savedConfig }, { status: 201 })
  } catch (error: any) {
    console.error('❌ [POST /llm-assist] Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// ==========================================
// PUT /api/platforms/llm-assist/refine - Refine config based on feedback
// ==========================================
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { config, feedback, test_results, connection_id } = body

    if (!config || !feedback) {
      return NextResponse.json(
        { success: false, error: 'config and feedback are required' },
        { status: 400 }
      )
    }

    const refinedConfig = await connectorManager.refineConfigWithLLM(
      config,
      feedback,
      test_results
    )

    const safeConfig = JSON.parse(JSON.stringify(refinedConfig))

    const updated = await prisma.llm_assisted_configs.create({
      data: {
        connection_id: connection_id ?? null,
        input: JSON.stringify({ feedback, test_results }),
        suggested_config: safeConfig,
        confidence_score: (safeConfig.confidence as number) ?? null,
        status: 'refined',
        user_approved: true,
        llm_model: 'claude-3-opus',
      },
    })

    return NextResponse.json({ success: true, data: updated }, { status: 201 })
  } catch (error: any) {
    console.error('❌ [PUT /llm-assist] Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}