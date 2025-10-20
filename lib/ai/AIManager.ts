/**
 * MagNode — Universal AI Manager
 * Compatible con: OpenAI, Anthropic, Gemini, Mistral, Ollama, y Custom APIs.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

// Tipos de proveedor soportados
export type AIProvider =
  | "openai"
  | "anthropic"
  | "gemini"
  | "mistral"
  | "ollama"
  | "custom"
  | "none";

interface GenerateOptions {
  model?: string;
  prompt: string;
  temperature?: number;
  max_tokens?: number;
  context?: Record<string, any>;
}

export class AIManager {
  private static provider: AIProvider =
    (process.env.AI_PROVIDER as AIProvider) || "none";

  private static instance: any = null;

  /**
   * Inicializa dinámicamente el proveedor activo.
   */
  static init() {
    if (this.instance) return this.instance;

    console.log(`⚙️ Inicializando AI provider: ${this.provider}`);

    switch (this.provider) {
      case "openai":
        this.instance = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        break;

      case "anthropic":
        this.instance = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY,
        });
        break;

      case "gemini":
        this.instance = new GoogleGenerativeAI(
          process.env.GEMINI_API_KEY || ""
        );
        break;

      case "mistral":
        this.instance = {
          api: process.env.MISTRAL_API_URL,
          key: process.env.MISTRAL_API_KEY,
        };
        break;

      case "ollama":
        this.instance = {
          api: process.env.OLLAMA_API_URL || "http://localhost:11434",
        };
        break;

      case "custom":
        this.instance = {
          api: process.env.CUSTOM_AI_API_URL,
          key: process.env.CUSTOM_AI_API_KEY,
        };
        break;

      default:
        console.warn("⚠️ No AI provider configurado. Modo offline activo.");
        this.instance = null;
        break;
    }

    return this.instance;
  }

  /**
   * Genera una respuesta según el proveedor activo.
   */
  static async generateResponse({
    model,
    prompt,
    temperature = 0.7,
    max_tokens = 512,
  }: GenerateOptions): Promise<string> {
    this.init();

    if (!this.instance) {
      console.warn("⚠️ No hay proveedor AI configurado. Retornando vacío.");
      return "[Modo offline: sin IA activa]";
    }

    try {
      switch (this.provider) {
        case "openai": {
          const res = await this.instance.chat.completions.create({
            model: model || "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature,
            max_tokens,
          });
          return res.choices[0].message.content || "";
        }

        case "anthropic": {
          const res = await this.instance.messages.create({
            model: model || "claude-3-sonnet-20240229",
            max_tokens,
            temperature,
            messages: [{ role: "user", content: prompt }],
          });
          return res.content?.[0]?.text || "";
        }

        case "gemini": {
          const modelToUse = model || "gemini-1.5-flash";
          const genAI = this.instance.getGenerativeModel({ model: modelToUse });
          const result = await genAI.generateContent(prompt);
          return result.response.text();
        }

        case "mistral": {
          const response = await fetch(`${this.instance.api}/v1/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.instance.key}`,
            },
            body: JSON.stringify({
              model: model || "mistral-small",
              messages: [{ role: "user", content: prompt }],
              temperature,
              max_tokens,
            }),
          });
          const data = await response.json();
          return data.choices?.[0]?.message?.content || "";
        }

        case "ollama": {
          const response = await fetch(`${this.instance.api}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: model || "llama3",
              prompt,
            }),
          });
          const text = await response.text();
          return text.trim();
        }

        case "custom": {
          const response = await fetch(this.instance.api, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.instance.key}`,
            },
            body: JSON.stringify({ prompt }),
          });
          const result = await response.json();
          return result.output || result.text || "";
        }

        default:
          return "[Modo offline: sin IA activa]";
      }
    } catch (error: any) {
      console.error("❌ Error en IA:", error);
      return `[Error del proveedor IA: ${error.message}]`;
    }
  }
}