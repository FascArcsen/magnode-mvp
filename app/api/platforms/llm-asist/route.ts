
import { NextRequest, NextResponse } from 'next/server';
import { ConnectorManager } from '@/lib/connectors/connector-manager';

const connectorManager = new ConnectorManager(process.env.ANTHROPIC_API_KEY || '');

// ==========================================
// POST /api/platforms/llm-assist - Generate config with LLM
// ==========================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { base_url, api_documentation, sample_response, api_description } = body;

    // Validate required fields
    if (!base_url) {
      return NextResponse.json(
        { success: false, error: 'base_url is required' },
        { status: 400 }
      );
    }

    // Check if Anthropic API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'LLM assistance not configured. Please set ANTHROPIC_API_KEY environment variable.' 
        },
        { status: 503 }
      );
    }

    // Generate configuration with LLM
    const llmConfig = await connectorManager.generateConfigWithLLM({
      base_url,
      api_documentation,
      sample_response,
      api_description
    });

    return NextResponse.json({
      success: true,
      data: llmConfig
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ==========================================
// PUT /api/platforms/llm-assist/refine - Refine config based on feedback
// ==========================================

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { config, feedback, test_results } = body;

    if (!config || !feedback) {
      return NextResponse.json(
        { success: false, error: 'config and feedback are required' },
        { status: 400 }
      );
    }

    // Refine configuration
    const refinedConfig = await connectorManager.refineConfigWithLLM(
      config,
      feedback,
      test_results
    );

    return NextResponse.json({
      success: true,
      data: refinedConfig
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}