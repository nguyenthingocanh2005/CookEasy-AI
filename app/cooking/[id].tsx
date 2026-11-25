export { CookingModeScreen as default } from "@/presentation/screens/CookingModeScreen";

// import { Ionicons } from "@expo/vector-icons";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import { useState } from "react";
// import { Pressable, StyleSheet, Text, View } from "react-native";
// import { PrimaryButton, SecondaryButton } from "@/components/ui";
// import { colors, radius, spacing, typography } from "@/constants/theme";
// import { recipes } from "@/data/mockData";
// import { SafeAreaView } from "react-native-safe-area-context";

// export default function CookingMode() {
//   const { id } = useLocalSearchParams<{ id: string }>();
//   const router = useRouter();
//   const recipe = recipes.find((item) => item.id === id) ?? recipes[0]!;
//   const [stepIndex, setStepIndex] = useState(0);
//   const step = recipe.instructions[stepIndex] ?? recipe.instructions[0]!;
//   const isLast = stepIndex === recipe.instructions.length - 1;
//   const progress = ((stepIndex + 1) / recipe.instructions.length) * 100;

//   return (
//     <SafeAreaView style={styles.screen}>
//       <View style={styles.header}>
//         <Pressable onPress={() => router.back()} style={styles.close}>
//           <Ionicons name="close" size={24} color={colors.text} />
//         </Pressable>
//         <View style={styles.headerCopy}>
//           <Text numberOfLines={1} style={styles.recipe}>
//             {recipe.name}
//           </Text>
//           <Text style={styles.stepLabel}>
//             Step {stepIndex + 1} of {recipe.instructions.length}
//           </Text>
//         </View>
//       </View>
//       <View style={styles.track}>
//         <View style={[styles.progress, { width: `${progress}%` }]} />
//       </View>
//       <View style={styles.content}>
//         <View style={styles.number}>
//           <Text style={styles.numberText}>{stepIndex + 1}</Text>
//         </View>
//         <Text style={styles.title}>{step.title}</Text>
//         <Text style={styles.description}>{step.description}</Text>
//         {step.duration ? (
//           <View style={styles.timer}>
//             <Ionicons name="timer-outline" size={22} color={colors.primaryDark} />
//             <Text style={styles.timerText}>About {step.duration} minutes</Text>
//           </View>
//         ) : null}
//       </View>
//       <View style={styles.actions}>
//         <SecondaryButton
//           title="Previous Step"
//           icon="arrow-back"
//           disabled={stepIndex === 0}
//           onPress={() => setStepIndex((value) => Math.max(0, value - 1))}
//           style={styles.action}
//         />
//         <PrimaryButton
//           title={isLast ? "Finish Cooking" : "Next Step"}
//           icon={isLast ? "checkmark" : "arrow-forward"}
//           onPress={() =>
//             isLast ? router.replace(`/recipes/${recipe.id}`) : setStepIndex((value) => value + 1)
//           }
//           style={styles.action}
//         />
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   screen: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
//   header: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
//   close: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: colors.surface,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   headerCopy: { flex: 1 },
//   recipe: { ...typography.cardTitle, color: colors.text },
//   stepLabel: { ...typography.caption, color: colors.textSecondary },
//   track: {
//     height: 6,
//     borderRadius: 3,
//     backgroundColor: colors.primaryLight,
//     marginTop: spacing.lg,
//     overflow: "hidden",
//   },
//   progress: { height: "100%", backgroundColor: colors.primary, borderRadius: 3 },
//   content: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: spacing.md,
//     gap: spacing.lg,
//   },
//   number: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//     backgroundColor: colors.primary,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   numberText: { ...typography.hero, color: colors.surface },
//   title: { ...typography.title, color: colors.text, textAlign: "center" },
//   description: {
//     fontSize: 19,
//     lineHeight: 30,
//     fontFamily: "Inter_400Regular",
//     color: colors.textSecondary,
//     textAlign: "center",
//   },
//   timer: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: spacing.xs,
//     paddingVertical: spacing.sm,
//     paddingHorizontal: spacing.md,
//     borderRadius: radius.pill,
//     backgroundColor: colors.primaryLight,
//   },
//   timerText: { ...typography.body, color: colors.primaryDark, fontFamily: "Inter_600SemiBold" },
//   actions: { flexDirection: "row", gap: spacing.sm },
//   action: { flex: 1 },
// });
