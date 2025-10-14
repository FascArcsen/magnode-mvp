import type {
  UniversalAPIConfig,
  LLMAssistedConfig,
  DataMapping
} from '@/types/connectors';

// ==========================================
// LLM CONFIG GENERATOR
// El diferenciador clave de MagNode
// ==========================================

export class LLMConfigGenerator {
  private apiKey: string;
  private model = 'claude-sonnet-4-5-20250929';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // ==========================================
  // ANALYZE API (Main method)
  // ==========================================

  async analyzeAPI(input: {
    api_documentation?: string;
    base_url: string;
    sample_response?: string;
    api_description?: string;
  }): Promise<LLMAssistedConfig> {
    const startTime = Date.now();

    try {
      const prompt = this.buildPrompt(input);
      const llmResponse = await this.callClaude(prompt);
      const config = this.parseAndValidate(llmResponse);

      return {
        config_id: `llm_config_${Date.now()}`,
        input,
        suggested_config: config,
        confidence_score: this.calculateConfidence(config, input),
        warnings: this.generateWarnings(config),
        suggestions: this.generateSuggestions(config),
        status: 'generated',
        user_approved: false,
        generated_at: new Date().toISOString(),
        llm_model: this.model
      };
    } catch (error: any) {
      throw new Error(`Failed to analyze API: ${error.message}`);
    }
  }

  // ==========================================
  // BUILD PROMPT
  // ==========================================

  private buildPrompt(input: {
    api_documentation?: string;
    base_url: string;
    sample_response?: string;
    api_description?: string;
  }): string {
    return `You are an expert API integration specialist. Your task is to analyze an API and generate a complete configuration for connecting it to MagNode, a platform that tracks organizational actions and events.

# OBJECTIVE
Generate a JSON configuration that will allow MagNode to:
1. Connect to the API
2. Extract user actions/events/activities
3. Map them to a standardized audit log format

# API INFORMATION

## Base URL
${input.base_url}

${input.api_description ? `## API Description\n${input.api_description}\n` : ''}

${input.api_documentation ? `## Documentation\n${input.api_documentation}\n` : ''}

${input.sample_response ? `## Sample Response\n\`\`\`json\n${input.sample_response}\n\`\`\`\n` : ''}

# CONFIGURATION SCHEMA

You must generate a JSON object with this exact structure:

\`\`\`json
{
  "base_url": "string",
  "global_headers": { "key": "value" },
  "endpoints": [
    {
      "endpoint_id": "unique_id",
      "name": "Descriptive Name",
      "description": "What this endpoint returns",
      "path": "/api/v1/events",
      "method": "GET",
      "query_params": { "limit": 100 },
      "pagination": {
        "type": "offset|cursor|page|none",
        "page_param": "page",
        "size_param": "per_page",
        "page_size": 100,
        "cursor_param": "cursor",
        "cursor_path": "$.pagination.next_cursor",
        "max_pages": 10
      },
      "response_data_path": "$.data.events",
      "time_filter": {
        "param_name": "since",
        "param_type": "query",
        "date_format": "ISO8601"
      }
    }
  ],
  "data_mapping": {
    "required_fields": {
      "id": {
        "source_path": "$.id",
        "data_type": "string",
        "required": true
      },
      "timestamp": {
        "source_path": "$.created_at",
        "data_type": "date",
        "required": true,
        "transform": { "type": "parse_date" }
      },
      "actor": {
        "source_path": "$.user.email",
        "data_type": "string",
        "required": true
      },
      "action": {
        "source_path": "$.event_type",
        "data_type": "string",
        "required": true
      }
    },
    "optional_fields": {
      "target": {
        "source_path": "$.target.id",
        "data_type": "string"
      },
      "target_type": {
        "source_path": "$.target.type",
        "data_type": "string"
      },
      "department": {
        "source_path": "$.user.department",
        "data_type": "string"
      },
      "metadata": {
        "source_path": "$",
        "data_type": "object"
      }
    }
  },
  "rate_limit": {
    "requests_per_minute": 60,
    "concurrent_requests": 5,
    "strategy": "wait"
  }
}
\`\`\`

# CRITICAL INSTRUCTIONS

1. **Identify Event Endpoints**: Find endpoints that return user actions, events, activities, or audit logs. Common patterns:
   - /events, /activities, /actions, /audit_log
   - /users/{id}/actions
   - /timeline, /feed

2. **JSONPath Mapping**: Use JSONPath syntax for source_path:
   - "$.id" for root-level id
   - "$.user.email" for nested fields
   - "$.data[*].timestamp" for arrays

3. **Pagination Detection**: Analyze how the API handles pagination:
   - Offset-based: ?page=1&limit=100
   - Cursor-based: ?cursor=xyz
   - Page-based: ?page=2&per_page=50
   - Link headers: Check response headers

4. **Data Types**: Map correctly:
   - Timestamps → "date" with parse_date transform
   - IDs → "string"
   - Numbers → "number"
   - Objects → "object"

5. **Rate Limits**: If documented, include them. If not, suggest conservative defaults:
   - Small APIs: 60 req/min
   - Medium APIs: 300 req/min
   - Large APIs: 1000 req/min

6. **Incremental Sync**: If possible, configure time_filter for efficient syncing

# OUTPUT FORMAT

Respond with ONLY valid JSON. No markdown, no code blocks, no explanations.
Start your response with { and end with }

Your JSON response:`;
  }

  // ==========================================
  // CALL CLAUDE API
  // ==========================================

