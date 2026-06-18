import { useLocation } from "wouter";
import { useListTemplates, useApplyBotTemplate } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useState, useEffect } from "react";
import { Bot, ShieldCheck, LogOut, ArrowRight, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const APP_ID = "1510614634111963156";
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function buildInviteUrl(templateId: number): string {
  const redirectUri = encodeURIComponent(`${window.location.origin}${BASE}/bot`);
  return (
    `https://discord.com/oauth2/authorize` +
    `?client_id=${APP_ID}` +
    `&permissions=8` +
    `&scope=bot` +
    `&redirect_uri=${redirectUri}` +
    `&state=${templateId}`
  );
}

export default function BotPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [guildId, setGuildId] = useState<string | null>(null);
  const [stateTemplateId, setStateTemplateId] = useState<number | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [applied, setApplied] = useState(false);

  const { data: templates, isLoading } = useListTemplates({}, {
    query: { queryKey: ["templates-bot"] }
  });

  const applyBot = useApplyBotTemplate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gid = params.get("guild_id");
    const state = params.get("state");
    if (gid) {
      setGuildId(gid);
      if (state) setStateTemplateId(Number(state));
      window.history.replaceState({}, "", `${BASE}/bot`);
    }
  }, []);

  const handleApply = () => {
    const tid = selectedTemplateId ?? stateTemplateId;
    if (!guildId || !tid) return;

    applyBot.mutate(
      { data: { guildId, templateId: tid } },
      {
        onSuccess: () => {
          setApplied(true);
          toast({ title: t("bot.toastSuccess"), description: t("bot.toastSuccessDesc") });
        },
        onError: (err) => {
          toast({ variant: "destructive", title: t("bot.toastError"), description: err.message || t("bot.toastErrorDesc") });
        },
      }
    );
  };

  if (guildId && !applied) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-lg w-full space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#5865F2]/10 mb-4">
              <CheckCircle2 className="w-8 h-8 text-[#5865F2]" />
            </div>
            <h1 className="text-2xl font-bold mb-2">{t("bot.botAdded")}</h1>
            <p className="text-muted-foreground">{t("bot.chooseToApply")}</p>
          </div>

          <div className="space-y-3 max-h-[50vh] overflow-y-auto">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))
            ) : templates?.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => setSelectedTemplateId(tmpl.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-start ${
                  (selectedTemplateId ?? stateTemplateId) === tmpl.id
                    ? "border-[#5865F2] bg-[#5865F2]/10"
                    : "border-border hover:border-[#5865F2]/50 hover:bg-muted/50"
                }`}
              >
                {tmpl.imageUrl && (
                  <img src={tmpl.imageUrl} alt={tmpl.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{tmpl.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{tmpl.description}</p>
                </div>
                <Badge variant="secondary" className="shrink-0">{tmpl.category}</Badge>
              </button>
            ))}
          </div>

          {!user && (
            <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{t("bot.loginWarning")}</span>
            </div>
          )}

          <Button
            className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-base h-12 gap-2"
            disabled={!(selectedTemplateId ?? stateTemplateId) || applyBot.isPending || !user}
            onClick={handleApply}
          >
            {applyBot.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t("bot.applying")}
              </>
            ) : (
              <>
                <Bot className="w-5 h-5" />
                {t("bot.applyNow")}
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  if (applied) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-2">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold">{t("bot.successTitle")}</h1>
          <p className="text-muted-foreground">{t("bot.successDesc")}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => { setApplied(false); setGuildId(null); }}>
              {t("bot.applyAnother")}
            </Button>
            <Button variant="outline" asChild>
              <a href="/customize">{t("bot.customizeTemplate")}</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#5865F2]/20 via-background to-background border-b border-border/50 py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 bg-[#5865F2]/10 border border-[#5865F2]/30 text-[#5865F2] rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Bot className="w-4 h-4" />
            {t("bot.badge")}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            {t("bot.title")}
            <span className="text-[#5865F2]">{t("bot.titleHighlight")}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            {t("bot.subtitle")}
          </p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-center mb-8">{t("bot.chooseTemplate")}</h2>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-xl" />
              ))}
            </div>
          ) : templates && templates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((tmpl) => (
                <Card key={tmpl.id} className="overflow-hidden border-border/50 hover:border-[#5865F2]/50 hover:shadow-md transition-all group">
                  {tmpl.imageUrl && (
                    <div className="h-40 w-full overflow-hidden bg-muted">
                      <img src={tmpl.imageUrl} alt={tmpl.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-lg leading-tight">{tmpl.name}</h3>
                      <Badge variant="secondary" className="shrink-0 text-xs">{tmpl.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{tmpl.description}</p>
                    <a href={buildInviteUrl(tmpl.id)} rel="noopener noreferrer">
                      <Button className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold gap-2">
                        <Bot className="w-4 h-4" />
                        {t("bot.addAndApply")}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">{t("bot.noTemplates")}</p>
          )}
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-8">{t("bot.howItWorks")}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {(["1", "2", "3"] as const).map((step, idx) => {
              const icons = [
                <Bot key="1" className="w-6 h-6 text-[#5865F2]" />,
                <CheckCircle2 key="2" className="w-6 h-6 text-yellow-500" />,
                <LogOut key="3" className="w-6 h-6 text-green-500" />,
              ];
              const nums = ["١", "٢", "٣"];
              return (
                <div key={step} className="relative bg-card border border-border rounded-xl p-6 text-center">
                  <div className="absolute -top-3 -end-3 w-7 h-7 rounded-full bg-[#5865F2] text-white text-xs font-bold flex items-center justify-center">
                    {nums[idx]}
                  </div>
                  <div className="flex justify-center mb-3">{icons[idx]}</div>
                  <h3 className="font-semibold mb-2">{t(`bot.steps.${step}.title`)}</h3>
                  <p className="text-sm text-muted-foreground">{t(`bot.steps.${step}.desc`)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-10 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
            <ShieldCheck className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold text-green-600 dark:text-green-400 mb-2">{t("bot.safetyTitle")}</h3>
            <p className="text-sm text-muted-foreground">{t("bot.safetyDesc")}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
