
import { Logo } from "./Logo";

export function Header() {
  return (
    <header className="sticky top-0 z-10 w-full py-4 px-6 md:px-10 backdrop-blur-md bg-cutelist-dark/80 border-b border-cutelist-primary/20">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Logo />
        <div className="flex gap-2">
          <button className="text-sm font-medium text-cutelist-primary hover:text-cutelist-accent transition-colors">
            Login
          </button>
        </div>
      </div>
    </header>
  );
}
