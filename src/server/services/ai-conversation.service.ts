import { aiConversationRepository, type ConversationWithMessages, type ConversationListItem, type PaginationParams, type PaginatedResult } from "@/server/repositories/ai-conversation.repository";
import { getAiProvider, type AiMessage as ProviderMessage } from "@/server/ai/providers";
import { loggerApi as logger } from "@/lib/logger";

/**
 * AI Conversation service — business logic layer for AI chat operations.
 * Orchestrates repository calls, AI provider interactions, and applies business rules.
 *
 * This layer is responsible for:
 * - Coordinating between repository and AI provider
 * - Managing conversation state and message history
 * - Handling streaming responses
 * - Returning structured data to the action layer
 */

export class AiConversationService {
  /**
   * Get conversations for a user with pagination
   */
  async getConversations(
    organizationId: string,
    userId: string,
    pagination: PaginationParams = { page: 1, pageSize: 20 },
  ): Promise<PaginatedResult<ConversationListItem>> {
    return aiConversationRepository.getConversations(organizationId, userId, pagination);
  }

  /**
   * Get a single conversation by ID with all messages
   */
  async getConversationById(
    id: string,
    organizationId: string,
    userId: string,
  ): Promise<ConversationWithMessages | null> {
    return aiConversationRepository.getConversationById(id, organizationId, userId);
  }

  /**
   * Create a new conversation
   */
  async createConversation(
    data: {
      title: string;
      organizationId: string;
      userId: string;
    },
  ): Promise<ConversationWithMessages> {
    const conversation = await aiConversationRepository.createConversation(data);
    const fullConversation = await aiConversationRepository.getConversationById(
      conversation.id,
      data.organizationId,
      data.userId,
    );
    return fullConversation as ConversationWithMessages;
  }

  /**
   * Update conversation title
   */
  async updateConversation(
    id: string,
    organizationId: string,
    userId: string,
    data: {
      title?: string;
    },
  ): Promise<ConversationWithMessages> {
    // Verify the conversation belongs to the user
    const existing = await aiConversationRepository.getConversationById(id, organizationId, userId);
    if (!existing) {
      throw new Error("Conversation not found");
    }

    await aiConversationRepository.updateConversation(id, data);

    const fullConversation = await aiConversationRepository.getConversationById(id, organizationId, userId);
    return fullConversation as ConversationWithMessages;
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(id: string, organizationId: string, userId: string): Promise<void> {
    // Verify the conversation belongs to the user
    const existing = await aiConversationRepository.getConversationById(id, organizationId, userId);
    if (!existing) {
      throw new Error("Conversation not found");
    }

    await aiConversationRepository.deleteConversation(id);
  }

  /**
   * Clear all messages in a conversation
   */
  async clearConversation(id: string, organizationId: string, userId: string): Promise<ConversationWithMessages> {
    // Verify the conversation belongs to the user
    const existing = await aiConversationRepository.getConversationById(id, organizationId, userId);
    if (!existing) {
      throw new Error("Conversation not found");
    }

    await aiConversationRepository.clearConversationMessages(id);

    const fullConversation = await aiConversationRepository.getConversationById(id, organizationId, userId);
    return fullConversation as ConversationWithMessages;
  }

  /**
   * Send a message andget AI response (non-streaming)
   */
  async sendMessage(
    conversationId: string,
    organizationId: string,
    userId: string,
    content: string,
  ): Promise<ConversationWithMessages> {
    // Verify the conversation belongs to the user
    const conversation = await aiConversationRepository.getConversationById(
      conversationId,
      organizationId,
      userId,
    );
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Save user message
    await aiConversationRepository.createMessage({
      conversationId,
      role: "user",
      content,
    });

    // Get conversation history for context
    const messages = await aiConversationRepository.getMessages(conversationId);
    const providerMessages: ProviderMessage[] = messages.map((msg) => ({
      role: msg.role as any,
      content: msg.content,
    }));

    // Get AI response
    const provider = getAiProvider();
    const response = await provider.chatCompletion({
      messages: providerMessages,
    });

    // Save AI response
    await aiConversationRepository.createMessage({
      conversationId,
      role: "assistant",
      content: response.content,
    });

    logger.info("AI message sent", {
      conversationId,
      userId,
      provider: provider.getName(),
      tokens: response.usage?.totalTokens,
    });

    // Return updated conversation
    const fullConversation = await aiConversationRepository.getConversationById(
      conversationId,
      organizationId,
      userId,
    );
    return fullConversation as ConversationWithMessages;
  }

  /**
   * Send a message and get AI response (streaming)
   */
  async sendMessageStream(
    conversationId: string,
    organizationId: string,
    userId: string,
    content: string,
    onChunk: (chunk: { content: string; done: boolean }) => void,
  ): Promise<ConversationWithMessages> {
    // Verify the conversation belongs to the user
    const conversation = await aiConversationRepository.getConversationById(
      conversationId,
      organizationId,
      userId,
    );
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Save user message
    await aiConversationRepository.createMessage({
      conversationId,
      role: "user",
      content,
    });

    // Get conversation history for context
    const messages = await aiConversationRepository.getMessages(conversationId);
    const providerMessages: ProviderMessage[] = messages.map((msg) => ({
      role: msg.role as any,
      content: msg.content,
    }));

    // Get AI response with streaming
    const provider = getAiProvider();
    let fullResponse = "";

    const response = await provider.chatCompletionStream(
      {
        messages: providerMessages,
      },
      (chunk) => {
        onChunk(chunk);
        fullResponse += chunk.content;
      },
    );

    // Save AI response
    await aiConversationRepository.createMessage({
      conversationId,
      role: "assistant",
      content: fullResponse,
    });

    logger.info("AI message sent (streaming)", {
      conversationId,
      userId,
      provider: provider.getName(),
      tokens: response.usage?.totalTokens,
    });

    // Return updated conversation
    const fullConversation = await aiConversationRepository.getConversationById(
      conversationId,
      organizationId,
      userId,
    );
    return fullConversation as ConversationWithMessages;
  }

  /**
   * Regenerate the last AI response
   */
  async regenerateResponse(
    conversationId: string,
    organizationId: string,
    userId: string,
  ): Promise<ConversationWithMessages> {
    // Verify the conversation belongs to the user
    const conversation = await aiConversationRepository.getConversationById(
      conversationId,
      organizationId,
      userId,
    );
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Get all messages
    const messages = await aiConversationRepository.getMessages(conversationId);

    // Remove the last assistant message if it exists
    const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
    if (lastMessage && lastMessage.role === "assistant") {
      // We'll need to delete this message, but Prisma doesn't have a simple way
      // For now, we'll just add a new message
    }

    // Get messages excluding the last assistant message
    const providerMessages: ProviderMessage[] = messages
      .filter((msg) => !lastMessage || msg !== lastMessage)
      .map((msg) => ({
        role: msg.role as any,
        content: msg.content,
      }));

    // Get AI response
    const provider = getAiProvider();
    const response = await provider.chatCompletion({
      messages: providerMessages,
    });

    // Save new AI response
    await aiConversationRepository.createMessage({
      conversationId,
      role: "assistant",
      content: response.content,
    });

    logger.info("AI response regenerated", {
      conversationId,
      userId,
      provider: provider.getName(),
    });

    // Return updated conversation
    const fullConversation = await aiConversationRepository.getConversationById(
      conversationId,
      organizationId,
      userId,
    );
    return fullConversation as ConversationWithMessages;
  }
}

export const aiConversationService = new AiConversationService();
