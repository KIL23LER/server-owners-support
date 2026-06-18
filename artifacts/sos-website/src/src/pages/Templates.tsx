import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useListTemplates, Template } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search, Filter, LayoutTemplate, Bot, Zap, LogOut, ExternalLink, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const APP_ID = "1510614634111963156";
const BOT_INVITE = `https://discord.com/oauth2/authorize?client_id=${APP_ID}&permissions=8&scope=bot`;

export default function Templates() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: templates, isLoading } = useListTemplates({}, {
    query: { queryKey: ["templates"] }
  });

  const categories = templates
    ? Array.from(new Set(templates.map((t) => t.category)))
    : [];

  const filteredTemplates = templates?.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? template.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-8 md:py-12" dir={t("dir")}>
      <div className="mb-8 md:mb-12 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3 text-foreground">{t("templates.title")}</h1>
        <p className="text-base md:text-lg text-muted-foreground">{t("templates.subtitle")}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t("templates.searchPlaceholder")}
            className="pr-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Button
            size="sm"
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            className="shrink-0"
          >
            {t("templates.all")}
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              size="sm"
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="shrink-0"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-36 w-full rounded-xl" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          ))
        ) : filteredTemplates && filteredTemplates.length > 0 ? (
          filteredTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))
        ) : (
          <div className="col-span-full py-16 text-center flex flex-col items-center">
            <Filter className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <h3 className="text-lg font-bold mb-1">{t("templates.noResults")}</h3>
            <p className="text-muted-foreground text-sm">{t("templates.noResultsDesc")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TemplateCard({ template }: { template: Template }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <Card className="overflow-hidden border-border/60 hover:border-primary/40 hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      {template.imageUrl ? (
        <div className="h-36 w-full overflow-hidden bg-muted">
          <img
            src={template.imageUrl}
            alt={template.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      ) : (
        <div className="h-36 w-full bg-primary/5 flex items-center justify-center border-b border-border/40">
          <LayoutTemplate className="h-14 w-14 text-primary/20" />
        </div>
      )}

      <CardContent className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
            {template.category}
          </Badge>
          {template.featured && (
            <Badge className="bg-amber-500 hover:bg-amber-600 text-xs">{t("templates.featured")}</Badge>
          )}
        </div>
        <h3 className="text-base font-bold mb-1 line-clamp-1">{template.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
          {template.description}
        </p>

        <div className="mt-auto pt-3 border-t border-border/40 flex gap-2">
          <Button className="flex-1 text-sm" onClick={() => setOpen(true)}>
            <Bot className="w-4 h-4 ml-1.5" />
            {t("templates.applyToServer")}
          </Button>
          <a href={`/customize?id=${template.id}`} className="flex-1">
            <Button variant="outline" className="w-full text-sm gap-1.5">
              <Pencil className="w-3.5 h-3.5" />
              {t("templates.customize")}
            </Button>
          </a>
        </div>
      </CardContent>

      <ApplyBotDialog open={open} onClose={() => setOpen(false)} template={template} />
    </Card>
  );
}

function ApplyBotDialog({
  open,
  onClose,
  template,
}: {
  open: boolean;
  onClose: () => void;
  template: Template;
}) {
  const { t } = useTranslation();

  const steps = [
    {
      icon: <Bot className="w-5 h-5 text-[#5865F2]" />,
      num: "١",
      title: t("templates.applyDialog.step1Title"),
      desc: t("templates.applyDialog.step1Desc"),
      action: (
        <a href={BOT_INVITE} target="_blank" rel="noopener noreferrer">
          <Button size="sm" className="bg-[#5865F2] hover:bg-[#4752C4] text-white gap-1.5 w-full mt-2">
            <ExternalLink className="w-3.5 h-3.5" />
            {t("templates.applyDialog.addBot")}
          </Button>
        </a>
      ),
    },
    {
      icon: <Zap className="w-5 h-5 text-yellow-500" />,
      num: "٢",
      title: t("templates.applyDialog.step2Title"),
      desc: t("templates.applyDialog.step2Desc"),
    },
    {
      icon: <LogOut className="w-5 h-5 text-green-500" />,
      num: "٣",
      title: t("templates.applyDialog.step3Title"),
      desc: t("templates.applyDialog.step3Desc", { name: template.name }),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent dir={t("dir")} className="max-w-sm mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Bot className="w-5 h-5 text-[#5865F2]" />
            {t("templates.applyDialog.title", { name: template.name })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-[#5865F2]/10 border border-[#5865F2]/30 flex items-center justify-center text-xs font-bold text-[#5865F2] shrink-0">
                  {step.num}
                </div>
                {i < steps.length - 1 && (
                  <div className="w-px flex-1 bg-border/60 my-1" />
                )}
              </div>
              <div className="flex-1 pb-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  {step.icon}
                  <p className="font-semibold text-sm">{step.title}</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                {"action" in step && step.action}
              </div>
            </div>
          ))}

          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex gap-2">
            <span className="text-green-500 mt-0.5">🛡️</span>
            <p className="text-xs text-muted-foreground">
              {t("templates.applyDialog.safetyNote")}
            </p>
          </div>

          <div className="flex gap-2 pt-1">
            <a href={`/customize?id=${template.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                <Pencil className="w-3.5 h-3.5" />
                {t("templates.applyDialog.customize")}
              </Button>
            </a>
            <Button variant="ghost" size="sm" onClick={onClose} className="px-3 text-xs">
              {t("templates.applyDialog.close")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
