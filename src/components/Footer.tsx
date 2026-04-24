export const Footer = () => (
  <footer className="border-t border-border bg-background mt-24">
    <div className="container py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <div className="checkered h-4 w-4 rounded-sm" />
        <span className="font-mono">LMU RACE HUB</span>
        <span>— built for sim racers, by sim racers.</span>
      </div>
      <div className="flex items-center gap-4 font-mono text-xs uppercase tracking-wider">
        <span>v1.0 · Phase 1</span>
        <span className="text-primary">●</span>
        <span>Online</span>
      </div>
    </div>
  </footer>
);
