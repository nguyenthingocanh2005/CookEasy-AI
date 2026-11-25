export { RecipeDetailScreen as default } from "@/presentation/screens/RecipeDetailScreen";

// import { Ionicons } from "@expo/vector-icons";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import { useState } from "react";
// import { Image, Pressable, Share, StyleSheet, Text, View } from "react-native";
// import { CookingStepCard, IconButton, PrimaryButton, Screen, SectionHeader } from "@/components/ui";
// import { colors, radius, spacing, typography } from "@/constants/theme";
// import { recipes } from "@/data/mockData";
// import { useApp } from "@/contexts/AppContext";

// export default function RecipeDetail() {
//   const { id } = useLocalSearchParams<{ id: string }>();
//   const router = useRouter();
//   const { favorites, toggleFavorite, comments } = useApp();
//   const recipe = recipes.find((item) => item.id === id) ?? recipes[0]!;
//   const [checked, setChecked] = useState<string[]>([]);
//   const favorite = favorites.includes(recipe.id);

//   const toggleIngredient = (ingredientId: string) => {
//     setChecked((current) =>
//       current.includes(ingredientId)
//         ? current.filter((item) => item !== ingredientId)
//         : [...current, ingredientId],
//     );
//   };

//   return (
//     <Screen style={styles.content}>
//       <View style={styles.hero}>
//         <Image source={{ uri: recipe.imageUrl }} style={styles.image} />
//         <View style={styles.scrim} />
//         <View style={styles.topActions}>
//           <IconButton icon="arrow-back" label="Go back" light onPress={() => router.back()} />
//           <View style={styles.actionGroup}>
//             <IconButton
//               icon={favorite ? "heart" : "heart-outline"}
//               label="Toggle favorite"
//               light={!favorite}
//               active={favorite}
//               onPress={() => toggleFavorite(recipe.id)}
//             />
//             <IconButton
//               icon="share-social-outline"
//               label="Share recipe"
//               light
//               onPress={() =>
//                 void Share.share({
//                   title: recipe.name,
//                   message: `Try ${recipe.name} on CookEasy AI — ${recipe.description}`,
//                 })
//               }
//             />
//           </View>
//         </View>
//         <View style={styles.heroCopy}>
//           <Text style={styles.cuisine}>{recipe.cuisine.toUpperCase()}</Text>
//           <Text style={styles.title}>{recipe.name}</Text>
//           <Text style={styles.heroDescription}>{recipe.description}</Text>
//         </View>
//       </View>
//       <View style={styles.stats}>
//         <Stat icon="timer-outline" value={`${recipe.preparationTime} min`} label="Prep" />
//         <Stat icon="flame-outline" value={`${recipe.cookingTime} min`} label="Cook" />
//         <Stat icon="speedometer-outline" value={recipe.difficulty} label="Level" />
//         <Stat icon="people-outline" value={`${recipe.servings}`} label="Serves" />
//       </View>
//       <SectionHeader title="Ingredients" />
//       <Text style={styles.hint}>Tap an ingredient to check it off.</Text>
//       <View style={styles.ingredientList}>
//         {recipe.ingredients.map((ingredient) => {
//           const isChecked = checked.includes(ingredient.id);
//           return (
//             <Pressable
//               key={ingredient.id}
//               onPress={() => toggleIngredient(ingredient.id)}
//               style={styles.ingredient}
//             >
//               <Ionicons
//                 name={isChecked ? "checkmark-circle" : "ellipse-outline"}
//                 size={23}
//                 color={isChecked ? colors.primary : colors.hint}
//               />
//               <Text style={[styles.ingredientName, isChecked && styles.checked]}>
//                 {ingredient.name}
//               </Text>
//               <Text style={styles.quantity}>
//                 {ingredient.quantity} {ingredient.unit}
//               </Text>
//             </Pressable>
//           );
//         })}
//       </View>
//       <SectionHeader title="Cooking instructions" />
//       <View style={styles.steps}>
//         {recipe.instructions.map((step, index) => (
//           <CookingStepCard key={step.id} step={step} number={index + 1} />
//         ))}
//       </View>
//       <View style={styles.tip}>
//         <Ionicons name="bulb-outline" size={22} color={colors.warning} />
//         <View style={styles.tipCopy}>
//           <Text style={styles.tipTitle}>Cook’s tip</Text>
//           <Text style={styles.hint}>
//             Reserve a little cooking water. It helps every sauce become silky and cohesive.
//           </Text>
//         </View>
//       </View>
//       <Pressable onPress={() => router.push(`/comments/${recipe.id}`)} style={styles.comments}>
//         <View>
//           <Text style={styles.commentsTitle}>Comments & ratings</Text>
//           <Text style={styles.hint}>
//             {comments.filter((comment) => comment.recipeId === recipe.id).length} community notes
//           </Text>
//         </View>
//         <Ionicons name="chevron-forward" size={21} color={colors.hint} />
//       </Pressable>
//       <PrimaryButton
//         title="Start Cooking"
//         icon="play"
//         onPress={() => router.push(`/cooking/${recipe.id}`)}
//       />
//     </Screen>
//   );
// }

