/**
 * Base AI provider interface and types
 */

export type MessageRole = "user" | "assistant" | "system";

export interface AiMessage {
  role: MessageRole;
  content: string;
}

export interface ChatCompletionOptions {
  messages: AiMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  content: string;
  finishReason?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface StreamingChunk {
  content: string;
  done: boolean;
}

export type StreamCallback = (chunk: StreamingChunk) => void;

/**
 * Base interface for all AI providers
 */
export interface AiProvider {
  /**
   * Get the provider name
   */
  getName(): string;

  /**
   * Check if the provider is configured and available
   */
  isAvailable(): boolean;

  /**
   * Generate a chat completion (non-streaming)
   */
  chatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse>;

  /**
   * Generate a chat completion with streaming
   */
  chatCompletionStream(
    options: ChatCompletionOptions,
    onChunk: StreamCallback
  ): Promise<ChatCompletionResponse>;
}
