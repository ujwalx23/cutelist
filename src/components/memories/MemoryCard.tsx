
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { ViewMemoryModal } from "./ViewMemoryModal";
import { AddMemoryModal } from "./AddMemoryModal";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Memory } from "./types";

interface MemoryCardProps {
  memory: Memory;
}

export function MemoryCard({ memory }: MemoryCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const deleteMemoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('memories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
      toast({
        title: "Memory deleted",
        description: "Your memory has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete memory. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this memory?")) {
      deleteMemoryMutation.mutate(memory.id);
    }
  };

  const canModify = user && (memory.user_id === user.id || memory.isDefault);

  return (
    <>
      <Card className="glass-card overflow-hidden group hover:scale-105 transition-transform duration-200">
        {memory.image_url && (
          <div className="aspect-video overflow-hidden">
            <img
              src={memory.image_url}
              alt={memory.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
        )}
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 text-white">{memory.title}</h3>
          {memory.description && (
            <p className="text-gray-400 text-sm mb-3 line-clamp-2">
              {memory.description}
            </p>
          )}
          {memory.tags && memory.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {memory.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">
              {new Date(memory.created_at).toLocaleDateString()}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setViewModalOpen(true)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              {canModify && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditModalOpen(true)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDelete}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <ViewMemoryModal
        memory={memory}
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
      />

      {canModify && (
        <AddMemoryModal
          memory={memory}
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
        />
      )}
    </>
  );
}
