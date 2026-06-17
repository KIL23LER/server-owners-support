import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useListTemplates, useGetInvite } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Shield, Star, Award, MessageSquare, LayoutTemplate } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();
  const { data: templates, isLoading } = useListTemplates({ featured: true }, {
    query: { queryKey: ["templates", "featured"] }
  });
  const { data: inviteData } = useGetInvite();
  const inviteLink = inviteData?.invite ?? "https://discord.gg/264549513333702657";

  const sections = [
    { key: "start", icon: MessageSquare },
    { key: "server", icon: LayoutTemplate },
    { key: "security", icon: Shield },
    { key: "rating", icon: Star },
    { key: "apply", icon: Users },
    { key: "cup", icon: Award },
  ] as const;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <section className="relative overflow-hidden bg-primary/5 py-24 lg:py-32">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-10">
          <img
            src="https://cdn.discordapp.com/banners/264549513333702657/4e64a1f5d48fff55ca767f84d0e99fe8.png"
            alt="Banner background"
            className="w-full h-full object-cover blur-sm"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/20 text-primary hover:bg-primary/30 border-primary/30 px-4 py-1.5 text-sm font-semibold">
              {t("home.badge")}
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 leading-tight">
              {t("home.title")}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              {t("home.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" asChild className="text-base h-12 px-8 shadow-lg hover-elevate">
                <a href={inviteLink} target="_blank" rel="noopener noreferrer">
                  {t("home.joinServer")}
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base h-12 px-8 hover-elevate">
                <Link href="/templates">{t("home.exploreTemplates")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">{t("home.sectionsTitle")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              {t("home.sectionsSubtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {sections.map(({ key, icon: Icon }) => (
              <Card key={key} className="border-border/50 bg-card/50 hover:bg-card transition-all duration-300 hover:shadow-md hover-elevate group">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{t(`home.sections.${key}.name`)}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t(`home.sections.${key}.desc`)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-3">{t("home.featuredTitle")}</h2>
              <p className="text-muted-foreground text-lg">{t("home.featuredSubtitle")}</p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex hover:bg-primary/10 hover:text-primary">
              <Link href="/templates">{t("home.viewAll")}</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col space-y-3">
                  <Skeleton className="h-48 w-full rounded-xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            ) : templates && templates.length > 0 ? (
              templates.slice(0, 3).map((template) => (
                <Card key={template.id} className="overflow-hidden border-border/50 hover-elevate transition-all duration-300">
                  {template.imageUrl && (
                    <div className="h-48 w-full overflow-hidden bg-muted">
                      <img
                        src={template.imageUrl}
                        alt={template.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {template.category}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold mb-2 line-clamp-1">{template.name}</h3>
                    <p className="text-muted-foreground line-clamp-2 mb-6 h-10">
                      {template.description}
                    </p>
                    <Button asChild className="w-full">
                      <Link href="/templates">{t("home.viewDetails")}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-muted-foreground">
                {t("home.noFeatured")}
              </div>
            )}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" asChild className="w-full">
              <Link href="/templates">{t("home.viewAll")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
