import { Bot, ShieldCheck, Zap, LogOut, Hash, Users, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const APP_ID = "1510614634111963156";
const BOT_INVITE = `https://discord.com/oauth2/authorize?client_id=${APP_ID}&permissions=8&scope=bot%20applications.commands`;

export default function BotPage() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#5865F2]/20 via-background to-background border-b border-border/50 py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 bg-[#5865F2]/10 border border-[#5865F2]/30 text-[#5865F2] rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Bot className="w-4 h-4" />
            بوت Discord الرسمي
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            طبّق القالب على سيرفرك
            <span className="text-[#5865F2]"> بأمر واحد</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            أضف البوت لسيرفرك، اكتب <code className="bg-muted px-2 py-0.5 rounded text-sm">/setup-template</code>، وسيُنشئ كل القنوات والرتب تلقائياً — ثم يخرج من تلقاء نفسه.
          </p>
          <a href={BOT_INVITE} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-base px-8 gap-2">
              <Bot className="w-5 h-5" />
              أضف البوت لسيرفرك
              <ArrowRight className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-10">كيف يعمل؟</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Bot className="w-6 h-6 text-[#5865F2]" />,
                step: "١",
                title: "أضف البوت",
                desc: "اضغط \"أضف البوت\" ومنح صلاحية مدير السيرفر — هذه مطلوبة لإنشاء القنوات والرتب.",
              },
              {
                icon: <Zap className="w-6 h-6 text-yellow-500" />,
                step: "٢",
                title: "شغّل الأمر",
                desc: "اكتب /setup-template في أي قناة وأكّد — سيبدأ البوت بإنشاء كل القنوات والرتب فوراً.",
              },
              {
                icon: <LogOut className="w-6 h-6 text-green-500" />,
                step: "٣",
                title: "البوت يخرج تلقائياً",
                desc: "بعد انتهاء التطبيق، البوت يغادر السيرفر من تلقاء نفسه. لا يبقى ولا يراقب.",
              },
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

      {/* What gets created */}
      <section className="py-12 px-4 bg-muted/30 border-y border-border/50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-10">ماذا ينشئ البوت؟</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Channels */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Hash className="w-5 h-5 text-[#5865F2]" />
                <h3 className="font-semibold">القنوات (١٤ قناة + ٤ فئات)</h3>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                {[
                  "📌 المعلومات — القوانين، الإعلانات، الترحيب، الرتب",
                  "💬 العام — الدردشة، الصور، الروابط، أوف توبيك",
                  "🛠️ الدعم — طلبات المساعدة، التذاكر، الإبلاغ",
                  "🔊 الصوتيات — غرفة عامة، موسيقى، منتظرون",
                ].map((c) => (
                  <div key={c} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Roles */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-[#5865F2]" />
                <h3 className="font-semibold">الرتب (٨ رتب)</h3>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  { name: "المالك", color: "#FFD700" },
                  { name: "المدير التنفيذي", color: "#FF6B6B" },
                  { name: "المدير", color: "#FF4757" },
                  { name: "المشرف", color: "#2ED573" },
                  { name: "المساعد", color: "#1E90FF" },
                  { name: "العضو المميز", color: "#A55EEA" },
                  { name: "العضو", color: "#B2BEC3" },
                  { name: "الجديد", color: "#636E72" },
                ].map((r) => (
                  <div key={r.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: r.color }} />
                    <span className="text-foreground font-medium">{r.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety note */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
            <ShieldCheck className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold text-green-600 dark:text-green-400 mb-2">البوت لا يراقب سيرفرك</h3>
            <p className="text-sm text-muted-foreground">
              البوت يدخل فقط لتطبيق القالب، ثم يغادر تلقائياً. لا يقرأ رسائلك ولا يبقى في السيرفر.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center border-t border-border/50">
        <h2 className="text-2xl font-bold mb-4">جاهز لتطبيق القالب؟</h2>
        <p className="text-muted-foreground mb-6">يمكنك تخصيص الإيموجيات وألوان الرتب من صفحة التخصيص</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a href={BOT_INVITE} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold gap-2">
              <Bot className="w-5 h-5" />
              أضف البوت
            </Button>
          </a>
          <a href="/customize">
            <Button size="lg" variant="outline" className="gap-2">
              🎨 تخصيص القالب
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
}
