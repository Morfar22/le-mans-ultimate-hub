import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Flag, Fuel, Map, User as UserIcon, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/calculator", label: "Calculator", icon: Fuel },
  { to: "/tracks", label: "Tracks", icon: Map },
];

export const Header = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-md bg-primary">
            <Flag className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg font-bold tracking-wide">LMU RACE HUB</span>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
              Race Engineer • v1.0
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  active ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/profile"><UserIcon className="h-4 w-4" />Profile</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4" />Sign out
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
        </div>

        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container flex flex-col gap-1 py-3">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium hover:bg-secondary"
              >
                <Icon className="h-4 w-4" />{label}
              </Link>
            ))}
            <div className="border-t border-border mt-2 pt-2">
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium hover:bg-secondary">
                    <UserIcon className="h-4 w-4" />Profile
                  </Link>
                  <button onClick={() => { signOut(); setOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium hover:bg-secondary">
                    <LogOut className="h-4 w-4" />Sign out
                  </button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-primary">
                  Sign in →
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
