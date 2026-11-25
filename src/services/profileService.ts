
import { supabase } from "@/lib/supabase";

export interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

// Get the current user's profile.
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  return {
    profile: data as UserProfile | null,
    error: error?.message ?? null,
  };
}

// Update the user's display name.
export async function updateProfile(
  userId: string,
  displayName: string
) {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  return {
    profile: data as UserProfile | null,
    error: error?.message ?? null,
  };
}

// Upload an avatar and save its public URL to profiles.
export async function uploadAvatar(
  userId: string,
  imageUri: string,
  mimeType?: string | null
) {
  try {
    const response = await fetch(imageUri);

    if (!response.ok) {
      return {
        avatarUrl: null,
        error: "Unable to read the selected image.",
      };
    }

    const arrayBuffer = await response.arrayBuffer();

    const contentType = mimeType || "image/jpeg";

    const extension =
      contentType === "image/png"
        ? "png"
        : contentType === "image/webp"
          ? "webp"
          : "jpg";

    const filePath = `${userId}/avatar-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, arrayBuffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      return {
        avatarUrl: null,
        error: uploadError.message,
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const avatarUrl = publicUrlData.publicUrl;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      return {
        avatarUrl: null,
        error: updateError.message,
      };
    }

    return {
      avatarUrl,
      error: null,
    };
  } catch (err) {
    return {
      avatarUrl: null,
      error:
        err instanceof Error
          ? err.message
          : "Unable to upload avatar.",
    };
  }
}
