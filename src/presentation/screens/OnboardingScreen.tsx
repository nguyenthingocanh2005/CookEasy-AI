
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton } from "@/components/ui";
import { colors, radius, spacing, typography } from "@/constants/theme";

const slides = [
  {
    title: "Discover what to cook",
    description: "Turn everyday ingredients into meals you’ll genuinely look forward to.",
    image: "https://images.unsplash.com/photo-1554878015-e51ff096a767?w=1200&q=85",
    icon: "restaurant-outline" as const,
  },
  {
    title: "Scan ingredients with AI",
    description:
      "Photograph your fridge or pantry, then review every ingredient before continuing.",
    image: "https://images.unsplash.com/photo-1655115287925-e03a3f863e98?w=1200&q=85",
    icon: "scan-outline" as const,
  },
  {
    title: "Create recipes made for you",
    description: "Get practical ideas shaped around your time, tastes, and dietary preferences.",
    image: "https://images.unsplash.com/photo-1625128726772-ab1d76ef976e?w=1200&q=85",
    icon: "sparkles-outline" as const,
  },
];

export function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const router = useRouter();
  const slide = slides[index] ?? slides[0]!;
  const isLast = index === slides.length - 1;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topRow}>
        <Text style={styles.brand}>CookEasy AI</Text>
        <Pressable onPress={() => router.replace("/(auth)/login")} hitSlop={8}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>
      <ImageBackground
        source={{ uri: slide.image }}
        style={styles.image}
        imageStyle={styles.imageRadius}
      >
        <View style={styles.scrim} />
        <View style={styles.icon}>
          <Ionicons name={slide.icon} size={28} color={colors.primaryDark} />
        </View>
      </ImageBackground>
      <View style={styles.copy}>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>
      </View>
      <View style={styles.dots}>
        {slides.map((item, itemIndex) => (
          <View key={item.title} style={[styles.dot, itemIndex === index && styles.dotActive]} />
        ))}
      </View>
      <PrimaryButton
        title={isLast ? "Get Started" : "Continue"}
        icon="arrow-forward"
        onPress={() => (isLast ? router.replace("/(auth)/login") : setIndex((value) => value + 1))}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, gap: spacing.lg },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brand: { ...typography.cardTitle, color: colors.primaryDark },
  skip: { ...typography.button, color: colors.textSecondary },
  image: {
    flex: 1,
    minHeight: 330,
    justifyContent: "flex-end",
    padding: spacing.lg,
    overflow: "hidden",
    borderRadius: radius.modal,
  },
  imageRadius: { borderRadius: radius.modal },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(15,35,18,0.16)",
    borderRadius: radius.modal,
  },
  icon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: { gap: spacing.sm },
  title: { ...typography.title, color: colors.text },
  description: { ...typography.body, color: colors.textSecondary },
  dots: { flexDirection: "row", gap: spacing.xs, justifyContent: "center" },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { width: 24, backgroundColor: colors.primary },
});
