import { env } from "@/lib/env";
import type { AiProvider } from "./base";
import { MockProvider } from "./mock";
import { OpenAIProvider } from "./openai";
import { AnthropicProvider } from "./anthropic";

/**
 * Factory function to get the appropriate AI provider based on configuration
 */
export function getAiProvider(): AiProvider {
  const provider = env.AI_PROVIDER || "mock";

  switch (provider) {
    case "openai":
      const openai = new OpenAIProvider();
      if (openai.isAvailable()) {
        return openai;
      }
      console.warn("OpenAI provider configured but API key not found, falling back to mock");
      return new MockProvider();

    case "anthropic":
      const anthropic = new AnthropicProvider();
      if (anthropic.isAvailable()) {
        return anthropic;
      }
      console.warn("Anthropic provider configured but API key not found, falling back to mock");
      return new MockProvider();

    case "mock":
    default:
      return new MockProvider();
  }
}

export { MockProvider, OpenAIProvider, AnthropicProvider };
export type { AiProvider, ChatCompletionOptions, ChatCompletionResponse, StreamingChunk, StreamCallback, MessageRole, AiMessage } from "./base";
