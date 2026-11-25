export { FavoritesScreen as default } from "@/presentation/screens/FavoritesScreen";


// import { useRouter } from "expo-router";
// import { StyleSheet, Text, View } from "react-native";
// import { EmptyState, RecipeCard, Screen } from "@/components/ui";
// import { colors, spacing, typography } from "@/constants/theme";
// import { recipes } from "@/data/mockData";
// import { useApp } from "@/contexts/AppContext";

// export default function Favorites() {
//   const router = useRouter();
//   const { favorites, toggleFavorite } = useApp();
//   const saved = recipes.filter((recipe) => favorites.includes(recipe.id));

//   return (
//     <Screen>
//       <View style={styles.heading}>
//         <Text style={styles.title}>Favorites</Text>
//         <Text style={styles.description}>
//           {saved.length ? `${saved.length} saved recipes` : "Your personal cookbook"}
//         </Text>
//       </View>
//       {saved.length ? (
//         <View style={styles.list}>
//           {saved.map((recipe) => (
//             <RecipeCard
//               key={recipe.id}
//               recipe={recipe}
//               favorite
//               onFavorite={() => toggleFavorite(recipe.id)}
//               onPress={() => router.push(`/recipes/${recipe.id}`)}
//             />
//           ))}
//         </View>
//       ) : (
//         <EmptyState
//           icon="heart-outline"
//           title="Save meals you love"
//           description="Tap the heart on any recipe to keep it close for later."
//           action="Discover Recipes"
//           onAction={() => router.push("/(tabs)/discover")}
//         />
//       )}
//     </Screen>
//   );
// }

// const styles = StyleSheet.create({
//   heading: { gap: spacing.xxs, marginTop: spacing.xs },
//   title: { ...typography.title, color: colors.text },
//   description: { ...typography.body, color: colors.textSecondary },
//   list: { gap: spacing.md },
// });
