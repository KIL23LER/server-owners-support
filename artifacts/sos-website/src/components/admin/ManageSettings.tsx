import { useState } from "react";
import { useGetAdminSettings, useUpdateSetting } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Link2 } from "lucide-react";

export default function ManageSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useGetAdminSettings({
    query: { queryKey: ["admin-settings"] }
  });

  const [inviteLink, setInviteLink] = useState("");
  const updateSetting = useUpdateSetting();

  const currentInvite = settings?.["discord_invite"] ?? "";

  const handleSaveInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const value = inviteLink.trim() || currentInvite;
    if (!value) return;

    updateSetting.mutate(
      { key: "discord_invite", data: { value } },
      {
        onSuccess: () => {
          toast({ title: "تم الحفظ", description: "تم تحديث رابط الدعوة بنجاح." });
          setInviteLink("");
          queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
          queryClient.invalidateQueries({ queryKey: ["invite"] });
        },
        onError: () => {
          toast({ variant: "destructive", title: "خطأ", description: "تعذر حفظ الرابط." });
        }
      }
    );
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-2">إعدادات الموقع</h2>
        <p className="text-muted-foreground mb-6">
          إدارة الإعدادات العامة للموقع.
        </p>
      </div>

      <form onSubmit={handleSaveInvite} className="p-5 bg-muted/30 rounded-xl border border-border/50 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Link2 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">رابط دعوة الديسكورد</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          الرابط الحالي:{" "}
          {isLoading ? (
            <span className="italic">جاري التحميل...</span>
          ) : currentInvite ? (
            <a href={currentInvite} target="_blank" rel="noopener noreferrer"
              className="font-mono text-primary hover:underline"
            >
              {currentInvite}
            </a>
          ) : (
            <span className="italic text-muted-foreground">لم يُضبط بعد (يستخدم الافتراضي)</span>
          )}
        </p>
        <div className="flex gap-3">
          <div className="flex-1">
            <Label htmlFor="invite-input" className="sr-only">رابط الدعوة الجديد</Label>
            <Input
              id="invite-input"
              dir="ltr"
              placeholder="https://discord.gg/..."
              value={inviteLink}
              onChange={(e) => setInviteLink(e.target.value)}
              className="text-left"
            />
          </div>
          <Button type="submit" disabled={!inviteLink.trim() || updateSetting.isPending}>
            {updateSetting.isPending ? "جاري الحفظ..." : (
              <>
                <Save className="ml-2 h-4 w-4" />
                حفظ
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
