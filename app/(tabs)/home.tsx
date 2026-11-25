export { HomeScreen as default } from "@/presentation/screens/HomeScreen";

// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
// import {
//   AIAssistantBanner,
//   CategoryCard,
//   FeaturedRecipeCard,
//   RecipeCard,
//   Screen,
//   SearchBar,
//   SectionHeader,
//   UserAvatar,
// } from "@/components/ui";
// import { colors, spacing, typography } from "@/constants/theme";
// import { categories, currentUser, recipes } from "@/data/mockData";
// import { useApp } from "@/contexts/AppContext";

// export default function Home() {
//   const router = useRouter();
//   const { favorites, toggleFavorite } = useApp();

//   return (
//     <Screen>
//       <View style={styles.header}>
//         <View>
//           <Text style={styles.greeting}>Good morning!</Text>
//           <Text style={styles.name}>What shall we cook today?</Text>
//         </View>
//         <View style={styles.headerActions}>
//           <Pressable
//             accessibilityLabel="Notifications"
//             onPress={() => Alert.alert("You’re all caught up", "No new notifications right now.")}
//             style={styles.notification}
//           >
//             <Ionicons name="notifications-outline" size={22} color={colors.text} />
//             <View style={styles.badge} />
//           </Pressable>
//           <UserAvatar uri={currentUser.photoURL} name={currentUser.displayName} />
//         </View>
//       </View>
//       <SearchBar value="" onChangeText={() => router.push("/(tabs)/discover")} />
//       <AIAssistantBanner onPress={() => router.push("/(tabs)/ai-cooking")} />
//       <SectionHeader
//         title="Browse categories"
//         action="See all"
//         onAction={() => router.push("/(tabs)/discover")}
//       />
//       <ScrollView
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={styles.horizontal}
//       >
//         {categories.map((category) => (
//           <CategoryCard
//             key={category.name}
//             title={category.name}
//             icon={category.icon}
//             onPress={() => router.push("/(tabs)/discover")}
//           />
//         ))}
//       </ScrollView>
//       <SectionHeader
//         title="Featured recipe"
//         action="Explore"
//         onAction={() => router.push("/(tabs)/discover")}
//       />
//       <FeaturedRecipeCard
//         recipe={recipes[0]!}
//         favorite={favorites.includes(recipes[0]!.id)}
//         onFavorite={() => toggleFavorite(recipes[0]!.id)}
//         onPress={() => router.push(`/recipes/${recipes[0]!.id}`)}
//       />
//       <SectionHeader
//         title="Popular this week"
//         action="View all"
//         onAction={() => router.push("/(tabs)/discover")}
//       />
//       <ScrollView
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={styles.horizontal}
//       >
//         {recipes.slice(1).map((recipe) => (
//           <RecipeCard
//             key={recipe.id}
//             recipe={recipe}
//             horizontal
//             favorite={favorites.includes(recipe.id)}
//             onFavorite={() => toggleFavorite(recipe.id)}
//             onPress={() => router.push(`/recipes/${recipe.id}`)}
//           />
//         ))}
//       </ScrollView>
//     </Screen>
//   );
// }

// const styles = StyleSheet.create({
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginTop: spacing.xs,
//   },
//   greeting: { ...typography.title, color: colors.text },
//   name: { ...typography.description, color: colors.textSecondary, marginTop: spacing.xxs },
//   headerActions: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
//   notification: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },
//   badge: {
//     position: "absolute",
//     right: 8,
//     top: 7,
//     width: 7,
//     height: 7,
//     borderRadius: 4,
//     backgroundColor: colors.orange,
//     borderWidth: 1.5,
//     borderColor: colors.background,
//   },
//   horizontal: { gap: spacing.sm, paddingVertical: spacing.xxs, paddingRight: spacing.lg },
// });
