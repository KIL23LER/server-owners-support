import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LogOut, LayoutTemplate, ShieldCheck, Menu, Home, Sliders } from "lucide-react";

export function Navbar() {
  const [location] = useLocation();
  const { user, login, logout, isLoading } = useAuth();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const dir = t("dir") as "rtl" | "ltr";

  const navLinks = [
    { href: "/", label: t("nav.home"), icon: <Home className="w-4 h-4" /> },
    { href: "/templates", label: t("nav.templates"), icon: <LayoutTemplate className="w-4 h-4" /> },
    { href: "/customize", label: t("nav.customize"), icon: <Sliders className="w-4 h-4" /> },
  ];

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side={dir === "rtl" ? "right" : "left"} className="w-64 pt-8" dir={dir}>
              <div className="flex flex-col gap-1 mt-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive(link.href)
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/70 hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="mt-6 px-4">
                {!isLoading && !user && (
                  <Button onClick={() => { login(); setMobileOpen(false); }} className="w-full font-bold">
                    {t("nav.login")}
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2">
            <img
              src="https://cdn.discordapp.com/icons/264549513333702657/27eaa9612e3b89378485fbf9f001d97d.png"
              alt={t("site.name")}
              className="w-8 h-8 rounded-full border border-primary/20"
            />
            <span className="font-bold text-base text-primary hidden sm:inline">{t("site.name")}</span>
            <span className="font-bold text-base text-primary sm:hidden">{t("site.shortName")}</span>
          </Link>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                isActive(link.href)
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/70 hover:text-foreground hover:bg-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth */}
        <div className="flex items-center gap-2">
          {!isLoading && (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                    <Avatar className="h-10 w-10 border border-primary/20">
                      <AvatarImage src={user.avatar || undefined} alt={user.username} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {user.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56" dir={dir}>
                  <div className="flex items-center gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {user.globalName && <p className="font-medium">{user.globalName}</p>}
                      <p className="w-[200px] truncate text-sm text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/templates" className="cursor-pointer flex w-full items-center gap-2">
                      <LayoutTemplate className="h-4 w-4" />
                      <span>{t("nav.browseTemplates")}</span>
                    </Link>
                  </DropdownMenuItem>
                  {user.isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer flex w-full items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        <span className="text-primary font-medium">{t("nav.adminPanel")}</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive gap-2" onClick={logout}>
                    <LogOut className="h-4 w-4" />
                    <span>{t("nav.logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={login} className="font-bold text-sm px-4">
                <span className="hidden sm:inline">{t("nav.login")}</span>
                <span className="sm:hidden">{t("nav.loginShort")}</span>
              </Button>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
