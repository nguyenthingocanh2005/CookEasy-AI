import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";
import { colors, radius, shadows, typography } from "@/constants/theme";

const icons = {
  home: ["home", "home-outline"],
  discover: ["compass", "compass-outline"],
  "ai-cooking": ["sparkles", "sparkles-outline"],
  favorites: ["heart", "heart-outline"],
  profile: ["person", "person-outline"],
} as const;

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.hint,
        tabBarLabelStyle: styles.label,
        tabBarStyle: styles.bar,
        tabBarIcon: ({ focused, color }) => {
          const names = icons[route.name as keyof typeof icons] ?? icons.home;
          const icon = focused ? names[0] : names[1];
          if (route.name === "ai-cooking") {
            return (
              <View style={[styles.aiTab, focused && styles.aiTabActive]}>
                <Ionicons name={icon} size={23} color={colors.surface} />
              </View>
            );
          }
          return (
            <Ionicons name={icon} size={22} color={focused ? colors.primaryDark : colors.hint} />
          );
        },
      })}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="discover" options={{ title: "Discover" }} />
      <Tabs.Screen name="ai-cooking" options={{ title: "AI Cooking" }} />
      <Tabs.Screen name="favorites" options={{ title: "Favorites" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: Platform.OS === "android" ? 78 : 86,
    paddingTop: 8,
    paddingBottom: Platform.OS === "android" ? 12 : 22,
    backgroundColor: colors.surface,
    borderTopColor: colors.divider,
    ...shadows.floating,
  },
  label: { ...typography.caption, fontSize: 10, fontFamily: "Inter_600SemiBold" },
  aiTab: {
    width: 46,
    height: 46,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -16,
    borderWidth: 4,
    borderColor: colors.surface,
  },
  aiTabActive: { backgroundColor: colors.primary },
});
