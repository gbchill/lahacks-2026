import { Link, useLocation } from "react-router-dom";
import { House, ScanLine, FolderHeart, User } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { getLabels } from "@/lib/menu-labels";
import { cn } from "@/lib/utils";

export function BottomTabBar() {
  const location = useLocation();
  const { user } = useAuth();
  const { code } = useLanguage();
  const labels = getLabels(code);

  const isActive = (path: string) => location.pathname === path;

  const tabs = [
    { to: "/home", icon: House, label: labels.tabHome, active: isActive("/home") },
    { to: "/capture", icon: ScanLine, label: labels.tabScan, active: isActive("/capture") },
    { to: "/documents", icon: FolderHeart, label: labels.tabDocuments, active: isActive("/documents") },
    { to: user ? "/account" : "/login", icon: User, label: labels.tabProfile, active: isActive("/account") || isActive("/login") },
  ];

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 bg-background/80 backdrop-blur-2xl border-t border-white/10"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Main navigation"
    >
      <div className="max-w-lg mx-auto flex items-center justify-around h-[72px]">
        {tabs.map(({ to, icon: Icon, label, active }) => (
          <Link
            key={to}
            to={to}
            aria-label={label}
            className={cn(
              "flex flex-col items-center justify-center gap-1 rounded-2xl transition-all w-20 h-12",
              active
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground"
            )}
          >
            <Icon size={22} strokeWidth={1.5} />
            <span className="text-[11px] leading-none">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
