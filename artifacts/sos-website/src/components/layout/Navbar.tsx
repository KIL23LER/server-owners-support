import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, LayoutTemplate, ShieldCheck, Bot, Menu, X, Home, Palette } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export function Navbar() {
  const [location] = useLocation();
  const { user, login, logout, isLoading } = useAuth();
  const { t, i18n } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAr = i18n.language === "ar";

  function toggleLang() {
    i18n.changeLanguage(isAr ? "en" : "ar");
  }

  const navLinks = [
    { href: "/",          label: t("nav.home"),      icon: Home,    exact: true },
    { href: "/templates", label: t("nav.templates"),  icon: LayoutTemplate },
    { href: "/customize", label: t("nav.customize"),  icon: Palette },
    { href: "/bot",       label: t("nav.bot"),        icon: Bot },
  ];

  function isActive(href: string, exact?: boolean) {
    return exact ? location === href : location.startsWith(href);
  }

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
              <img
                src="https://cdn.discordapp.com/icons/264549513333702657/27eaa9612e3b89378485fbf9f001d97d.png"
                alt="SOS"
                className="w-8 h-8 rounded-full border border-primary/20"
              />
              <span className="font-bold text-lg hidden sm:inline-block text-primary">SOS</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ href, label, icon: Icon, exact }) => (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                    isActive(href, exact)
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLang}
              className="font-semibold text-xs border border-border/50 px-2.5 py-1 h-8 rounded-full"
              title={isAr ? "Switch to English" : "التبديل للعربية"}
            >
              {isAr ? "EN" : "عر"}
            </Button>

            {!isLoading && (
              user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10 border border-primary/20">
                        <AvatarImage src={user.avatar || undefined} alt={user.username} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        {user.globalName && <p className="font-medium">{user.globalName}</p>}
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/templates" className="cursor-pointer flex w-full items-center">
                        <LayoutTemplate className="ms-2 me-2 h-4 w-4" />
                        <span>{t("nav.browseTemplates")}</span>
                      </Link>
                    </DropdownMenuItem>
                    {user.isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer flex w-full items-center">
                          <ShieldCheck className="ms-2 me-2 h-4 w-4 text-primary" />
                          <span className="text-primary font-medium">{t("nav.adminPanel")}</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={logout}>
                      <LogOut className="ms-2 me-2 h-4 w-4" />
                      <span>{t("nav.logout")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={login} className="font-bold hidden md:flex">
                  {t("nav.login")}
                </Button>
              )
            )}

            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur flex flex-col pt-16">
          <div className="flex flex-col gap-1 px-4 py-6">
            {navLinks.map(({ href, label, icon: Icon, exact }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-colors ${
                  isActive(href, exact)
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {label}
                {href === "/bot" && (
                  <span className="ms-auto text-xs bg-[#5865F2]/15 text-[#5865F2] px-2 py-0.5 rounded-full font-semibold">
                    {isAr ? "جديد" : "New"}
                  </span>
                )}
              </Link>
            ))}

            <div className="mt-4 border-t border-border/40 pt-4">
              {!isLoading && !user && (
                <Button onClick={() => { login(); setMobileOpen(false); }} className="w-full font-bold h-12 text-base">
                  {t("nav.login")}
                </Button>
              )}
              {!isLoading && user && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50">
                  <Avatar className="h-10 w-10 border border-primary/20">
                    <AvatarImage src={user.avatar || undefined} alt={user.username} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{user.globalName || user.username}</p>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => { logout(); setMobileOpen(false); }} className="text-destructive hover:text-destructive">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