  private async callClaude(prompt: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  // ==========================================
  // PARSE AND VALIDATE
  // ==========================================

  private parseAndValidate(llmResponse: string): UniversalAPIConfig {
    try {
      // Extract JSON from response (in case Claude adds markdown)
      let jsonStr = llmResponse.trim();
      
      // Remove markdown code blocks if present
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```\n?$/g, '');
      }

      const config = JSON.parse(jsonStr);

      // Validate required fields
      if (!config.base_url) throw new Error('Missing base_url');
      if (!config.endpoints || config.endpoints.length === 0) {
        throw new Error('No endpoints defined');
      }
      if (!config.data_mapping) throw new Error('Missing data_mapping');

      // Validate each endpoint
      config.endpoints.forEach((endpoint: any, i: number) => {
        if (!endpoint.endpoint_id) endpoint.endpoint_id = `endpoint_${i}`;
        if (!endpoint.name) throw new Error(`Endpoint ${i} missing name`);
        if (!endpoint.path) throw new Error(`Endpoint ${i} missing path`);
        if (!endpoint.method) endpoint.method = 'GET';
        if (!endpoint.response_data_path) endpoint.response_data_path = '$';
      });

      // Validate data mapping
      const mapping = config.data_mapping;
      if (!mapping.required_fields) throw new Error('Missing required_fields in mapping');
      
      const required = ['id', 'timestamp', 'actor', 'action'];
      required.forEach(field => {
        if (!mapping.required_fields[field]) {
          throw new Error(`Missing required field mapping: ${field}`);
        }
      });

      return config as UniversalAPIConfig;
    } catch (error: any) {
      throw new Error(`Failed to parse LLM response: ${error.message}\n\nResponse: ${llmResponse.substring(0, 500)}`);
    }
  }

  // ==========================================
  // CALCULATE CONFIDENCE
  // ==========================================

  private calculateConfidence(config: UniversalAPIConfig, input: any): number {
    let score = 0.5; // Base score

    // Has documentation? +0.2
    if (input.api_documentation && input.api_documentation.length > 100) {
      score += 0.2;
    }

    // Has sample response? +0.15
    if (input.sample_response) {
      score += 0.15;
    }

    // Has multiple endpoints? +0.1
    if (config.endpoints.length > 1) {
      score += 0.1;
    }

    // Has pagination configured? +0.05
    if (config.endpoints.some(e => e.pagination && e.pagination.type !== 'none')) {
      score += 0.05;
    }

    // Has time filter (incremental sync)? +0.05
    if (config.endpoints.some(e => e.time_filter)) {
      score += 0.05;
    }

    // Has optional fields mapped? +0.05
    if (config.data_mapping.optional_fields && 
        Object.keys(config.data_mapping.optional_fields).length > 2) {
      score += 0.05;
    }

    return Math.min(score, 1.0);
  }

  // ==========================================
  // GENERATE WARNINGS
  // ==========================================

  private generateWarnings(config: UniversalAPIConfig): string[] {
    const warnings: string[] = [];

    // Check if pagination is configured
    const noPagination = config.endpoints.filter(e => 
      !e.pagination || e.pagination.type === 'none'
    );
    if (noPagination.length > 0) {
      warnings.push(`${noPagination.length} endpoint(s) have no pagination configured. This may cause issues with large datasets.`);
    }

    // Check if rate limiting is configured
    if (!config.rate_limit) {
      warnings.push('No rate limiting configured. This may cause API throttling.');
    }

    // Check if incremental sync is possible
    const noTimeFilter = config.endpoints.filter(e => !e.time_filter);
    if (noTimeFilter.length > 0) {
      warnings.push(`${noTimeFilter.length} endpoint(s) have no time filter. Incremental sync will not be possible.`);
    }

    // Check if actor mapping looks valid
    const actorPath = config.data_mapping.required_fields.actor.source_path;
    if (!actorPath.includes('user') && !actorPath.includes('actor') && !actorPath.includes('email')) {
      warnings.push('Actor field mapping may be incorrect. Expected path containing "user", "actor", or "email".');
    }

    return warnings;
  }

  // ==========================================
  // GENERATE SUGGESTIONS
  // ==========================================

  private generateSuggestions(config: UniversalAPIConfig): string[] {
    const suggestions: string[] = [];

    // Suggest adding more optional fields
    if (!config.data_mapping.optional_fields?.department) {
      suggestions.push('Consider mapping department/team information if available in the API response.');
    }

    // Suggest webhook support
    suggestions.push('If this API supports webhooks, consider setting them up for real-time updates instead of polling.');

    // Suggest testing with small limits first
    if (config.endpoints.some(e => e.pagination && e.pagination.page_size > 100)) {
      suggestions.push('Start with smaller page sizes (10-50) during testing to validate the configuration.');
    }

    return suggestions;
  }

  // ==========================================
  // REFINE CONFIG (User feedback loop)
  // ==========================================

  async refineConfig(
    originalConfig: UniversalAPIConfig,
    userFeedback: string,
    testResults?: any
  ): Promise<UniversalAPIConfig> {
    const prompt = `You previously generated this API configuration:

\`\`\`json
${JSON.stringify(originalConfig, null, 2)}
\`\`\`

User feedback: "${userFeedback}"

${testResults ? `\nTest results:\n${JSON.stringify(testResults, null, 2)}` : ''}

Please refine the configuration based on the feedback. Respond with ONLY the updated JSON configuration.`;

    const llmResponse = await this.callClaude(prompt);
    return this.parseAndValidate(llmResponse);
  }
}