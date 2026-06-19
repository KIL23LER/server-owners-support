import { useState, useEffect, useRef, useCallback } from "react";
import { useSearch } from "wouter";
import { useListTemplates, Template, useGetMyGuilds, useApplyBotTemplate } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import {
  Hash,
  Volume2,
  ChevronDown,
  ChevronRight,
  Pencil,
  RotateCcw,
  Check,
  Palette,
  FolderOpen,
  LayoutList,
  Bot,
  Zap,
  LogOut,
  ShieldCheck,
  ExternalLink,
  LayoutTemplate,
  ArrowRight,
  AlertCircle,
  Loader2,
  Eye,
  Sparkles,
  RefreshCw,
  Star,
  Users,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ParsedChannel {
  id: string;
  name: string;
  emoji: string;
  type: "text" | "voice";
}

interface ParsedCategory {
  id: string;
  name: string;
  channels: ParsedChannel[];
}

interface ParsedRole {
  id: string;
  name: string;
  color: string;
}

interface ParsedTemplate {
  categories: ParsedCategory[];
  roles: ParsedRole[];
}

interface CustomizationState {
  channelEmojis: Record<string, string>;
  roleColors: Record<string, string>;
  channelDecoration: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const APP_ID = "1510614634111963156";
const BOT_INVITE = `https://discord.com/oauth2/authorize?client_id=${APP_ID}&permissions=8&scope=bot`;
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const POPULAR_EMOJIS = [
  "📋","📢","👋","🎖️","💬","🖼️","🔗","🎭","❓","🎫","🚨","🎙️","🎵","💤",
  "⭐","🔥","💡","🎮","🏆","📌","🌟","✅","❌","🎉","🛡️","⚔️","🌈","💎",
  "🚀","🎯","📣","🔔","📝","🗂️","📁","🔒","🔓","💰","🎲","🎸","🎤","📺",
];

const PRESET_COLORS = [
  "#FFD700","#FF6B6B","#FF4757","#2ED573","#1E90FF","#A55EEA","#FFA502",
  "#FF6348","#26de81","#45aaf2","#fd9644","#B2BEC3","#636E72",
  "#00cec9","#fdcb6e","#e17055","#74b9ff","#55efc4","#fab1a0","#ffffff",
];

const DECORATION_PRESETS = ["⭐", "🌟", "✨", "💫", "🔥", "🎯", "🏆", "💎", "🚀", "🎮", "🛡️", "⚔️"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function intToHex(color: number): string {
  if (!color) return "#636E72";
  return "#" + color.toString(16).padStart(6, "0");
}

function guessEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("rule") || n.includes("قانون")) return "📋";
  if (n.includes("announce") || n.includes("إعلان")) return "📢";
  if (n.includes("welcome") || n.includes("ترحيب")) return "👋";
  if (n.includes("role") || n.includes("رتب")) return "🎖️";
  if (n.includes("general") || n.includes("عام") || n.includes("دردشة")) return "💬";
  if (n.includes("media") || n.includes("صور") || n.includes("ميديا")) return "🖼️";
  if (n.includes("link") || n.includes("روابط")) return "🔗";
  if (n.includes("off") || n.includes("meme") || n.includes("ميم")) return "🎭";
  if (n.includes("help") || n.includes("support") || n.includes("مساعدة")) return "❓";
  if (n.includes("ticket") || n.includes("تذكرة")) return "🎫";
  if (n.includes("report") || n.includes("إبلاغ")) return "🚨";
  if (n.includes("music") || n.includes("موسيقى")) return "🎵";
  if (n.includes("voice") || n.includes("صوت")) return "🎙️";
  if (n.includes("afk") || n.includes("منتظر")) return "💤";
  if (n.includes("game") || n.includes("ألعاب")) return "🎮";
  if (n.includes("admin") || n.includes("staff") || n.includes("إدارة")) return "🛡️";
  if (n.includes("bot") || n.includes("بوت")) return "🤖";
  if (n.includes("news") || n.includes("أخبار")) return "📰";
  if (n.includes("log")) return "📝";
  return "💬";
}

function parseDiscordTemplate(data: any): ParsedTemplate {
  const guild = data?.serialized_source_guild ?? data;
  const rawChannels: any[] = guild?.channels ?? [];
  const rawRoles: any[] = guild?.roles ?? [];

  const categoryMap: Record<number, ParsedCategory> = {};
  const uncategorized: ParsedChannel[] = [];

  rawChannels
    .filter((c) => c.type === 4)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .forEach((c) => {
      categoryMap[c.id] = { id: String(c.id), name: c.name, channels: [] };
    });

  rawChannels
    .filter((c) => c.type !== 4)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .forEach((c) => {
      const ch: ParsedChannel = {
        id: String(c.id),
        name: c.name.replace(/^[^\w\u0600-\u06FF\s]+[\s・\-_]?/, "").trim() || c.name,
        emoji: guessEmoji(c.name),
        type: c.type === 2 ? "voice" : "text",
      };
      if (c.parent_id != null && categoryMap[c.parent_id]) {
        categoryMap[c.parent_id].channels.push(ch);
      } else {
        uncategorized.push(ch);
      }
    });

  const categories = Object.values(categoryMap).filter((c) => c.channels.length > 0);
  if (uncategorized.length > 0) {
    categories.push({ id: "uncategorized", name: "📌 قنوات أخرى", channels: uncategorized });
  }

  const roles: ParsedRole[] = rawRoles
    .filter((r) => r.id !== 0 && r.name !== "@everyone")
    .map((r) => ({ id: String(r.id), name: r.name, color: intToHex(r.color) }));

  return { categories, roles };
}

function storageKey(templateId: number) {
  return `sos-custom-${templateId}`;
}

function loadCustomization(templateId: number): CustomizationState {
  try {
    const stored = localStorage.getItem(storageKey(templateId));
    if (stored) return { channelDecoration: "", ...JSON.parse(stored) };
  } catch {}
  return { channelEmojis: {}, roleColors: {}, channelDecoration: "" };
}

function saveCustomization(templateId: number, state: CustomizationState) {
  localStorage.setItem(storageKey(templateId), JSON.stringify(state));
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TemplateCustomizer() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const preselectedId = params.get("id") ? parseInt(params.get("id")!) : null;

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [parsedTemplate, setParsedTemplate] = useState<ParsedTemplate | null>(null);
  const [fetchState, setFetchState] = useState<"idle" | "loading" | "error">("idle");
  const [customization, setCustomization] = useState<CustomizationState>({ channelEmojis: {}, roleColors: {}, channelDecoration: "" });
  const [collapsedCats, setCollapsedCats] = useState<Record<string, boolean>>({});
  const [editChannel, setEditChannel] = useState<ParsedChannel | null>(null);
  const [editCatId, setEditCatId] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [selectedGuildId, setSelectedGuildId] = useState<string | null>(null);
  const [botAdded, setBotAdded] = useState(false);
  const { toast } = useToast();
  const { user, login } = useAuth();

  const { data: templates, isLoading: templatesLoading } = useListTemplates({}, {
    query: { queryKey: ["templates"] },
  });

  useEffect(() => {
    if (preselectedId && templates && !selectedTemplate) {
      const t = templates.find((t) => t.id === preselectedId);
      if (t) handleSelectTemplate(t);
    }
  }, [preselectedId, templates]);

  const handleSelectTemplate = useCallback(async (template: Template) => {
    setSelectedTemplate(template);
    setCustomization(loadCustomization(template.id));
    setParsedTemplate(null);
    setFetchState("loading");
    setCollapsedCats({});
    await fetchTemplateData(template);
  }, []);

  const fetchTemplateData = async (template: Template) => {
    setFetchState("loading");
    try {
      const res = await fetch(`${BASE}/api/discord-template/${template.templateCode}`);
      if (!res.ok) throw new Error("not found");
      const data = await res.json();
      setParsedTemplate(parseDiscordTemplate(data));
      setFetchState("idle");
    } catch {
      setFetchState("error");
    }
  };

  const updateCustomization = (updater: (prev: CustomizationState) => CustomizationState) => {
    setCustomization((prev) => {
      const next = updater(prev);
      if (selectedTemplate) saveCustomization(selectedTemplate.id, next);
      return next;
    });
  };

  const resetAll = () => {
    updateCustomization(() => ({ channelEmojis: {}, roleColors: {}, channelDecoration: "" }));
    toast({ title: "تم إعادة الضبط", description: "تمت إعادة كل الإعدادات للافتراضي." });
  };

  const getChannelEmoji = (ch: ParsedChannel) =>
    customization.channelEmojis[ch.id] ?? ch.emoji;

  const getChannelDisplay = (ch: ParsedChannel) => {
    const emoji = getChannelEmoji(ch);
    const deco = customization.channelDecoration || "";
    return `${deco}${emoji} ${ch.name}`;
  };

  const getRoleColor = (role: ParsedRole) =>
    customization.roleColors[role.id] ?? role.color;

  // ── Step 1: Template Picker ─────────────────────────────────────────────────
  if (!selectedTemplate) {
    return (
      <div dir="rtl" className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">تخصيص قالب السيرفر</h1>
          <p className="text-sm text-muted-foreground">اختر أحد قوالبنا لتعديل إيموجيات القنوات وألوان الرتب</p>
        </div>

        {templatesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            ))}
          </div>
        ) : templates && templates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((t) => (
              <div key={t.id} className="border border-border/60 rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-md transition-all group flex flex-col">
                {t.imageUrl ? (
                  <div className="h-32 overflow-hidden bg-muted">
                    <img src={t.imageUrl} alt={t.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                ) : (
                  <div className="h-32 bg-primary/5 flex items-center justify-center border-b border-border/40">
                    <LayoutTemplate className="h-12 w-12 text-primary/20" />
                  </div>
                )}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">{t.category}</Badge>
                    {t.featured && <Badge className="text-xs bg-amber-500">مميز</Badge>}
                  </div>
                  <h3 className="font-bold text-sm mb-1 line-clamp-1">{t.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">{t.description}</p>
                  <div className="flex gap-2 mt-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1.5 text-xs"
                      onClick={() => setPreviewTemplate(t)}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      عرض القالب
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 gap-1.5 text-xs"
                      onClick={() => handleSelectTemplate(t)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      تخصيص
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <LayoutTemplate className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">لا توجد قوالب منشورة بعد.</p>
          </div>
        )}

        {previewTemplate && (
          <PreviewTemplateDialog
            template={previewTemplate}
            onClose={() => setPreviewTemplate(null)}
            onCustomize={() => { setPreviewTemplate(null); handleSelectTemplate(previewTemplate); }}
          />
        )}
      </div>
    );
  }

  // ── Loading State ───────────────────────────────────────────────────────────
  if (fetchState === "loading") {
    return (
      <div dir="rtl" className="container mx-auto px-4 py-20 flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">جاري تحميل محتوى القالب من Discord...</p>
      </div>
    );
  }

  // ── Error State ─────────────────────────────────────────────────────────────
  if (fetchState === "error") {
    return (
      <div dir="rtl" className="container mx-auto px-4 py-20 flex flex-col items-center gap-4 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <h2 className="font-bold text-lg">تعذّر تحميل القالب</h2>
        <p className="text-muted-foreground text-sm max-w-sm">
          ربما رابط القالب منتهي الصلاحية أو غير صالح.
        </p>
        <div className="flex gap-2">
          <Button onClick={() => fetchTemplateData(selectedTemplate!)} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            إعادة المحاولة
          </Button>
          <Button variant="outline" onClick={() => { setSelectedTemplate(null); setParsedTemplate(null); setFetchState("idle"); }}>
            اختر قالباً آخر
          </Button>
        </div>
      </div>
    );
  }

  if (!parsedTemplate) return null;

  // ── Step 2: Customizer ──────────────────────────────────────────────────────
  return (
    <div dir="rtl" className="container mx-auto px-4 py-8 md:py-10 max-w-6xl">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-foreground shrink-0 px-2"
            onClick={() => { setSelectedTemplate(null); setParsedTemplate(null); setFetchState("idle"); }}
          >
            <ArrowRight className="h-4 w-4" />
            <span className="hidden sm:inline">القوالب</span>
          </Button>
          <div className="min-w-0">
            <h1 className="text-lg md:text-2xl font-extrabold truncate">تخصيص: {selectedTemplate.name}</h1>
            <p className="text-xs text-muted-foreground">التغييرات تُحفظ تلقائياً في متصفحك</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={resetAll} className="gap-2 shrink-0 self-start sm:self-auto">
          <RotateCcw className="h-4 w-4" />
          إعادة الضبط
        </Button>
      </div>

      {/* Customizer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* ── Discord Preview ─────────────────────── */}
        <div className="order-2 lg:order-1">
          <div className="lg:sticky lg:top-20">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              معاينة مباشرة
            </h2>
            <div className="rounded-xl overflow-hidden border border-border/60 bg-[#2b2d31] text-white shadow-2xl">
              <div className="bg-[#1e1f22] px-4 py-3 border-b border-white/10">
                <span className="font-bold text-sm">🗂️ {selectedTemplate.name}</span>
              </div>
              <div className="max-h-[50vh] overflow-y-auto">
                {parsedTemplate.categories.map((cat) => {
                  const collapsed = collapsedCats[cat.id];
                  return (
                    <div key={cat.id} className="mt-1">
                      <button
                        onClick={() => setCollapsedCats((p) => ({ ...p, [cat.id]: !p[cat.id] }))}
                        className="w-full flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-200 transition-colors"
                      >
                        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        <span className="truncate">{cat.name}</span>
                      </button>
                      {!collapsed && cat.channels.map((ch) => (
                        <div key={ch.id} className="flex items-center gap-2 px-3 py-1.5 mx-1 rounded hover:bg-white/5 cursor-default text-gray-400 hover:text-gray-200 transition-colors">
                          {ch.type === "voice"
                            ? <Volume2 className="h-3.5 w-3.5 shrink-0" />
                            : <Hash className="h-3.5 w-3.5 shrink-0" />}
                          <span className="text-sm truncate">{getChannelDisplay(ch)}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Edit Panel ───────────────────────────── */}
        <div className="order-1 lg:order-2">
          <Tabs defaultValue="channels">
            <TabsList className="w-full mb-5">
              <TabsTrigger value="channels" className="flex-1 gap-1.5 text-sm">
                <LayoutList className="h-4 w-4" />
                القنوات
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-1">{parsedTemplate.categories.reduce((s, c) => s + c.channels.length, 0)}</Badge>
              </TabsTrigger>
              <TabsTrigger value="decoration" className="flex-1 gap-1.5 text-sm">
                <Sparkles className="h-4 w-4" />
                زغرفة
              </TabsTrigger>
              <TabsTrigger value="roles" className="flex-1 gap-1.5 text-sm">
                <Palette className="h-4 w-4" />
                الرتب
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-1">{parsedTemplate.roles.length}</Badge>
              </TabsTrigger>
            </TabsList>

            {/* Channels Tab */}
            <TabsContent value="channels" className="space-y-3">
              {parsedTemplate.categories.map((cat) => (
                <CategoryEditor
                  key={cat.id}
                  category={cat}
                  customization={customization}
                  onEditChannel={(ch) => { setEditChannel(ch); setEditCatId(cat.id); }}
                  onApplyToCategory={(emoji) => {
                    const updates: Record<string, string> = {};
                    cat.channels.forEach((ch) => { updates[ch.id] = emoji; });
                    updateCustomization((prev) => ({ ...prev, channelEmojis: { ...prev.channelEmojis, ...updates } }));
                    toast({ title: "✅ تم", description: `${emoji} على كل قنوات "${cat.name}"` });
                  }}
                />
              ))}
              {parsedTemplate.categories.length > 1 && (
                <div className="border border-dashed border-border/60 rounded-xl p-4">
                  <p className="text-sm font-medium mb-3 flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-primary" />
                    تطبيق إيموجي على كل القنوات
                  </p>
                  <EmojiPickerInline
                    onSelect={(emoji) => {
                      const updates: Record<string, string> = {};
                      parsedTemplate.categories.forEach((cat) =>
                        cat.channels.forEach((ch) => { updates[ch.id] = emoji; })
                      );
                      updateCustomization((prev) => ({ ...prev, channelEmojis: { ...prev.channelEmojis, ...updates } }));
                      toast({ title: "✅ تم", description: `${emoji} على جميع القنوات.` });
                    }}
                  />
                </div>
              )}
            </TabsContent>

            {/* Decoration Tab */}
            <TabsContent value="decoration" className="space-y-4">
              <div className="border border-border/60 rounded-xl p-5 space-y-4">
                <div>
                  <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    زغرفة مخصصة للقنوات
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    أضف نصاً أو إيموجي يظهر قبل كل قناة في السيرفر — مثل ختم خاص بسيرفرك.
                  </p>
                  <Input
                    placeholder="مثال: ⭐ أو 🌟 أو [SOS]"
                    value={customization.channelDecoration}
                    onChange={(e) => updateCustomization((prev) => ({ ...prev, channelDecoration: e.target.value }))}
                    className="text-center text-base"
                    maxLength={10}
                  />
                </div>

                {customization.channelDecoration && (
                  <div className="bg-muted/40 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">معاينة:</p>
                    <div className="flex items-center gap-2 text-sm">
                      <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-mono">{customization.channelDecoration}💬 اسم-القناة</span>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">اختر زغرفة جاهزة:</p>
                  <div className="flex flex-wrap gap-2">
                    {DECORATION_PRESETS.map((d) => (
                      <button
                        key={d}
                        onClick={() => updateCustomization((prev) => ({ ...prev, channelDecoration: prev.channelDecoration === d ? "" : d }))}
                        className={`text-xl w-10 h-10 rounded-lg border flex items-center justify-center transition-all hover:scale-110 ${
                          customization.channelDecoration === d
                            ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                            : "border-border/60 hover:border-primary/40 bg-muted/30"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {customization.channelDecoration && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-muted-foreground"
                    onClick={() => updateCustomization((prev) => ({ ...prev, channelDecoration: "" }))}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    إزالة الزغرفة
                  </Button>
                )}
              </div>
            </TabsContent>

            {/* Roles Tab */}
            <TabsContent value="roles" className="space-y-2">
              {parsedTemplate.roles.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  لا توجد رتب مخصصة في هذا القالب.
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-3">اضغط على الدائرة الملوّنة لتغيير لون الرتبة.</p>
                  {parsedTemplate.roles.map((role) => (
                    <RoleColorEditor
                      key={role.id}
                      role={role}
                      currentColor={getRoleColor(role)}
                      onChange={(color) => updateCustomization((prev) => ({ ...prev, roleColors: { ...prev.roleColors, [role.id]: color } }))}
                      onReset={() => updateCustomization((prev) => {
                        const { [role.id]: _, ...rest } = prev.roleColors;
                        return { ...prev, roleColors: rest };
                      })}
                    />
                  ))}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* ── Apply with Bot ───────────────────────────────────────────── */}
      <ApplyWithBot
        template={selectedTemplate!}
        user={user}
        onLogin={login}
        selectedGuildId={selectedGuildId}
        setSelectedGuildId={setSelectedGuildId}
        botAdded={botAdded}
        setBotAdded={setBotAdded}
      />

      {/* Channel Edit Dialog */}
      {editChannel && (
        <ChannelEditDialog
          channel={editChannel}
          categoryName={parsedTemplate.categories.find((c) => c.id === editCatId)?.name ?? ""}
          currentEmoji={getChannelEmoji(editChannel)}
          onClose={() => setEditChannel(null)}
          onApplyOne={(emoji) => {
            updateCustomization((prev) => ({ ...prev, channelEmojis: { ...prev.channelEmojis, [editChannel.id]: emoji } }));
            setEditChannel(null);
            toast({ title: "✅ تم", description: `${emoji} ${editChannel.name}` });
          }}
          onApplyCategory={(emoji) => {
            const cat = parsedTemplate.categories.find((c) => c.id === editCatId);
            if (!cat) return;
            const updates: Record<string, string> = {};
            cat.channels.forEach((ch) => { updates[ch.id] = emoji; });
            updateCustomization((prev) => ({ ...prev, channelEmojis: { ...prev.channelEmojis, ...updates } }));
            setEditChannel(null);
            toast({ title: "✅ تم", description: `${emoji} على كل قنوات "${cat.name}".` });
          }}
          onApplyAll={(emoji) => {
            const updates: Record<string, string> = {};
            parsedTemplate.categories.forEach((cat) => cat.channels.forEach((ch) => { updates[ch.id] = emoji; }));
            updateCustomization((prev) => ({ ...prev, channelEmojis: { ...prev.channelEmojis, ...updates } }));
            setEditChannel(null);
            toast({ title: "✅ تم", description: `${emoji} على جميع القنوات.` });
          }}
        />
      )}
    </div>
  );
}

// ─── Apply With Bot ───────────────────────────────────────────────────────────

function ApplyWithBot({
  template, user, onLogin, selectedGuildId, setSelectedGuildId, botAdded, setBotAdded,
}: {
  template: Template;
  user: any;
  onLogin: () => void;
  selectedGuildId: string | null;
  setSelectedGuildId: (id: string | null) => void;
  botAdded: boolean;
  setBotAdded: (v: boolean) => void;
}) {
  const { toast } = useToast();
  const applyBot = useApplyBotTemplate();
  const [applyState, setApplyState] = useState<"idle" | "applying" | "done" | "error">("idle");

  const { data: guilds, isLoading: guildsLoading } = useGetMyGuilds({
    query: { queryKey: ["my-guilds"], enabled: !!user, retry: 1 },
  });

  const selectedGuild = guilds?.find((g) => g.id === selectedGuildId);
  const botInviteUrl = selectedGuildId
    ? `${BOT_INVITE}&guild_id=${selectedGuildId}&disable_guild_select=true`
    : BOT_INVITE;

  const handleApply = () => {
    if (!selectedGuildId || !template) return;
    setApplyState("applying");
    applyBot.mutate(
      { data: { guildId: selectedGuildId, templateId: template.id, customizations: { channelEmojis: customization.channelEmojis } } },
      {
        onSuccess: () => {
          setApplyState("done");
          toast({ title: "✅ تم تطبيق القالب!", description: "البوت طبّق القالب وغادر السيرفر تلقائياً." });
        },
        onError: (err: any) => {
          setApplyState("error");
          toast({ variant: "destructive", title: "فشل التطبيق", description: err?.message || "حدث خطأ أثناء تطبيق القالب." });
        },
      },
    );
  };

  return (
    <div className="mt-10 md:mt-14">
      <div className="border border-[#5865F2]/30 rounded-2xl overflow-hidden">
        <div className="bg-[#5865F2]/10 px-5 py-4 border-b border-[#5865F2]/20 flex items-center gap-3">
          <Bot className="w-5 h-5 text-[#5865F2] shrink-0" />
          <div>
            <h2 className="font-bold text-base">طبّق القالب على سيرفرك بالبوت</h2>
            <p className="text-xs text-muted-foreground mt-0.5">اختر سيرفرك، أضف البوت، ثم اضغط تطبيق</p>
          </div>
        </div>
        <div className="p-5 space-y-5">

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: <Users className="w-5 h-5 text-[#5865F2]" />, num: "١", title: "اختر سيرفرك", desc: "سجّل دخولك واختر السيرفر الذي تريد تطبيق القالب عليه.", done: !!selectedGuildId },
              { icon: <Bot className="w-5 h-5 text-yellow-500" />, num: "٢", title: "أضف البوت", desc: "اضغط زر إضافة البوت — سيُضاف مباشرة للسيرفر المختار.", done: botAdded },
              { icon: <Zap className="w-5 h-5 text-green-500" />, num: "٣", title: "طبّق القالب", desc: "اضغط تطبيق القالب — البوت ينشئ القنوات والرتب ثم يغادر تلقائياً.", done: applyState === "done" },
            ].map((step) => (
              <div key={step.num} className={`relative rounded-xl p-4 border transition-colors ${step.done ? "border-green-500/40 bg-green-500/5" : "border-border/40 bg-muted/40"}`}>
                <div className={`absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full text-white text-[11px] font-bold flex items-center justify-center ${step.done ? "bg-green-500" : "bg-[#5865F2]"}`}>
                  {step.done ? "✓" : step.num}
                </div>
                <div className="flex items-center gap-2 mb-1.5">{step.icon}<span className="font-semibold text-sm">{step.title}</span></div>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Not logged in */}
          {!user && (
            <div className="rounded-xl border border-dashed border-[#5865F2]/40 bg-[#5865F2]/5 p-5 text-center">
              <p className="text-sm font-medium mb-3">سجّل دخولك بديسكورد لاختيار سيرفرك</p>
              <Button onClick={onLogin} className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold gap-2">
                <Bot className="w-4 h-4" /> تسجيل الدخول بديسكورد
              </Button>
            </div>
          )}

          {/* Guild selector */}
          {user && (
            <div className="space-y-3">
              <p className="text-sm font-semibold">اختر السيرفر:</p>
              {guildsLoading ? (
                <div className="flex gap-2 flex-wrap">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-10 w-32 rounded-lg" />)}
                </div>
              ) : guilds && guilds.length > 0 ? (
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                  {guilds.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => { setSelectedGuildId(g.id); setBotAdded(false); setApplyState("idle"); }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                        selectedGuildId === g.id
                          ? "border-[#5865F2] bg-[#5865F2]/10 text-[#5865F2] font-bold"
                          : "border-border/50 hover:border-[#5865F2]/40 bg-muted/30"
                      }`}
                    >
                      {g.icon ? (
                        <img src={`https://cdn.discordapp.com/icons/${g.id}/${g.icon}.webp?size=32`} className="w-5 h-5 rounded-full" alt="" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-[#5865F2]/20 flex items-center justify-center text-[10px] font-bold text-[#5865F2]">
                          {g.name.charAt(0)}
                        </div>
                      )}
                      <span className="truncate max-w-[140px]">{g.name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">لا توجد سيرفرات تملك فيها صلاحية المدير.</p>
              )}
            </div>
          )}

          {/* Step 2: Add bot button */}
          {selectedGuild && (
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center rounded-xl border border-border/50 bg-muted/30 p-4">
              <div className="flex-1">
                <p className="text-sm font-semibold">أضف البوت لـ "{selectedGuild.name}"</p>
                <p className="text-xs text-muted-foreground mt-0.5">سيفتح رابط ديسكورد مباشرةً للسيرفر المختار</p>
              </div>
              <a
                href={botInviteUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setBotAdded(true)}
              >
                <Button className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold gap-2 whitespace-nowrap">
                  <Bot className="w-4 h-4" />
                  {botAdded ? "أُضيف البوت ✓" : "أضف البوت"}
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </a>
            </div>
          )}

          {/* Step 3: Apply button */}
          {selectedGuild && botAdded && applyState !== "done" && (
            <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">البوت جاهز — طبّق القالب الآن</p>
                <p className="text-xs text-muted-foreground mt-0.5">سيُنشئ البوت القنوات والرتب ثم يغادر تلقائياً</p>
              </div>
              <Button
                onClick={handleApply}
                disabled={applyState === "applying"}
                className="bg-green-600 hover:bg-green-700 text-white font-bold gap-2 whitespace-nowrap"
              >
                {applyState === "applying" ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> جاري التطبيق...</>
                ) : (
                  <><Zap className="w-4 h-4" /> تطبيق القالب</>
                )}
              </Button>
            </div>
          )}

          {/* Error state */}
          {applyState === "error" && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-destructive">فشل التطبيق</p>
                <p className="text-xs text-muted-foreground">تحقق من أن البوت مضاف للسيرفر بصلاحية مدير، ثم أعد المحاولة.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setApplyState("idle")}>إعادة المحاولة</Button>
            </div>
          )}

          {/* Success state */}
          {applyState === "done" && (
            <div className="rounded-xl border border-green-500/40 bg-green-500/10 p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-green-700 dark:text-green-400">تم تطبيق القالب بنجاح! 🎉</p>
                <p className="text-xs text-muted-foreground">البوت أنشأ القنوات والرتب وغادر السيرفر تلقائياً.</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
            <ShieldCheck className="w-4 h-4 text-green-500 shrink-0" />
            <span>البوت يغادر تلقائياً بعد التطبيق — لا يبقى في سيرفرك</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Preview Template Dialog ──────────────────────────────────────────────────

function PreviewTemplateDialog({
  template, onClose, onCustomize,
}: {
  template: Template;
  onClose: () => void;
  onCustomize: () => void;
}) {
  const [state, setState] = useState<"loading" | "loaded" | "error">("loading");
  const [parsed, setParsed] = useState<ParsedTemplate | null>(null);
  const [activeTab, setActiveTab] = useState<"channels" | "roles">("channels");

  useEffect(() => {
    fetch(`${BASE}/api/discord-template/${template.templateCode}`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => { setParsed(parseDiscordTemplate(data)); setState("loaded"); })
      .catch(() => setState("error"));
  }, [template.templateCode]);

  const totalChannels = parsed?.categories.reduce((s, c) => s + c.channels.length, 0) ?? 0;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent dir="rtl" className="max-w-lg max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Eye className="w-5 h-5 text-primary" />
              {template.name}
            </DialogTitle>
          </DialogHeader>
          {template.description && (
            <p className="text-xs text-muted-foreground mt-1.5">{template.description}</p>
          )}
          {parsed && (
            <div className="flex gap-3 mt-3">
              <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                <Hash className="h-3 w-3" /> {totalChannels} قناة
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                <Users className="h-3 w-3" /> {parsed.roles.length} رتبة
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                <FolderOpen className="h-3 w-3" /> {parsed.categories.length} قسم
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {state === "loading" && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">جاري تحميل تفاصيل القالب...</p>
            </div>
          )}

          {state === "error" && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-sm text-muted-foreground">تعذّر تحميل تفاصيل القالب. ربما الرابط منتهي الصلاحية.</p>
            </div>
          )}

          {state === "loaded" && parsed && (
            <div className="p-5">
              {/* Tab switcher */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab("channels")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === "channels" ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  <Hash className="h-3.5 w-3.5" /> القنوات ({totalChannels})
                </button>
                <button
                  onClick={() => setActiveTab("roles")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === "roles" ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  <Star className="h-3.5 w-3.5" /> الرتب ({parsed.roles.length})
                </button>
              </div>

              {activeTab === "channels" && (
                <div className="rounded-xl overflow-hidden border border-border/50 bg-[#2b2d31] text-white">
                  <div className="bg-[#1e1f22] px-4 py-2.5 border-b border-white/10">
                    <span className="font-bold text-xs">🗂️ {template.name}</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {parsed.categories.map((cat) => (
                      <div key={cat.id} className="mt-1">
                        <div className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          <ChevronDown className="h-3 w-3" />
                          <span className="truncate">{cat.name}</span>
                          <span className="text-[10px] opacity-50 mr-1">({cat.channels.length})</span>
                        </div>
                        {cat.channels.map((ch) => (
                          <div key={ch.id} className="flex items-center gap-2 px-3 py-1.5 mx-1 text-gray-400">
                            {ch.type === "voice" ? <Volume2 className="h-3.5 w-3.5 shrink-0" /> : <Hash className="h-3.5 w-3.5 shrink-0" />}
                            <span className="text-xs truncate">{ch.emoji} {ch.name}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "roles" && (
                <div className="space-y-2">
                  {parsed.roles.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-8">لا توجد رتب مخصصة في هذا القالب.</p>
                  ) : (
                    parsed.roles.map((role) => (
                      <div key={role.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border/50 bg-muted/20">
                        <div
                          className="w-5 h-5 rounded-full shrink-0 ring-1 ring-white/20"
                          style={{ backgroundColor: role.color }}
                        />
                        <span className="text-sm font-medium">{role.name}</span>
                        <span className="text-xs text-muted-foreground mr-auto font-mono">{role.color}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/50 flex gap-2">
          <Button className="flex-1 gap-2" onClick={onCustomize}>
            <Pencil className="w-4 h-4" />
            تخصيص القالب
          </Button>
          <Button variant="outline" onClick={onClose} className="px-4">
            إغلاق
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Category Editor ──────────────────────────────────────────────────────────

function CategoryEditor({
  category, customization, onEditChannel, onApplyToCategory,
}: {
  category: ParsedCategory;
  customization: CustomizationState;
  onEditChannel: (ch: ParsedChannel) => void;
  onApplyToCategory: (emoji: string) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-border/60 rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 bg-muted/40 cursor-pointer hover:bg-muted/60 transition-colors"
        onClick={() => setOpen((p) => !p)}
      >
        <div className="flex items-center gap-2 min-w-0">
          {open ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
          <span className="font-semibold text-sm truncate">{category.name}</span>
          <Badge variant="secondary" className="text-[10px] py-0 px-1.5 shrink-0">{category.channels.length}</Badge>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="ghost" className="text-xs gap-1 h-7 px-2 shrink-0" onClick={(e) => e.stopPropagation()}>
              <FolderOpen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">تغيير الكل</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3" align="end">
            <p className="text-xs font-medium mb-2 text-muted-foreground">إيموجي لكل قنوات هذه الفئة:</p>
            <EmojiPickerInline onSelect={onApplyToCategory} />
          </PopoverContent>
        </Popover>
      </div>
      {open && (
        <div className="divide-y divide-border/40">
          {category.channels.map((ch) => {
            const emoji = customization.channelEmojis[ch.id] ?? ch.emoji;
            const changed = !!customization.channelEmojis[ch.id];
            return (
              <div key={ch.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors">
                {ch.type === "voice" ? <Volume2 className="h-4 w-4 text-muted-foreground shrink-0" /> : <Hash className="h-4 w-4 text-muted-foreground shrink-0" />}
                <span className="text-lg w-7 text-center shrink-0">{emoji}</span>
                <span className="flex-1 text-sm truncate">{ch.name}</span>
                {changed && <Badge variant="secondary" className="text-[10px] py-0 px-1.5 bg-primary/10 text-primary hidden sm:flex shrink-0">معدّل</Badge>}
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground shrink-0" onClick={() => onEditChannel(ch)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Channel Edit Dialog ──────────────────────────────────────────────────────

function ChannelEditDialog({
  channel, categoryName, currentEmoji, onClose, onApplyOne, onApplyCategory, onApplyAll,
}: {
  channel: ParsedChannel; categoryName: string; currentEmoji: string;
  onClose: () => void; onApplyOne: (e: string) => void; onApplyCategory: (e: string) => void; onApplyAll: (e: string) => void;
}) {
  const [selected, setSelected] = useState(currentEmoji);
  const [custom, setCustom] = useState("");
  const finalEmoji = custom.trim() || selected;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent dir="rtl" className="max-w-sm mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Pencil className="h-4 w-4" />تعديل إيموجي القناة
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border/50">
            {channel.type === "voice" ? <Volume2 className="h-4 w-4 text-muted-foreground" /> : <Hash className="h-4 w-4 text-muted-foreground" />}
            <span className="text-xl">{finalEmoji}</span>
            <span className="font-medium text-sm">{channel.name}</span>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">أو اكتب إيموجي يدوياً:</label>
            <Input placeholder="مثال: 🌟" value={custom} onChange={(e) => setCustom(e.target.value)} className="text-center text-lg" maxLength={4} />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">اختر سريعاً:</p>
            <EmojiPickerInline onSelect={(e) => { setSelected(e); setCustom(""); }} selected={selected} />
          </div>
          <div className="space-y-2 pt-2 border-t border-border/40">
            <Button className="w-full gap-2 text-sm" onClick={() => onApplyOne(finalEmoji)}><Check className="h-4 w-4" />تغيير هذه القناة فقط</Button>
            <Button variant="outline" className="w-full gap-2 text-sm" onClick={() => onApplyCategory(finalEmoji)}><FolderOpen className="h-4 w-4" />تغيير كل قنوات "{categoryName}"</Button>
            <Button variant="outline" className="w-full gap-2 text-sm text-muted-foreground" onClick={() => onApplyAll(finalEmoji)}><LayoutList className="h-4 w-4" />تغيير كل القنوات</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Role Color Editor ────────────────────────────────────────────────────────

function RoleColorEditor({
  role, currentColor, onChange, onReset,
}: {
  role: ParsedRole; currentColor: string; onChange: (c: string) => void; onReset: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const changed = currentColor !== role.color;
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-border/60 hover:bg-muted/30 transition-colors">
      <div
        className="w-8 h-8 rounded-full shrink-0 cursor-pointer ring-2 ring-offset-2 ring-offset-background hover:scale-110 transition-transform"
        style={{ backgroundColor: currentColor }}
        onClick={() => inputRef.current?.click()}
        title="اضغط لتغيير اللون"
      />
      <input ref={inputRef} type="color" value={currentColor} onChange={(e) => onChange(e.target.value)} className="sr-only" />
      <span className="flex-1 font-medium text-sm truncate">{role.name}</span>
      {changed && (
        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive shrink-0" onClick={onReset}>
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline" className="h-7 px-2 text-xs gap-1 shrink-0">
            <Palette className="h-3 w-3" /><span className="hidden sm:inline">ألوان</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-52 p-3" align="end">
          <p className="text-xs text-muted-foreground mb-2">اختر لوناً جاهزاً:</p>
          <div className="grid grid-cols-7 gap-1.5">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                className={`w-6 h-6 rounded-full hover:scale-110 transition-transform ${currentColor === c ? "ring-2 ring-offset-1 ring-primary" : ""}`}
                style={{ backgroundColor: c }}
                onClick={() => onChange(c)}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// ─── Emoji Picker ─────────────────────────────────────────────────────────────

function EmojiPickerInline({
  onSelect,
  selected,
}: {
  onSelect: (emoji: string) => void;
  selected?: string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {POPULAR_EMOJIS.map((e) => (
        <button
          key={e}
          onClick={() => onSelect(e)}
          className={`text-xl w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-110 ${
            selected === e ? "bg-primary/20 ring-2 ring-primary/50 ring-offset-1" : "hover:bg-muted"
          }`}
        >
          {e}
        </button>
      ))}
    </div>
  );
}

