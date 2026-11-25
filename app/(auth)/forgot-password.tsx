export { ForgotPasswordScreen as default } from "@/presentation/screens/ForgotPasswordScreen";

// import { useRouter } from "expo-router";
// import { useState } from "react";
// import { StyleSheet, Text, View } from "react-native";
// import { CustomTextInput, PrimaryButton, Screen, SecondaryButton } from "@/components/ui";
// import { colors, spacing, typography } from "@/constants/theme";

// export default function ForgotPassword() {
//   const router = useRouter();
//   const [email, setEmail] = useState("");
//   const [sent, setSent] = useState(false);

//   return (
//     <Screen style={styles.content}>
//       <Text style={styles.title}>{sent ? "Check your inbox" : "Reset your password"}</Text>
//       <Text style={styles.description}>
//         {sent
//           ? `We sent recovery instructions to ${email}.`
//           : "Enter your email and we’ll prepare a secure recovery link."}
//       </Text>
//       {sent ? (
//         <SecondaryButton title="Back to Sign In" icon="arrow-back" onPress={() => router.back()} />
//       ) : (
//         <View style={styles.form}>
//           <CustomTextInput
//             label="Email"
//             icon="mail-outline"
//             value={email}
//             onChangeText={setEmail}
//             autoCapitalize="none"
//             keyboardType="email-address"
//           />
//           <PrimaryButton
//             title="Send Recovery Link"
//             onPress={() => email.includes("@") && setSent(true)}
//             disabled={!email.includes("@")}
//           />
//           <SecondaryButton title="Cancel" onPress={() => router.back()} />
//         </View>
//       )}
//     </Screen>
//   );
// }

// const styles = StyleSheet.create({
//   content: { paddingTop: spacing.xxl, justifyContent: "center" },
//   title: { ...typography.title, color: colors.text },
//   description: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
//   form: { gap: spacing.md },
// });
