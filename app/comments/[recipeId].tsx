export { CommentsScreen as default } from "@/presentation/screens/CommentsScreen";

// import { Ionicons } from "@expo/vector-icons";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import { useState } from "react";
// import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
// import { Screen, UserAvatar } from "@/components/ui";
// import { colors, radius, spacing, typography } from "@/constants/theme";
// import { recipes } from "@/data/mockData";
// import { useApp } from "@/contexts/AppContext";

// export default function Comments() {
//   const { recipeId } = useLocalSearchParams<{ recipeId: string }>();
//   const router = useRouter();
//   const recipe = recipes.find((item) => item.id === recipeId) ?? recipes[0]!;
//   const { comments, addComment, deleteComment } = useApp();
//   const [content, setContent] = useState("");
//   const recipeComments = comments.filter((comment) => comment.recipeId === recipe.id);

//   const submit = () => {
//     const clean = content.trim();
//     if (!clean) return;
//     addComment(recipe.id, clean);
//     setContent("");
//   };

//   return (
//     <Screen>
//       <View style={styles.header}>
//         <Pressable onPress={() => router.back()} style={styles.back}>
//           <Ionicons name="arrow-back" size={22} color={colors.text} />
//         </Pressable>
//         <View>
//           <Text style={styles.title}>Community notes</Text>
//           <Text style={styles.description}>{recipe.name}</Text>
//         </View>
//       </View>
//       <View style={styles.list}>
//         {recipeComments.map((comment) => (
//           <View key={comment.id} style={styles.comment}>
//             <UserAvatar name={comment.userName} uri={comment.userPhotoURL} />
//             <View style={styles.commentCopy}>
//               <View style={styles.commentHeader}>
//                 <View>
//                   <Text style={styles.author}>{comment.userName}</Text>
//                   <Text style={styles.timestamp}>
//                     {new Date(comment.createdAt).toLocaleDateString()}
//                   </Text>
//                 </View>
//                 {comment.userId === "user-demo" ? (
//                   <Pressable onPress={() => deleteComment(comment.id)} hitSlop={8}>
//                     <Ionicons name="trash-outline" size={18} color={colors.error} />
//                   </Pressable>
//                 ) : null}
//               </View>
//               <Text style={styles.body}>{comment.content}</Text>
//             </View>
//           </View>
//         ))}
//       </View>
//       <View style={styles.composer}>
//         <UserAvatar name="Alex Morgan" size={40} />
//         <TextInput
//           value={content}
//           onChangeText={setContent}
//           placeholder="Share a helpful cooking note..."
//           placeholderTextColor={colors.hint}
//           style={styles.input}
//           multiline
//         />
//         <Pressable
//           onPress={submit}
//           disabled={!content.trim()}
//           style={[styles.send, !content.trim() && styles.disabled]}
//         >
//           <Ionicons name="send" size={19} color={colors.surface} />
//         </Pressable>
//       </View>
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
//   title: { ...typography.title, color: colors.text },
//   description: { ...typography.description, color: colors.textSecondary },
//   list: { gap: spacing.sm },
//   comment: {
//     flexDirection: "row",
//     gap: spacing.sm,
//     backgroundColor: colors.surface,
//     borderRadius: radius.card,
//     padding: spacing.md,
//   },
//   commentCopy: { flex: 1, gap: spacing.xs },
//   commentHeader: { flexDirection: "row", justifyContent: "space-between" },
//   author: { ...typography.cardTitle, color: colors.text },
//   timestamp: { ...typography.caption, color: colors.hint },
//   body: { ...typography.body, color: colors.textSecondary },
//   composer: {
//     flexDirection: "row",
//     alignItems: "flex-end",
//     gap: spacing.xs,
//     backgroundColor: colors.surface,
//     borderRadius: radius.card,
//     padding: spacing.xs,
//     borderWidth: 1,
//     borderColor: colors.border,
//   },
//   input: {
//     ...typography.body,
//     color: colors.text,
//     flex: 1,
//     minHeight: 44,
//     maxHeight: 110,
//     padding: spacing.sm,
//   },
//   send: {
//     width: 42,
//     height: 42,
//     borderRadius: 21,
//     backgroundColor: colors.primary,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   disabled: { opacity: 0.45 },
// });
