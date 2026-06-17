import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Copy,
  Check,
  Palette,
  FolderOpen,
  LayoutList,
} from "lucide-react";

// ─── Default Template Data ───────────────────────────────────────────────────

interface Channel {
  id: string;
  name: string;
  emoji: string;
  type: "text" | "voice";
}

interface Category {
  id: string;
  name: string;
  channels: Channel[];
}

interface Role {
  id: string;
  name: string;
  color: string;
}

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "cat-info",
    name: "📌 المعلومات",
    channels: [
      { id: "ch-rules", name: "القوانين", emoji: "📋", type: "text" },
      { id: "ch-announce", name: "الإعلانات", emoji: "📢", type: "text" },
      { id: "ch-welcome", name: "الترحيب", emoji: "👋", type: "text" },
      { id: "ch-roles", name: "الرتب", emoji: "🎖️", type: "text" },
    ],
  },
  {
    id: "cat-general",
    name: "💬 العام",
    channels: [
      { id: "ch-chat", name: "الدردشة", emoji: "💬", type: "text" },
      { id: "ch-media", name: "الصور والميديا", emoji: "🖼️", type: "text" },
      { id: "ch-links", name: "الروابط", emoji: "🔗", type: "text" },
      { id: "ch-off", name: "أوف توبيك", emoji: "🎭", type: "text" },
    ],
  },
  {
    id: "cat-support",
    name: "🛠️ الدعم",
    channels: [
      { id: "ch-help", name: "طلبات المساعدة", emoji: "❓", type: "text" },
      { id: "ch-ticket", name: "التذاكر", emoji: "🎫", type: "text" },
      { id: "ch-report", name: "الإبلاغ", emoji: "🚨", type: "text" },
    ],
  },
  {
    id: "cat-voice",
    name: "🔊 الصوتيات",
    channels: [
      { id: "vc-general", name: "الغرفة العامة", emoji: "🎙️", type: "voice" },
      { id: "vc-music", name: "الموسيقى", emoji: "🎵", type: "voice" },
      { id: "vc-afk", name: "المنتظرون", emoji: "💤", type: "voice" },
    ],
  },
];

const DEFAULT_ROLES: Role[] = [
  { id: "role-owner", name: "المالك", color: "#FFD700" },
  { id: "role-coadmin", name: "المدير التنفيذي", color: "#FF6B6B" },
  { id: "role-admin", name: "المدير", color: "#FF4757" },
  { id: "role-mod", name: "المشرف", color: "#2ED573" },
  { id: "role-helper", name: "المساعد", color: "#1E90FF" },
  { id: "role-vip", name: "العضو المميز", color: "#A55EEA" },
  { id: "role-member", name: "العضو", color: "#B2BEC3" },
  { id: "role-new", name: "الجديد", color: "#636E72" },
];

const STORAGE_KEY = "sos-template-customization";

interface CustomizationState {
  channelEmojis: Record<string, string>;
  roleColors: Record<string, string>;
}

const POPULAR_EMOJIS = [
  "📋","📢","👋","🎖️","💬","🖼️","🔗","🎭","❓","🎫","🚨","🎙️","🎵","💤",
  "⭐","🔥","💡","🎮","🏆","📌","🌟","✅","❌","🎉","🛡️","⚔️","🌈","💎",
  "🚀","🎯","📣","🔔","🔇","📝","🗂️","📁","📂","🗃️","🗄️","🔒","🔓",
  "💰","🎲","🃏","🎸","🎤","📺","📻","🎬","🎧","🖥️","💻","📱",
];

// ─── LocalStorage helpers ─────────────────────────────────────────────────────

function loadCustomization(): CustomizationState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { channelEmojis: {}, roleColors: {} };
}

