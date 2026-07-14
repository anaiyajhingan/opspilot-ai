import { db } from "@/lib/db";
import type { AiConversation, AiMessage } from "@prisma/client";

/**
 * AI Conversation repository — data access layer for AI chat operations.
 * Handles CRUD, filtering, and related data for conversations and messages.
 *
 * All queries are scoped to the user's organization via the organizationId
 * parameter — the caller (service layer) is responsible for resolving this
 * from the session.
 */

export type ConversationWithMessages = AiConversation & {
  messages: AiMessage[];
  _count: { messages: number };
};

export type ConversationListItem = Pick<
  AiConversation,
  "id" | "title" | "createdAt" | "updatedAt"
> & {
  _count: { messages: number };
};

export type PaginationParams = {
  page: number;
  pageSize: number;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export class AiConversationRepository {
  /**
   * Get conversations for a user with pagination
   */
  async getConversations(
    organizationId: string,
    userId: string,
    pagination: PaginationParams = { page: 1, pageSize: 20 },
  ): Promise<PaginatedResult<ConversationListItem>> {
    const { page, pageSize } = pagination;
    const skip = (page - 1) * pageSize;

    const where = {
      organizationId,
      userId,
    };

    const [items, total] = await Promise.all([
      db.aiConversation.findMany({
        where,
        select: {
          id: true,
          title: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { messages: true },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: pageSize,
      }),
      db.aiConversation.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Get a single conversation by ID with all messages
   */
  async getConversationById(
    id: string,
    organizationId: string,
    userId: string,
  ): Promise<ConversationWithMessages | null> {
    const conversation = await db.aiConversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: { messages: true },
        },
      },
    });

    if (!conversation || conversation.organizationId !== organizationId || conversation.userId !== userId) {
      return null;
    }

    return conversation as ConversationWithMessages;
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
  ): Promise<AiConversation> {
    // Verify the organization exists before creating the conversation
    const organization = await db.organization.findUnique({
      where: { id: data.organizationId },
    });
    
    if (!organization) {
      throw new Error(`Organization with id ${data.organizationId} does not exist`);
    }

    // Verify the user exists and belongs to the organization
    const user = await db.user.findUnique({
      where: { id: data.userId },
    });
    
    if (!user) {
      throw new Error(`User with id ${data.userId} does not exist`);
    }
    
    if (user.organizationId !== data.organizationId) {
      throw new Error(`User ${data.userId} does not belong to organization ${data.organizationId}`);
    }

    return db.aiConversation.create({
      data,
    });
  }

  /**
   * Update conversation title
   */
  async updateConversation(
    id: string,
    data: {
      title?: string;
    },
  ): Promise<AiConversation> {
    return db.aiConversation.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a conversation and all its messages
   */
  async deleteConversation(id: string): Promise<AiConversation> {
    return db.aiConversation.delete({
      where: { id },
    });
  }

  /**
   * Add a message to a conversation
   */
  async createMessage(
    data: {
      conversationId: string;
      role: string;
      content: string;
    },
  ): Promise<AiMessage> {
    return db.aiMessage.create({
      data,
    });
  }

  /**
   * Delete all messages in a conversation
   */
  async clearConversationMessages(conversationId: string): Promise<void> {
    await db.aiMessage.deleteMany({
      where: { conversationId },
    });
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId: string): Promise<AiMessage[]> {
    return db.aiMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });
  }
}

export const aiConversationRepository = new AiConversationRepository();
