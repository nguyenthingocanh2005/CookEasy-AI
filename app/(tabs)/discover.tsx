export { DiscoverScreen as default } from "@/presentation/screens/DiscoverScreen";

// import { useMemo, useState } from "react";
// import { ScrollView, StyleSheet, Text, View } from "react-native";
// import { useRouter } from "expo-router";
// import { BottomSheet, FilterChip, RecipeCard, Screen, SearchBar } from "@/components/ui";
// import { colors, spacing, typography } from "@/constants/theme";
// import { recipes } from "@/data/mockData";
// import { useApp } from "@/contexts/AppContext";

// const categories = ["All", "Breakfast", "Lunch", "Dinner", "Healthy", "Quick Meals"];
// const cuisines = ["All cuisines", "Italian", "Mediterranean", "Middle Eastern"];
// const times = ["Any time", "Under 25 min", "Under 40 min"];
// const difficulties = ["Any level", "Easy", "Medium"];

// export default function Discover() {
//   const router = useRouter();
//   const { favorites, toggleFavorite } = useApp();
//   const [query, setQuery] = useState("");
//   const [category, setCategory] = useState("All");
//   const [cuisine, setCuisine] = useState("All cuisines");
//   const [time, setTime] = useState("Any time");
//   const [difficulty, setDifficulty] = useState("Any level");
//   const [filtersOpen, setFiltersOpen] = useState(false);

//   const filtered = useMemo(() => {
//     const normalized = query.trim().toLowerCase();
//     return recipes.filter((recipe) => {
//       const matchesQuery =
//         !normalized ||
//         recipe.name.toLowerCase().includes(normalized) ||
//         recipe.ingredients.some((ingredient) => ingredient.name.toLowerCase().includes(normalized));
//       const matchesCategory = category === "All" || recipe.category === category;
//       const matchesCuisine = cuisine === "All cuisines" || recipe.cuisine === cuisine;
//       const matchesTime =
//         time === "Any time" ||
//         (time === "Under 25 min" ? recipe.totalTime <= 25 : recipe.totalTime <= 40);
//       const matchesDifficulty = difficulty === "Any level" || recipe.difficulty === difficulty;
//       return matchesQuery && matchesCategory && matchesCuisine && matchesTime && matchesDifficulty;
//     });
//   }, [query, category, cuisine, time, difficulty]);

//   return (
//     <Screen>
//       <View style={styles.heading}>
//         <Text style={styles.title}>Discover</Text>
//         <Text style={styles.description}>Find a new favorite for any moment.</Text>
//       </View>
//       <SearchBar value={query} onChangeText={setQuery} onFilter={() => setFiltersOpen(true)} />
//       {!query ? (
//         <View style={styles.suggestions}>
//           <Text style={styles.label}>Popular searches</Text>
//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.chips}
//           >
//             {["15-minute pasta", "High protein", "Tomatoes", "Vegetarian"].map((item) => (
//               <FilterChip
//                 key={item}
//                 label={item}
//                 onPress={() => setQuery(item === "Tomatoes" ? "tomato" : "")}
//               />
//             ))}
//           </ScrollView>
//         </View>
//       ) : null}
//       <ScrollView
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={styles.chips}
//       >
//         {categories.map((item) => (
//           <FilterChip
//             key={item}
//             label={item}
//             selected={category === item}
//             onPress={() => setCategory(item)}
//           />
//         ))}
//       </ScrollView>
//       <Text style={styles.results}>{filtered.length} recipes</Text>
//       <View style={styles.list}>
//         {filtered.map((recipe) => (
//           <RecipeCard
//             key={recipe.id}
//             recipe={recipe}
//             favorite={favorites.includes(recipe.id)}
//             onFavorite={() => toggleFavorite(recipe.id)}
//             onPress={() => router.push(`/recipes/${recipe.id}`)}
//           />
//         ))}
//         {!filtered.length ? (
//           <View style={styles.empty}>
//             <Text style={styles.emptyTitle}>No recipes found</Text>
//             <Text style={styles.description}>Try a different ingredient or clear a filter.</Text>
//           </View>
//         ) : null}
//       </View>
//       <BottomSheet
//         visible={filtersOpen}
//         onClose={() => setFiltersOpen(false)}
//         title="Filter recipes"
//       >
//         <FilterGroup title="Cuisine" items={cuisines} selected={cuisine} onSelect={setCuisine} />
//         <FilterGroup title="Cooking time" items={times} selected={time} onSelect={setTime} />
//         <FilterGroup
//           title="Difficulty"
//           items={difficulties}
//           selected={difficulty}
//           onSelect={setDifficulty}
//         />
//       </BottomSheet>
//     </Screen>
//   );
// }

// function FilterGroup({
//   title,
//   items,
//   selected,
//   onSelect,
// }: {
//   title: string;
//   items: string[];
//   selected: string;
//   onSelect: (item: string) => void;
// }) {
//   return (
//     <View style={styles.filterGroup}>
//       <Text style={styles.label}>{title}</Text>
//       <View style={styles.wrap}>
//         {items.map((item) => (
//           <FilterChip
//             key={item}
//             label={item}
//             selected={selected === item}
//             onPress={() => onSelect(item)}
//           />
//         ))}
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   heading: { gap: spacing.xxs, marginTop: spacing.xs },
//   title: { ...typography.title, color: colors.text },
//   description: { ...typography.body, color: colors.textSecondary },
//   suggestions: { gap: spacing.xs },
//   label: { ...typography.description, color: colors.text, fontFamily: "Inter_600SemiBold" },
//   chips: { gap: spacing.xs, paddingRight: spacing.lg },
//   results: { ...typography.caption, color: colors.textSecondary },
//   list: { gap: spacing.md },
//   empty: { alignItems: "center", padding: spacing.xxl, gap: spacing.xs },
//   emptyTitle: { ...typography.section, color: colors.text },
//   filterGroup: { gap: spacing.sm },
//   wrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
// });
