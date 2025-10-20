// ===============================================
// 🔮 AI REGISTRY — Centraliza configuración de modelos
// ===============================================

export interface ModelConfig {
  provider: "openai" | "anthropic" | "gemini" | "custom" | "local";
  model: string;
  maxTokens?: number;
  temperature?: number;
  apiKeyEnv: string; // Nombre de la variable de entorno que contiene la API key
}

// 🔧 Registro universal de modelos
export const AI_REGISTRY: Record<string, ModelConfig> = {
  // === OpenAI ===
  openai_gpt4: {
    provider: "openai",
    model: "gpt-4-turbo",
    temperature: 0.7,
    maxTokens: 2000,
    apiKeyEnv: "OPENAI_API_KEY",
  },
  openai_gpt35: {
    provider: "openai",
    model: "gpt-3.5-turbo",
    temperature: 0.7,
    maxTokens: 1500,
    apiKeyEnv: "OPENAI_API_KEY",
  },

  // === Anthropic ===
  claude_3: {
    provider: "anthropic",
    model: "claude-3-opus-20240229",
    temperature: 0.7,
    maxTokens: 2000,
    apiKeyEnv: "ANTHROPIC_API_KEY",
  },

  // === Gemini ===
  gemini_15_pro: {
    provider: "gemini",
    model: "gemini-1.5-pro",
    temperature: 0.7,
    maxTokens: 2000,
    apiKeyEnv: "GEMINI_API_KEY",
  },

  // === Custom ===
  custom_llm: {
    provider: "custom",
    model: "custom-llm",
    apiKeyEnv: "CUSTOM_AI_API_KEY",
  },

  // === Local (modo simulación) ===
  local_basic: {
    provider: "local",
    model: "local-sim",
    temperature: 0,
    apiKeyEnv: "NONE",
  },
};
