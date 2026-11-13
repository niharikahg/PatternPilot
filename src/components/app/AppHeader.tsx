import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Compass, Moon, Sun, LogIn, LogOut } from "lucide-react";
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
    <Link to="/" className="flex shrink-0 items-center gap-2 font-display text-base font-extrabold sm:text-lg">
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-highlight text-highlight-foreground">
        <Compass className="h-4 w-4" />
      </span>
      PatternPilot
    </Link>
  );
}

import { useAccount } from "./AccountProvider";

export function AppHeader() {
  const account=useAccount();
  const link = "rounded-full px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:px-4 sm:text-sm";
  const active = { className: "bg-foreground !text-background hover:bg-foreground" };
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-1 px-3 sm:gap-4 sm:px-4">
        <Logo />
        <nav className="flex items-center gap-1">
          <Link to="/workspace" className={link} activeProps={active}>Workspace</Link>
          <Link to="/dashboard" className={link} activeProps={active}>Dashboard</Link>
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-1">{account.userId?<Button variant="ghost" size="icon" title={account.sync} aria-label="Sign out" onClick={()=>void account.signOut()}><LogOut className="size-4" /></Button>:<Button asChild variant="ghost" size="icon"><Link to="/auth" aria-label="Sign in"><LogIn className="size-4" /></Link></Button>}<ThemeToggle /></div>
      </div>
    </header>
  );
}
