import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Compass, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("pp-theme", next ? "dark" : "light");
  };
  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight">
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-highlight text-highlight-foreground">
        <Compass className="h-4 w-4" />
      </span>
      PatternPilot
    </Link>
  );
}

export function AppHeader() {
  const link = "rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground";
  const active = { className: "bg-foreground text-background hover:bg-foreground hover:text-background" };
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Logo />
        <nav className="flex items-center gap-1">
          <Link to="/workspace" className={link} activeProps={active}>Workspace</Link>
          <Link to="/dashboard" className={link} activeProps={active}>Dashboard</Link>
        </nav>
        <div className="ml-auto"><ThemeToggle /></div>
      </div>
    </header>
  );
}
