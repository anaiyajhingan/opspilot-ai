"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MessageSquare, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IncidentDetails } from "@/features/incidents/components/incident-details";
import { IncidentTimeline } from "@/features/incidents/components/incident-timeline";
import { useIncident, useAddComment, useUpdateIncident, useDeleteIncident } from "@/features/incidents/hooks/use-incidents";
import type { CommentInput } from "@/features/incidents/schemas";
import { useState } from "react";

export default function IncidentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const incidentId = params.id as string;
  const [comment, setComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const { data: incident, isLoading, error } = useIncident(incidentId);
  const addCommentMutation = useAddComment(incidentId);
  const updateMutation = useUpdateIncident(incidentId);
  const deleteMutation = useDeleteIncident();

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    const input: CommentInput = { body: comment };
    const result = await addCommentMutation.mutateAsync(input);

    if (result.ok) {
      setComment("");
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this incident?")) {
      const result = await deleteMutation.mutateAsync(incidentId);
      if (result.ok) {
        router.push("/incidents");
      } else {
        alert(result.error || "Failed to delete incident");
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 size-4" />
          Back
        </Button>
        <div className="rounded-[10px] border border-[--border] bg-[--surface] p-6">
          <p className="text-sm text-[--sev-1]">Failed to load incident. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 size-4" />
        Back to Incidents
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <IncidentDetails 
            incident={incident!} 
            isLoading={isLoading} 
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <IncidentTimeline incident={incident!} isLoading={isLoading} />
        </div>

        <div className="space-y-6">
          <div className="rounded-[10px] border border-[--border] bg-[--surface] p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="size-4 text-[--muted-foreground]" />
              <h3 className="text-sm font-medium">Add Comment</h3>
            </div>
            <div className="space-y-3">
              <Input
                placeholder="Write a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
                disabled={isLoading || addCommentMutation.isPending}
              />
              <Button
                onClick={handleAddComment}
                disabled={!comment.trim() || isLoading || addCommentMutation.isPending}
                className="w-full"
              >
                <Send className="mr-2 size-4" />
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
