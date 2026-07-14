import type {
  AiProvider,
  ChatCompletionOptions,
  ChatCompletionResponse,
  StreamCallback,
  StreamingChunk,
} from "./base";

/**
 * Mock AI provider for development and testing
 * Returns predefined responses without calling external APIs
 */
export class MockProvider implements AiProvider {
  getName(): string {
    return "Mock";
  }

  isAvailable(): boolean {
    return true;
  }

  async chatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    // Simulate network delay
    await this.delay(500);

    const lastMessage = options.messages[options.messages.length - 1];
    const response = this.generateMockResponse(lastMessage?.content || "");

    return {
      content: response,
      finishReason: "stop",
      usage: {
        promptTokens: this.estimateTokens(JSON.stringify(options.messages)),
        completionTokens: this.estimateTokens(response),
        totalTokens: this.estimateTokens(JSON.stringify(options.messages)) + this.estimateTokens(response),
      },
    };
  }

  async chatCompletionStream(
    options: ChatCompletionOptions,
    onChunk: StreamCallback
  ): Promise<ChatCompletionResponse> {
    const lastMessage = options.messages[options.messages.length - 1];
    const fullResponse = this.generateMockResponse(lastMessage?.content || "");
    
    // Simulate streaming by sending chunks
    const chunks = this.splitIntoChunks(fullResponse, 20);
    
    for (const chunk of chunks) {
      await this.delay(50);
      onChunk({
        content: chunk,
        done: false,
      });
    }

    // Send final chunk
    onChunk({
      content: "",
      done: true,
    });

    return {
      content: fullResponse,
      finishReason: "stop",
      usage: {
        promptTokens: this.estimateTokens(JSON.stringify(options.messages)),
        completionTokens: this.estimateTokens(fullResponse),
        totalTokens: this.estimateTokens(JSON.stringify(options.messages)) + this.estimateTokens(fullResponse),
      },
    };
  }

  private generateMockResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes("incident") || lowerMessage.includes("outage")) {
      return "I can help you analyze this incident. Based on the information provided, I recommend: 1) Check recent deployments, 2) Review error logs for patterns, 3) Verify service dependencies. Would you like me to dive deeper into any of these areas?";
    }

    if (lowerMessage.includes("help")) {
      return "I'm your AI assistant for OpsPilot. I can help you with:\n\n• Incident analysis and root cause investigation\n• Postmortem generation\n• Alert correlation\n• System health monitoring\n• Best practices for incident response\n\nWhat would you like to work on?";
    }

    if (lowerMessage.includes("error") || lowerMessage.includes("bug")) {
      return "I see you're experiencing an error. To help diagnose the issue, please provide:\n1. The error message or stack trace\n2. When the error started occurring\n3. Any recent changes to the system\n4. Which services or components are affected";
    }

    if (lowerMessage.includes("deploy") || lowerMessage.includes("release")) {
      return "Regarding deployments, I can help you:\n• Review deployment logs for issues\n• Analyze pre and post-deployment metrics\n• Identify potential rollback triggers\n• Generate deployment checklists\n• Document deployment procedures";
    }

    // Default response
    return "I understand you're asking about: " + userMessage + ". As an OpsPilot AI assistant, I'm here to help with incident management, system monitoring, and operational best practices. Could you provide more details about what you'd like to accomplish?";
  }

  private splitIntoChunks(text: string, chunkSize: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }
}
