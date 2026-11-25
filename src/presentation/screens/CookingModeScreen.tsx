
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui";

import {
  colors,
  radius,
  spacing,
  typography,
} from "@/constants/theme";

import { getRecipeById } from "@/services/recipeService";
import type { Recipe } from "@/types";

export function CookingModeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadRecipe = async () => {
      if (!id) {
        setError("Recipe ID is missing.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await getRecipeById(id);

        if (!isMounted) return;

        if (result.error) {
          setError(result.error);
          setRecipe(null);
        } else if (!result.recipe) {
          setError(
            "Recipe not found or you do not have permission to view it."
          );
          setRecipe(null);
        } else {
          setRecipe(result.recipe);
          setStepIndex(0);
        }
      } catch (err) {
        if (!isMounted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading the recipe."
        );
        setRecipe(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadRecipe();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centerScreen}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.statusText}>
          Loading cooking instructions...
        </Text>
      </SafeAreaView>
    );
  }

  if (error || !recipe) {
    return (
      <SafeAreaView style={styles.centerScreen}>
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={colors.error}
        />

        <Text style={styles.errorTitle}>
          Unable to load recipe
        </Text>

        <Text style={styles.statusText}>
          {error ?? "Something went wrong."}
        </Text>

        <SecondaryButton
          title="Go Back"
          onPress={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  if (recipe.instructions.length === 0) {
    return (
      <SafeAreaView style={styles.centerScreen}>
        <Ionicons
          name="document-text-outline"
          size={48}
          color={colors.primary}
        />

        <Text style={styles.errorTitle}>
          No cooking instructions
        </Text>

        <Text style={styles.statusText}>
          This recipe does not have any cooking steps yet.
        </Text>

        <SecondaryButton
          title="Go Back"
          onPress={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  const step = recipe.instructions[stepIndex];
  const isLast = stepIndex === recipe.instructions.length - 1;

  const progress =
    ((stepIndex + 1) / recipe.instructions.length) * 100;

  if (!step) return null;

  const handleNext = () => {
    if (isLast) {
      router.replace(`/recipes/${recipe.id}`);
      return;
    }

    setStepIndex((current) => current + 1);
  };

  const handlePrevious = () => {
    setStepIndex((current) => Math.max(0, current - 1));
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.close}
        >
          <Ionicons
            name="close"
            size={24}
            color={colors.text}
          />
        </Pressable>

        <View style={styles.headerCopy}>
          <Text numberOfLines={1} style={styles.recipe}>
            {recipe.name}
          </Text>

          <Text style={styles.stepLabel}>
            Step {stepIndex + 1} of {recipe.instructions.length}
          </Text>
        </View>
      </View>

      {/* Progress */}
      <View style={styles.track}>
        <View
          style={[
            styles.progress,
            { width: `${progress}%` },
          ]}
        />
      </View>

      {/* Scrollable content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.number}>
            <Text style={styles.numberText}>
              {stepIndex + 1}
            </Text>
          </View>

          {/* Step title stays centered */}
          <Text style={styles.title}>
            {step.title}
          </Text>

          {/* Instructions justified */}
          <Text style={styles.description}>
            {step.description}
          </Text>

          {/* Step image */}
          {step.imageUrl ? (
            <Image
              source={{ uri: step.imageUrl }}
              style={styles.stepImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons
                name="image-outline"
                size={34}
                color={colors.hint}
              />

              <Text style={styles.placeholderText}>
                No photo for this step
              </Text>
            </View>
          )}

          {/* Duration */}
          {step.duration ? (
            <View style={styles.timer}>
              <Ionicons
                name="timer-outline"
                size={22}
                color={colors.primaryDark}
              />

              <Text style={styles.timerText}>
                About {step.duration} minutes
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Navigation buttons */}
      <View style={styles.actions}>
        <SecondaryButton
          title="Previous Step"
          icon="arrow-back"
          disabled={stepIndex === 0}
          onPress={handlePrevious}
          style={styles.action}
        />

        <PrimaryButton
          title={isLast ? "Finish Cooking" : "Next Step"}
          icon={isLast ? "checkmark" : "arrow-forward"}
          onPress={handleNext}
          style={styles.action}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },

  centerScreen: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.md,
  },

  statusText: {
    ...typography.description,
    color: colors.textSecondary,
    textAlign: "center",
  },

  errorTitle: {
    ...typography.title,
    color: colors.text,
    textAlign: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  close: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  headerCopy: {
    flex: 1,
  },

  recipe: {
    ...typography.cardTitle,
    color: colors.text,
  },

  stepLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primaryLight,
    marginTop: spacing.lg,
    overflow: "hidden",
  },

  progress: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 3,
  },

  scroll: {
    flex: 1,
    marginTop: spacing.md,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.lg,
  },

  content: {
    flexGrow: 1,
    alignItems: "stretch",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },

  number: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },

  numberText: {
    ...typography.hero,
    color: colors.surface,
  },

  title: {
    ...typography.title,
    color: colors.text,
    textAlign: "center",
    alignSelf: "stretch",
  },

  description: {
    fontSize: 19,
    lineHeight: 30,
    fontFamily: "Inter_400Regular",
    color: colors.textSecondary,
    textAlign: "justify",
    alignSelf: "stretch",
  },

  stepImage: {
    width: "100%",
    height: 230,
    borderRadius: radius.card,
    backgroundColor: colors.input,
  },

  imagePlaceholder: {
    width: "100%",
    height: 140,
    borderRadius: radius.card,
    backgroundColor: colors.input,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },

  placeholderText: {
    ...typography.caption,
    color: colors.hint,
  },

  timer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
  },

  timerText: {
    ...typography.body,
    color: colors.primaryDark,
    fontFamily: "Inter_600SemiBold",
  },

  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
  },

  action: {
    flex: 1,
  },
});
