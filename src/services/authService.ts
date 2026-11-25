
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import * as Linking from "expo-linking";

export interface AuthResult {
  error: string | null;
  needsEmailConfirmation?: boolean;
}

// Register a new account
export async function signUp(
  name: string,
  email: string,
  password: string
): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: {
        full_name: name.trim(),
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return {
    error: null,
    needsEmailConfirmation: !data.session,
  };
}

// Sign in
export async function signIn(
  email: string,
  password: string
): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  return {
    error: error?.message ?? null,
  };
}

// Sign out
export async function signOut(): Promise<AuthResult> {
  const { error } = await supabase.auth.signOut();

  return {
    error: error?.message ?? null,
  };
}

// Get the current session
export async function getCurrentSession(): Promise<{
  session: Session | null;
  error: string | null;
}> {
  const { data, error } = await supabase.auth.getSession();

  return {
    session: data.session,
    error: error?.message ?? null,
  };
}

// Listen for authentication changes
export function subscribeToAuthChanges(
  callback: (session: Session | null) => void
) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });

  return () => subscription.unsubscribe();
}


// Send a password recovery email


export async function resetPassword(
  email: string,
  redirectTo: string
): Promise<AuthResult> {
  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    {
      redirectTo,
    }
  );

  return {
    error: error?.message ?? null,
  };
}


// Exchange the recovery callback URL for a Supabase session.
export async function completePasswordRecovery(
  url: string
): Promise<AuthResult> {
  const parsed = Linking.parse(url);
  const params = parsed.queryParams ?? {};

  const errorDescription = params.error_description;
  if (typeof errorDescription === "string") {
    return { error: errorDescription };
  }

  const codeValue = params.code;
  const code = typeof codeValue === "string" ? codeValue : null;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    return { error: error?.message ?? null };
  }

  // Support callbacks that return tokens in the URL fragment.
  const fragment = url.split("#")[1];

  if (fragment) {
    const fragmentParams = new URLSearchParams(fragment);
    const accessToken = fragmentParams.get("access_token");
    const refreshToken = fragmentParams.get("refresh_token");

    if (accessToken && refreshToken) {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      return { error: error?.message ?? null };
    }
  }

  return {
    error: "The recovery link is invalid or has expired. Please request a new one.",
  };
}

// Save the new password to Supabase.
export async function updatePassword(
  newPassword: string
): Promise<AuthResult> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  return { error: error?.message ?? null };
}
