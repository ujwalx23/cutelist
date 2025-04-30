
import { Heart } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative w-8 h-8 border-2 border-cutelist-primary rounded-md transform rotate-3 flex items-center justify-center bg-white">
        <span className="text-cutelist-dark font-bold text-xs tracking-tight">TO</span>
        <span className="text-cutelist-dark font-bold text-xs tracking-tight">DO</span>
        <Heart className="text-cutelist-heart absolute bottom-0.5 size-4" fill="currentColor" strokeWidth={1} />
        <div className="absolute top-0 right-0 w-3 h-3 bg-cutelist-accent transform translate-x-1 -translate-y-1 rotate-45"></div>
      </div>
    </div>
  );
}
