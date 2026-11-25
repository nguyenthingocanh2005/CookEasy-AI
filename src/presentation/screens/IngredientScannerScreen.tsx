
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  PrimaryButton,
  Screen,
  SecondaryButton,
} from "@/components/ui";
import { colors, radius, spacing, typography } from "@/constants/theme";

export function IngredientScannerScreen() {
  const { source } = useLocalSearchParams<{
    source?: string;
  }>();

  const router = useRouter();

  const [imageUri, setImageUri] = useState<string>();
  const [mimeType, setMimeType] = useState<string>();
  const [opened, setOpened] = useState(false);

  const pick = async (mode: "camera" | "gallery") => {
    try {
      const permission =
        mode === "camera"
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission needed",
          `Allow ${
            mode === "camera" ? "camera" : "photo library"
          } access to scan ingredients.`,
        );
        return;
      }

      const result =
        mode === "camera"
          ? await ImagePicker.launchCameraAsync({
              mediaTypes: ["images"],
              quality: 0.8,
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ["images"],
              quality: 0.8,
            });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        setImageUri(asset.uri);
        setMimeType(asset.mimeType ?? undefined);
      }
    } catch (error) {
      console.error("Image picker error:", error);

      Alert.alert(
        "Image unavailable",
        "We could not open the image source. Please try again.",
      );
    }
  };

  useEffect(() => {
    if (
      !opened &&
      (source === "camera" || source === "gallery")
    ) {
      setOpened(true);
      void pick(source);
    }
  }, [source, opened]);

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color={colors.text}
          />
        </Pressable>

        <View style={styles.headerCopy}>
          <Text style={styles.title}>
            Scan ingredients
          </Text>

          <Text style={styles.description}>
            Use a clear, well-lit photo for the best result.
          </Text>
        </View>
      </View>

      <View style={styles.preview}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
          />
        ) : (
          <View style={styles.placeholder}>
            <View style={styles.scanIcon}>
              <Ionicons
                name="scan-outline"
                size={42}
                color={colors.primaryDark}
              />
            </View>

            <Text style={styles.placeholderTitle}>
              Frame your ingredients
            </Text>

            <Text style={styles.placeholderText}>
              Place items on a clear surface and avoid heavy shadows.
            </Text>
          </View>
        )}

        <View
          style={styles.corners}
          pointerEvents="none"
        />
      </View>

      <View style={styles.actions}>
        <SecondaryButton
          title={imageUri ? "Retake Photo" : "Take Photo"}
          icon="camera-outline"
          onPress={() => void pick("camera")}
          style={styles.action}
        />

        <SecondaryButton
          title="Choose Gallery"
          icon="images-outline"
          onPress={() => void pick("gallery")}
          style={styles.action}
        />
      </View>

      <View style={styles.privacy}>
        <Ionicons
          name="shield-checkmark-outline"
          size={19}
          color={colors.primaryDark}
        />

        <Text style={styles.privacyText}>
          Your selected image is sent securely to our AI service
          to identify ingredients.
        </Text>
      </View>

      <PrimaryButton
        title="Recognize Ingredients"
        icon="sparkles"
        disabled={!imageUri}
        onPress={() => {
          if (!imageUri) return;

          router.push({
            pathname: "/ingredients/result",
            params: {
              imageUri,
              mimeType: mimeType ?? "image/jpeg",
            },
          });
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  description: {
    ...typography.description,
    color: colors.textSecondary,
  },
  preview: {
    height: 410,
    borderRadius: radius.modal,
    overflow: "hidden",
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
    gap: spacing.sm,
  },
  scanIcon: {
    width: 82,
    height: 82,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderTitle: {
    ...typography.section,
    color: colors.text,
    marginTop: spacing.sm,
  },
  placeholderText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
  },
  corners: {
    ...StyleSheet.absoluteFill,
    margin: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.75)",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  action: {
    flex: 1,
  },
  privacy: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    padding: spacing.sm,
    borderRadius: radius.input,
  },
  privacyText: {
    ...typography.caption,
    color: colors.primaryDark,
    flex: 1,
  },
});