function saveCustomization(state: CustomizationState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TemplateCustomizer() {
  const [customization, setCustomization] = useState<CustomizationState>(loadCustomization);
  const [collapsedCats, setCollapsedCats] = useState<Record<string, boolean>>({});
  const [editChannel, setEditChannel] = useState<Channel | null>(null);
  const [editCatId, setEditCatId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    saveCustomization(customization);
  }, [customization]);

  const getChannelEmoji = (channelId: string, defaultEmoji: string) =>
    customization.channelEmojis[channelId] ?? defaultEmoji;

  const getRoleColor = (roleId: string, defaultColor: string) =>
    customization.roleColors[roleId] ?? defaultColor;

  const resetAll = () => {
    setCustomization({ channelEmojis: {}, roleColors: {} });
    toast({ title: "تم إعادة الضبط", description: "تمت إعادة كل الإعدادات للافتراضي." });
  };

  const toggleCat = (catId: string) =>
    setCollapsedCats((prev) => ({ ...prev, [catId]: !prev[catId] }));

  return (
    <div dir="rtl" className="container mx-auto px-4 py-10 max-w-6xl">
      {/* Header */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold mb-2">تخصيص قالب السيرفر</h1>
          <p className="text-muted-foreground">
            عدّل زخرفة الرومات وألوان الرتب — التغييرات تُحفظ عندك فقط.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={resetAll} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            إعادة الضبط
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Left: Discord Preview ─────────────────────────── */}
        <div className="order-2 lg:order-1">
          <div className="sticky top-20">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              معاينة مباشرة
            </h2>
            <div className="rounded-xl overflow-hidden border border-border/60 bg-[#2b2d31] text-white shadow-2xl">
              {/* Discord sidebar header */}
              <div className="bg-[#1e1f22] px-4 py-3 border-b border-white/10">
                <span className="font-bold text-sm">🗂️ سيرفرك</span>
              </div>
              <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
                {DEFAULT_CATEGORIES.map((cat) => {
                  const collapsed = collapsedCats[cat.id];
                  return (
                    <div key={cat.id} className="mt-1">
                      <button
                        onClick={() => toggleCat(cat.id)}
                        className="w-full flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-200 transition-colors"
                      >
                        {collapsed ? (
                          <ChevronRight className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                        <span className="truncate">{cat.name}</span>
                      </button>
                      {!collapsed &&
                        cat.channels.map((ch) => {
                          const emoji = getChannelEmoji(ch.id, ch.emoji);
                          return (
                            <div
                              key={ch.id}
                              className="flex items-center gap-2 px-3 py-1.5 mx-1 rounded hover:bg-white/5 cursor-default text-gray-400 hover:text-gray-200 transition-colors"
                            >
                              {ch.type === "voice" ? (
                                <Volume2 className="h-3.5 w-3.5 shrink-0" />
                              ) : (
                                <Hash className="h-3.5 w-3.5 shrink-0" />
                              )}
                              <span className="text-sm truncate">
                                {emoji} {ch.name}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Edit Panel ─────────────────────────────── */}
        <div className="order-1 lg:order-2">
          <Tabs defaultValue="channels">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="channels" className="flex-1 gap-2">
                <LayoutList className="h-4 w-4" />
                الرومات
              </TabsTrigger>
              <TabsTrigger value="roles" className="flex-1 gap-2">
                <Palette className="h-4 w-4" />
                الرتب
              </TabsTrigger>
            </TabsList>

            {/* ── Channels Tab ─────────────────────── */}
            <TabsContent value="channels" className="space-y-4">
              {DEFAULT_CATEGORIES.map((cat) => (
                <CategoryEditor
                  key={cat.id}
                  category={cat}
                  customization={customization}
                  onEditChannel={(ch) => {
                    setEditChannel(ch);
                    setEditCatId(cat.id);
                  }}
                  onApplyToCategory={(emoji) => {
                    const updates: Record<string, string> = {};
                    cat.channels.forEach((ch) => { updates[ch.id] = emoji; });
                    setCustomization((prev) => ({
                      ...prev,
                      channelEmojis: { ...prev.channelEmojis, ...updates },
                    }));
                    toast({ title: "✅ تم", description: `تم تطبيق ${emoji} على كل رومات "${cat.name}".` });
                  }}
                />
              ))}

              {/* Apply to ALL */}
              <div className="border border-dashed border-border/60 rounded-xl p-4">
                <p className="text-sm font-medium mb-3 flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-primary" />
                  تطبيق إيموجي على كل الرومات
                </p>
                <EmojiPickerInline
                  onSelect={(emoji) => {
                    const updates: Record<string, string> = {};
                    DEFAULT_CATEGORIES.forEach((cat) =>
                      cat.channels.forEach((ch) => { updates[ch.id] = emoji; })
                    );
                    setCustomization((prev) => ({
                      ...prev,
                      channelEmojis: { ...prev.channelEmojis, ...updates },
                    }));
                    toast({ title: "✅ تم", description: `تم تطبيق ${emoji} على جميع الرومات.` });
                  }}
                />
              </div>
            </TabsContent>

            {/* ── Roles Tab ────────────────────────── */}
            <TabsContent value="roles" className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                اضغط على مربع اللون بجانب اسم الرتبة لتغيير لونها.
              </p>
              {DEFAULT_ROLES.map((role) => (
                <RoleColorEditor
                  key={role.id}
                  role={role}
                  currentColor={getRoleColor(role.id, role.color)}
                  onChange={(color) => {
                    setCustomization((prev) => ({
                      ...prev,
                      roleColors: { ...prev.roleColors, [role.id]: color },
                    }));
                  }}
                  onReset={() => {
                    setCustomization((prev) => {
                      const { [role.id]: _, ...rest } = prev.roleColors;
                      return { ...prev, roleColors: rest };
                    });
                  }}
                />
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* ── Channel Edit Dialog ───────────────────────────── */}
      {editChannel && (
        <ChannelEditDialog
          channel={editChannel}
          categoryName={
            DEFAULT_CATEGORIES.find((c) => c.id === editCatId)?.name ?? ""
          }
          currentEmoji={getChannelEmoji(editChannel.id, editChannel.emoji)}
          onClose={() => setEditChannel(null)}
          onApplyOne={(emoji) => {
            setCustomization((prev) => ({
              ...prev,
              channelEmojis: { ...prev.channelEmojis, [editChannel.id]: emoji },
            }));
            setEditChannel(null);
            toast({ title: "✅ تم تغيير الروم", description: `${emoji} ${editChannel.name}` });
          }}
          onApplyCategory={(emoji) => {
            const cat = DEFAULT_CATEGORIES.find((c) => c.id === editCatId);
            if (!cat) return;
            const updates: Record<string, string> = {};
            cat.channels.forEach((ch) => { updates[ch.id] = emoji; });
            setCustomization((prev) => ({
              ...prev,
              channelEmojis: { ...prev.channelEmojis, ...updates },
            }));
            setEditChannel(null);
            toast({ title: "✅ تم تغيير الكاتيقوري", description: `${emoji} على كل رومات "${cat.name}".` });
          }}
          onApplyAll={(emoji) => {
            const updates: Record<string, string> = {};
            DEFAULT_CATEGORIES.forEach((cat) =>
              cat.channels.forEach((ch) => { updates[ch.id] = emoji; })
            );
            setCustomization((prev) => ({
              ...prev,
              channelEmojis: { ...prev.channelEmojis, ...updates },
            }));
            setEditChannel(null);
            toast({ title: "✅ تم تغيير كل الرومات", description: `${emoji} على كل الرومات.` });
          }}
        />
      )}
    </div>
  );
}

// ─── Category Editor ──────────────────────────────────────────────────────────

function CategoryEditor({
  category,
  customization,
  onEditChannel,
  onApplyToCategory,
}: {
  category: Category;
  customization: CustomizationState;
  onEditChannel: (ch: Channel) => void;
  onApplyToCategory: (emoji: string) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border border-border/60 rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 bg-muted/40 cursor-pointer hover:bg-muted/60 transition-colors"
        onClick={() => setOpen((p) => !p)}
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <span className="font-semibold text-sm">{category.name}</span>
          <Badge variant="secondary" className="text-xs">{category.channels.length} رومات</Badge>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs gap-1 h-7 px-2"
              onClick={(e) => e.stopPropagation()}
            >
              <FolderOpen className="h-3.5 w-3.5" />
              تغيير الكل
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3" align="end">
            <p className="text-xs font-medium mb-2 text-muted-foreground">
              اختر إيموجي لتطبيقه على كل رومات هذه الكاتيقوري:
            </p>
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
              <div
                key={ch.id}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors"
              >
                {ch.type === "voice" ? (
                  <Volume2 className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <span className="text-lg w-7 text-center">{emoji}</span>
                <span className="flex-1 text-sm">{ch.name}</span>
                {changed && (
                  <Badge variant="secondary" className="text-[10px] py-0 px-1.5 bg-primary/10 text-primary">
                    معدّل
                  </Badge>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => onEditChannel(ch)}
                >
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
  channel,
  categoryName,
  currentEmoji,
  onClose,
  onApplyOne,
  onApplyCategory,
  onApplyAll,
}: {
  channel: Channel;
  categoryName: string;
  currentEmoji: string;
  onClose: () => void;
  onApplyOne: (emoji: string) => void;
  onApplyCategory: (emoji: string) => void;
  onApplyAll: (emoji: string) => void;
}) {
  const [selected, setSelected] = useState(currentEmoji);
  const [custom, setCustom] = useState("");

  const finalEmoji = custom.trim() || selected;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent dir="rtl" className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4" />
            تعديل زخرفة الروم
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border/50">
            {channel.type === "voice" ? (
              <Volume2 className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Hash className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-xl">{finalEmoji}</span>
            <span className="font-medium">{channel.name}</span>
          </div>

          {/* Custom input */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              أو اكتب إيموجي يدوياً:
            </label>
            <Input
              placeholder="مثال: 🌟"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              className="text-center text-lg"
              maxLength={4}
            />
          </div>

          {/* Quick pick */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">اختر سريعاً:</p>
            <EmojiPickerInline onSelect={(e) => { setSelected(e); setCustom(""); }} selected={selected} />
          </div>

          {/* Apply buttons */}
          <div className="space-y-2 pt-2 border-t border-border/40">
            <Button className="w-full gap-2" onClick={() => onApplyOne(finalEmoji)}>
              <Check className="h-4 w-4" />
              تغيير هذا الروم فقط
            </Button>
            <Button variant="outline" className="w-full gap-2" onClick={() => onApplyCategory(finalEmoji)}>
              <FolderOpen className="h-4 w-4" />
              تغيير كل رومات "{categoryName}"
            </Button>
            <Button variant="outline" className="w-full gap-2 text-muted-foreground" onClick={() => onApplyAll(finalEmoji)}>
              <LayoutList className="h-4 w-4" />
              تغيير كل الرومات
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Role Color Editor ────────────────────────────────────────────────────────

const PRESET_COLORS = [
  "#FFD700","#FF6B6B","#FF4757","#2ED573","#1E90FF","#A55EEA","#FFA502",
  "#FF6348","#26de81","#45aaf2","#fd9644","#a55eea","#B2BEC3","#636E72",
  "#00cec9","#fdcb6e","#e17055","#74b9ff","#55efc4","#fab1a0","#ffffff",
];

function RoleColorEditor({
  role,
  currentColor,
  onChange,
  onReset,
}: {
  role: Role;
  currentColor: string;
  onChange: (color: string) => void;
  onReset: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const changed = currentColor !== role.color;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-border/60 hover:bg-muted/30 transition-colors">
      {/* Color swatch / picker trigger */}
      <div
        className="w-8 h-8 rounded-full shrink-0 cursor-pointer ring-2 ring-offset-2 ring-offset-background transition-all hover:scale-110"
        style={{ backgroundColor: currentColor, ringColor: currentColor }}
        onClick={() => inputRef.current?.click()}
        title="اضغط لتغيير اللون"
      />
      <input
        ref={inputRef}
        type="color"
        value={currentColor}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
      />

      <span className="flex-1 font-medium text-sm">{role.name}</span>
      <span className="text-xs text-muted-foreground font-mono">{currentColor.toUpperCase()}</span>

      {/* Presets popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
            <Palette className="h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="end">
          <p className="text-xs font-medium text-muted-foreground mb-2">ألوان سريعة:</p>
          <div className="grid grid-cols-7 gap-1.5">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                className="w-7 h-7 rounded-full hover:scale-110 transition-transform ring-offset-1 hover:ring-2 hover:ring-primary"
                style={{ backgroundColor: c, border: c === "#ffffff" ? "1px solid #ccc" : undefined }}
                onClick={() => onChange(c)}
                title={c}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {changed && (
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
          onClick={onReset}
          title="إعادة اللون الافتراضي"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}

// ─── Emoji Picker Inline ──────────────────────────────────────────────────────

function EmojiPickerInline({
  onSelect,
  selected,
}: {
  onSelect: (emoji: string) => void;
  selected?: string;
}) {
  return (
    <div className="grid grid-cols-8 gap-1">
      {POPULAR_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onSelect(emoji)}
          className={`w-8 h-8 text-lg rounded hover:bg-primary/20 transition-colors flex items-center justify-center ${
            selected === emoji ? "bg-primary/30 ring-1 ring-primary" : ""
          }`}
          title={emoji}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
