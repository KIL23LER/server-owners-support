import { useListTemplates } from "@workspace/api-client-react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const CATEGORIES = ["الكل", "عام", "ألعاب", "تعليم", "ترفيه", "إبداع", "تقنية"];

export default function TemplatesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("الكل");

  const { data: templates, isLoading } = useListTemplates(
    category !== "الكل" ? { category } : {},
    { query: { queryKey: ["templates", category] } }
  );

  const filtered = templates?.filter((t) =>
    search.trim() === "" ||
    t.name.includes(search) ||
    t.description?.includes(search)
  );

  const s = makeStyles(colors, insets, isWeb);

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.title}>القوالب</Text>
        <View style={s.searchRow}>
          <MaterialCommunityIcons name="magnify" size={18} color={colors.mutedForeground} style={s.searchIcon} />
          <TextInput
            style={s.searchInput}
            placeholder="ابحث عن قالب..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
            textAlign="right"
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.categories}>
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              style={[s.catBtn, category === cat && s.catBtnActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[s.catText, category === cat && s.catTextActive]}>{cat}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={s.list}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : filtered && filtered.length > 0 ? (
          filtered.map((t) => (
            <View key={t.id} style={s.card}>
              <View style={s.cardTop}>
                <View style={s.catTag}>
                  <Text style={s.catTagText}>{t.category}</Text>
                </View>
                {t.featured && (
                  <View style={s.featuredTag}>
                    <MaterialCommunityIcons name="star" size={11} color={colors.primary} />
                    <Text style={s.featuredTagText}>مميز</Text>
                  </View>
                )}
              </View>
              <Text style={s.cardName}>{t.name}</Text>
              <Text style={s.cardDesc} numberOfLines={3}>{t.description}</Text>
              <Pressable
                style={s.applyBtn}
                onPress={() => {
                  const url = `https://discord.new/${t.discordTemplateCode}`;
                  Linking.openURL(url);
                }}
              >
                <MaterialCommunityIcons name="discord" size={16} color="#fff" />
                <Text style={s.applyBtnText}>تطبيق القالب</Text>
              </Pressable>
            </View>
          ))
        ) : (
          <View style={s.empty}>
            <MaterialCommunityIcons name="folder-open-outline" size={48} color={colors.border} />
            <Text style={s.emptyText}>لا توجد قوالب</Text>
            {search !== "" && (
              <Text style={s.emptySubText}>جرب كلمة بحث مختلفة</Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>, insets: ReturnType<typeof useSafeAreaInsets>, isWeb: boolean) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: isWeb ? 67 + 16 : insets.top + 16,
      paddingHorizontal: 20,
      paddingBottom: 12,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 24,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      textAlign: "right",
      marginBottom: 14,
    },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.muted,
      borderRadius: colors.radius,
      paddingHorizontal: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchIcon: { marginLeft: 8 },
    searchInput: {
      flex: 1,
      paddingVertical: 10,
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
    },
    categories: { gap: 8, paddingBottom: 4 },
    catBtn: {
      paddingHorizontal: 16,
      paddingVertical: 7,
      borderRadius: 99,
      backgroundColor: colors.muted,
      borderWidth: 1,
      borderColor: colors.border,
    },
    catBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    catText: { fontSize: 13, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    catTextActive: { color: "#fff" },
    list: { flex: 1 },
    listContent: {
      padding: 20,
      paddingBottom: isWeb ? 34 + 100 : insets.bottom + 100,
      gap: 14,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardTop: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginBottom: 10 },
    catTag: {
      backgroundColor: colors.primary + "15",
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    catTagText: { color: colors.primary, fontSize: 11, fontFamily: "Inter_500Medium" },
    featuredTag: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      backgroundColor: "#fbbf2420",
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    featuredTagText: { color: "#f59e0b", fontSize: 11, fontFamily: "Inter_500Medium" },
    cardName: {
      fontSize: 16,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      textAlign: "right",
      marginBottom: 6,
    },
    cardDesc: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "right",
      lineHeight: 20,
      marginBottom: 14,
    },
    applyBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.primary,
      paddingVertical: 11,
      borderRadius: colors.radius,
    },
    applyBtnText: { color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 14 },
    empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
    emptyText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground },
    emptySubText: { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
  });
}
