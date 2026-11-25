export { AICookingScreen as default } from "@/presentation/screens/AICookingScreen";


// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import { useState } from "react";
// import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
// import {
//   FilterChip,
//   IngredientChip,
//   IngredientInput,
//   PrimaryButton,
//   Screen,
//   SecondaryButton,
// } from "@/components/ui";
// import { colors, radius, spacing, typography } from "@/constants/theme";
// import { useApp } from "@/contexts/AppContext";

// export default function AICooking() {
//   const router = useRouter();
//   const { ingredients, setIngredients } = useApp();
//   const [cuisine, setCuisine] = useState("Any cuisine");
//   const [diet, setDiet] = useState("No restrictions");
//   const [servings, setServings] = useState(2);
//   const [time, setTime] = useState("30 min");
//   const [difficulty, setDifficulty] = useState("Easy");

//   const addIngredient = (name: string) => {
//     setIngredients([...ingredients, { id: `manual-${Date.now()}`, name }]);
//   };

//   return (
//     <Screen>
//       <View style={styles.heading}>
//         <View style={styles.aiMark}>
//           <Ionicons name="sparkles" size={24} color={colors.orange} />
//         </View>
//         <View style={styles.headingCopy}>
//           <Text style={styles.title}>AI Cooking Assistant</Text>
//           <Text style={styles.description}>Let’s create something delicious.</Text>
//         </View>
//       </View>
//       <View style={styles.tip}>
//         <Ionicons name="bulb-outline" size={20} color={colors.warning} />
//         <Text style={styles.tipText}>
//           Add what you have. You’ll review everything before a recipe is generated.
//         </Text>
//       </View>
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Your ingredients</Text>
//         <IngredientInput onAdd={addIngredient} />
//         {ingredients.length ? (
//           <View style={styles.wrap}>
//             {ingredients.map((ingredient) => (
//               <IngredientChip
//                 key={ingredient.id}
//                 label={ingredient.name}
//                 onRemove={() =>
//                   setIngredients(ingredients.filter((item) => item.id !== ingredient.id))
//                 }
//               />
//             ))}
//           </View>
//         ) : (
//           <Text style={styles.helper}>Add ingredients manually or scan them with your camera.</Text>
//         )}
//       </View>
//       <View style={styles.scanActions}>
//         <SecondaryButton
//           title="Take Photo"
//           icon="camera-outline"
//           onPress={() =>
//             router.push({ pathname: "/ingredients/scanner", params: { source: "camera" } })
//           }
//           style={styles.scanButton}
//         />
//         <SecondaryButton
//           title="Gallery"
//           icon="images-outline"
//           onPress={() =>
//             router.push({ pathname: "/ingredients/scanner", params: { source: "gallery" } })
//           }
//           style={styles.scanButton}
//         />
//       </View>
//       <PreferenceRow
//         title="Cuisine"
//         items={["Any cuisine", "Italian", "Asian", "Mexican"]}
//         selected={cuisine}
//         onSelect={setCuisine}
//       />
//       <PreferenceRow
//         title="Dietary preferences"
//         items={["No restrictions", "Vegetarian", "High protein"]}
//         selected={diet}
//         onSelect={setDiet}
//       />
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Servings</Text>
//         <View style={styles.counter}>
//           <Pressable
//             onPress={() => setServings(Math.max(1, servings - 1))}
//             style={styles.counterButton}
//           >
//             <Ionicons name="remove" size={21} color={colors.primaryDark} />
//           </Pressable>
//           <Text style={styles.counterValue}>{servings}</Text>
//           <Pressable
//             onPress={() => setServings(Math.min(8, servings + 1))}
//             style={styles.counterButton}
//           >
//             <Ionicons name="add" size={21} color={colors.primaryDark} />
//           </Pressable>
//         </View>
//       </View>
//       <PreferenceRow
//         title="Maximum cooking time"
//         items={["20 min", "30 min", "45 min", "60 min"]}
//         selected={time}
//         onSelect={setTime}
//       />
//       <PreferenceRow
//         title="Difficulty"
//         items={["Easy", "Medium", "Any level"]}
//         selected={difficulty}
//         onSelect={setDifficulty}
//       />
//       <PrimaryButton
//         title="Generate Recipes"
//         icon="sparkles"
//         disabled={!ingredients.length}
//         onPress={() => router.push("/recipes/results")}
//       />
//     </Screen>
//   );
// }

// function PreferenceRow({
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
//     <View style={styles.section}>
//       <Text style={styles.sectionTitle}>{title}</Text>
//       <ScrollView
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={styles.chips}
//       >
//         {items.map((item) => (
//           <FilterChip
//             key={item}
//             label={item}
//             selected={selected === item}
//             onPress={() => onSelect(item)}
//           />
//         ))}
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   heading: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.xs },
//   aiMark: {
//     width: 48,
//     height: 48,
//     borderRadius: 16,
//     backgroundColor: colors.orangeLight,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   headingCopy: { flex: 1 },
//   title: { ...typography.title, color: colors.text },
//   description: { ...typography.description, color: colors.textSecondary },
//   tip: {
//     flexDirection: "row",
//     gap: spacing.sm,
//     backgroundColor: colors.orangeLight,
//     borderRadius: radius.input,
//     padding: spacing.sm,
//   },
//   tipText: { ...typography.description, color: colors.warning, flex: 1 },
//   section: { gap: spacing.sm },
//   sectionTitle: { ...typography.cardTitle, color: colors.text },
//   helper: { ...typography.description, color: colors.hint },
//   wrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
//   scanActions: { flexDirection: "row", gap: spacing.sm },
//   scanButton: { flex: 1 },
//   chips: { gap: spacing.xs, paddingRight: spacing.lg },
//   counter: { flexDirection: "row", alignItems: "center", gap: spacing.lg },
//   counterButton: {
//     width: 42,
//     height: 42,
//     borderRadius: radius.input,
//     backgroundColor: colors.primaryLight,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   counterValue: { ...typography.section, color: colors.text, minWidth: 28, textAlign: "center" },
// });
