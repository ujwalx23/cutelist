
import { useState, useRef } from "react";
import { X, ImageIcon, AtSign } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Memory } from "./types";

interface AddMemoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memory?: Memory;
}

export const AddMemoryModal = ({ open, onOpenChange, memory }: AddMemoryModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: memory?.title || "",
    description: memory?.description || "",
    tags: memory?.tags?.join(", ") || "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(memory?.image_url || null);

  const createMemoryMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; tags: string; image_url?: string }) => {
      if (!user) throw new Error("Must be logged in");

      const tagsArray = data.tags.split(",").map(tag => tag.trim()).filter(Boolean);
      
      if (memory) {
        // Update existing memory
        const { data: result, error } = await supabase
          .from('memories')
          .update({
            title: data.title,
            description: data.description,
            tags: tagsArray,
            image_url: data.image_url || memory.image_url
          })
          .eq('id', memory.id)
          .select()
          .single();
        
        if (error) throw error;
        return result;
      } else {
        // Create new memory
        const { data: result, error } = await supabase
          .from('memories')
          .insert([{
            title: data.title,
            description: data.description,
            tags: tagsArray,
            image_url: data.image_url,
            user_id: user.id
          }])
          .select()
          .single();
        
        if (error) throw error;
        return result;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
      toast({
        title: memory ? "Memory updated" : "Memory created",
        description: `Your memory has been successfully ${memory ? 'updated' : 'created'}.`,
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${memory ? 'update' : 'create'} memory. Please try again.`,
        variant: "destructive",
      });
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClose = () => {
    onOpenChange(false);
    setFormData({ title: "", description: "", tags: "" });
    setSelectedFile(null);
    setPreviewImage(null);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) return;

    let imageUrl = memory?.image_url;

    if (selectedFile) {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('memories')
        .upload(fileName, selectedFile);

      if (uploadError) {
        toast({
          title: "Upload Error",
          description: "Failed to upload image. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const { data } = supabase.storage.from('memories').getPublicUrl(fileName);
      imageUrl = data.publicUrl;
    }

    createMemoryMutation.mutate({
      ...formData,
      image_url: imageUrl
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{memory ? 'Edit Memory' : 'Create Memory'}</DialogTitle>
          <DialogDescription>
            {memory ? 'Update your memory' : 'Capture a special moment to remember'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Give your memory a title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What makes this memory special?"
              className="min-h-[100px]"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex items-center">
              <AtSign className="mr-2 h-4 w-4 text-gray-500" />
              <Input
                id="tags"
                placeholder="summer, vacation, friends (comma separated)"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image">Image</Label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="sr-only"
              onChange={handleFileChange}
            />
            <div 
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer ${
                previewImage ? 'border-cutelist-primary/30' : 'border-gray-700 hover:border-gray-500'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              {previewImage ? (
                <div className="relative w-full">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewImage(null);
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2 p-8">
                  <div className="rounded-full bg-cutelist-primary/20 p-3">
                    <ImageIcon className="h-8 w-8 text-cutelist-primary" />
                  </div>
                  <span className="text-sm font-medium">Upload Image</span>
                  <span className="text-xs text-gray-500">Click to browse or drag and drop</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={createMemoryMutation.isPending || !formData.title.trim()}
          >
            {createMemoryMutation.isPending ? 
              (memory ? "Updating..." : "Creating...") : 
              (memory ? "Update Memory" : "Save Memory")
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
