
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

import {
  CustomTextInput,
  PrimaryButton,
  Screen,
  SecondaryButton,
  UserAvatar,
} from "@/components/ui";
import { colors, radius, spacing, typography } from "@/constants/theme";
import { useApp } from "@/contexts/AppContext";
import {
  getProfile,
  updateProfile,
  uploadAvatar,
} from "@/services/profileService";

export function EditProfileScreen() {
  const router = useRouter();
  const { user } = useApp();

  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      if (!user) {
        setLoadingProfile(false);
        return;
      }

      try {
        const result = await getProfile(user.id);

        if (!active) return;

        if (result.error) {
          setError(result.error);
        }

        setDisplayName(
          result.profile?.display_name ??
            user.user_metadata?.full_name ??
            user.user_metadata?.display_name ??
            user.email?.split("@")[0] ??
            ""
        );

        setAvatarUrl(
          result.profile?.avatar_url ??
            user.user_metadata?.avatar_url ??
            null
        );
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your profile."
        );
      } finally {
        if (active) setLoadingProfile(false);
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [user]);

  const handleChoosePhoto = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow CookEasy AI to access your photo library."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0]);
        setError("");
        }
    } catch {
      Alert.alert("Error", "Unable to open your photo library.");
    }
  };

  const handleSave = async () => {
    if (!user) {
      setError("Please sign in again.");
      return;
    }

    const normalizedName = displayName.trim();

    if (!normalizedName) {
      setError("Please enter your name.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      // Update the user's name in Supabase.
      const profileResult = await updateProfile(
        user.id,
        normalizedName
      );

      if (profileResult.error) {
        setError(profileResult.error);
        return;
      }

      // Update Supabase Auth metadata as well.
      const { error: authError } = await (
        await import("@/lib/supabase")
      ).supabase.auth.updateUser({
        data: {
          full_name: normalizedName,
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      // Upload the selected avatar if there is a new image.
      if (selectedImage) {
        const avatarResult = await uploadAvatar(
          user.id,
          selectedImage.uri,
          selectedImage.mimeType
        );

        if (avatarResult.error) {
          setError(
            `Your name was saved, but the avatar could not be uploaded: ${avatarResult.error}`
          );
          return;
        }

        setAvatarUrl(avatarResult.avatarUrl);
      }

      Alert.alert("Success", "Your profile has been updated.", [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)/profile"),
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loadingProfile) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color={colors.text}
          />
        </Pressable>

        <Text style={styles.title}>Edit Profile</Text>
      </View>

      <View style={styles.avatarSection}>
        <View style={styles.avatarWrapper}>
          <UserAvatar
            uri={selectedImage?.uri ?? avatarUrl ?? undefined}
            name={displayName || "User"}
            size={104}
           />

          <Pressable
            onPress={handleChoosePhoto}
            style={styles.cameraButton}
          >
            <Ionicons
              name="camera"
              size={19}
              color={colors.surface}
            />
          </Pressable>
        </View>

        <Pressable onPress={handleChoosePhoto}>
          <Text style={styles.changePhoto}>Change Photo</Text>
        </Pressable>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Full Name</Text>

        <CustomTextInput
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Enter your full name"
          autoCapitalize="words"
        />

        <Text style={styles.label}>Email Address</Text>

        <View style={styles.emailField}>
          <Ionicons
            name="mail-outline"
            size={19}
            color={colors.hint}
          />
          <Text style={styles.emailText}>
            {user?.email ?? ""}
          </Text>
        </View>

        <Text style={styles.emailNote}>
          Your email address cannot be changed here.
        </Text>

        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : null}

        <PrimaryButton
          title={saving ? "Saving..." : "Save Changes"}
          onPress={handleSave}
          disabled={saving}
        />

        <SecondaryButton
          title="Cancel"
          onPress={() => router.back()}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: radius.button,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  avatarSection: {
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  avatarWrapper: {
    position: "relative",
  },
  cameraButton: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.background,
  },
  changePhoto: {
    ...typography.body,
    color: colors.primaryDark,
    fontFamily: "Inter_600SemiBold",
  },
  form: {
    gap: spacing.md,
  },
  label: {
    ...typography.body,
    color: colors.text,
    fontFamily: "Inter_600SemiBold",
  },
  emailField: {
    minHeight: 52,
    backgroundColor: colors.input,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  emailText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  emailNote: {
    ...typography.description,
    color: colors.hint,
    marginTop: -spacing.xs,
  },
  error: {
    ...typography.description,
    color: colors.error,
  },
});
