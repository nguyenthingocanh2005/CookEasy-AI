
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "@/constants/theme";

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.replace("/onboarding"), 1400);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.brand}>
        <View style={styles.logo}>
          <Ionicons name="leaf" size={42} color={colors.surface} />
          <View style={styles.spark}>
            <Ionicons name="sparkles" size={15} color={colors.orange} />
          </View>
        </View>
        <Text style={styles.name}>CookEasy AI</Text>
        <Text style={styles.tagline}>
          Cook smarter. Waste less. Eat better.
        </Text>
      </View>
      <ActivityIndicator color={colors.primary} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.xxl,
  },
  brand: { alignItems: "center", gap: spacing.sm },
  logo: {
    width: 92,
    height: 92,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  spark: {
    position: "absolute",
    right: 14,
    top: 14,
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: colors.orangeLight,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { ...typography.hero, color: colors.primaryDark },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
