
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { CustomTextInput, PrimaryButton, Screen } from "@/components/ui";
import { colors, spacing, typography } from "@/constants/theme";
import { useApp } from "@/contexts/AppContext";

export function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useApp();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setError("");
    setSuccess("");

    if (
      !name.trim() ||
      !email.trim().includes("@") ||
      password.length < 6 ||
      password !== confirm ||
      !accepted
    ) {
      setError(
        "Complete all fields, match your passwords, and accept the terms.",
      );
      return;
    }

    try {
      setSubmitting(true);

      const result = await signUp(name, email, password);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.needsEmailConfirmation) {
        setSuccess(
          "Your account has been created! Please check your email to confirm your account before signing in.",
        );
        return;
      }

      router.replace("/(tabs)/home");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen style={styles.content}>
      <Text style={styles.title}>Create your account</Text>

      <Text style={styles.description}>
        Save recipes and personalize every recommendation.
      </Text>

      <View style={styles.form}>
        <CustomTextInput
          label="Full name"
          icon="person-outline"
          value={name}
          onChangeText={setName}
        />

        <CustomTextInput
          label="Email"
          icon="mail-outline"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <CustomTextInput
          label="Password"
          icon="lock-closed-outline"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <CustomTextInput
          label="Confirm password"
          icon="shield-checkmark-outline"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
        />

        <Pressable
          onPress={() => setAccepted((value) => !value)}
          style={styles.terms}
        >
          <Ionicons
            name={accepted ? "checkbox" : "square-outline"}
            size={22}
            color={colors.primary}
          />

          <Text style={styles.termsText}>
            I agree to the Terms of Service and Privacy Policy.
          </Text>
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {success ? (
          <Text style={styles.success}>{success}</Text>
        ) : null}

        <PrimaryButton
          title={submitting ? "Creating Account..." : "Create Account"}
          onPress={submit}
        />
      </View>

      <Pressable onPress={() => router.back()} style={styles.signIn}>
        <Text style={styles.description}>
          Already have an account?{" "}
          <Text style={styles.link}>Sign In</Text>
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.xxl },
  title: { ...typography.title, color: colors.text },
  description: { ...typography.body, color: colors.textSecondary },
  form: { gap: spacing.md, marginTop: spacing.md },
  terms: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  termsText: {
    ...typography.description,
    color: colors.textSecondary,
    flex: 1,
  },
  error: {
    ...typography.description,
    color: colors.error,
  },
  success: {
    ...typography.description,
    color: colors.success,
  },
  signIn: {
    alignItems: "center",
    marginTop: spacing.sm,
  },
  link: {
    color: colors.primaryDark,
    fontFamily: "Inter_600SemiBold",
  },
});
