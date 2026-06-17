import { useListTemplates } from "@workspace/api-client-react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const SECTIONS = [
  { name: "البداية", icon: "chat-outline" as const, desc: "نقطة انطلاقك في المجتمع" },
  { name: "سيرفرك", icon: "server-outline" as const, desc: "شارك سيرفرك واحصل على نصائح" },
  { name: "الأمان", icon: "shield-check-outline" as const, desc: "حماية سيرفرك من السبام" },
  { name: "التقييم", icon: "star-outline" as const, desc: "قيّم سيرفرات الآخرين" },
  { name: "التقديم", icon: "account-group-outline" as const, desc: "ابحث عن إداريين" },
  { name: "كأس 2026", icon: "trophy-outline" as const, desc: "تحديات وفعاليات خاصة" },
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isWeb = Platform.OS === "web";

  const { data: featured, isLoading } = useListTemplates(
    { featured: "true" } as any,
    { query: { queryKey: ["templates", "featured"] } }
  );

  const s = makeStyles(colors, insets, isWeb);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.hero}>
        <View style={s.badge}>
          <Text style={s.badgeText}>+550 صاحب سيرفر عربي</Text>
        </View>
        <Text style={s.heroTitle}>مجتمع أصحاب{"\n"}سيرفرات الديسكورد</Text>
        <Text style={s.heroSub}>مكان يجمع أصحاب السيرفرات لتبادل الخبرات ومشاركة القوالب</Text>
        <Pressable style={s.joinBtn} onPress={() => Linking.openURL("https://discord.gg/264549513333702657")}>
          <MaterialCommunityIcons name="discord" size={20} color="#fff" />
          <Text style={s.joinBtnText}>انضم للسيرفر</Text>
        </Pressable>
      </View>

      <Text style={s.sectionTitle}>أقسام المجتمع</Text>
      <View style={s.grid}>
        {SECTIONS.map((sec) => (
          <View key={sec.name} style={s.card}>
            <View style={s.cardIcon}>
              <MaterialCommunityIcons name={sec.icon} size={22} color={colors.primary} />
            </View>
            <Text style={s.cardName}>{sec.name}</Text>
            <Text style={s.cardDesc}>{sec.desc}</Text>
          </View>
        ))}
      </View>

      <View style={s.featuredHeader}>
        <Text style={s.sectionTitle}>قوالب مميزة</Text>
        <Pressable onPress={() => router.push("/(tabs)/templates")}>
          <Text style={s.seeAll}>عرض الكل</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
      ) : featured && featured.length > 0 ? (
        featured.slice(0, 3).map((t) => (
          <Pressable key={t.id} style={s.featuredCard} onPress={() => router.push("/(tabs)/templates")}>
            <View style={s.featuredContent}>
              <View style={s.featuredBadge}>
                <Text style={s.featuredBadgeText}>{t.category}</Text>
              </View>
              <Text style={s.featuredName}>{t.name}</Text>
              <Text style={s.featuredDesc} numberOfLines={2}>{t.description}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-left" size={20} color={colors.mutedForeground} />
          </Pressable>
        ))
      ) : (
        <View style={s.empty}>
          <Text style={s.emptyText}>لا توجد قوالب مميزة حالياً</Text>
        </View>
      )}
    </ScrollView>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>, insets: ReturnType<typeof useSafeAreaInsets>, isWeb: boolean) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: {
      paddingTop: isWeb ? 67 + 16 : insets.top + 16,
      paddingBottom: isWeb ? 34 + 100 : insets.bottom + 100,
      paddingHorizontal: 20,
    },
    hero: {
      backgroundColor: colors.secondary,
      borderRadius: colors.radius,
      padding: 24,
      marginBottom: 28,
      alignItems: "center",
    },
    badge: {
      backgroundColor: colors.primary + "22",
      borderRadius: 99,
      paddingHorizontal: 14,
      paddingVertical: 6,
      marginBottom: 14,
    },
    badgeText: { color: colors.primary, fontSize: 12, fontFamily: "Inter_600SemiBold" },
    heroTitle: {
      fontSize: 22,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      textAlign: "center",
      marginBottom: 10,
    },
    heroSub: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
      marginBottom: 20,
      lineHeight: 22,
    },
    joinBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: colors.radius,
    },
    joinBtnText: { color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 15 },
    sectionTitle: {
      fontSize: 18,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      marginBottom: 14,
      textAlign: "right",
    },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 28 },
    card: {
      width: "47%",
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardIcon: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: colors.primary + "15",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },
    cardName: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      marginBottom: 4,
      textAlign: "right",
    },
    cardDesc: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      lineHeight: 18,
      textAlign: "right",
    },
    featuredHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
    seeAll: { color: colors.primary, fontFamily: "Inter_500Medium", fontSize: 14 },
    featuredCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 16,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    featuredContent: { flex: 1 },
    featuredBadge: {
      backgroundColor: colors.primary + "15",
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
      alignSelf: "flex-end",
      marginBottom: 6,
    },
    featuredBadgeText: { color: colors.primary, fontSize: 11, fontFamily: "Inter_500Medium" },
    featuredName: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      marginBottom: 4,
      textAlign: "right",
    },
    featuredDesc: { fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "right" },
    empty: { alignItems: "center", paddingVertical: 20 },
    emptyText: { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
  });
}
