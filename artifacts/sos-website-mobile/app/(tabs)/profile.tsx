import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";

const DOMAIN = process.env.EXPO_PUBLIC_DOMAIN;
const API_BASE = DOMAIN ? `https://${DOMAIN}` : "";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { user, isLoading, token, logout } = useAuth();

  const handleLogin = async () => {
    const redirectUrl = Linking.createURL("auth");
    const loginUrl = `${API_BASE}/api/auth/login?mobile=true&redirect=${encodeURIComponent(redirectUrl)}`;

    if (Platform.OS === "web") {
      window.location.href = loginUrl;
    } else {
      await WebBrowser.openAuthSessionAsync(loginUrl, redirectUrl);
    }
  };

  const s = makeStyles(colors, insets, isWeb);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <Text style={s.pageTitle}>حسابي</Text>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 60 }} />
      ) : user ? (
        <>
          <View style={s.profileCard}>
            {user.avatar ? (
              <Image
                source={{ uri: `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png?size=128` }}
                style={s.avatar}
              />
            ) : (
              <View style={[s.avatar, s.avatarFallback]}>
                <MaterialCommunityIcons name="account" size={40} color={colors.primary} />
              </View>
            )}
            <Text style={s.username}>{user.globalName ?? user.username}</Text>
            <Text style={s.discordId}>@{user.username}</Text>
            {user.isAdmin && (
              <View style={s.adminBadge}>
                <MaterialCommunityIcons name="shield-check" size={13} color="#fff" />
                <Text style={s.adminText}>مشرف</Text>
              </View>
            )}
          </View>

          <View style={s.section}>
            <Text style={s.sectionTitle}>الحساب</Text>
            <View style={s.menuCard}>
              <Pressable style={s.menuItem} onPress={() => Linking.openURL("https://discord.com/channels/@me")}>
                <MaterialCommunityIcons name="discord" size={20} color={colors.primary} />
                <Text style={s.menuLabel}>فتح Discord</Text>
                <MaterialCommunityIcons name="chevron-left" size={18} color={colors.mutedForeground} />
              </Pressable>
              <View style={s.divider} />
              <Pressable style={s.menuItem} onPress={() => Linking.openURL("https://server-owners-support.vercel.app")}>
                <MaterialCommunityIcons name="web" size={20} color={colors.primary} />
                <Text style={s.menuLabel}>الموقع الإلكتروني</Text>
                <MaterialCommunityIcons name="chevron-left" size={18} color={colors.mutedForeground} />
              </Pressable>
            </View>
          </View>

          <Pressable style={s.logoutBtn} onPress={logout}>
            <MaterialCommunityIcons name="logout" size={18} color={colors.destructive} />
            <Text style={s.logoutText}>تسجيل الخروج</Text>
          </Pressable>
        </>
      ) : (
        <>
          <View style={s.loginCard}>
            <View style={s.loginIcon}>
              <MaterialCommunityIcons name="discord" size={48} color={colors.primary} />
            </View>
            <Text style={s.loginTitle}>سجل دخولك بـ Discord</Text>
            <Text style={s.loginSub}>للوصول إلى جميع الميزات وإدارة سيرفراتك</Text>
            <Pressable style={s.loginBtn} onPress={handleLogin}>
              <MaterialCommunityIcons name="discord" size={20} color="#fff" />
              <Text style={s.loginBtnText}>تسجيل الدخول</Text>
            </Pressable>
          </View>

          <View style={s.featuresCard}>
            {[
              { icon: "view-grid-outline" as const, text: "تطبيق قوالب على سيرفراتك مباشرة" },
              { icon: "shield-check-outline" as const, text: "إدارة وحماية سيرفراتك" },
              { icon: "account-group-outline" as const, text: "تواصل مع مجتمع أصحاب السيرفرات" },
            ].map((f) => (
              <View key={f.text} style={s.featureRow}>
                <MaterialCommunityIcons name={f.icon} size={20} color={colors.primary} />
                <Text style={s.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>
        </>
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
    pageTitle: {
      fontSize: 24,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      textAlign: "right",
      marginBottom: 24,
    },
    profileCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 24,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 24,
    },
    avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 14 },
    avatarFallback: {
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    username: {
      fontSize: 20,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      marginBottom: 4,
    },
    discordId: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginBottom: 10,
    },
    adminBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: colors.primary,
      borderRadius: 99,
      paddingHorizontal: 12,
      paddingVertical: 5,
    },
    adminText: { color: "#fff", fontSize: 12, fontFamily: "Inter_600SemiBold" },
    section: { marginBottom: 20 },
    sectionTitle: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      textAlign: "right",
      marginBottom: 10,
    },
    menuCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
    },
    menuLabel: {
      flex: 1,
      fontSize: 15,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
      textAlign: "right",
    },
    divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 16 },
    logoutBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderWidth: 1,
      borderColor: colors.destructive + "50",
      borderRadius: colors.radius,
      paddingVertical: 13,
      marginTop: 8,
    },
    logoutText: { color: colors.destructive, fontFamily: "Inter_600SemiBold", fontSize: 15 },
    loginCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 32,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 20,
    },
    loginIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary + "15",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
    },
    loginTitle: {
      fontSize: 20,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      marginBottom: 10,
    },
    loginSub: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 24,
    },
    loginBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: colors.primary,
      paddingHorizontal: 32,
      paddingVertical: 14,
      borderRadius: colors.radius,
    },
    loginBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 16 },
    featuresCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 14,
    },
    featureRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    featureText: {
      flex: 1,
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
      textAlign: "right",
    },
  });
}
