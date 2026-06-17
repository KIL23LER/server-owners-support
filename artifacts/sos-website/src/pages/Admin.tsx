import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldAlert, BarChart3, LayoutTemplate, Users, PlusCircle, Settings2 } from "lucide-react";
import AddTemplateForm from "@/components/admin/AddTemplateForm";
import ManageTemplates from "@/components/admin/ManageTemplates";
import ManageAdmins from "@/components/admin/ManageAdmins";
import AdminStatsDashboard from "@/components/admin/AdminStats";
import ManageSettings from "@/components/admin/ManageSettings";

export default function Admin() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] items-center justify-center text-center px-4">
        <ShieldAlert className="h-20 w-20 text-destructive mb-6" />
        <h1 className="text-3xl font-bold mb-4">صلاحيات غير كافية</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          عذراً، هذه الصفحة مخصصة لإداريي الموقع فقط. لا تملك الصلاحيات اللازمة للوصول إلى لوحة التحكم.
        </p>
        <Link href="/" className="text-primary hover:underline font-medium">
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold mb-2 text-foreground">لوحة الإدارة</h1>
          <p className="text-muted-foreground text-lg">
            أهلاً بك، {user.globalName || user.username}. يمكنك إدارة الموقع من هنا.
          </p>
        </div>
      </div>

      <Tabs defaultValue="stats" className="w-full" dir="rtl">
        <TabsList className="grid w-full grid-cols-5 mb-8 bg-muted/50 p-1">
          <TabsTrigger value="stats" className="flex items-center gap-2 data-[state=active]:bg-background">
            <BarChart3 className="h-4 w-4 hidden sm:block" />
            <span>الإحصائيات</span>
          </TabsTrigger>
          <TabsTrigger value="add" className="flex items-center gap-2 data-[state=active]:bg-background">
            <PlusCircle className="h-4 w-4 hidden sm:block" />
            <span>رفع قالب</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2 data-[state=active]:bg-background">
            <LayoutTemplate className="h-4 w-4 hidden sm:block" />
            <span>إدارة القوالب</span>
          </TabsTrigger>
          <TabsTrigger value="admins" className="flex items-center gap-2 data-[state=active]:bg-background">
            <Users className="h-4 w-4 hidden sm:block" />
            <span>إدارة الإداريين</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-background">
            <Settings2 className="h-4 w-4 hidden sm:block" />
            <span>الإعدادات</span>
          </TabsTrigger>
        </TabsList>
        
        <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
          <TabsContent value="stats" className="mt-0 outline-none">
            <AdminStatsDashboard />
          </TabsContent>
          <TabsContent value="add" className="mt-0 outline-none">
            <AddTemplateForm />
          </TabsContent>
          <TabsContent value="templates" className="mt-0 outline-none">
            <ManageTemplates />
          </TabsContent>
          <TabsContent value="admins" className="mt-0 outline-none">
            <ManageAdmins />
          </TabsContent>
          <TabsContent value="settings" className="mt-0 outline-none">
            <ManageSettings />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
