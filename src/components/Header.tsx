import { Rocket, Cpu } from "lucide-react";

const Header = () => {
  return (
    <header className="relative border-b border-border/50 glass-card">
      <div className="container mx-auto px-4 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 glow-primary">
            <Rocket className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-gradient-primary">NexusNews</span>
            </h1>
            <p className="text-xs text-muted-foreground font-mono tracking-widest uppercase">
              Space & Tech Feed
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-slow" />
            LIVE
          </span>
          <span className="text-border">|</span>
          <span className="flex items-center gap-1">
            <Rocket className="w-3 h-3" /> Space
          </span>
          <span className="text-border">+</span>
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3" /> Tech
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
