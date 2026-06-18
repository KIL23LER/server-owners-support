import { useState } from "react";
import { useListTemplates, useDeleteTemplate, getListTemplatesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
import { Search, Trash2, ExternalLink } from "lucide-react";

export default function ManageTemplates() {
  const [searchTerm, setSearchTerm] = useState("");
  const [templateToDelete, setTemplateToDelete] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: templates, isLoading } = useListTemplates({}, {
    query: {
      queryKey: ["templates-admin"]
    }
  });

  const deleteTemplate = useDeleteTemplate();

  const handleDelete = () => {
    if (!templateToDelete) return;

    deleteTemplate.mutate({ id: templateToDelete }, {
      onSuccess: () => {
        toast({
          title: "تم الحذف بنجاح",
          description: "تم حذف القالب من قاعدة البيانات.",
        });
        queryClient.invalidateQueries({ queryKey: getListTemplatesQueryKey() });
        queryClient.invalidateQueries({ queryKey: ["templates-admin"] });
        queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        setTemplateToDelete(null);
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "حدث خطأ أثناء محاولة حذف القالب.",
        });
        setTemplateToDelete(null);
      }
    });
  };

  const filteredTemplates = templates?.filter(template => 
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    template.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">إدارة القوالب</h2>
        <div className="relative w-full sm:w-72">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="ابحث بالاسم أو التصنيف..." 
            className="pr-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table dir="rtl">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>اسم القالب</TableHead>
              <TableHead>التصنيف</TableHead>
              <TableHead>تاريخ الإضافة</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredTemplates && filteredTemplates.length > 0 ? (
              filteredTemplates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.id}</TableCell>
                  <TableCell>{template.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{template.category}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(template.createdAt).toLocaleDateString('ar-SA')}
                  </TableCell>
                  <TableCell>
                    {template.featured ? (
                      <Badge className="bg-amber-500 hover:bg-amber-600 text-xs">مميز</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">عادي</span>
                    )}
                  </TableCell>
                  <TableCell className="text-left">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <a href={`https://discord.com/template/${template.templateCode}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setTemplateToDelete(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  لا توجد قوالب
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!templateToDelete} onOpenChange={(open) => !open && setTemplateToDelete(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف القالب؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف القالب بشكل نهائي من قاعدة البيانات.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse sm:justify-start gap-2">
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteTemplate.isPending}
            >
              {deleteTemplate.isPending ? "جاري الحذف..." : "حذف"}
            </AlertDialogAction>
            <AlertDialogCancel className="mt-0">إلغاء</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
