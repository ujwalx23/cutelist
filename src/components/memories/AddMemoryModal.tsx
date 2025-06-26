
import { useState, useRef } from "react";
import { X, ImageIcon, AtSign } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface AddMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateMemory: (memoryData: {
    title: string;
    description: string;
    image: File | null;
    tags: string;
  }) => void;
  isPending: boolean;
  uploadProgress: number;
}

export const AddMemoryModal = ({
  isOpen,
  onClose,
  onCreateMemory,
  isPending,
  uploadProgress,
}: AddMemoryModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newMemory, setNewMemory] = useState({
    title: "",
    description: "",
    image: null as File | null,
    tags: "",
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setNewMemory({ ...newMemory, image: file });
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClose = () => {
    onClose();
    setPreviewImage(null);
    setNewMemory({
      title: "",
      description: "",
      image: null,
      tags: "",
    });
  };

  const handleCreateMemory = () => {
    onCreateMemory(newMemory);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Memory</DialogTitle>
          <DialogDescription>
            Capture a special moment to remember
          </DialogDescription>
        </DialogHeader>
        {uploadProgress > 0 && uploadProgress < 100 ? (
          <div className="py-10">
            <div className="mb-2 flex justify-between text-sm">
              <span>Uploading image...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cutelist-primary" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Give your memory a title"
                value={newMemory.title}
                onChange={(e) => setNewMemory({ ...newMemory, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What makes this memory special?"
                className="min-h-[100px]"
                value={newMemory.description}
                onChange={(e) => setNewMemory({ ...newMemory, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex items-center">
                <AtSign className="mr-2 h-4 w-4 text-gray-500" />
                <Input
                  id="tags"
                  placeholder="summer, vacation, friends (comma separated)"
                  value={newMemory.tags}
                  onChange={(e) => setNewMemory({ ...newMemory, tags: e.target.value })}
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
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 transition-colors ${
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
                        setNewMemory({ ...newMemory, image: null });
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2 cursor-pointer p-8">
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
        )}
        <div className="flex justify-end space-x-2 mt-4">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={uploadProgress > 0 && uploadProgress < 100}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateMemory}
            disabled={
              isPending || 
              (uploadProgress > 0 && uploadProgress < 100)
            }
          >
            {isPending ? "Creating..." : "Save Memory"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
