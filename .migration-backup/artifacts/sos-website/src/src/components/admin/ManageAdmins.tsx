import { useState } from "react";
import { useListAdmins, useAddAdmin, useRemoveAdmin, getListAdminsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, UserPlus, ShieldAlert, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";

export default function ManageAdmins() {
  const [newAdminId, setNewAdminId] = useState("");
  const [makeOwner, setMakeOwner] = useState(false);
  const [adminToRemove, setAdminToRemove] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const { data: admins, isLoading } = useListAdmins({
    query: {
      queryKey: ["admins-list"]
    }
  });

  const addAdmin = useAddAdmin();
  const removeAdmin = useRemoveAdmin();

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminId.trim()) return;

    addAdmin.mutate({ data: { discordId: newAdminId, isOwner: makeOwner } }, {
      onSuccess: () => {
        toast({
          title: "تمت إضافة الإداري",
          description: "تم منحه صلاحيات الإدارة بنجاح.",
        });
        setNewAdminId("");
        queryClient.invalidateQueries({ queryKey: getListAdminsQueryKey() });
        queryClient.invalidateQueries({ queryKey: ["admins-list"] });
        queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "حدث خطأ",
          description: error.message || "تعذر إضافة الإداري.",
        });
      }
    });
  };

  const handleRemove = () => {
    if (!adminToRemove) return;

    removeAdmin.mutate({ discordId: adminToRemove }, {
      onSuccess: () => {
        toast({
          title: "تم سحب الصلاحيات",
          description: "تم سحب صلاحيات الإدارة بنجاح.",
        });
        queryClient.invalidateQueries({ queryKey: getListAdminsQueryKey() });
        queryClient.invalidateQueries({ queryKey: ["admins-list"] });
        queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        setAdminToRemove(null);
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "حدث خطأ أثناء محاولة سحب الصلاحيات.",
        });
        setAdminToRemove(null);
      }
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-2">إدارة المشرفين</h2>
        <p className="text-muted-foreground mb-6">
          يمكن للمشرفين الوصول إلى لوحة التحكم، إضافة وقبول قوالب جديدة، وتعيين مشرفين آخرين.
        </p>

        <form onSubmit={handleAddAdmin} className="flex flex-wrap gap-3 mb-8 p-4 bg-muted/30 rounded-lg border border-border/50">
          <div className="flex-1 min-w-[200px]">
            <Input 
              placeholder="معرف الديسكورد (Discord ID)" 
              value={newAdminId}
              onChange={(e) => setNewAdminId(e.target.value)}
              dir="ltr"
              className="text-left"
            />
          </div>
          {user?.isOwner && (
            <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground select-none">
              <input
                type="checkbox"
                checked={makeOwner}
                onChange={(e) => setMakeOwner(e.target.checked)}
                className="w-4 h-4"
              />
              <Crown className="h-4 w-4 text-yellow-500" />
              Owner
            </label>
          )}
          <Button type="submit" disabled={!newAdminId.trim() || addAdmin.isPending}>
            {addAdmin.isPending ? "جاري الإضافة..." : (
              <>
                <UserPlus className="ml-2 h-4 w-4" />
                إضافة مشرف
              </>
            )}
          </Button>
        </form>

        <div className="rounded-md border overflow-hidden">
          <Table dir="rtl">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>معرف الديسكورد</TableHead>
                <TableHead>الرتبة</TableHead>
                <TableHead>تاريخ التعيين</TableHead>
                <TableHead>تم التعيين بواسطة</TableHead>
                <TableHead className="text-left">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : admins && admins.length > 0 ? (
                admins.map((admin) => (
                  <TableRow key={admin.discordId}>
                    <TableCell className="font-medium font-mono text-left" dir="ltr">
                      {admin.discordId}
                    </TableCell>
                    <TableCell>
                      {admin.isOwner ? (
                        <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30 gap-1">
                          <Crown className="h-3 w-3" /> Owner
                        </Badge>
                      ) : (
                        <Badge variant="secondary">مشرف</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(admin.createdAt).toLocaleDateString('ar-SA')}
                    </TableCell>
                    <TableCell>
                      {admin.addedBy ? (
                        <span className="font-mono text-sm">{admin.addedBy}</span>
                      ) : (
                        <span className="text-muted-foreground text-sm">النظام</span>
                      )}
                    </TableCell>
                    <TableCell className="text-left">
                      {!admin.isOwner && user?.isOwner && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setAdminToRemove(admin.discordId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    لا يوجد مشرفين مضافين
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={!!adminToRemove} onOpenChange={(open) => !open && setAdminToRemove(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="h-6 w-6 text-destructive" />
              <AlertDialogTitle>سحب صلاحيات الإدارة</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              هل أنت متأكد من سحب صلاحيات الإدارة من هذا المستخدم؟ لن يتمكن من الوصول إلى لوحة الإدارة بعد ذلك.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse sm:justify-start gap-2">
            <AlertDialogAction 
              onClick={handleRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={removeAdmin.isPending}
            >
              {removeAdmin.isPending ? "جاري التنفيذ..." : "تأكيد السحب"}
            </AlertDialogAction>
            <AlertDialogCancel className="mt-0">إلغاء</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
