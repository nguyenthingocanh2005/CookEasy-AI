
import { useEffect, useRef, useState } from "react";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import {
  CustomTextInput,
  PrimaryButton,
  SecondaryButton,
  Screen,
} from "@/components/ui";
import { colors, spacing, typography } from "@/constants/theme";
import {
  completePasswordRecovery,
  updatePassword,
} from "@/services/authService";

export function ResetPasswordScreen() {
  const router = useRouter();
  const callbackUrl = Linking.useURL();
  const handledUrl = useRef<string | null>(null);

  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!callbackUrl || handledUrl.current === callbackUrl) return;

    handledUrl.current = callbackUrl;
    let active = true;

    const verifyLink = async () => {
      setVerifying(true);
      setError("");

      try {
        const result = await completePasswordRecovery(callbackUrl);

        if (!active) return;

        if (result.error) {
          setError(result.error);
          setVerified(false);
        } else {
          setVerified(true);
        }
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to verify the recovery link."
        );
      } finally {
        if (active) setVerifying(false);
      }
    };

    verifyLink();

    return () => {
      active = false;
    };
  }, [callbackUrl]);

  const handleUpdatePassword = async () => {
    setError("");

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);

      const result = await updatePassword(password);

      if (result.error) {
        setError(result.error);
        return;
      }

      setCompleted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update your password. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (verifying) {
    return (
      <Screen style={styles.content}>
        <Text style={styles.title}>Verifying your link...</Text>
        <Text style={styles.description}>
          Please wait while we verify your password recovery request.
        </Text>
      </Screen>
    );
  }

  if (completed) {
    return (
      <Screen style={styles.content}>
        <Text style={styles.title}>Password updated!</Text>
        <Text style={styles.description}>
          Your password has been changed successfully. You can now sign in
          with your new password.
        </Text>

        <PrimaryButton
          title="Back to Sign In"
          onPress={() => router.replace("/(auth)/login")}
        />
      </Screen>
    );
  }

  if (!verified) {
    return (
      <Screen style={styles.content}>
        <Text style={styles.title}>Invalid recovery link</Text>
        <Text style={styles.description}>
          {error || "This recovery link may have expired."}
        </Text>

        <PrimaryButton
          title="Request a New Link"
          onPress={() => router.replace("/(auth)/forgot-password")}
        />

        <SecondaryButton
          title="Back to Sign In"
          onPress={() => router.replace("/(auth)/login")}
        />
      </Screen>
    );
  }

  return (
    <Screen style={styles.content}>
      <Text style={styles.title}>Create New Password</Text>

      <Text style={styles.description}>
        Enter your new password below. Use at least 6 characters.
      </Text>

      <View style={styles.form}>
        <CustomTextInput
          label="New Password"
          icon="lock-closed-outline"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <CustomTextInput
          label="Confirm New Password"
          icon="lock-closed-outline"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton
          title={submitting ? "Updating..." : "Update Password"}
          onPress={handleUpdatePassword}
          disabled={submitting}
        />
      </View>
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
