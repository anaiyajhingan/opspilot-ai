import type {
  AiProvider,
  ChatCompletionOptions,
  ChatCompletionResponse,
  StreamCallback,
  StreamingChunk,
} from "./base";
import { env } from "@/lib/env";

/**
 * Anthropic (Claude) provider implementation
 * Requires ANTHROPIC_API_KEY environment variable
 */
export class AnthropicProvider implements AiProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = env.ANTHROPIC_API_KEY || "";
  }

  getName(): string {
    return "Anthropic";
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async chatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    if (!this.isAvailable()) {
      throw new Error("Anthropic API key is not configured");
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        messages: this.convertMessages(options.messages),
        max_tokens: options.maxTokens ?? 2048,
        temperature: options.temperature ?? 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    return {
      content: data.content[0].text,
      finishReason: data.stop_reason,
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens,
      },
    };
  }

  async chatCompletionStream(
    options: ChatCompletionOptions,
    onChunk: StreamCallback
  ): Promise<ChatCompletionResponse> {
    if (!this.isAvailable()) {
      throw new Error("Anthropic API key is not configured");
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        messages: this.convertMessages(options.messages),
        max_tokens: options.maxTokens ?? 2048,
        temperature: options.temperature ?? 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Failed to get response reader");
    }

    const decoder = new TextDecoder();
    let fullContent = "";
    let inputTokens = 0;
    let outputTokens = 0;

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
              
              if (parsed.type === "content_block_delta") {
                const content = parsed.delta?.text || "";
                if (content) {
                  fullContent += content;
                  onChunk({
                    content,
                    done: false,
                  });
                }
              }

              if (parsed.type === "message_start") {
                inputTokens = parsed.message?.usage?.input_tokens || 0;
              }

              if (parsed.type === "message_delta") {
                outputTokens = parsed.usage?.output_tokens || 0;
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
          promptTokens: inputTokens,
          completionTokens: outputTokens,
          totalTokens: inputTokens + outputTokens,
        },
      };
    } finally {
      reader.releaseLock();
    }
  }

  private convertMessages(messages: any[]): any[] {
    // Convert from OpenAI format to Anthropic format
    return messages.map((msg) => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content,
    }));
  }
}
