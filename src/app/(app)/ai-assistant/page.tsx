"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Plus, Trash2, RefreshCw, Copy, Check, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getConversations,
  getConversation,
  createConversation,
  deleteConversation,
  clearConversation,
  sendMessage,
  regenerateResponse,
} from "@/actions/ai-conversation.actions";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: string;
  content: string;
  createdAt: Date;
};

type Conversation = {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  _count: { messages: number };
};

export default function AiAssistantPage() {
  const queryClient = useQueryClient();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  const { data: conversationsData, isLoading: conversationsLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => getConversations({ page: 1, pageSize: 50 }),
  });

  // Fetch selected conversation
  const { data: conversationData, isLoading: conversationLoading } = useQuery({
    queryKey: ["conversation", selectedConversationId],
    queryFn: () => (selectedConversationId ? getConversation(selectedConversationId) : null),
    enabled: !!selectedConversationId,
  });

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: createConversation,
    onSuccess: (data) => {
      if (data.ok && data.data) {
        setSelectedConversationId(data.data.id);
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      } else if (!data.ok) {
        console.error("Failed to create conversation:", data.error);
        alert(data.error || "Failed to create conversation");
      }
    },
    onError: (error) => {
      console.error("Error creating conversation:", error);
      alert("Error creating conversation: " + (error instanceof Error ? error.message : String(error)));
    },
  });

  // Delete conversation mutation
  const deleteConversationMutation = useMutation({
    mutationFn: deleteConversation,
    onSuccess: () => {
      setSelectedConversationId(null);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  // Clear conversation mutation
  const clearConversationMutation = useMutation({
    mutationFn: clearConversation,
    onSuccess: (data) => {
      if (data.ok) {
        queryClient.invalidateQueries({ queryKey: ["conversation", selectedConversationId] });
      }
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) =>
      sendMessage(conversationId, { content }),
    onSuccess: (data) => {
      if (data.ok) {
        queryClient.invalidateQueries({ queryKey: ["conversation", selectedConversationId] });
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      }
    },
  });

  // Regenerate response mutation
  const regenerateResponseMutation = useMutation({
    mutationFn: regenerateResponse,
    onSuccess: (data) => {
      if (data.ok) {
        queryClient.invalidateQueries({ queryKey: ["conversation", selectedConversationId] });
      }
    },
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationData?.messages]);

  // Handle new conversation
  const handleNewConversation = () => {
    createConversationMutation.mutate({ title: "New Chat" });
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!input.trim() || !selectedConversationId || isSending) return;

    const content = input;
    setInput("");
    setIsSending(true);

    sendMessageMutation.mutate(
      { conversationId: selectedConversationId, content },
      {
        onSuccess: () => {
          setIsSending(false);
        },
        onError: () => {
          setIsSending(false);
        },
      },
    );
  };

  // Handle regenerate response
  const handleRegenerate = () => {
    if (!selectedConversationId) return;
    regenerateResponseMutation.mutate(selectedConversationId);
  };

  // Handle copy message
  const handleCopy = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  // Handle delete conversation
  const handleDeleteConversation = (conversationId: string) => {
    if (confirm("Are you sure you want to delete this conversation?")) {
      deleteConversationMutation.mutate(conversationId);
    }
  };

  // Handle clear conversation
  const handleClearConversation = () => {
    if (!selectedConversationId) return;
    if (confirm("Are you sure you want to clear all messages in this conversation?")) {
      clearConversationMutation.mutate(selectedConversationId);
    }
  };

  const conversations = conversationsData?.items || [];
  const messages = conversationData?.messages || [];

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-64 border-r border-[--border] bg-[--surface] flex flex-col">
        <div className="p-4 border-b border-[--border]">
          <Button onClick={handleNewConversation} className="w-full" size="sm">
            <Plus className="size-4 mr-2" />
            New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {conversationsLoading ? (
            <div className="text-sm text-[--muted-foreground]">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="text-sm text-[--muted-foreground]">No conversations yet</div>
          ) : (
            conversations.map((conv: Conversation) => (
              <div
                key={conv.id}
                className={cn(
                  "p-3 rounded-lg cursor-pointer mb-1 hover:bg-[--surface-hover] transition-colors",
                  selectedConversationId === conv.id && "bg-[--surface-hover]",
                )}
                onClick={() => setSelectedConversationId(conv.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{conv.title}</div>
                    <div className="text-xs text-[--muted-foreground]">
                      {conv._count.messages} messages
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-6">
                        <Trash2 className="size-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleDeleteConversation(conv.id)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversationId ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-[--border] flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{conversationData?.title || "Chat"}</h2>
                <p className="text-sm text-[--muted-foreground]">
                  {messages.length} messages
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleClearConversation}>
                  <Trash2 className="size-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {conversationLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-sm text-[--muted-foreground]">Loading...</div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageSquare className="size-12 mx-auto mb-4 text-[--muted-foreground]" />
                    <p className="text-[--muted-foreground]">Start a conversation</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message: Message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        message.role === "user" ? "justify-end" : "justify-start",
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] rounded-lg p-3",
                          message.role === "user"
                            ? "bg-[--accent] text-white"
                            : "bg-[--surface] border border-[--border]",
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                            <div className="text-xs mt-1 opacity-70">
                              {new Date(message.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                          {message.role === "assistant" && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-6 h-6 w-6"
                                onClick={() => handleCopy(message.content, message.id)}
                              >
                                {copiedMessageId === message.id ? (
                                  <Check className="size-3" />
                                ) : (
                                  <Copy className="size-3" />
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-[--border]">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type your message..."
                  disabled={isSending}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isSending}
                  size="icon"
                >
                  <Send className="size-4" />
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleRegenerate}
                  disabled={isSending || messages.length === 0}
                  size="icon"
                >
                  <RefreshCw className="size-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle>AI Assistant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[--muted-foreground] mb-4">
                  Start a new conversation to get help with incidents, deployments, and operational
                  best practices.
                </p>
                <Button onClick={handleNewConversation} className="w-full">
                  <Plus className="size-4 mr-2" />
                  New Chat
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
