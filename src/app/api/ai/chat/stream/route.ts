import { auth } from "@/lib/auth";
import { aiConversationService } from "@/server/services/ai-conversation.service";
import { loggerApi as logger } from "@/lib/logger";

/**
 * Streaming API route for AI chat responses
 * POST /api/ai/chat/stream
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.organizationId || !session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { conversationId, content } = body;

    if (!conversationId || !content) {
      return new Response("Missing required fields", { status: 400 });
    }

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send user message and get streaming AI response
          await aiConversationService.sendMessageStream(
            conversationId,
            session.user.organizationId,
            session.user.id,
            content,
            (chunk) => {
              // Send each chunk as a Server-Sent Event
              const data = JSON.stringify(chunk);
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            },
          );

          // Send done signal
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          logger.error("Streaming error", {
            conversationId,
            userId: session.user.id,
            error: error instanceof Error ? error.message : String(error),
          });
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    logger.error("Stream API error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return new Response("Internal server error", { status: 500 });
  }
}
