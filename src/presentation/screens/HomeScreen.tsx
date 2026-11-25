
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  AIAssistantBanner,
  CategoryCard,
  FeaturedRecipeCard,
  RecipeCard,
  Screen,
  SearchBar,
  SectionHeader,
  UserAvatar,
} from "@/components/ui";

import { colors, spacing, typography } from "@/constants/theme";
import { useApp } from "@/contexts/AppContext";
import { getProfile } from "@/services/profileService";
import {
  getCategories,
  getRecipes,
  RecipeCategory,
} from "@/services/recipeService";
import { Recipe } from "@/types";

const categoryIcons: Record<
  string,
  keyof typeof Ionicons.glyphMap
> = {
  Breakfast: "sunny-outline",
  Lunch: "restaurant-outline",
  Dinner: "moon-outline",
  Healthy: "leaf-outline",
  Desserts: "ice-cream-outline",
  "Quick Meals": "flash-outline",
};

export function HomeScreen() {
  const router = useRouter();
  const { user, favorites, toggleFavorite } = useApp();

  const [displayName, setDisplayName] = useState("CookEasy User");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<RecipeCategory[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadHomeData = async () => {
        setLoadingRecipes(true);
        setDataError(null);

        try {
          const [recipeResult, categoryResult] = await Promise.all([
            getRecipes(),
            getCategories(),
          ]);

          if (!active) return;

          setRecipes(recipeResult.recipes);
          setCategories(categoryResult.categories);

          setDataError(
            recipeResult.error ?? categoryResult.error ?? null
          );
        } catch (error) {
          if (!active) return;

          setDataError(
            error instanceof Error
              ? error.message
              : "Unable to load home data."
          );
        } finally {
          if (active) {
            setLoadingRecipes(false);
          }
        }
      };

      const loadProfile = async () => {
        if (!user) {
          setDisplayName("CookEasy User");
          setAvatarUrl(null);
          return;
        }

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
        }
      };

      loadHomeData();
      loadProfile();

      return () => {
        active = false;
      };
    }, [user])
  );

  const featuredRecipe = recipes[0];
  const popularRecipes = recipes.slice(1);

  const handleCreateRecipe = () => {
    router.push("/recipes/create");
  };

  return (
    <View style={styles.container}>
      <Screen>
        <View style={styles.header}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>Good morning!</Text>

            <Text style={styles.name}>
              {displayName
                ? `Hello, ${displayName}!`
                : "What shall we cook today?"}
            </Text>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              accessibilityLabel="Notifications"
              onPress={() =>
                Alert.alert(
                  "You’re all caught up",
                  "No new notifications right now."
                )
              }
              style={styles.notification}
            >
              <Ionicons
                name="notifications-outline"
                size={22}
                color={colors.text}
              />
              <View style={styles.badge} />
            </Pressable>

            <Pressable
              onPress={() => router.push("/(tabs)/profile")}
              accessibilityLabel="Open profile"
            >
              <UserAvatar
                uri={avatarUrl ?? undefined}
                name={displayName}
                size={42}
              />
            </Pressable>
          </View>
        </View>

        <SearchBar
          value=""
          onChangeText={() => router.push("/(tabs)/discover")}
        />

        <AIAssistantBanner
          onPress={() => router.push("/(tabs)/ai-cooking")}
        />

        <SectionHeader
          title="Browse categories"
          action="See all"
          onAction={() => router.push("/(tabs)/discover")}
        />

        {categories.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontal}
          >
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                title={category.name}
                icon={categoryIcons[category.name] ?? "restaurant-outline"}
                onPress={() => router.push("/(tabs)/discover")}
              />
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.emptyText}>
            No categories available yet.
          </Text>
        )}

        <SectionHeader
          title="Featured recipe"
          action="Explore"
          onAction={() => router.push("/(tabs)/discover")}
        />

        {loadingRecipes ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading recipes...</Text>
          </View>
        ) : featuredRecipe ? (
          <FeaturedRecipeCard
            recipe={featuredRecipe}
            favorite={favorites.includes(featuredRecipe.id)}
            onFavorite={() => toggleFavorite(featuredRecipe.id)}
            onPress={() => router.push(`/recipes/${featuredRecipe.id}`)}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="restaurant-outline"
              size={32}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyText}>
              No recipes available yet.
            </Text>
          </View>
        )}

        <SectionHeader
          title="Popular this week"
          action="View all"
          onAction={() => router.push("/(tabs)/discover")}
        />

        {loadingRecipes ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : popularRecipes.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontal}
          >
            {popularRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                horizontal
                favorite={favorites.includes(recipe.id)}
                onFavorite={() => toggleFavorite(recipe.id)}
                onPress={() => router.push(`/recipes/${recipe.id}`)}
              />
            ))}
          </ScrollView>
        ) : null}

        {dataError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Unable to load some data: {dataError}
            </Text>
          </View>
        ) : null}
      </Screen>

      {/* Floating Create Recipe Button */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Create a recipe"
        onPress={handleCreateRecipe}
        style={({ pressed }) => [
          styles.createButton,
          pressed && styles.createButtonPressed,
        ]}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    ...typography.title,
    color: colors.text,
  },
  name: {
    ...typography.description,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  createButton: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 999,
  },
  createButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.94 }],
  },
  notification: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    right: 8,
    top: 7,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.orange,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  horizontal: {
    gap: spacing.sm,
    paddingVertical: spacing.xxs,
    paddingRight: spacing.lg,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  loadingText: {
    ...typography.description,
    color: colors.textSecondary,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyText: {
    ...typography.description,
    color: colors.textSecondary,
    paddingVertical: spacing.sm,
  },
  errorContainer: {
    padding: spacing.sm,
  },
  errorText: {
    ...typography.description,
    color: colors.error,
  },
});
