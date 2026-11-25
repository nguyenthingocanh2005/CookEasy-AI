export { ProfileScreen as default } from "@/presentation/screens/ProfileScreen";

// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
// import { ConfirmationDialog, Screen, UserAvatar } from "@/components/ui";
// import { colors, radius, spacing, typography } from "@/constants/theme";
// import { currentUser } from "@/data/mockData";
// import { useState } from "react";

// const settings = [
//   { title: "Edit Profile", icon: "create-outline" as const },
//   { title: "My Favorites", icon: "heart-outline" as const },
//   { title: "Dietary Preferences", icon: "leaf-outline" as const },
//   { title: "Account Settings", icon: "settings-outline" as const },
//   { title: "About CookEasy AI", icon: "information-circle-outline" as const },
// ];

// export default function Profile() {
//   const router = useRouter();
//   const [logoutOpen, setLogoutOpen] = useState(false);

//   const openSetting = (title: string) => {
//     if (title === "My Favorites") router.push("/(tabs)/favorites");
//     else Alert.alert(title, "This setting is ready for your future Firebase profile integration.");
//   };

//   return (
//     <Screen>
//       <Text style={styles.title}>Profile</Text>
//       <View style={styles.profileCard}>
//         <UserAvatar uri={currentUser.photoURL} name={currentUser.displayName} size={82} />
//         <Text style={styles.name}>{currentUser.displayName}</Text>
//         <Text style={styles.email}>{currentUser.email}</Text>
//         <View style={styles.preferences}>
//           {currentUser.dietaryPreferences.map((item) => (
//             <Text key={item} style={styles.preference}>
//               {item}
//             </Text>
//           ))}
//         </View>
//       </View>
//       <View style={styles.settingsCard}>
//         {settings.map((item, index) => (
//           <Pressable
//             key={item.title}
//             onPress={() => openSetting(item.title)}
//             style={[styles.setting, index < settings.length - 1 && styles.settingBorder]}
//           >
//             <View style={styles.settingIcon}>
//               <Ionicons name={item.icon} size={20} color={colors.primaryDark} />
//             </View>
//             <Text style={styles.settingText}>{item.title}</Text>
//             <Ionicons name="chevron-forward" size={19} color={colors.hint} />
//           </Pressable>
//         ))}
//       </View>
//       <Pressable onPress={() => setLogoutOpen(true)} style={styles.logout}>
//         <Ionicons name="log-out-outline" size={20} color={colors.error} />
//         <Text style={styles.logoutText}>Log Out</Text>
//       </Pressable>
//       <ConfirmationDialog
//         visible={logoutOpen}
//         title="Log out?"
//         description="You can sign back in anytime to access your saved recipes."
//         confirmLabel="Log Out"
//         onCancel={() => setLogoutOpen(false)}
//         onConfirm={() => router.replace("/(auth)/login")}
//       />
//     </Screen>
//   );
// }

// const styles = StyleSheet.create({
//   title: { ...typography.title, color: colors.text, marginTop: spacing.xs },
//   profileCard: {
//     backgroundColor: colors.surface,
//     borderRadius: radius.modal,
//     padding: spacing.xl,
//     alignItems: "center",
//     gap: spacing.xs,
//   },
//   name: { ...typography.section, color: colors.text, marginTop: spacing.xs },
//   email: { ...typography.description, color: colors.textSecondary },
//   preferences: { flexDirection: "row", gap: spacing.xs, marginTop: spacing.sm },
//   preference: {
//     ...typography.caption,
//     color: colors.primaryDark,
//     backgroundColor: colors.primaryLight,
//     paddingVertical: spacing.xs,
//     paddingHorizontal: spacing.sm,
//     borderRadius: radius.pill,
//   },
//   settingsCard: {
//     backgroundColor: colors.surface,
//     borderRadius: radius.card,
//     paddingHorizontal: spacing.md,
//   },
//   setting: { minHeight: 64, flexDirection: "row", alignItems: "center", gap: spacing.sm },
//   settingBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
//   settingIcon: {
//     width: 36,
//     height: 36,
//     borderRadius: radius.input,
//     backgroundColor: colors.primaryLight,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   settingText: { ...typography.body, fontFamily: "Inter_600SemiBold", color: colors.text, flex: 1 },
//   logout: {
//     minHeight: 52,
//     borderRadius: radius.button,
//     borderWidth: 1,
//     borderColor: "#F3CDCD",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: spacing.xs,
//   },
//   logoutText: { ...typography.button, color: colors.error },
// });
