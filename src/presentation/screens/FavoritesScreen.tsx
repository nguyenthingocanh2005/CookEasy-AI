
import { useCallback, useMemo, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { EmptyState, RecipeCard, Screen } from "@/components/ui";
import { colors, spacing, typography } from "@/constants/theme";
import { useApp } from "@/contexts/AppContext";
import { getRecipes } from "@/services/recipeService";
import type { Recipe } from "@/types";

export function FavoritesScreen() {
  const router = useRouter();
  const { user, authLoading, favorites, toggleFavorite } = useApp();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecipes = useCallback(async () => {
    if (authLoading) return;

    if (!user) {
      setRecipes([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const result = await getRecipes();

    if (result.error) {
      setError(result.error);
      setRecipes([]);
    } else {
      setRecipes(result.recipes);
    }

    setLoading(false);
  }, [user, authLoading]);

  useFocusEffect(
    useCallback(() => {
      loadRecipes();
    }, [loadRecipes]),
  );

  const saved = useMemo(
    () => recipes.filter((recipe) => favorites.includes(recipe.id)),
    [recipes, favorites],
  );

  return (
    <Screen>
      <View style={styles.heading}>
        <Text style={styles.title}>Favorites</Text>
        <Text style={styles.description}>
          {saved.length
            ? `${saved.length} saved recipes`
            : "Your personal cookbook"}
        </Text>
      </View>

      {loading || authLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.statusText}>Loading favorites...</Text>
        </View>
      ) : error ? (
        <EmptyState
          icon="alert-circle-outline"
          title="Unable to load favorites"
          description={error}
          action="Try Again"
          onAction={loadRecipes}
        />
      ) : !user ? (
        <EmptyState
          icon="person-outline"
          title="Login to see your favorites"
          description="Sign in to access your personal cookbook."
          action="Login"
          onAction={() => router.push("/(auth)/login")}
        />
      ) : saved.length ? (
        <View style={styles.list}>
          {saved.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              favorite
              onFavorite={() => toggleFavorite(recipe.id)}
              onPress={() => router.push(`/recipes/${recipe.id}`)}
            />
          ))}
        </View>
      ) : (
        <EmptyState
          icon="heart-outline"
          title="Save meals you love"
          description="Tap the heart on any recipe to keep it close for later."
          action="Discover Recipes"
          onAction={() => router.push("/(tabs)/discover")}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    gap: spacing.xxs,
    marginTop: spacing.xs,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
  },
  list: {
    gap: spacing.md,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  statusText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
