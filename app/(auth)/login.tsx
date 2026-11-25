export { LoginScreen as default } from "@/presentation/screens/LoginScreen";

// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import { useState } from "react";
// import { Pressable, StyleSheet, Text, View } from "react-native";
// import { CustomTextInput, PrimaryButton, Screen } from "@/components/ui";
// import { colors, radius, spacing, typography } from "@/constants/theme";

// export default function Login() {
//   const router = useRouter();
//   const [email, setEmail] = useState("alex@cookeasy.app");
//   const [password, setPassword] = useState("cookeasy");
//   const [visible, setVisible] = useState(false);
//   const [remember, setRemember] = useState(true);
//   const [error, setError] = useState("");

//   const signIn = () => {
//     if (!email.includes("@") || password.length < 6) {
//       setError("Enter a valid email and a password of at least 6 characters.");
//       return;
//     }
//     router.replace("/(tabs)/home");
//   };

//   return (
//     <Screen style={styles.content}>
//       <View style={styles.logo}>
//         <Ionicons name="leaf" size={34} color={colors.surface} />
//       </View>
//       <View style={styles.heading}>
//         <Text style={styles.title}>Welcome back</Text>
//         <Text style={styles.description}>Sign in to continue your cooking journey.</Text>
//       </View>
//       <View style={styles.form}>
//         <CustomTextInput
//           label="Email"
//           icon="mail-outline"
//           value={email}
//           onChangeText={setEmail}
//           autoCapitalize="none"
//           keyboardType="email-address"
//         />
//         <CustomTextInput
//           label="Password"
//           icon="lock-closed-outline"
//           value={password}
//           onChangeText={setPassword}
//           secureTextEntry={!visible}
//           rightAction={
//             <Pressable onPress={() => setVisible((value) => !value)} hitSlop={8}>
//               <Ionicons
//                 name={visible ? "eye-off-outline" : "eye-outline"}
//                 size={20}
//                 color={colors.textSecondary}
//               />
//             </Pressable>
//           }
//         />
//         {error ? <Text style={styles.error}>{error}</Text> : null}
//         <View style={styles.options}>
//           <Pressable onPress={() => setRemember((value) => !value)} style={styles.remember}>
//             <Ionicons
//               name={remember ? "checkbox" : "square-outline"}
//               size={21}
//               color={colors.primary}
//             />
//             <Text style={styles.optionText}>Remember me</Text>
//           </Pressable>
//           <Pressable onPress={() => router.push("/(auth)/forgot-password")}>
//             <Text style={styles.link}>Forgot password?</Text>
//           </Pressable>
//         </View>
//         <PrimaryButton title="Sign In" onPress={signIn} />
//       </View>
//       <View style={styles.footer}>
//         <Text style={styles.optionText}>New to CookEasy AI?</Text>
//         <Pressable onPress={() => router.push("/(auth)/register")}>
//           <Text style={styles.link}>Create Account</Text>
//         </Pressable>
//       </View>
//     </Screen>
//   );
// }

// const styles = StyleSheet.create({
//   content: { paddingTop: spacing.xxl, justifyContent: "center" },
//   logo: {
//     width: 70,
//     height: 70,
//     borderRadius: radius.modal,
//     backgroundColor: colors.primary,
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: spacing.sm,
//   },
//   heading: { gap: spacing.xs, marginBottom: spacing.lg },
//   title: { ...typography.hero, color: colors.text },
//   description: { ...typography.body, color: colors.textSecondary },
//   form: { gap: spacing.md },
//   options: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
//   remember: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
//   optionText: { ...typography.description, color: colors.textSecondary },
//   link: { ...typography.description, color: colors.primaryDark, fontFamily: "Inter_600SemiBold" },
//   error: { ...typography.description, color: colors.error },
//   footer: {
//     flexDirection: "row",
//     justifyContent: "center",
//     gap: spacing.xs,
//     marginTop: spacing.lg,
//   },
// });
