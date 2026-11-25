
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  ConfirmationDialog,
  Screen,
  UserAvatar,
} from "@/components/ui";
import { colors, radius, spacing, typography } from "@/constants/theme";
import { useApp } from "@/contexts/AppContext";
import { getProfile } from "@/services/profileService";

const settings = [
  { title: "Edit Profile", icon: "create-outline" as const },
  { title: "My Favorites", icon: "heart-outline" as const },
  { title: "Dietary Preferences", icon: "leaf-outline" as const },
  { title: "Account Settings", icon: "settings-outline" as const },
  { title: "About CookEasy AI", icon: "information-circle-outline" as const },
];

export function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useApp();

  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [displayName, setDisplayName] = useState("CookEasy User");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Reload profile whenever this screen becomes active.
  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadProfile = async () => {
        if (!user) {
          setDisplayName("CookEasy User");
          setEmail("");
          setAvatarUrl(null);
          setLoadingProfile(false);
          return;
        }

        setEmail(user.email ?? "");

        try {
          const result = await getProfile(user.id);

          if (!active) return;

          setDisplayName(
            result.profile?.display_name ??
              user.user_metadata?.full_name ??
              user.user_metadata?.display_name ??
              user.email?.split("@")[0] ??
              "CookEasy User"
          );

          setAvatarUrl(
            result.profile?.avatar_url ??
              user.user_metadata?.avatar_url ??
              null
          );
        } catch {
          if (!active) return;

          setDisplayName(
            user.user_metadata?.full_name ??
              user.user_metadata?.display_name ??
              user.email?.split("@")[0] ??
              "CookEasy User"
          );

          setAvatarUrl(user.user_metadata?.avatar_url ?? null);
        } finally {
          if (active) {
            setLoadingProfile(false);
          }
        }
      };

      setLoadingProfile(true);
      loadProfile();

      return () => {
        active = false;
      };
    }, [user])
  );

  const openSetting = (title: string) => {
    if (title === "My Favorites") {
      router.push("/(tabs)/favorites");
      return;
    }

    if (title === "Edit Profile") {
      router.push("/edit-profile");
      return;
    }

    Alert.alert(
      title,
      "This feature will be connected in a future update."
    );
  };

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const result = await signOut();

      if (result.error) {
        Alert.alert("Log Out Failed", result.error);
        return;
      }

      setLogoutOpen(false);
      router.replace("/(auth)/login");
    } catch {
      Alert.alert(
        "Error",
        "Something went wrong while logging out. Please try again."
      );
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.profileCard}>
        {loadingProfile ? (
          <View style={styles.avatarLoading}>
            <ActivityIndicator
              size="large"
              color={colors.primary}
            />
          </View>
        ) : (
          <UserAvatar
            uri={avatarUrl ?? undefined}
            name={displayName}
            size={82}
          />
        )}

        <Text style={styles.name}>
          {displayName}
        </Text>

        <Text style={styles.email}>
          {email}
        </Text>
      </View>

      <View style={styles.settingsCard}>
        {settings.map((item, index) => (
          <Pressable
            key={item.title}
            onPress={() => openSetting(item.title)}
            style={[
              styles.setting,
              index < settings.length - 1 && styles.settingBorder,
            ]}
          >
            <View style={styles.settingIcon}>
              <Ionicons
                name={item.icon}
                size={20}
                color={colors.primaryDark}
              />
            </View>

            <Text style={styles.settingText}>
              {item.title}
            </Text>

            <Ionicons
              name="chevron-forward"
              size={19}
              color={colors.hint}
            />
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={() => setLogoutOpen(true)}
        style={styles.logout}
      >
        <Ionicons
          name="log-out-outline"
          size={20}
          color={colors.error}
        />

        <Text style={styles.logoutText}>
          Log Out
        </Text>
      </Pressable>

      <ConfirmationDialog
        visible={logoutOpen}
        title="Log out?"
        description="You can sign back in anytime to access your saved recipes."
        confirmLabel={loggingOut ? "Logging Out..." : "Log Out"}
        onCancel={() => {
          if (!loggingOut) {
            setLogoutOpen(false);
          }
        }}
        onConfirm={handleLogout}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatarLoading: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.xs,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.modal,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.xs,
  },
  name: {
    ...typography.section,
    color: colors.text,
    marginTop: spacing.xs,
  },
  email: {
    ...typography.description,
    color: colors.textSecondary,
  },
  settingsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
  },
  setting: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  settingBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.input,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  settingText: {
    ...typography.body,
    fontFamily: "Inter_600SemiBold",
    color: colors.text,
    flex: 1,
  },
  logout: {
    minHeight: 52,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: "#F3CDCD",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  logoutText: {
    ...typography.button,
    color: colors.error,
  },
});
