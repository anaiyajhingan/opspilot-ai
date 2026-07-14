"use server";

import { auth } from "@/lib/auth";
import { loggerApi as logger } from "@/lib/logger";
import { assertCan } from "@/lib/rbac";
import type { Result } from "@/types";
import { aiConversationService } from "@/server/services/ai-conversation.service";
import { z } from "zod";

/**
 * Server actions for AI conversation operations.
 *
 * These actions are the entry points for client-side mutations and queries.
 * They handle authentication, authorization, and error handling.
 */

const createConversationSchema = z.object({
  title: z.string().min(1).max(100),
});

const updateConversationSchema = z.object({
  title: z.string().min(1).max(100).optional(),
});

const sendMessageSchema = z.object({
  content: z.string().min(1).max(10000),
});

const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
});

/**
 * Get conversations for the current user
 */
export async function getConversations(pagination: { page?: number; pageSize?: number } = {}) {
  const session = await auth();

  if (!session?.user?.organizationId || !session?.user?.id) {
    throw new Error("Unauthorized: No organization or user found");
  }

  try {
    const parsed = paginationSchema.parse(pagination);
    const result = await aiConversationService.getConversations(
      session.user.organizationId,
      session.user.id,
      parsed,
    );
    logger.info("Conversations fetched", { orgId: session.user.organizationId, userId: session.user.id });
    return result;
  } catch (error) {
    logger.error("Failed to fetch conversations", {
      orgId: session.user.organizationId,
      userId: session.user.id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Get a single conversation by ID
 */
export async function getConversation(id: string) {
  const session = await auth();

  if (!session?.user?.organizationId || !session?.user?.id) {
    throw new Error("Unauthorized: No organization or user found");
  }

  try {
    const conversation = await aiConversationService.getConversationById(
      id,
      session.user.organizationId,
      session.user.id,
    );
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    logger.info("Conversation fetched", { orgId: session.user.organizationId, conversationId: id });
    return conversation;
  } catch (error) {
    logger.error("Failed to fetch conversation", {
      orgId: session.user.organizationId,
      conversationId: id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Create a new conversation
 */
export async function createConversation(input: { title: string }): Promise<Result<{ id: string }>> {
  const session = await auth();

  if (!session?.user?.organizationId || !session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  const parsed = createConversationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    assertCan(session.user.role, "ai:chat");

    logger.info("Creating conversation", {
      userId: session.user.id,
      organizationId: session.user.organizationId,
      role: session.user.role,
    });

    const conversation = await aiConversationService.createConversation({
      ...parsed.data,
      organizationId: session.user.organizationId,
      userId: session.user.id,
    });

    logger.info("Conversation created", { orgId: session.user.organizationId, conversationId: conversation.id });
    return { ok: true, data: { id: conversation.id } };
  } catch (error) {
    logger.error("Failed to create conversation", {
      userId: session?.user?.id,
      orgId: session?.user?.organizationId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { ok: false, error: error instanceof Error ? error.message : "Failed to create conversation" };
  }
}

/**
 * Update a conversation
 */
export async function updateConversation(
  id: string,
  input: { title?: string },
): Promise<Result<{ id: string }>> {
  const session = await auth();

  if (!session?.user?.organizationId || !session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  const parsed = updateConversationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    assertCan(session.user.role, "ai:chat");

    const conversation = await aiConversationService.updateConversation(
      id,
      session.user.organizationId,
      session.user.id,
      parsed.data,
    );

    logger.info("Conversation updated", { orgId: session.user.organizationId, conversationId: id });
    return { ok: true, data: { id: conversation.id } };
  } catch (error) {
    logger.error("Failed to update conversation", {
      orgId: session.user.organizationId,
      conversationId: id,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, error: error instanceof Error ? error.message : "Failed to update conversation" };
  }
}

/**
 * Delete a conversation
 */
export async function deleteConversation(id: string): Promise<Result<null>> {
  const session = await auth();

  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  try {
    assertCan(session.user.role, "ai:delete");

    await aiConversationService.deleteConversation(id, session.user.organizationId, session.user.id);

    logger.info("Conversation deleted", { orgId: session.user.organizationId, conversationId: id });
    return { ok: true, data: null };
  } catch (error) {
    logger.error("Failed to delete conversation", {
      orgId: session.user.organizationId,
      conversationId: id,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, error: error instanceof Error ? error.message : "Failed to delete conversation" };
  }
}

/**
 * Clear all messages in a conversation
 */
export async function clearConversation(id: string): Promise<Result<{ id: string }>> {
  const session = await auth();

  if (!session?.user?.organizationId || !session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  try {
    assertCan(session.user.role, "ai:chat");

    const conversation = await aiConversationService.clearConversation(
      id,
      session.user.organizationId,
      session.user.id,
    );

    logger.info("Conversation cleared", { orgId: session.user.organizationId, conversationId: id });
    return { ok: true, data: { id: conversation.id } };
  } catch (error) {
    logger.error("Failed to clear conversation", {
      orgId: session.user.organizationId,
      conversationId: id,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, error: error instanceof Error ? error.message : "Failed to clear conversation" };
  }
}

/**
 * Send a message (non-streaming)
 */
export async function sendMessage(
  conversationId: string,
  input: { content: string },
): Promise<Result<{ id: string }>> {
  const session = await auth();

  if (!session?.user?.organizationId || !session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  const parsed = sendMessageSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    assertCan(session.user.role, "ai:chat");

    const conversation = await aiConversationService.sendMessage(
      conversationId,
      session.user.organizationId,
      session.user.id,
      parsed.data.content,
    );

    logger.info("Message sent", { orgId: session.user.organizationId, conversationId });
    return { ok: true, data: { id: conversation.id } };
  } catch (error) {
    logger.error("Failed to send message", {
      orgId: session.user.organizationId,
      conversationId,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, error: error instanceof Error ? error.message : "Failed to send message" };
  }
}

/**
 * Regenerate the last AI response
 */
export async function regenerateResponse(conversationId: string): Promise<Result<{ id: string }>> {
  const session = await auth();

  if (!session?.user?.organizationId || !session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  try {
    assertCan(session.user.role, "ai:chat");

    const conversation = await aiConversationService.regenerateResponse(
      conversationId,
      session.user.organizationId,
      session.user.id,
    );

    logger.info("Response regenerated", { orgId: session.user.organizationId, conversationId });
    return { ok: true, data: { id: conversation.id } };
  } catch (error) {
    logger.error("Failed to regenerate response", {
      orgId: session.user.organizationId,
      conversationId,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, error: error instanceof Error ? error.message : "Failed to regenerate response" };
  }
}
