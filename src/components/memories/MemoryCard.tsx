
import { useState } from "react";
import { format } from "date-fns";
import { Heart, CalendarIcon } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

interface Memory {
  id: string;
  user_id: string;
  title: string;
  description: string;
  image_url: string;
  tags: string[];
  created_at: string;
}

interface MemoryCardProps {
  memory: Memory;
  onViewMemory: (memory: Memory) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  currentUserId?: string;
}

export const MemoryCard = ({
  memory,
  onViewMemory,
  isFavorite,
  onToggleFavorite,
  currentUserId,
}: MemoryCardProps) => {
  return (
    <Card 
      className="overflow-hidden transition-all hover:shadow-lg cursor-pointer group"
      onClick={() => onViewMemory(memory)}
    >
      <div className="aspect-video relative overflow-hidden">
        <img 
          src={memory.image_url} 
          alt={memory.title} 
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        <div 
          className="absolute top-2 right-2 z-10"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(memory.id);
          }}
        >
          <Heart 
            className={`h-6 w-6 transition-colors ${
              isFavorite 
                ? "fill-red-500 text-red-500" 
                : "fill-transparent text-white/70 hover:text-white"
            }`} 
          />
        </div>
      </div>
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg line-clamp-1">{memory.title}</CardTitle>
        </div>
        <CardDescription className="line-clamp-1 flex items-center">
          <CalendarIcon className="h-3 w-3 mr-1" />
          {format(new Date(memory.created_at), "MMM d, yyyy")}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-gray-400 line-clamp-2">{memory.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex flex-wrap gap-1">
          {memory.tags && memory.tags.map((tag, i) => (
            <span 
              key={i} 
              className="text-xs px-2 py-1 bg-cutelist-primary/20 text-cutelist-primary rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
};
