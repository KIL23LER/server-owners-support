import { useLocation } from "wouter";
import { useListTemplates, useApplyBotTemplate } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useState, useEffect } from "react";
import { Bot, ShieldCheck, LogOut, Hash, Users, ArrowRight, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const APP_ID = "1510614634111963156";
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function buildInviteUrl(templateId: number): string {
  const redirectUri = encodeURIComponent(
    `${window.location.origin}${BASE}/bot`
  );
  return (
    `https://discord.com/api/oauth2/authorize` +
    `?client_id=${APP_ID}` +
    `&permissions=8` +
    `&scope=bot` +
    `&redirect_uri=${redirectUri}` +
    `&response_type=code` +
    `&state=${templateId}`
  );
}

export default function BotPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

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
          toast({ title: "✅ تم تطبيق القالب!", description: "القنوات والرتب أُنشئت بنجاح." });
        },
        onError: (err) => {
          toast({ variant: "destructive", title: "خطأ", description: err.message || "فشل تطبيق القالب." });
        },
      }
    );
  };

  if (guildId && !applied) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4" dir="rtl">
        <div className="max-w-lg w-full space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#5865F2]/10 mb-4">
              <CheckCircle2 className="w-8 h-8 text-[#5865F2]" />
            </div>
            <h1 className="text-2xl font-bold mb-2">البوت انضاف للسيرفر!</h1>
            <p className="text-muted-foreground">اختر القالب اللي تبي تطبقه:</p>
          </div>

          <div className="space-y-3 max-h-[50vh] overflow-y-auto">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))
            ) : templates?.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplateId(t.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-right ${
                  (selectedTemplateId ?? stateTemplateId) === t.id
                    ? "border-[#5865F2] bg-[#5865F2]/10"
                    : "border-border hover:border-[#5865F2]/50 hover:bg-muted/50"
                }`}
              >
                {t.imageUrl && (
                  <img src={t.imageUrl} alt={t.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{t.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{t.description}</p>
                </div>
                <Badge variant="secondary" className="shrink-0">{t.category}</Badge>
              </button>
            ))}
          </div>

          {!user && (
            <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>تحتاج تسجيل الدخول بديسكورد عشان يشتغل البوت.</span>
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
                جاري تطبيق القالب...
              </>
            ) : (
              <>
                <Bot className="w-5 h-5" />
                طبّق القالب الآن
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  if (applied) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4" dir="rtl">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-2">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold">تم بنجاح! 🎉</h1>
          <p className="text-muted-foreground">
            القنوات والرتب أُنشئت في سيرفرك. البوت غادر تلقائياً.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => { setApplied(false); setGuildId(null); }}>
              تطبيق على سيرفر آخر
            </Button>
            <Button variant="outline" asChild>
              <a href="/customize">🎨 تخصيص القالب</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#5865F2]/20 via-background to-background border-b border-border/50 py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 bg-[#5865F2]/10 border border-[#5865F2]/30 text-[#5865F2] rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Bot className="w-4 h-4" />
            بوت Discord الرسمي
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            طبّق القالب على سيرفرك
            <span className="text-[#5865F2]"> بضغطة زر</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            اختر القالب، أضف البوت لسيرفرك، وهو يُنشئ كل القنوات والرتب تلقائياً ثم يغادر. بدون أوامر، بدون إعدادات.
          </p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-center mb-8">اختر القالب</h2>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-xl" />
              ))}
            </div>
          ) : templates && templates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((t) => (
                <Card key={t.id} className="overflow-hidden border-border/50 hover:border-[#5865F2]/50 hover:shadow-md transition-all group">
                  {t.imageUrl && (
                    <div className="h-40 w-full overflow-hidden bg-muted">
                      <img src={t.imageUrl} alt={t.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-lg leading-tight">{t.name}</h3>
                      <Badge variant="secondary" className="shrink-0 text-xs">{t.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{t.description}</p>
                    <a href={buildInviteUrl(t.id)} rel="noopener noreferrer">
                      <Button className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold gap-2">
                        <Bot className="w-4 h-4" />
                        أضف البوت وطبّق
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">لا توجد قوالب متاحة حالياً.</p>
          )}
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-8">كيف يعمل؟</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Bot className="w-6 h-6 text-[#5865F2]" />, step: "١", title: "اختر القالب", desc: "اختر القالب المناسب لسيرفرك واضغط \"أضف البوت وطبّق\"." },
              { icon: <CheckCircle2 className="w-6 h-6 text-yellow-500" />, step: "٢", title: "أضفه لسيرفرك", desc: "Discord يفتح ويطلب منك تختار السيرفر — اختره وأكّد." },
              { icon: <LogOut className="w-6 h-6 text-green-500" />, step: "٣", title: "البوت يشتغل ويخرج", desc: "البوت ينشئ القنوات والرتب تلقائياً ثم يغادر السيرفر." },
            ].map((item) => (
              <div key={item.step} className="relative bg-card border border-border rounded-xl p-6 text-center">
                <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-[#5865F2] text-white text-xs font-bold flex items-center justify-center">
                  {item.step}
                </div>
                <div className="flex justify-center mb-3">{item.icon}</div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
            <ShieldCheck className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold text-green-600 dark:text-green-400 mb-2">البوت لا يبقى في سيرفرك</h3>
            <p className="text-sm text-muted-foreground">
              يدخل فقط لتطبيق القالب، ثم يغادر تلقائياً. لا يقرأ رسائلك ولا يراقبك.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
