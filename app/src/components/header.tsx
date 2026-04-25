import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="w-full border-b border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto max-w-3xl flex items-center justify-between px-5 py-4">
        <Link to="/" className="font-heading text-2xl text-foreground no-underline hover:opacity-80 transition-opacity">
          Orision
        </Link>
      </div>
    </header>
  );
}
