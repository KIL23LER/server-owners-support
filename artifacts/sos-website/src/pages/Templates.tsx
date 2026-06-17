import { useState } from "react";
import { useListTemplates, useGetMyGuilds, Template } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search, Server, Filter, LayoutTemplate } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Templates() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { data: templates, isLoading } = useListTemplates({}, {
    query: {
      queryKey: ["templates"]
    }
  });

  const categories = templates 
    ? Array.from(new Set(templates.map(t => t.category))) 
    : [];

  const filteredTemplates = templates?.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? template.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-4 text-foreground">معرض القوالب</h1>
        <p className="text-lg text-muted-foreground">
          استكشف مجموعة واسعة من قوالب الديسكورد الجاهزة. اختر القالب المناسب لسيرفرك وقم بتطبيقه بضغطة زر.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="ابحث عن قالب..." 
            className="pr-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <Button 
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            className="shrink-0"
          >
            الكل
          </Button>
          {categories.map(category => (
            <Button 
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="shrink-0"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))
        ) : filteredTemplates && filteredTemplates.length > 0 ? (
          filteredTemplates.map(template => (
            <TemplateCard key={template.id} template={template} />
          ))
        ) : (
          <div className="col-span-full py-20 text-center flex flex-col items-center justify-center">
            <Filter className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-bold mb-2">لا توجد نتائج</h3>
            <p className="text-muted-foreground">لم نتمكن من العثور على قوالب تطابق بحثك.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TemplateCard({ template }: { template: Template }) {
  const { user, login } = useAuth();
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);

  const templateUrl = template.templateCode.startsWith("http")
    ? template.templateCode
    : `https://discord.new/${template.templateCode}`;

  return (
    <Card className="overflow-hidden border-border/60 hover-elevate transition-all duration-300 flex flex-col h-full">
      {template.imageUrl ? (
        <div className="h-40 w-full overflow-hidden bg-muted">
          <img
            src={template.imageUrl}
            alt={template.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      ) : (
        <div className="h-40 w-full bg-primary/5 flex items-center justify-center border-b border-border/40">
          <LayoutTemplate className="h-16 w-16 text-primary/20" />
        </div>
      )}
      <CardContent className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-3">
          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
            {template.category}
          </Badge>
          {template.featured && (
            <Badge className="bg-amber-500 hover:bg-amber-600">مميز</Badge>
          )}
        </div>
        <h3 className="text-lg font-bold mb-2 line-clamp-1">{template.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
          {template.description}
        </p>

        <div className="mt-auto pt-4 border-t border-border/40">
          {!user ? (
            <Button className="w-full" onClick={login}>
              سجّل دخول لتطبيق القالب
            </Button>
          ) : (
            <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">تطبيق على سيرفري</Button>
              </DialogTrigger>
              <DialogContent dir="rtl" className="max-w-md">
                <DialogHeader>
                  <DialogTitle>تطبيق قالب: {template.name}</DialogTitle>
                  <DialogDescription>
                    اضغط على سيرفرك وسيفتح Discord — اختر "Apply to Existing Server" ثم حدد سيرفرك.
                  </DialogDescription>
                </DialogHeader>
                <ApplyTemplateForm template={template} templateUrl={templateUrl} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ApplyTemplateForm({ template, templateUrl }: { template: Template; templateUrl: string }) {
  const { data: guilds, isLoading } = useGetMyGuilds({
    query: { queryKey: ["my-guilds"] }
  });
  const [selectedGuild, setSelectedGuild] = useState<{ id: string; name: string; icon: string | null } | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3 py-4">
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    );
  }

  if (!guilds || guilds.length === 0) {
    return (
      <div className="py-8 text-center space-y-4">
        <Server className="h-12 w-12 text-muted-foreground mx-auto" />
        <p className="text-muted-foreground">ما عندك سيرفرات بصلاحيات أدمن.</p>
        <a href={templateUrl} target="_blank" rel="noopener noreferrer">
          <Button className="w-full">فتح القالب في Discord</Button>
        </a>
      </div>
    );
  }

  if (selectedGuild) {
    return (
      <div className="space-y-4 py-2">
        <div className="flex items-center gap-3 p-3 rounded-lg border border-primary bg-primary/5">
          {selectedGuild.icon ? (
            <img
              src={`https://cdn.discordapp.com/icons/${selectedGuild.id}/${selectedGuild.icon}.png`}
              alt={selectedGuild.name}
              className="w-10 h-10 rounded-full flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary flex-shrink-0">
              {selectedGuild.name.charAt(0)}
            </div>
          )}
          <span className="flex-1 font-medium text-sm">{selectedGuild.name}</span>
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground"
            onClick={() => setSelectedGuild(null)}
          >
            تغيير
          </Button>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 space-y-1.5 text-sm">
          <p className="font-semibold text-amber-600 dark:text-amber-400">خطوات التطبيق على Discord:</p>
          <ol className="space-y-1 text-muted-foreground pr-4 list-decimal">
            <li>اضغط الزر أدناه لفتح صفحة القالب في Discord</li>
            <li>اختر <strong className="text-foreground">"Apply to Existing Server"</strong></li>
            <li>
              اختر سيرفر <strong className="text-foreground">{selectedGuild.name}</strong> من القائمة
            </li>
          </ol>
        </div>

        <a href={templateUrl} target="_blank" rel="noopener noreferrer">
          <Button className="w-full gap-2">
            <Server className="h-4 w-4" />
            تطبيق على {selectedGuild.name}
          </Button>
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-2 py-2">
      <p className="text-xs text-muted-foreground mb-3">اختر السيرفر اللي تريد تطبيق القالب عليه:</p>
      <div className="max-h-[50vh] overflow-y-auto space-y-2 pl-1">
        {guilds.map((guild) => (
          <button
            key={guild.id}
            onClick={() => setSelectedGuild(guild)}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all group text-right"
          >
            {guild.icon ? (
              <img
                src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                alt={guild.name}
                className="w-10 h-10 rounded-full flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary flex-shrink-0">
                {guild.name.charAt(0)}
              </div>
            )}
            <span className="flex-1 font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">
              {guild.name}
            </span>
            <Server className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
