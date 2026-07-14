import type {
  AiProvider,
  ChatCompletionOptions,
  ChatCompletionResponse,
  StreamCallback,
  StreamingChunk,
} from "./base";
import { env } from "@/lib/env";

/**
 * OpenAI provider implementation
 * Requires OPENAI_API_KEY environment variable
 */
export class OpenAIProvider implements AiProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = env.OPENAI_API_KEY || "";
  }

  getName(): string {
    return "OpenAI";
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async chatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    if (!this.isAvailable()) {
      throw new Error("OpenAI API key is not configured");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: options.messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const choice = data.choices[0];

    return {
      content: choice.message.content,
      finishReason: choice.finish_reason,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      },
    };
  }

  async chatCompletionStream(
    options: ChatCompletionOptions,
    onChunk: StreamCallback
  ): Promise<ChatCompletionResponse> {
    if (!this.isAvailable()) {
      throw new Error("OpenAI API key is not configured");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: options.messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Failed to get response reader");
    }

    const decoder = new TextDecoder();
    let fullContent = "";
    let totalTokens = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || "";
              
              if (content) {
                fullContent += content;
                onChunk({
                  content,
                  done: false,
                });
              }

              if (parsed.usage) {
                totalTokens = parsed.usage.total_tokens;
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      onChunk({
        content: "",
        done: true,
      });

      return {
        content: fullContent,
        finishReason: "stop",
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: totalTokens,
        },
      };
    } finally {
      reader.releaseLock();
    }
  }
}
