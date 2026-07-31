import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Globe, Menu, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NbcLogo } from "@/components/nbc/NbcLogo";
import { navigationItems, languages, type NavItem } from "@/lib/nbc-content";
import { cn } from "@/lib/utils";

function NavLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const className =
    "cursor-pointer rounded-md px-1 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-nbc-royal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  if (item.to) {
    return (
      <Link
        to={item.to}
        onClick={onNavigate}
        className={className}
        activeProps={{ className: "text-nbc-royal font-semibold" }}
        activeOptions={{ exact: true }}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onNavigate} className={className}>
      {item.label}
    </button>
  );
}

/**
 * Global navigation for the NBC Hospitality platform.
 * Sticky on scroll, collapses into a sheet below the large breakpoint.
 */
export function GlobalNav() {
  const [scrolled, setScrolled] = useState(false);
  const [language, setLanguage] = useState<string>(languages[0]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-nbc-scarlet/90 bg-background transition-shadow",
        scrolled && "shadow-card",
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3 lg:flex lg:gap-10 lg:px-8"
      >
        <div className="flex min-w-0 items-center gap-10">
          <NbcLogo height={40} />
          <div className="hidden items-center gap-8 lg:flex">
            {navigationItems.map((item) => (
              <NavLink key={item.label} item={item} />
            ))}
          </div>
        </div>

        <div className="hidden items-center gap-4 lg:ml-auto lg:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 text-foreground/80">
                <Globe aria-hidden="true" />
                {language}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((lang) => (
                <DropdownMenuItem key={lang} onSelect={() => setLanguage(lang)}>
                  {lang === "ENG" ? "English" : "Kiswahili"}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="scarlet" size="lg" className="gap-2" asChild>
            <Link to="/auth" search={{ next: "/" }}>
              <User aria-hidden="true" />
              Login
            </Link>
          </Button>
        </div>


        <div className="flex items-center justify-end gap-2 lg:hidden">
          <Button variant="scarlet" size="sm" className="gap-2" asChild>
            <Link to="/auth" search={{ next: "/" }}>
              <User aria-hidden="true" />
              Login
            </Link>
          </Button>
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[86vw] max-w-sm">
              <SheetTitle className="sr-only">NBC Hospitality menu</SheetTitle>
              <div className="mt-2 flex flex-col gap-6">
                <NbcLogo height={36} />
                <div className="flex flex-col gap-2">
                  {navigationItems.map((item) => (
                    <NavLink key={item.label} item={item} onNavigate={() => setMenuOpen(false)} />
                  ))}
                </div>
                <div className="flex flex-col gap-3 border-t border-border pt-6">
                  <Button variant="outline" className="justify-start gap-2">
                    <Globe aria-hidden="true" />
                    Language · {language}
                  </Button>

                  <Button variant="scarlet" size="lg" className="justify-start gap-2" asChild>
                    <Link to="/auth" search={{ next: "/" }} onClick={() => setMenuOpen(false)}>
                      <User aria-hidden="true" />
                      Login
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

      </nav>
    </header>
  );
}
