
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  LoadingIndicator,
  PrimaryButton,
  RecipeCard,
  Screen,
  SecondaryButton,
} from "@/components/ui";

import { colors, spacing, typography } from "@/constants/theme";
import { useApp } from "@/contexts/AppContext";
import { mockAIRecipeService } from "@/services/mockServices";
import { saveRecipe } from "@/services/recipeService";
import { Recipe } from "@/types";

export function RecipeResultsScreen() {
  const router = useRouter();

  const { ingredients, favorites, toggleFavorite } = useApp();

  const [results, setResults] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingIds, setSavingIds] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  // Generate recipes using the current mock service
  const generate = async () => {
    setLoading(true);
    setResults([]);
    setSavedIds([]);
    setSavingIds([]);

    try {
      const value = await mockAIRecipeService.generate({
        ingredients,
        preferences: {
          dietaryPreferences: [],
          preferredCuisine: [],
          defaultServings: 2,
          maximumCookingTime: 30,
        },
        difficulty: "Easy",
      });

      setResults(value);
    } catch (error) {
      Alert.alert(
        "Generation failed",
        error instanceof Error
          ? error.message
          : "Could not generate recipes. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Save one recipe to Supabase
  const handleSaveRecipe = async (recipe: Recipe) => {
    if (savingIds.includes(recipe.id) || savedIds.includes(recipe.id)) {
      return;
    }

    setSavingIds((current) => [...current, recipe.id]);

    try {
      const result = await saveRecipe({
        recipe,
        source: "ai",
        isPublic: false,
      });

      if (result.error || !result.recipeId) {
        Alert.alert(
          "Could not save recipe",
          result.error ?? "Please try again."
        );
        return;
      }

      // Replace mock ID with the actual Supabase ID.
      setResults((current) =>
        current.map((item) =>
          item.id === recipe.id
            ? { ...item, id: result.recipeId! }
            : item
        )
      );

      setSavedIds((current) => [...current, result.recipeId!]);

      Alert.alert(
        "Recipe saved!",
        `${recipe.name} has been saved to your personal recipes.`
      );
    } catch (error) {
      Alert.alert(
        "Could not save recipe",
        error instanceof Error
          ? error.message
          : "An unexpected error occurred."
      );
    } finally {
      setSavingIds((current) =>
        current.filter((id) => id !== recipe.id)
      );
    }
  };

  // Open recipe details using the real Supabase ID
  const handleViewRecipe = (recipe: Recipe) => {
    if (!savedIds.includes(recipe.id)) {
      Alert.alert(
        "Save recipe first",
        "Please save this recipe before viewing its full details."
      );
      return;
    }

    router.push(`/recipes/${recipe.id}`);
  };

  useEffect(() => {
    generate();
  }, []);

  if (loading) {
    return (
      <Screen scroll={false}>
        <LoadingIndicator label="Creating recipes around your ingredients..." />
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

        <View style={styles.heading}>
          <Text style={styles.title}>Recipes made for you</Text>

          <Text style={styles.description}>
            Based on {ingredients.length} ingredients and your preferences.
          </Text>
        </View>
      </View>

      {results.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons
            name="restaurant-outline"
            size={44}
            color={colors.hint}
          />

          <Text style={styles.emptyTitle}>No recipes found</Text>

          <Text style={styles.emptyDescription}>
            Try again with different ingredients.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {results.map((recipe) => {
            const isSaved = savedIds.includes(recipe.id);
            const isSaving = savingIds.includes(recipe.id);

            return (
              <View key={recipe.id} style={styles.result}>
                <RecipeCard
                  recipe={recipe}
                  favorite={
                    isSaved && favorites.includes(recipe.id)
                  }
                  onFavorite={() => {
                    if (isSaved) {
                      void toggleFavorite(recipe.id);
                    }
                  }}
                  onPress={() => handleViewRecipe(recipe)}
                />

                {isSaved ? (
                  <>
                    <View style={styles.savedMessage}>
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color={colors.success}
                      />
                      <Text style={styles.savedText}>
                        Saved to your recipes
                      </Text>
                    </View>

                    <PrimaryButton
                      title="View Recipe"
                      icon="book-outline"
                      onPress={() => handleViewRecipe(recipe)}
                    />
                  </>
                ) : (
                  <PrimaryButton
                    title={isSaving ? "Saving..." : "Save Recipe"}
                    icon="bookmark-outline"
                    disabled={isSaving}
                    onPress={() => handleSaveRecipe(recipe)}
                  />
                )}
              </View>
            );
          })}
        </View>
      )}

      <SecondaryButton
        title="Generate Again"
        icon="refresh-outline"
        onPress={generate}
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

  heading: {
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

  list: {
    gap: spacing.lg,
  },

  result: {
    gap: spacing.sm,
  },

  savedMessage: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },

  savedText: {
    ...typography.description,
    color: colors.success,
  },

  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },

  emptyTitle: {
    ...typography.cardTitle,
    color: colors.text,
  },

  emptyDescription: {
    ...typography.description,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
