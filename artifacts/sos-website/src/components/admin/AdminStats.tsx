import { useGetAdminStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LayoutTemplate, Users, ShieldCheck, Star } from "lucide-react";

export default function AdminStatsDashboard() {
  const { data: stats, isLoading } = useGetAdminStats({
    query: {
      queryKey: ["admin-stats"]
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[60px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center py-10 text-muted-foreground">تعذر تحميل الإحصائيات</div>;
  }

  const statCards = [
    {
      title: "إجمالي القوالب",
      value: stats.totalTemplates,
      icon: LayoutTemplate,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "القوالب المميزة",
      value: stats.featuredTemplates,
      icon: Star,
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    },
    {
      title: "المستخدمين",
      value: stats.totalUsers,
      icon: Users,
      color: "text-green-500",
      bg: "bg-green-500/10"
    },
    {
      title: "الإداريين",
      value: stats.totalAdmins,
      icon: ShieldCheck,
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">نظرة عامة</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, i) => (
            <Card key={i} className="overflow-hidden border-border/50 shadow-sm">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
