
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  CookingStepCard,
  IconButton,
  PrimaryButton,
  Screen,
  SectionHeader,
} from "@/components/ui";

import { colors, radius, spacing, typography } from "@/constants/theme";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/lib/supabase";
import { getRecipeById } from "@/services/recipeService";
import { Recipe } from "@/types";

export function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { favorites, toggleFavorite } = useApp();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState<string[]>([]);
  const [commentCount, setCommentCount] = useState(0);

  // Load recipe details
  useEffect(() => {
    let active = true;

    const loadRecipe = async () => {
      if (!id) {
        setError("Recipe ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setRecipe(null);
      setChecked([]);
      setCommentCount(0);

      try {
        const result = await getRecipeById(id);

        if (!active) return;

        if (result.error) {
          setError(result.error);
        } else if (!result.recipe) {
          setError("This recipe could not be found.");
        } else {
          setRecipe(result.recipe);
        }
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load this recipe."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadRecipe();

    return () => {
      active = false;
    };
  }, [id]);

  // Load actual comment count from Supabase
  useEffect(() => {
    if (!recipe?.id) return;

    let active = true;

    const loadCommentCount = async () => {
      const { count, error } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("recipe_id", recipe.id);

      if (!active) return;

      if (error) {
        console.error(
          "Could not load comment count:",
          error.message
        );
        return;
      }

      setCommentCount(count ?? 0);
    };

    loadCommentCount();

    return () => {
      active = false;
    };
  }, [recipe?.id]);

  const favorite = recipe
    ? favorites.includes(recipe.id)
    : false;

  const toggleIngredient = (ingredientId: string) => {
    setChecked((current) =>
      current.includes(ingredientId)
        ? current.filter((item) => item !== ingredientId)
        : [...current, ingredientId]
    );
  };

  if (loading) {
    return (
      <Screen style={styles.stateScreen}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.stateText}>Loading recipe...</Text>
      </Screen>
    );
  }

  if (error || !recipe) {
    return (
      <Screen style={styles.stateScreen}>
        <Ionicons
          name="restaurant-outline"
          size={52}
          color={colors.textSecondary}
        />

        <Text style={styles.stateTitle}>
          Recipe unavailable
        </Text>

        <Text style={styles.stateText}>
          {error ?? "This recipe could not be found."}
        </Text>

        <PrimaryButton
          title="Go back"
          icon="arrow-back"
          onPress={() => router.back()}
        />
      </Screen>
    );
  }

  const handleShare = async () => {
    try {
      await Share.share({
        title: recipe.name,
        message: `Try ${recipe.name} on CookEasy AI — ${recipe.description}`,
      });
    } catch {
      // Sharing was cancelled or unavailable.
    }
  };

  return (
    <Screen style={styles.content}>
      <View style={styles.hero}>
        {recipe.imageUrl ? (
          <Image
            source={{ uri: recipe.imageUrl }}
            style={styles.image}
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Ionicons
              name="restaurant-outline"
              size={64}
              color={colors.textSecondary}
            />
          </View>
        )}

        <View style={styles.scrim} />

        <View style={styles.topActions}>
          <IconButton
            icon="arrow-back"
            label="Go back"
            light
            onPress={() => router.back()}
          />

          <View style={styles.actionGroup}>
            <IconButton
              icon={favorite ? "heart" : "heart-outline"}
              label="Toggle favorite"
              light={!favorite}
              active={favorite}
              onPress={() => toggleFavorite(recipe.id)}
            />

            <IconButton
              icon="share-social-outline"
              label="Share recipe"
              light
              onPress={() => void handleShare()}
            />
          </View>
        </View>

        <View style={styles.heroCopy}>
          <Text style={styles.cuisine}>
            {recipe.cuisine.toUpperCase()}
          </Text>

          <Text style={styles.title}>{recipe.name}</Text>

          <Text style={styles.heroDescription}>
            {recipe.description}
          </Text>
        </View>
      </View>

      <View style={styles.stats}>
        <Stat
          icon="timer-outline"
          value={
            recipe.preparationTime > 0
              ? `${recipe.preparationTime} min`
              : "—"
          }
          label="Prep"
        />

        <Stat
          icon="flame-outline"
          value={`${recipe.cookingTime} min`}
          label="Cook"
        />

        <Stat
          icon="speedometer-outline"
          value={recipe.difficulty}
          label="Level"
        />

        <Stat
          icon="people-outline"
          value={`${recipe.servings}`}
          label="Serves"
        />
      </View>

      <SectionHeader title="Ingredients" />

      <Text style={styles.hint}>
        Tap an ingredient to check it off.
      </Text>

      <View style={styles.ingredientList}>
        {recipe.ingredients.length > 0 ? (
          recipe.ingredients.map((ingredient) => {
            const isChecked = checked.includes(ingredient.id);

            const quantity = [
              ingredient.quantity,
              ingredient.unit,
            ]
              .filter(
                (value) => value !== undefined && value !== null
              )
              .join(" ");

            return (
              <Pressable
                key={ingredient.id}
                onPress={() => toggleIngredient(ingredient.id)}
                style={styles.ingredient}
              >
                <Ionicons
                  name={
                    isChecked
                      ? "checkmark-circle"
                      : "ellipse-outline"
                  }
                  size={23}
                  color={
                    isChecked ? colors.primary : colors.hint
                  }
                />

                <Text
                  style={[
                    styles.ingredientName,
                    isChecked && styles.checked,
                  ]}
                >
                  {ingredient.name}
                </Text>

                <Text style={styles.quantity}>
                  {quantity || "As needed"}
                </Text>
              </Pressable>
            );
          })
        ) : (
          <Text style={styles.hint}>
            No ingredients have been added yet.
          </Text>
        )}
      </View>

      <SectionHeader title="Cooking instructions" />

      <View style={styles.steps}>
        {recipe.instructions.length > 0 ? (
          recipe.instructions.map((step, index) => (
            <CookingStepCard
              key={step.id}
              step={step}
              number={index + 1}
            />
          ))
        ) : (
          <Text style={styles.hint}>
            No cooking instructions have been added yet.
          </Text>
        )}
      </View>

      <View style={styles.tip}>
        <Ionicons
          name="bulb-outline"
          size={22}
          color={colors.warning}
        />

        <View style={styles.tipCopy}>
          <Text style={styles.tipTitle}>Cook’s tip</Text>

          <Text style={styles.hint}>
            Reserve a little cooking water. It helps every sauce
            become silky and cohesive.
          </Text>
        </View>
      </View>

      {/* Comments */}
      <Pressable
        onPress={() => router.push(`/comments/${recipe.id}`)}
        style={styles.comments}
      >
        <View>
          <Text style={styles.commentsTitle}>
            Comments & ratings
          </Text>

          <Text style={styles.hint}>
            {commentCount} community notes
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={21}
          color={colors.hint}
        />
      </Pressable>

      <PrimaryButton
        title="Start Cooking"
        icon="play"
        onPress={() => router.push(`/cooking/${recipe.id}`)}
      />
    </Screen>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  value: string;
  label: string;
}) {
  return (
    <View style={styles.stat}>
      <Ionicons
        name={icon}
        size={21}
        color={colors.primaryDark}
      />

      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 0,
  },
  stateScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  stateTitle: {
    ...typography.section,
    color: colors.text,
    textAlign: "center",
  },
  stateText: {
    ...typography.description,
    color: colors.textSecondary,
    textAlign: "center",
  },
  hero: {
    height: 430,
    marginTop: -spacing.md,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    backgroundColor: colors.input,
    alignItems: "center",
    justifyContent: "center",
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(13,26,14,0.38)",
  },
  topActions: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    top: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionGroup: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  heroCopy: {
    position: "absolute",
    bottom: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
    gap: spacing.xs,
  },
  cuisine: {
    ...typography.caption,
    color: colors.orangeLight,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  title: {
    ...typography.hero,
    color: colors.surface,
  },
  heroDescription: {
    ...typography.body,
    color: colors.surface,
  },
  stats: {
    marginHorizontal: spacing.lg,
    marginTop: -spacing.xl,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    flexDirection: "row",
    paddingVertical: spacing.md,
    zIndex: 2,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    ...typography.description,
    color: colors.text,
    fontFamily: "Inter_600SemiBold",
  },
  statLabel: {
    ...typography.caption,
    color: colors.hint,
  },
  hint: {
    ...typography.description,
    color: colors.textSecondary,
  },
  ingredientList: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
  },
  ingredient: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  ingredientName: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  checked: {
    textDecorationLine: "line-through",
    color: colors.hint,
  },
  quantity: {
    ...typography.description,
    color: colors.textSecondary,
  },
  steps: {
    gap: spacing.sm,
  },
  tip: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.card,
    backgroundColor: colors.orangeLight,
  },
  tipCopy: {
    flex: 1,
    gap: spacing.xxs,
  },
  tipTitle: {
    ...typography.cardTitle,
    color: colors.warning,
  },
  comments: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.md,
  },
  commentsTitle: {
    ...typography.cardTitle,
    color: colors.text,
  },
});
