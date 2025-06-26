
import { ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { MemoryCard } from "./MemoryCard";
import type { Memory } from "./types";

interface MemoriesTabProps {
  memories: Memory[];
}

export const MemoriesTab = ({ memories }: MemoriesTabProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {memories && memories.length > 0 ? (
        memories.map(memory => (
          <MemoryCard key={memory.id} memory={memory} />
        ))
      ) : (
        <div className="col-span-full flex flex-col items-center justify-center py-12">
          <ImageIcon className="h-16 w-16 mb-4 text-gray-600" />
          <h3 className="text-xl font-medium mb-2">No memories yet</h3>
          <p className="text-gray-400 text-center mb-4">
            Create your first memory to get started
          </p>
        </div>
      )}
    </div>
  );
};