// function Stat({
//   icon,
//   value,
//   label,
// }: {
//   icon: React.ComponentProps<typeof Ionicons>["name"];
//   value: string;
//   label: string;
// }) {
//   return (
//     <View style={styles.stat}>
//       <Ionicons name={icon} size={21} color={colors.primaryDark} />
//       <Text style={styles.statValue}>{value}</Text>
//       <Text style={styles.statLabel}>{label}</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   content: { paddingHorizontal: 0 },
//   hero: { height: 430, marginTop: -spacing.md, overflow: "hidden" },
//   image: { width: "100%", height: "100%" },
//   scrim: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(13,26,14,0.38)" },
//   topActions: {
//     position: "absolute",
//     left: spacing.lg,
//     right: spacing.lg,
//     top: spacing.md,
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   actionGroup: { flexDirection: "row", gap: spacing.xs },
//   heroCopy: {
//     position: "absolute",
//     bottom: spacing.xl,
//     left: spacing.lg,
//     right: spacing.lg,
//     gap: spacing.xs,
//   },
//   cuisine: {
//     ...typography.caption,
//     color: colors.orangeLight,
//     fontFamily: "Inter_700Bold",
//     letterSpacing: 1,
//   },
//   title: { ...typography.hero, color: colors.surface },
//   heroDescription: { ...typography.body, color: colors.surface },
//   stats: {
//     marginHorizontal: spacing.lg,
//     marginTop: -spacing.xl,
//     borderRadius: radius.card,
//     backgroundColor: colors.surface,
//     flexDirection: "row",
//     paddingVertical: spacing.md,
//     zIndex: 2,
//   },
//   stat: { flex: 1, alignItems: "center", gap: 2 },
//   statValue: { ...typography.description, color: colors.text, fontFamily: "Inter_600SemiBold" },
//   statLabel: { ...typography.caption, color: colors.hint },
//   hint: { ...typography.description, color: colors.textSecondary },
//   ingredientList: {
//     backgroundColor: colors.surface,
//     borderRadius: radius.card,
//     paddingHorizontal: spacing.md,
//   },
//   ingredient: {
//     minHeight: 54,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: spacing.sm,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.divider,
//   },
//   ingredientName: { ...typography.body, color: colors.text, flex: 1 },
//   checked: { textDecorationLine: "line-through", color: colors.hint },
//   quantity: { ...typography.description, color: colors.textSecondary },
//   steps: { gap: spacing.sm },
//   tip: {
//     flexDirection: "row",
//     gap: spacing.sm,
//     padding: spacing.md,
//     borderRadius: radius.card,
//     backgroundColor: colors.orangeLight,
//   },
//   tipCopy: { flex: 1, gap: spacing.xxs },
//   tipTitle: { ...typography.cardTitle, color: colors.warning },
//   comments: {
//     minHeight: 70,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     backgroundColor: colors.surface,
//     borderRadius: radius.card,
//     padding: spacing.md,
//   },
//   commentsTitle: { ...typography.cardTitle, color: colors.text },
// });
