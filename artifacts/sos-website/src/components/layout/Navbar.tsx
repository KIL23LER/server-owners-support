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
import { LogOut, LayoutTemplate, ShieldCheck, Bot } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Navbar() {
  const [location] = useLocation();
  const { user, login, logout, isLoading } = useAuth();
  const { t, i18n } = useTranslation();

  const isAr = i18n.language === "ar";

  function toggleLang() {
    i18n.changeLanguage(isAr ? "en" : "ar");
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="https://cdn.discordapp.com/icons/264549513333702657/27eaa9612e3b89378485fbf9f001d97d.png"
              alt="Server Owners Support"
              className="w-8 h-8 rounded-full border border-primary/20"
            />
            <span className="font-bold text-lg hidden sm:inline-block text-primary">SOS</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${location === "/" ? "bg-primary/10 text-primary" : "text-foreground/70 hover:text-foreground hover:bg-muted"}`}>
              {t("nav.home")}
            </Link>
            <Link href="/templates" className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${location.startsWith("/templates") ? "bg-primary/10 text-primary" : "text-foreground/70 hover:text-foreground hover:bg-muted"}`}>
              {t("nav.templates")}
            </Link>
            <Link href="/customize" className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${location.startsWith("/customize") ? "bg-primary/10 text-primary" : "text-foreground/70 hover:text-foreground hover:bg-muted"}`}>
              {t("nav.customize")}
            </Link>
            <Link href="/bot" className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1 ${location.startsWith("/bot") ? "bg-primary/10 text-primary" : "text-foreground/70 hover:text-foreground hover:bg-muted"}`}>
              <Bot className="w-3.5 h-3.5" />
              {t("nav.bot")}
            </Link>
          </div>
        </div>

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
              <Button onClick={login} className="font-bold">
                {t("nav.login")}
              </Button>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
