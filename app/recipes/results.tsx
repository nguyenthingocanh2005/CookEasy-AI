export { RecipeResultsScreen as default } from "@/presentation/screens/RecipeResultsScreen";

// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import { useEffect, useState } from "react";
// import { Pressable, StyleSheet, Text, View } from "react-native";
// import {
//   LoadingIndicator,
//   PrimaryButton,
//   RecipeCard,
//   Screen,
//   SecondaryButton,
// } from "@/components/ui";
// import { colors, spacing, typography } from "@/constants/theme";
// import { useApp } from "@/contexts/AppContext";
// import { mockAIRecipeService } from "@/services/mockServices";
// import { Recipe } from "@/types";

// export default function RecipeResults() {
//   const router = useRouter();
//   const { ingredients, favorites, toggleFavorite } = useApp();
//   const [results, setResults] = useState<Recipe[]>([]);
//   const [loading, setLoading] = useState(true);

//   const generate = () => {
//     setLoading(true);
//     mockAIRecipeService
//       .generate({
//         ingredients,
//         preferences: {
//           dietaryPreferences: [],
//           preferredCuisine: [],
//           defaultServings: 2,
//           maximumCookingTime: 30,
//         },
//         difficulty: "Easy",
//       })
//       .then((value) => {
//         setResults(value);
//         setLoading(false);
//       });
//   };

//   useEffect(generate, []);

//   if (loading) {
//     return (
//       <Screen scroll={false}>
//         <LoadingIndicator label="Creating recipes around your ingredients..." />
//       </Screen>
//     );
//   }

//   return (
//     <Screen>
//       <View style={styles.header}>
//         <Pressable onPress={() => router.back()} style={styles.back}>
//           <Ionicons name="arrow-back" size={22} color={colors.text} />
//         </Pressable>
//         <View style={styles.heading}>
//           <Text style={styles.title}>Recipes made for you</Text>
//           <Text style={styles.description}>
//             Based on {ingredients.length} ingredients and your preferences.
//           </Text>
//         </View>
//       </View>
//       <View style={styles.list}>
//         {results.map((recipe) => (
//           <View key={recipe.id} style={styles.result}>
//             <RecipeCard
//               recipe={recipe}
//               favorite={favorites.includes(recipe.id)}
//               onFavorite={() => toggleFavorite(recipe.id)}
//               onPress={() => router.push(`/recipes/${recipe.id}`)}
//             />
//             <PrimaryButton
//               title="View Recipe"
//               onPress={() => router.push(`/recipes/${recipe.id}`)}
//             />
//           </View>
//         ))}
//       </View>
//       <SecondaryButton title="Generate Again" icon="refresh-outline" onPress={generate} />
//     </Screen>
//   );
// }

// const styles = StyleSheet.create({
//   header: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
//   back: {
//     width: 42,
//     height: 42,
//     borderRadius: 21,
//     backgroundColor: colors.surface,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   heading: { flex: 1 },
//   title: { ...typography.title, color: colors.text },
//   description: { ...typography.description, color: colors.textSecondary },
//   list: { gap: spacing.lg },
//   result: { gap: spacing.sm },
// });
