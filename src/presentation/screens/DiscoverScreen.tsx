
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import {
  BottomSheet,
  FilterChip,
  RecipeCard,
  Screen,
  SearchBar,
} from "@/components/ui";

import { colors, spacing, typography } from "@/constants/theme";
import { useApp } from "@/contexts/AppContext";
import {
  getCategories,
  getRecipes,
  RecipeCategory,
} from "@/services/recipeService";
import { Recipe } from "@/types";

const times = ["Any time", "Under 25 min", "Under 40 min"];
const difficulties = ["Any level", "Easy", "Medium", "Hard"];

export function DiscoverScreen() {
  const router = useRouter();
  const { favorites, toggleFavorite } = useApp();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<RecipeCategory[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [time, setTime] = useState("Any time");
  const [difficulty, setDifficulty] = useState("Any level");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadData = async () => {
        setLoading(true);
        setError(null);

        try {
          const [recipeResult, categoryResult] = await Promise.all([
            getRecipes(),
            getCategories(),
          ]);

          if (!active) return;

          setRecipes(recipeResult.recipes);
          setCategories(categoryResult.categories);

          setError(
            recipeResult.error ?? categoryResult.error ?? null
          );
        } catch (err) {
          if (!active) return;

          setError(
            err instanceof Error
              ? err.message
              : "Unable to load recipes."
          );
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

      loadData();

      return () => {
        active = false;
      };
    }, [])
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return recipes.filter((recipe) => {
      const matchesQuery =
        !normalized ||
        recipe.name.toLowerCase().includes(normalized) ||
        recipe.description.toLowerCase().includes(normalized) ||
        recipe.ingredients.some((ingredient) =>
          ingredient.name.toLowerCase().includes(normalized)
        );

      const matchesCategory =
        category === "All" ||
        recipe.category.toLowerCase() === category.toLowerCase();

      const matchesTime =
        time === "Any time" ||
        (time === "Under 25 min"
          ? recipe.totalTime <= 25
          : recipe.totalTime <= 40);

      const matchesDifficulty =
        difficulty === "Any level" ||
        recipe.difficulty === difficulty;

      return (
        matchesQuery &&
        matchesCategory &&
        matchesTime &&
        matchesDifficulty
      );
    });
  }, [recipes, query, category, time, difficulty]);

  const clearFilters = () => {
    setQuery("");
    setCategory("All");
    setTime("Any time");
    setDifficulty("Any level");
  };

  return (
    <Screen>
      <View style={styles.heading}>
        <Text style={styles.title}>Discover</Text>
        <Text style={styles.description}>
          Find a new favorite for any moment.
        </Text>
      </View>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        onFilter={() => setFiltersOpen(true)}
      />

      {!query ? (
        <View style={styles.suggestions}>
          <Text style={styles.label}>Popular searches</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            {[
              "Pasta",
              "High protein",
              "Tomatoes",
              "Vegetarian",
            ].map((item) => (
              <FilterChip
                key={item}
                label={item}
                onPress={() => setQuery(item)}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        <FilterChip
          label="All"
          selected={category === "All"}
          onPress={() => setCategory("All")}
        />

        {categories.map((item) => (
          <FilterChip
            key={item.id}
            label={item.name}
            selected={category === item.name}
            onPress={() => setCategory(item.name)}
          />
        ))}
      </ScrollView>

      <Text style={styles.results}>
        {loading ? "Loading recipes..." : `${filtered.length} recipes`}
      </Text>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.description}>
            Finding delicious recipes...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>
            Unable to load recipes
          </Text>
          <Text style={styles.description}>{error}</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {filtered.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              favorite={favorites.includes(recipe.id)}
              onFavorite={() => toggleFavorite(recipe.id)}
              onPress={() => router.push(`/recipes/${recipe.id}`)}
            />
          ))}

          {!filtered.length ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>
                No recipes found
              </Text>

              <Text style={styles.description}>
                Try a different ingredient or clear your filters.
              </Text>

              <FilterChip
                label="Clear filters"
                onPress={clearFilters}
              />
            </View>
          ) : null}
        </View>
      )}

      <BottomSheet
        visible={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filter recipes"
      >
        <FilterGroup
          title="Cooking time"
          items={times}
          selected={time}
          onSelect={setTime}
        />

        <FilterGroup
          title="Difficulty"
          items={difficulties}
          selected={difficulty}
          onSelect={setDifficulty}
        />

        <View style={styles.filterActions}>
          <FilterChip
            label="Clear filters"
            onPress={() => {
              setTime("Any time");
              setDifficulty("Any level");
              setCategory("All");
            }}
          />
        </View>
      </BottomSheet>
    </Screen>
  );
}

function FilterGroup({
  title,
  items,
  selected,
  onSelect,
}: {
  title: string;
  items: string[];
  selected: string;
  onSelect: (item: string) => void;
}) {
  return (
    <View style={styles.filterGroup}>
      <Text style={styles.label}>{title}</Text>

      <View style={styles.wrap}>
        {items.map((item) => (
          <FilterChip
            key={item}
            label={item}
            selected={selected === item}
            onPress={() => onSelect(item)}
          />
        ))}
      </View>
    </View>
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
  suggestions: {
    gap: spacing.xs,
  },
  label: {
    ...typography.description,
    color: colors.text,
    fontFamily: "Inter_600SemiBold",
  },
  chips: {
    gap: spacing.xs,
    paddingRight: spacing.lg,
  },
  results: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  list: {
    gap: spacing.md,
  },
  loading: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
    gap: spacing.sm,
  },
  empty: {
    alignItems: "center",
    padding: spacing.xxl,
    gap: spacing.xs,
  },
  emptyTitle: {
    ...typography.section,
    color: colors.text,
  },
  filterGroup: {
    gap: spacing.sm,
  },
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  filterActions: {
    marginTop: spacing.md,
  },
});
