
import { useRouter } from "expo-router";
import { useState } from "react";
import * as Linking from "expo-linking";
import { Alert, Platform, StyleSheet, Text, View } from "react-native";

import {
  CustomTextInput,
  PrimaryButton,
  Screen,
  SecondaryButton,
} from "@/components/ui";
import { colors, spacing, typography } from "@/constants/theme";
import { resetPassword } from "@/services/authService";

export function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleResetPassword = async () => {
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setSubmitting(true);

      // Web uses the website URL; Android uses the app deep link.
      const redirectTo =
        Platform.OS === "web"
          ? `${window.location.origin}/reset-password`
          : Linking.createURL("reset-password");

      const result = await resetPassword(
        normalizedEmail,
        redirectTo
      );

      if (result.error) {
        setError(result.error);
        return;
      }

      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen style={styles.content}>
      <Text style={styles.title}>
        {sent ? "Check your inbox" : "Reset your password"}
      </Text>

      <Text style={styles.description}>
        {sent
          ? `If an account exists for ${email.trim()}, you should receive a password recovery email shortly.`
          : "Enter your registered email address and we'll send you a password recovery link."}
      </Text>

      {sent ? (
        <SecondaryButton
          title="Back to Sign In"
          icon="arrow-back"
          onPress={() => router.replace("/(auth)/login")}
        />
      ) : (
        <View style={styles.form}>
          <CustomTextInput
            label="Email"
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PrimaryButton
            title={submitting ? "Sending..." : "Send Recovery Link"}
            onPress={handleResetPassword}
            disabled={submitting}
          />

          <SecondaryButton
            title="Cancel"
            onPress={() => router.back()}
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.xxl,
    justifyContent: "center",
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  form: {
    gap: spacing.md,
  },
  error: {
    ...typography.description,
    color: colors.error,
  },
});
