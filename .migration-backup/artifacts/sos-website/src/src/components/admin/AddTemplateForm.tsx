import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateTemplate, getListTemplatesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const templateSchema = z.object({
  name: z.string().min(3, { message: "اسم القالب يجب أن يكون 3 أحرف على الأقل" }),
  description: z.string().min(10, { message: "وصف القالب يجب أن يكون 10 أحرف على الأقل" }),
  imageUrl: z.string().url({ message: "الرابط غير صالح" }).optional().or(z.literal("")),
  templateCode: z.string().min(1, { message: "كود القالب مطلوب" }),
  category: z.string().min(1, { message: "تصنيف القالب مطلوب" }),
  featured: z.boolean().default(false),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

export default function AddTemplateForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createTemplate = useCreateTemplate();
  
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
      templateCode: "",
      category: "",
      featured: false,
    },
  });

  function onSubmit(data: TemplateFormValues) {
    createTemplate.mutate({
      data: {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl || null,
        templateCode: data.templateCode,
        category: data.category,
        featured: data.featured,
      }
    }, {
      onSuccess: () => {
        toast({
          title: "تمت إضافة القالب بنجاح",
          description: "تم رفع القالب إلى قاعدة البيانات.",
        });
        form.reset();
        queryClient.invalidateQueries({ queryKey: getListTemplatesQueryKey() });
        queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "حدث خطأ",
          description: error.message || "تعذر إضافة القالب، يرجى المحاولة مرة أخرى.",
        });
      }
    });
  }

  const categories = [
    "عام", "ألعاب", "مجتمع", "برمجة", "تعليم", "أنمي", "رياضة", "أخرى"
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">رفع قالب جديد</h2>
        <p className="text-muted-foreground">قم بإضافة قالب ديسكورد جديد للمجتمع.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اسم القالب</FormLabel>
                <FormControl>
                  <Input placeholder="مثال: قالب مجتمع ألعاب متكامل" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الوصف</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="وصف تفصيلي عن القالب وما يحتويه من رتب وقنوات..." 
                    className="min-h-[120px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="templateCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>كود القالب (Template ID)</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: xX1yY2zZ3" {...field} dir="ltr" className="text-left" />
                  </FormControl>
                  <FormDescription>الكود الموجود في نهاية رابط قالب ديسكورد</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>التصنيف</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger dir="rtl">
                        <SelectValue placeholder="اختر تصنيفاً" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent dir="rtl">
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رابط صورة (اختياري)</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/image.jpg" {...field} dir="ltr" className="text-left" />
                </FormControl>
                <FormDescription>رابط مباشر لصورة عرض القالب</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">قالب مميز</FormLabel>
                  <FormDescription>
                    سيظهر هذا القالب في الصفحة الرئيسية وفي أعلى قائمة القوالب.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    dir="ltr"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={createTemplate.isPending}>
            {createTemplate.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري الرفع...
              </>
            ) : (
              "إضافة القالب"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
