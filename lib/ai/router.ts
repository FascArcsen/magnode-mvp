/**
 * 🤖 AI Router — Selecciona y ejecuta el modelo adecuado
 * Compatible con OpenAI, Anthropic, Gemini y modelos personalizados
 */

import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AI_REGISTRY, ModelConfig } from "./registry";
export class AIRouter {
  // ==============================
  // Selección del modelo según tarea
  // ==============================
  static getModel(taskType: string): ModelConfig {
    switch (taskType) {
      case "summarization":
      case "contextualization":
        return AI_REGISTRY["openai_gpt35"]; // rápido y económico
      case "generation":
      case "strategy":
        return AI_REGISTRY["openai_gpt4"]; // más potente
      case "analysis":
        return AI_REGISTRY["claude_3"];
      case "reasoning":
        return AI_REGISTRY["gemini_15_pro"];
      default:
        return AI_REGISTRY["openai_gpt35"];
    }
  }

  // ==============================
  // Ejecución de prompt según proveedor
  // ==============================
  static async runPrompt(taskType: string, prompt: string): Promise<string> {
    const model = this.getModel(taskType);
    const apiKey = process.env[model.apiKeyEnv];

    if (!apiKey) {
      throw new Error(`❌ Falta API key para proveedor: ${model.provider}`);
    }

    // === OPENAI ===
    if (model.provider === "openai") {
      const client = new OpenAI({ apiKey });
      const response = await client.chat.completions.create({
        model: model.model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: model.maxTokens ?? 512,
        temperature: model.temperature ?? 0.7,
      });
      return response.choices?.[0]?.message?.content || "";
    }

    // === ANTHROPIC ===
    if (model.provider === "anthropic") {
      const client = new Anthropic({ apiKey });
      const response = await client.messages.create({
        model: model.model,
        max_tokens: model.maxTokens ?? 512,
        temperature: model.temperature ?? 0.7,
        messages: [{ role: "user", content: prompt }],
      });

      // ✅ Manejo robusto del array de contenido
      if (Array.isArray(response.content)) {
        const textBlock = response.content.find(
          (b: any) => b.type === "text"
        ) as { text?: string };
        return textBlock?.text || "";
      }
      return (response as any).output_text || "";
    }

    // === GEMINI ===
    if (model.provider === "gemini") {
      const genAI = new GoogleGenerativeAI(apiKey);
      const modelClient = genAI.getGenerativeModel({ model: model.model });
      const result = await modelClient.generateContent(prompt);
      const text = result?.response?.text?.() || "";
      return text;
    }

    // === CUSTOM ===
    if (model.provider === "custom") {
      const res = await fetch(process.env.CUSTOM_AI_API_URL || "", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      return data.output || "";
    }

    // === LOCAL (modo simulación) ===
    if (model.provider === "local") {
      return `🧠 Simulación local (${model.model}): ${prompt.slice(0, 100)}...`;
    }

    throw new Error(`No handler implementado para provider: ${model.provider}`);
  }
}