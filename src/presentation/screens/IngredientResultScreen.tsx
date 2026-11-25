
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  LoadingIndicator,
  PrimaryButton,
  Screen,
  SecondaryButton,
} from "@/components/ui";
import { colors, radius, spacing, typography } from "@/constants/theme";
import { useApp } from "@/contexts/AppContext";
import { recognizeIngredients } from "@/services/ingredientRecognitionService";
import { Ingredient } from "@/types";

export function IngredientResultScreen() {
  const { imageUri, mimeType } = useLocalSearchParams<{
    imageUri: string;
    mimeType?: string;
  }>();

  const router = useRouter();
  const { setIngredients } = useApp();

  const [items, setItems] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const recognize = async () => {
      if (!imageUri) {
        setError("No image was selected. Please try again.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const result = await recognizeIngredients(
          imageUri,
          mimeType,
        );

        if (active) {
          setItems(result);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not recognize ingredients. Please try again.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void recognize();

    return () => {
      active = false;
    };
  }, [imageUri, mimeType]);

  const update = (id: string, value: string) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, name: value } : item,
      ),
    );
  };

  const add = () => {
    setItems((current) => [
      ...current,
      {
        id: `manual-${Date.now()}`,
        name: "New ingredient",
      },
    ]);
  };

  if (loading) {
    return (
      <Screen scroll={false}>
        <LoadingIndicator label="AI is identifying your ingredients..." />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Ionicons
              name="alert-circle-outline"
              size={38}
              color={colors.error}
            />
          </View>

          <Text style={styles.errorTitle}>
            Recognition failed
          </Text>

          <Text style={styles.description}>
            {error}
          </Text>

          <SecondaryButton
            title="Go Back and Try Again"
            icon="arrow-back"
            onPress={() => router.back()}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={colors.text}
          />
        </Pressable>

        <Text style={styles.title}>
          Recognition result
        </Text>
      </View>

      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
        />
      ) : null}

      <View style={styles.summary}>
        <View style={styles.summaryIcon}>
          <Ionicons
            name="checkmark"
            size={20}
            color={colors.surface}
          />
        </View>

        <View style={styles.summaryCopy}>
          <Text style={styles.summaryTitle}>
            {items.length} ingredients detected
          </Text>

          <Text style={styles.description}>
            Review and correct every item before continuing.
          </Text>
        </View>
      </View>

      <View style={styles.list}>
        {items.map((item) => (
          <View key={item.id} style={styles.item}>
            <View style={styles.ingredientIcon}>
              <Ionicons
                name="leaf-outline"
                size={20}
                color={colors.primaryDark}
              />
            </View>

            <View style={styles.fields}>
              <TextInput
                value={item.name}
                onChangeText={(value) =>
                  update(item.id, value)
                }
                style={styles.nameInput}
                placeholder="Ingredient name"
              />

              <View style={styles.meta}>
                {item.quantity != null ? (
                  <Text style={styles.description}>
                    {item.quantity} {item.unit ?? ""}
                  </Text>
                ) : null}

                {item.confidence != null ? (
                  <Text style={styles.confidence}>
                    {Math.round(item.confidence * 100)}% confidence
                  </Text>
                ) : null}
              </View>
            </View>

            <Pressable
              onPress={() =>
                setItems((current) =>
                  current.filter(
                    (entry) => entry.id !== item.id,
                  ),
                )
              }
              hitSlop={8}
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color={colors.error}
              />
            </Pressable>
          </View>
        ))}
      </View>

      <SecondaryButton
        title="Add Ingredient"
        icon="add"
        onPress={add}
      />

      <PrimaryButton
        title="Continue to Recipe Generation"
        icon="arrow-forward"
        disabled={!items.length}
        onPress={() => {
          setIngredients(items);
          router.replace("/(tabs)/ai-cooking");
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
  },
  back: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: radius.card,
    backgroundColor: colors.input,
  },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.input,
    padding: spacing.sm,
  },
  summaryIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryCopy: {
    flex: 1,
  },
  summaryTitle: {
    ...typography.cardTitle,
    color: colors.primaryDark,
  },
  description: {
    ...typography.description,
    color: colors.textSecondary,
  },
  list: {
    gap: spacing.sm,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  ingredientIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  fields: {
    flex: 1,
  },
  nameInput: {
    ...typography.body,
    fontFamily: "Inter_600SemiBold",
    color: colors.text,
    paddingVertical: 2,
  },
  meta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  confidence: {
    ...typography.caption,
    color: colors.success,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  errorIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#FDECEC",
    alignItems: "center",
    justifyContent: "center",
  },
  errorTitle: {
    ...typography.section,
    color: colors.text,
  },
});
