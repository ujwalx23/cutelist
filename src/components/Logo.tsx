
import { Heart } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-8 h-8 sm:w-10 sm:h-10 border-2 border-cutelist-primary rounded-md transform rotate-3 flex items-center justify-center bg-white">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
          <span className="text-cutelist-dark font-bold text-[0.4rem] sm:text-xs tracking-tight">TO</span>
          <span className="text-cutelist-dark font-bold text-[0.4rem] sm:text-xs tracking-tight">DO</span>
        </div>
        <Heart className="text-cutelist-heart absolute bottom-0.5 right-0.5 size-2 sm:size-5" fill="currentColor" strokeWidth={1} />
        <div className="absolute top-0 right-0 w-2 h-2 sm:w-3 sm:h-3 bg-cutelist-accent transform translate-x-1 -translate-y-1 rotate-45"></div>
      </div>
      <span className="font-bold text-lg sm:text-2xl text-gradient">CuteList</span>
    </div>
  );
}
